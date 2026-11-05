/**
 * Fixed-step simulation scheduler (SPEC §6.1). Each step:
 *   1. user actions (inputs set through press/release/setInput)
 *   2–4. electric solver, PLC and coupling (later phases)
 *   5. FluidSolver: discrete fixed point (valves, shuttles) + continuous motion
 *   6. sensors (phase 2b)
 * Deterministic: the same inputs always give the same results.
 */
import { ELECTRIC_ROLES, type ElectricRole } from '../components/electric/roles';
import { defaultParams, type DefLookup } from '../core/componentDef';
import type { ComponentInstance, Params, Project } from '../core/types';
import { findLimitBindings, limitActuated, type LimitBinding } from './coupling/mechanical';
import {
  contactClosed,
  solveCircuit,
  type CircuitResult,
  type ElectricLoad,
} from './electric/solver';
import { pneumaticBehavior } from './fluid/logic/behaviors';
import { LadderRuntime } from './plc/ladder/runtime';
import {
  Nets,
  nodeState,
  portKey,
  propagate,
  toNetEdge,
  type Propagation,
} from './fluid/logic/nets';
import type {
  ActuationInput,
  Behavior,
  LogicContext,
  NodeState,
  SimEvent,
  SimWarning,
} from './types';

/** Fixed-point iteration limit before reporting an oscillation (SPEC §6.2). */
export const MAX_ITERATIONS = 50;

function sameStates(a: Map<string, NodeState>, b: Map<string, NodeState>): boolean {
  if (a.size !== b.size) return false;
  for (const [k, v] of a) if (b.get(k) !== v) return false;
  return true;
}

export type BehaviorFactory = (type: string, componentId: string) => Behavior | undefined;

export interface SimulationOptions {
  /** Port and parameter definitions (injected so the engine imports no UI code). */
  getDef: DefLookup;
  getBehavior?: BehaviorFactory;
}

interface SimComponent {
  instance: ComponentInstance;
  params: Params;
  behavior: Behavior;
  state: unknown;
  /** Manual / electrical actuation (user clicks, later solenoids). */
  input: ActuationInput;
  /** Mechanical actuation (rollers pressed by a cylinder). */
  mech: ActuationInput;
  /** Electrical actuation (energised solenoid coils, SPEC §4 tags). */
  elec: ActuationInput;
  ctx: LogicContext;
}

/** Electric component (SPEC §6.4): contacts, loads, supply terminals. */
interface ElecComponent {
  instance: ComponentInstance;
  role: ElectricRole;
  params: Params;
  /** Port ids in definition order (two-terminal parts: [top, bottom]). */
  ports: string[];
  input: ActuationInput;
  mech: ActuationInput;
  closed: boolean;
  on: boolean;
}

/** Electric state of a net, for drawing live wires. */
export type ElectricState = 'plus' | 'minus' | 'short' | 'off';

const positionOf = (c: SimComponent | undefined) =>
  (c?.state as { position?: number } | undefined)?.position ?? 0;

export class Simulation {
  timeMs = 0;
  readonly dtMs: number;
  readonly events: SimEvent[] = [];
  readonly warnings: SimWarning[] = [];

  private readonly comps: SimComponent[] = [];
  private readonly byId = new Map<string, SimComponent>();
  private readonly nets = new Nets();
  private readonly connected = new Set<string>();
  private prop: Propagation = { feed: new Map(), vent: new Map() };
  private states = new Map<string, NodeState>();
  private oscillating = false;
  private readonly conflicts = new Set<string>();
  private readonly limits: LimitBinding[];
  private readonly elec: ElecComponent[] = [];
  private readonly elecById = new Map<string, ElecComponent>();
  private relayOn = new Set<string>();
  private circuit: CircuitResult | null = null;
  private elecOscillating = false;
  private shortActive = false;
  /** PLC (SPEC §6.5): the first PLC block runs the project's Ladder program. */
  private plc: ElecComponent | null = null;
  readonly ladder: LadderRuntime | null = null;
  private readonly scanMs: number = 10;
  private nextScanMs = 0;
  private plcInputs = new Set<string>();
  /** Changes of electric loads with a label, e.g. "K1=1", "Y1=0" (SPEC §8.1). */
  readonly signals: SimEvent[] = [];

  constructor(project: Project, options: SimulationOptions) {
    const getBehavior = options.getBehavior ?? pneumaticBehavior;
    this.dtMs = project.simulation.dtMs > 0 ? project.simulation.dtMs : 1;
    const supplyBar = project.simulation.supplyPressureBar;
    const unsupported = new Map<string, string[]>();

    for (const w of project.connections) {
      const a = portKey(...w.from);
      const b = portKey(...w.to);
      this.nets.union(a, b);
      this.connected.add(a);
      this.connected.add(b);
    }

    for (const instance of project.components) {
      const def = options.getDef(instance.type);
      const role = ELECTRIC_ROLES[instance.type];
      if (def && role) {
        for (const p of def.ports) this.nets.add(portKey(instance.id, p.id));
        const e: ElecComponent = {
          instance,
          role,
          params: { ...defaultParams(def), ...instance.params },
          ports: def.ports.map((p) => p.id),
          input: {},
          mech: {},
          closed: role.kind === 'contact' && role.normally === 'closed',
          on: false,
        };
        this.elec.push(e);
        this.elecById.set(instance.id, e);
        if (role.kind === 'plc' && !this.plc) this.plc = e;
        continue;
      }
      const behavior = getBehavior(instance.type, instance.id);
      if (!def || !behavior) {
        unsupported.set(instance.type, [...(unsupported.get(instance.type) ?? []), instance.id]);
        continue;
      }
      for (const p of def.ports) this.nets.add(portKey(instance.id, p.id));
      const params = { ...defaultParams(def), ...instance.params };
      const comp: SimComponent = {
        instance,
        params,
        behavior,
        state: behavior.init(params),
        input: {},
        mech: {},
        elec: {},
        ctx: undefined as unknown as LogicContext,
      };
      comp.ctx = this.makeContext(comp, supplyBar);
      this.comps.push(comp);
      this.byId.set(instance.id, comp);
    }
    for (const [type, componentIds] of unsupported) {
      this.warnings.push({ code: 'unsupported', type, componentIds });
    }
    this.limits = findLimitBindings(project.components).filter(
      (b) =>
        (this.byId.has(b.valveId) || this.elecById.has(b.valveId)) && this.byId.has(b.cylinderId),
    );
    if (this.plc) {
      this.ladder = new LadderRuntime(project.plc.ladder);
      const scan = Number(this.plc.params.scanMs);
      this.scanMs = Number.isFinite(scan) && scan >= 1 ? scan : 10;
    }
    // Rollers already pressed at the start (e.g. a0 with the cylinder retracted).
    this.applyCoupling(new Map());
    this.solve();
    // First PLC scan at t = 0, with the inputs as they are at power-up.
    if (this.ladder) {
      this.plcScan();
      this.solve();
    }
  }

  /** Step 6: rollers follow the cylinder positions. `previous` holds positions before motion. */
  private applyCoupling(previous: Map<string, number>): void {
    for (const b of this.limits) {
      const position = positionOf(this.byId.get(b.cylinderId));
      const before = previous.get(b.cylinderId) ?? position;
      const target = this.byId.get(b.valveId) ?? this.elecById.get(b.valveId)!;
      target.mech.left = limitActuated(b, position, before);
    }
  }

  private makeContext(comp: SimComponent, supplyBar: number): LogicContext {
    const id = comp.instance.id;
    const net = (portId: string) => this.nets.find(portKey(id, portId));
    return {
      params: comp.params,
      net: (p) => this.states.get(net(p)) ?? 'BLOCKED',
      feed: (p) => this.prop.feed.get(net(p)) ?? 0,
      vent: (p) => this.prop.vent.get(net(p)) ?? 0,
      connected: (p) => this.connected.has(portKey(id, p)),
      get input() {
        return {
          left: comp.input.left === true || comp.mech.left === true || comp.elec.left === true,
          right: comp.input.right === true || comp.mech.right === true || comp.elec.right === true,
        };
      },
      supplyBar,
    };
  }

  /**
   * Discrete fixed point: propagate, update valve positions, repeat until both
   * the node states and the component states stop changing (some edges, e.g.
   * shuttle valves, depend on node states).
   */
  private solve(): void {
    this.solveElectric();
    let stable = false;
    for (let i = 0; i < MAX_ITERATIONS && !stable; i++) {
      const edges = this.comps.flatMap((c) =>
        c.behavior.edges(c.state, c.ctx).map((e) => toNetEdge(e, c.instance.id, this.nets)),
      );
      this.prop = propagate(edges);
      const states = new Map<string, NodeState>();
      for (const key of this.nets.keys()) {
        const root = this.nets.find(key);
        if (!states.has(root)) states.set(root, nodeState(root, this.prop));
      }
      stable = sameStates(states, this.states);
      this.states = states;

      for (const c of this.comps) {
        if (!c.behavior.update) continue;
        const next = c.behavior.update(c.state, c.ctx);
        if (next !== c.state) {
          c.state = next;
          stable = false;
        }
      }
    }
    if (!stable && !this.oscillating) {
      this.warnings.push({ code: 'oscillation', timeMs: this.timeMs });
    }
    this.oscillating = !stable;
    this.checkSupplyVented();
    this.checkConflicts();
  }

  /**
   * Electric fixed point (SPEC §6.4): contacts -> circuit -> relay coils ->
   * contacts, until the relay states stop changing. Then energised solenoid
   * coils actuate the valves that name them (coilLeft / coilRight).
   */
  private solveElectric(): void {
    if (!this.elec.length) return;
    const net = (e: ElecComponent, i: number) =>
      this.nets.find(portKey(e.instance.id, e.ports[i]!));
    const plusNets: string[] = [];
    const minusNets: string[] = [];
    const loads: ElectricLoad[] = [];
    for (const e of this.elec) {
      if (e.role.kind === 'terminal') {
        (e.role.potential === '+' ? plusNets : minusNets).push(net(e, 0));
      }
      if (e.role.kind === 'load') loads.push({ id: e.instance.id, a: net(e, 0), b: net(e, 1) });
    }
    if (this.plc && this.ladder) {
      const outputs = this.ladder.outputs();
      for (const q of outputs) {
        if (this.plc.ports.includes(q))
          plusNets.push(this.nets.find(portKey(this.plc.instance.id, q)));
      }
    }
    const actuated = (e: ElecComponent): boolean => {
      if (e.role.kind !== 'contact') return false;
      switch (e.role.actuator) {
        case 'manual':
        case 'toggle':
          return e.input.left === true;
        case 'relay':
          return this.relayOn.has(String(e.params.relay ?? ''));
        case 'sensor':
          return e.mech.left === true;
      }
    };
    let stable = false;
    let result: CircuitResult = solveCircuit(plusNets, minusNets, [], loads);
    for (let i = 0; i < MAX_ITERATIONS && !stable; i++) {
      const conductors: [string, string][] = [];
      for (const e of this.elec) {
        if (e.role.kind !== 'contact') continue;
        e.closed = contactClosed(e.role.normally, actuated(e));
        if (e.closed) conductors.push([net(e, 0), net(e, 1)]);
      }
      result = solveCircuit(plusNets, minusNets, conductors, loads);
      const relayOn = new Set<string>();
      for (const e of this.elec) {
        if (
          e.role.kind === 'load' &&
          e.role.load === 'relay' &&
          result.energized.has(e.instance.id)
        ) {
          relayOn.add(String(e.params.label ?? ''));
        }
      }
      stable = relayOn.size === this.relayOn.size && [...relayOn].every((k) => this.relayOn.has(k));
      this.relayOn = relayOn;
    }
    this.circuit = result;
    if (this.plc) {
      const inputs = new Set<string>();
      for (const port of this.plc.ports) {
        if (
          port.startsWith('I') &&
          result.plus.has(this.nets.find(portKey(this.plc.instance.id, port)))
        ) {
          inputs.add(port);
        }
      }
      this.plcInputs = inputs;
    }
    if (!stable && !this.elecOscillating) {
      this.warnings.push({ code: 'oscillation', timeMs: this.timeMs });
    }
    this.elecOscillating = !stable;

    const solenoids = new Set<string>();
    for (const e of this.elec) {
      if (e.role.kind !== 'load') continue;
      const on = result.energized.has(e.instance.id);
      const label = String(e.params.label ?? '');
      if (on !== e.on && label) {
        this.signals.push({
          timeMs: this.timeMs,
          name: label + '=' + (on ? 1 : 0),
          componentId: e.instance.id,
        });
      }
      e.on = on;
      if (on && e.role.load === 'solenoid' && label) solenoids.add(label);
    }
    for (const c of this.comps) {
      const left = c.params.coilLeft;
      const right = c.params.coilRight;
      if (typeof left !== 'string' && typeof right !== 'string') continue;
      c.elec = {
        left: typeof left === 'string' && solenoids.has(left),
        right: typeof right === 'string' && solenoids.has(right),
      };
    }

    const short = result.short.length > 0;
    if (short && !this.shortActive) {
      this.warnings.push({ code: 'shortCircuit', timeMs: this.timeMs });
    }
    this.shortActive = short;
  }

  /** One PLC scan with the current input terminals (SPEC §6.5). */
  private plcScan(): void {
    this.ladder!.scan(this.plcInputs, this.ladder!.scans === 0 ? 0 : this.scanMs);
    this.nextScanMs = this.timeMs + this.scanMs;
  }

  /** PLC state for display: input and output addresses that are on. */
  plcState(): { inputs: string[]; outputs: string[] } | null {
    if (!this.ladder) return null;
    return { inputs: [...this.plcInputs].sort(), outputs: [...this.ladder.outputs()].sort() };
  }

  /** Reports each onset of simultaneous opposite signals on a valve (SPEC §7.3). */
  private checkConflicts(): void {
    for (const c of this.comps) {
      const id = c.instance.id;
      const conflict = (c.state as { conflict?: boolean } | null)?.conflict === true;
      if (conflict && !this.conflicts.has(id)) {
        this.conflicts.add(id);
        this.warnings.push({ code: 'bothSignals', timeMs: this.timeMs, componentId: id });
      } else if (!conflict) {
        this.conflicts.delete(id);
      }
    }
  }

  private checkSupplyVented(): void {
    const ports: string[] = [];
    for (const key of this.nets.keys()) {
      const root = this.nets.find(key);
      if ((this.prop.feed.get(root) ?? 0) > 0 && (this.prop.vent.get(root) ?? 0) > 0) {
        ports.push(key);
      }
    }
    if (!ports.length) return;
    const last = [...this.warnings].reverse().find((w) => w.code === 'supplyVented');
    if (!last || last.code !== 'supplyVented' || last.ports.join() !== ports.join()) {
      this.warnings.push({ code: 'supplyVented', timeMs: this.timeMs, ports });
    }
  }

  /**
   * Advances one time step. The discrete state is already solved (by the
   * constructor, the previous step or setInput), so only motion is integrated
   * and the fixed point is solved once afterwards.
   */
  step(): void {
    const previous = new Map(
      this.limits.map((b) => [b.cylinderId, positionOf(this.byId.get(b.cylinderId))]),
    );
    for (const c of this.comps) {
      if (!c.behavior.integrate) continue;
      const r = c.behavior.integrate(c.state, c.ctx, this.dtMs);
      c.state = r.state;
      for (const name of r.events ?? []) {
        this.events.push({ timeMs: this.timeMs + this.dtMs, name, componentId: c.instance.id });
      }
    }
    this.timeMs += this.dtMs;
    if (this.ladder && this.timeMs >= this.nextScanMs - 1e-9) this.plcScan();
    this.applyCoupling(previous);
    // Re-solve so states reflect the new positions, rollers and timers at this instant.
    this.solve();
  }

  /** Whether a roller valve is currently pressed by its cylinder. */
  isMechanicallyActuated(componentId: string): boolean {
    return (this.byId.get(componentId) ?? this.elecById.get(componentId))?.mech.left === true;
  }

  /** Runs for a duration (ms). */
  run(ms: number): void {
    const end = this.timeMs + ms;
    while (this.timeMs < end - 1e-9) this.step();
  }

  /** Runs until `done` is true or `maxMs` passes. Returns whether `done` became true. */
  runUntil(done: () => boolean, maxMs: number): boolean {
    const end = this.timeMs + maxMs;
    while (!done()) {
      if (this.timeMs >= end) return false;
      this.step();
    }
    return true;
  }

  /** Sets the actuation of a component (manual buttons, solenoids, rollers). */
  setInput(componentId: string, input: ActuationInput): void {
    const c = this.byId.get(componentId) ?? this.elecById.get(componentId);
    if (!c) throw new Error(`Unknown component: ${componentId}`);
    c.input = { ...c.input, ...input };
    this.solve();
  }

  press(componentId: string, side: 'left' | 'right' = 'left'): void {
    this.setInput(componentId, { [side]: true });
  }

  release(componentId: string, side: 'left' | 'right' = 'left'): void {
    this.setInput(componentId, { [side]: false });
  }

  hasComponent(componentId: string): boolean {
    return this.byId.has(componentId) || this.elecById.has(componentId);
  }

  /** Electric state of the net a port belongs to (live wires are drawn red, SPEC §7.3). */
  electricState(componentId: string, portId: string): ElectricState {
    if (!this.circuit) return 'off';
    const n = this.nets.find(portKey(componentId, portId));
    const p = this.circuit.plus.has(n);
    const m = this.circuit.minus.has(n);
    return p && m ? 'short' : p ? 'plus' : m ? 'minus' : 'off';
  }

  /** Whether an electric load (coil, lamp, buzzer) is energised. */
  isEnergized(componentId: string): boolean {
    return this.elecById.get(componentId)?.on === true;
  }

  /** Whether a relay (by label) is energised. */
  relayEnergized(label: string): boolean {
    return this.relayOn.has(label);
  }

  /** Current actuation of a component (copy). */
  componentInput(componentId: string): ActuationInput {
    return { ...((this.byId.get(componentId) ?? this.elecById.get(componentId))?.input ?? {}) };
  }

  /** Simulated components with a position (cylinders and valves), in project order. */
  componentIds(): string[] {
    return this.comps.map((c) => c.instance.id);
  }

  portState(componentId: string, portId: string): NodeState {
    return this.states.get(this.nets.find(portKey(componentId, portId))) ?? 'BLOCKED';
  }

  componentState<S = unknown>(componentId: string): S {
    const e = this.elecById.get(componentId);
    if (e && e.role.kind === 'plc') return (this.plcState() ?? { inputs: [], outputs: [] }) as S;
    if (e) {
      const st =
        e.role.kind === 'load'
          ? { on: e.on }
          : e.role.kind === 'contact'
            ? { closed: e.closed }
            : null;
      return st as S;
    }
    const c = this.byId.get(componentId);
    if (!c) throw new Error(`Unknown component: ${componentId}`);
    return c.state as S;
  }

  /** Event names in order, e.g. ["1A+", "2A+", "2A-", "1A-"]. */
  eventNames(): string[] {
    return this.events.map((e) => e.name);
  }
}

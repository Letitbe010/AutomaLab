/**
 * Fixed-step simulation scheduler (SPEC §6.1). Each step:
 *   1. user actions (inputs set through press/release/setInput)
 *   2–4. electric solver, PLC and coupling (later phases)
 *   5. FluidSolver: discrete fixed point (valves, shuttles) + continuous motion
 *   6. sensors (phase 2b)
 * Deterministic: the same inputs always give the same results.
 */
import { defaultParams, type DefLookup } from '../core/componentDef';
import type { ComponentInstance, Params, Project } from '../core/types';
import { pneumaticBehavior } from './fluid/logic/behaviors';
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
  input: ActuationInput;
  ctx: LogicContext;
}

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
        ctx: undefined as unknown as LogicContext,
      };
      comp.ctx = this.makeContext(comp, supplyBar);
      this.comps.push(comp);
      this.byId.set(instance.id, comp);
    }
    for (const [type, componentIds] of unsupported) {
      this.warnings.push({ code: 'unsupported', type, componentIds });
    }
    this.solve();
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
        return comp.input;
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

  /** Advances one time step. */
  step(): void {
    this.solve();
    for (const c of this.comps) {
      if (!c.behavior.integrate) continue;
      const r = c.behavior.integrate(c.state, c.ctx, this.dtMs);
      c.state = r.state;
      for (const name of r.events ?? []) {
        this.events.push({ timeMs: this.timeMs + this.dtMs, name, componentId: c.instance.id });
      }
    }
    this.timeMs += this.dtMs;
    // Re-solve so states reflect the new positions and timers at this instant.
    this.solve();
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
    const c = this.byId.get(componentId);
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

  portState(componentId: string, portId: string): NodeState {
    return this.states.get(this.nets.find(portKey(componentId, portId))) ?? 'BLOCKED';
  }

  componentState<S = unknown>(componentId: string): S {
    const c = this.byId.get(componentId);
    if (!c) throw new Error(`Unknown component: ${componentId}`);
    return c.state as S;
  }

  /** Event names in order, e.g. ["1A+", "2A+", "2A-", "1A-"]. */
  eventNames(): string[] {
    return this.events.map((e) => e.name);
  }
}

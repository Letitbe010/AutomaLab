/**
 * Logic-level behaviours of pneumatic components (SPEC §6.2).
 * Pure TypeScript: valve path tables come from the shared valve specs.
 */
import {
  VALVE_SPECS,
  type Operator,
  type ValveSpec,
} from '../../../components/pneumatic/valveSpecs';
import type { Params } from '../../../core/types';
import { ATM, SOURCE, type Behavior, type FluidEdge, type LogicContext } from '../../types';

const num = (params: Params, key: string, fallback: number) =>
  typeof params[key] === 'number' ? (params[key] as number) : fallback;

const both = (a: string, b: string, factor = 1): FluidEdge[] => [
  { from: a, to: b, factor },
  { from: b, to: a, factor },
];

/** Exhaust ports of valves vent to atmosphere when nothing is connected to them. */
const ventIfFree = (ctx: LogicContext, ...ports: string[]): FluidEdge[] =>
  ports.filter((p) => !ctx.connected(p)).map((p) => ({ from: p, to: ATM, factor: 1 }));

const label = (params: Params, fallback: string) =>
  typeof params.label === 'string' && params.label !== '' ? params.label : fallback;

// ---------------------------------------------------------------- valves

export interface ValveLogicState {
  position: number;
  /** Time (ms) the timed pilot has been pressurized. */
  timerMs: number;
}

const MANUAL_LIKE: Operator[] = ['button', 'pedal', 'lever', 'roller', 'idleRoller', 'solenoid'];

function operatorActive(
  spec: ValveSpec,
  side: 'left' | 'right',
  state: ValveLogicState,
  ctx: LogicContext,
): boolean {
  const op = spec[side][0];
  if (!op) return false;
  if (MANUAL_LIKE.includes(op)) return ctx.input[side] === true;
  if (op === 'pilot') {
    const port = side === 'left' ? spec.leftPilotPort : spec.rightPilotPort;
    if (!port || ctx.net(port) !== 'PRESSURE') return false;
    // Pressure sequence valve: the pilot must overcome the adjustable spring.
    if (spec[side === 'left' ? 'right' : 'left'].includes('springAdj')) {
      return ctx.supplyBar >= num(ctx.params, 'switchBar', 3);
    }
    return true;
  }
  if (op === 'timedPilot') return state.timerMs >= num(ctx.params, 'delayS', 2) * 1000;
  return false; // springs are restoring forces, not signals
}

const isReturnOnly = (ops: Operator[]) => ops.every((o) => o === 'spring' || o === 'springAdj');

export function valveBehavior(spec: ValveSpec): Behavior<ValveLogicState> {
  const n = spec.positions.length;
  const ventPorts = spec.ports.map((p) => p.id).filter((id) => id === '3' || id === '5');
  const timedPort = spec.left.includes('timedPilot') ? spec.leftPilotPort : undefined;

  return {
    init: () => ({ position: spec.rest, timerMs: 0 }),

    edges(state, ctx) {
      const out: FluidEdge[] = [];
      for (const path of spec.positions[state.position] ?? []) {
        if (path.kind === 'flow') out.push(...both(path.from, path.to));
      }
      return [...out, ...ventIfFree(ctx, ...ventPorts)];
    },

    update(state, ctx) {
      const l = operatorActive(spec, 'left', state, ctx);
      const r = operatorActive(spec, 'right', state, ctx);
      let position = state.position;
      if (isReturnOnly(spec.right)) {
        // Monostable: left operator against a return spring.
        position = l ? 0 : spec.rest;
      } else if (n === 3) {
        // Spring-centred 5/3.
        position = l && !r ? 0 : r && !l ? 2 : 1;
      } else {
        // Bistable: keeps its last position without signals (memory).
        if (l && !r) position = 0;
        else if (r && !l) position = n - 1;
      }
      return position === state.position ? state : { ...state, position };
    },

    integrate(state, ctx, dtMs) {
      if (!timedPort) return { state };
      const timerMs = ctx.net(timedPort) === 'PRESSURE' ? state.timerMs + dtMs : 0;
      return { state: timerMs === state.timerMs ? state : { ...state, timerMs } };
    },
  };
}

// ---------------------------------------------------------------- cylinders

export interface CylinderLogicState {
  /** 0 = retracted, 1 = extended. */
  position: number;
}

function move(
  state: CylinderLogicState,
  dir: -1 | 0 | 1,
  rate: number,
  ctx: LogicContext,
  dtMs: number,
  fallbackLabel: string,
) {
  if (dir === 0 || rate <= 0) return { state };
  const strokeS = num(ctx.params, 'strokeTimeS', 1);
  const next = Math.min(1, Math.max(0, state.position + (dir * rate * dtMs) / (strokeS * 1000)));
  if (next === state.position) return { state };
  const name = label(ctx.params, fallbackLabel);
  const events =
    next === 1 && state.position < 1
      ? [`${name}+`]
      : next === 0 && state.position > 0
        ? [`${name}-`]
        : [];
  return { state: { position: next }, events };
}

/** Single-acting: A extends against the spring; when A vents, the spring retracts. */
export const singleCylinder = (id: string): Behavior<CylinderLogicState> => ({
  init: () => ({ position: 0 }),
  edges: () => [],
  integrate(state, ctx, dtMs) {
    const a = ctx.net('A');
    if (a === 'PRESSURE') return move(state, 1, ctx.feed('A'), ctx, dtMs, id);
    if (a === 'EXHAUST') return move(state, -1, ctx.vent('A'), ctx, dtMs, id);
    return { state }; // trapped air holds the piston
  },
});

/** Double-acting: moves only when one chamber is pressurized and the other vents. */
export const doubleCylinder = (id: string): Behavior<CylinderLogicState> => ({
  init: () => ({ position: 0 }),
  edges: () => [],
  integrate(state, ctx, dtMs) {
    const a = ctx.net('A');
    const b = ctx.net('B');
    if (a === 'PRESSURE' && b === 'EXHAUST') {
      return move(state, 1, Math.min(ctx.feed('A'), ctx.vent('B')), ctx, dtMs, id);
    }
    if (b === 'PRESSURE' && a === 'EXHAUST') {
      return move(state, -1, Math.min(ctx.feed('B'), ctx.vent('A')), ctx, dtMs, id);
    }
    return { state };
  },
});

export interface MotorLogicState {
  /** Rotation direction: 1 when A drives, -1 when B drives. */
  direction: -1 | 0 | 1;
}

const motor: Behavior<MotorLogicState> = {
  init: () => ({ direction: 0 }),
  edges: () => [],
  integrate(state, ctx) {
    const a = ctx.net('A');
    const b = ctx.net('B');
    const direction =
      a === 'PRESSURE' && b === 'EXHAUST' ? 1 : b === 'PRESSURE' && a === 'EXHAUST' ? -1 : 0;
    return { state: direction === state.direction ? state : { direction } };
  },
};

// ---------------------------------------------------------------- other parts

const stateless = (edges: (ctx: LogicContext) => FluidEdge[]): Behavior<null> => ({
  init: () => null,
  edges: (_s, ctx) => edges(ctx),
});

const factorParam = (ctx: LogicContext) =>
  Math.min(1, Math.max(0.01, num(ctx.params, 'speedFactor', 0.5)));

/*
 * Two-input valves never link X and Y with each other (the ball or the double
 * piston always seals one side), otherwise one input would pressurize the
 * other through the valve and latch. Edges are therefore directed:
 *   into the output from a pressurized input, out of the output for venting.
 */
const feedOut = (input: string): FluidEdge[] => [{ from: input, to: '2', factor: 1 }];
const ventVia = (input: string): FluidEdge[] => [{ from: '2', to: input, factor: 1 }];

/** Shuttle (OR): the output follows the pressurized input(s); with none, it vents through both. */
const orValve = stateless((ctx) => {
  const x = ctx.net('X') === 'PRESSURE';
  const y = ctx.net('Y') === 'PRESSURE';
  if (x && y) return [...feedOut('X'), ...feedOut('Y')];
  if (x) return both('X', '2');
  if (y) return both('Y', '2');
  return [...ventVia('X'), ...ventVia('Y')];
});

/** Two-pressure valve (AND): the output connects to the input with the lower pressure. */
const andValve = stateless((ctx) => {
  const x = ctx.net('X') === 'PRESSURE';
  const y = ctx.net('Y') === 'PRESSURE';
  if (x && y) return [...feedOut('X'), ...feedOut('Y')];
  if (x) return both('Y', '2');
  if (y) return both('X', '2');
  return [...ventVia('X'), ...ventVia('Y')];
});

/** Quick exhaust: 1 -> 2 while 1 is pressurized; otherwise 2 vents directly. */
const quickExhaust = stateless((ctx) =>
  ctx.net('1') === 'PRESSURE'
    ? [{ from: '1', to: '2', factor: 1 }]
    : [{ from: '2', to: ATM, factor: 1 }],
);

const STATIC: Record<string, Behavior> = {
  'pn.source': stateless(() => [{ from: SOURCE, to: '1', factor: 1 }]),
  'pn.exhaust': stateless(() => [{ from: '1', to: ATM, factor: 1 }]),
  'pn.silencer': stateless(() => [{ from: '1', to: ATM, factor: 1 }]),
  'pn.gauge': stateless(() => []),
  'fluid.junction': stateless(() => []),
  'pn.filter': stateless(() => both('1', '2')),
  // TODO(galdetu): logic level ignores the regulated pressure value.
  'pn.valve.pressure-reg': stateless(() => both('1', '2')),
  'pn.service-unit': stateless(() => both('1', '2')),
  'pn.valve.shutoff': stateless((ctx) => (ctx.input.left === true ? [] : both('1', '2'))),
  'pn.valve.check': stateless(() => [{ from: '1', to: '2', factor: 1 }]),
  'pn.valve.flow-oneway': stateless((ctx) => [
    { from: '1', to: '2', factor: factorParam(ctx) },
    { from: '2', to: '1', factor: 1 },
  ]),
  'pn.valve.throttle': stateless((ctx) => both('1', '2', factorParam(ctx))),
  'pn.valve.or': orValve,
  'pn.valve.and': andValve,
  'pn.valve.quick-exhaust': quickExhaust,
  'pn.motor': motor,
  // Vacuum is not modelled at the logic level yet: the ejector only exhausts its supply.
  'pn.vacuum-ejector': stateless((ctx) => [
    { from: '1', to: '3', factor: 1 },
    ...ventIfFree(ctx, '3'),
  ]),
  'pn.suction-cup': stateless(() => []),
};

const CYLINDERS: Record<string, (id: string) => Behavior> = {
  'pn.cyl.single': singleCylinder as (id: string) => Behavior,
  'pn.cyl.double': doubleCylinder as (id: string) => Behavior,
  'pn.cyl.double-cushion': doubleCylinder as (id: string) => Behavior,
  'pn.cyl.double-rod': doubleCylinder as (id: string) => Behavior,
};

const VALVES = new Map(VALVE_SPECS.map((s) => [s.type, valveBehavior(s) as Behavior]));

/**
 * Behaviour for a component. Cylinders get their id so events can fall back to
 * it when the part has no label.
 */
export function pneumaticBehavior(type: string, componentId: string): Behavior | undefined {
  return VALVES.get(type) ?? STATIC[type] ?? CYLINDERS[type]?.(componentId);
}

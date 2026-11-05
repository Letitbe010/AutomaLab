/**
 * Simulation engine types (SPEC §6). Pure TypeScript: the engine knows no UI
 * and no concrete component; behaviours are looked up by component type.
 */
import type { Params } from '../core/types';

/** Logic-level state of a pneumatic node (SPEC §6.2). Hydraulics will add TANK. */
export type NodeState = 'PRESSURE' | 'EXHAUST' | 'BLOCKED';

/** Pseudo-ports used in edges: compressed-air supply and atmosphere. */
export const SOURCE = '@source';
export const ATM = '@atm';

/**
 * Directed conduction inside a component: air can flow from `from` to `to`.
 * `factor` (0..1] is the relative flow capacity (throttles < 1), used for the
 * logic-level speed factor of cylinders.
 */
export interface FluidEdge {
  from: string;
  to: string;
  factor: number;
}

/** Manual / electrical / mechanical actuation of a component's left and right operators. */
export interface ActuationInput {
  left?: boolean;
  right?: boolean;
}

export interface LogicContext {
  params: Params;
  /** Node state of the net a port belongs to (from the previous solver pass). */
  net(portId: string): NodeState;
  /** Best flow factor with which the port's net is fed from a source (0 = not pressurized). */
  feed(portId: string): number;
  /** Best flow factor with which the port's net can vent to atmosphere (0 = cannot). */
  vent(portId: string): number;
  /** Whether a connection is attached to the port. */
  connected(portId: string): boolean;
  input: ActuationInput;
  supplyBar: number;
}

export interface IntegrateResult<S> {
  state: S;
  /** Sequence events such as "1A+" (cylinder reached the front end). */
  events?: string[];
}

export interface Behavior<S = unknown> {
  init(params: Params): S;
  /** Internal conduction in the current state. May depend on node states (shuttle valves). */
  edges(state: S, ctx: LogicContext): FluidEdge[];
  /** Discrete update (valve positions), repeated until a fixed point is reached. */
  update?(state: S, ctx: LogicContext): S;
  /** Continuous update once per time step (cylinder motion, timers). */
  integrate?(state: S, ctx: LogicContext, dtMs: number): IntegrateResult<S>;
}

export type BehaviorLookup = (type: string) => Behavior | undefined;

export type SimWarning =
  | { code: 'oscillation'; timeMs: number }
  | { code: 'supplyVented'; timeMs: number; ports: string[] }
  | { code: 'unsupported'; type: string; componentIds: string[] }
  /** Both operators of a bistable or 5/3 valve are signalled at the same time. */
  | { code: 'bothSignals'; timeMs: number; componentId: string }
  /** +24 V connected to 0 V through conductors only (SPEC §6.4). */
  | { code: 'shortCircuit'; timeMs: number };

export interface SimEvent {
  timeMs: number;
  name: string;
  componentId: string;
}

/**
 * Directional valves as pure data (no React): ports, switching positions and
 * operators. The symbol factory draws them; the logic solver (phase 2a) will
 * read the same internal path tables (SPEC §6.2).
 */

export const BOX = 40;

export type Side = 'top' | 'bottom';

export interface PortSlot {
  id: string;
  /** Horizontal offset inside the box, in pixels (multiple of 10). */
  x: number;
  side: Side;
}

/** Internal path of one switching position. */
export type BoxPath = { kind: 'flow'; from: string; to: string } | { kind: 'block'; port: string };

export type Operator =
  'spring' | 'button' | 'pedal' | 'lever' | 'roller' | 'idleRoller' | 'pilot' | 'solenoid';

export interface ValveSpec {
  type: string;
  ways: '3/2' | '5/2' | '5/3';
  /** i18n key for the normal-position / centre description, e.g. "NI". */
  variantKey: string;
  ports: PortSlot[];
  /** Positions left to right; positions[i] is drawn in box i. */
  positions: BoxPath[][];
  /** Index of the box sitting on the ports at rest. */
  rest: number;
  /** Operators on each side, outermost last. Left operators switch to box 0, right ones to the last box. */
  left: Operator[];
  right: Operator[];
  /** Pilot port names (ISO 5599: the port pair the pilot connects, e.g. 14 = 1 -> 4). */
  leftPilotPort?: string;
  rightPilotPort?: string;
  labelPrefix: string;
}

const flow = (from: string, to: string): BoxPath => ({ kind: 'flow', from, to });
const block = (port: string): BoxPath => ({ kind: 'block', port });

const PORTS_32: PortSlot[] = [
  { id: '2', x: 10, side: 'top' },
  { id: '1', x: 10, side: 'bottom' },
  { id: '3', x: 30, side: 'bottom' },
];

const PORTS_5: PortSlot[] = [
  { id: '4', x: 10, side: 'top' },
  { id: '2', x: 30, side: 'top' },
  { id: '5', x: 10, side: 'bottom' },
  { id: '1', x: 20, side: 'bottom' },
  { id: '3', x: 30, side: 'bottom' },
];

const OPEN_12 = [flow('1', '2'), block('3')];
const EXHAUST_23 = [flow('2', '3'), block('1')];
const POS_14 = [flow('1', '4'), flow('2', '3'), block('5')];
const POS_12 = [flow('1', '2'), flow('4', '5'), block('3')];

const CENTRES = {
  c: { key: 'comp.valve.centre.closed', paths: ['4', '2', '5', '1', '3'].map(block) },
  e: { key: 'comp.valve.centre.exhaust', paths: [flow('4', '5'), flow('2', '3'), block('1')] },
  p: {
    key: 'comp.valve.centre.pressure',
    paths: [flow('1', '4'), flow('1', '2'), block('5'), block('3')],
  },
} as const;

const OP_SLUG: Record<Operator, string> = {
  spring: 'spring',
  button: 'button',
  pedal: 'pedal',
  lever: 'lever',
  roller: 'roller',
  idleRoller: 'idleroller',
  pilot: 'pilot',
  solenoid: 'sol',
};

/** Mechanically actuated valves are signal elements ("S"); the rest are control valves ("V"). */
// TODO(galdetu): labelling of limit valves: 1S1/1S2 (SPEC §4, §11) or a0/a1 (SPEC §8.8)?
const prefixFor = (op: Operator) => (op === 'roller' || op === 'idleRoller' ? '1S' : '1V');

function valve32(normal: 'nc' | 'no', op: Operator): ValveSpec {
  const nc = normal === 'nc';
  return {
    type: `pn.valve.3-2${nc ? '' : 'no'}.${OP_SLUG[op]}-spring`,
    ways: '3/2',
    variantKey: nc ? 'comp.valve.nc' : 'comp.valve.no',
    ports: PORTS_32,
    positions: nc ? [OPEN_12, EXHAUST_23] : [EXHAUST_23, OPEN_12],
    rest: 1,
    left: [op],
    right: ['spring'],
    ...(op === 'pilot' ? { leftPilotPort: nc ? '12' : '10' } : {}),
    labelPrefix: prefixFor(op),
  };
}

function valve52mono(op: Operator): ValveSpec {
  return {
    type: `pn.valve.5-2.${OP_SLUG[op]}-spring`,
    ways: '5/2',
    variantKey: 'comp.valve.mono',
    ports: PORTS_5,
    positions: [POS_14, POS_12],
    rest: 1,
    left: [op],
    right: ['spring'],
    ...(op === 'pilot' ? { leftPilotPort: '14' } : {}),
    labelPrefix: prefixFor(op),
  };
}

function valve52bi(op: 'pilot' | 'solenoid', type: string): ValveSpec {
  return {
    type,
    ways: '5/2',
    variantKey: 'comp.valve.bi',
    ports: PORTS_5,
    positions: [POS_14, POS_12],
    rest: 1,
    left: [op],
    right: [op],
    ...(op === 'pilot' ? { leftPilotPort: '14', rightPilotPort: '12' } : {}),
    labelPrefix: '1V',
  };
}

function valve53(centre: keyof typeof CENTRES, op: 'pilot' | 'solenoid'): ValveSpec {
  return {
    type: `pn.valve.5-3${centre}.${OP_SLUG[op]}`,
    ways: '5/3',
    variantKey: CENTRES[centre].key,
    ports: PORTS_5,
    positions: [POS_14, [...CENTRES[centre].paths], POS_12],
    rest: 1,
    left: [op, 'spring'],
    right: [op, 'spring'],
    ...(op === 'pilot' ? { leftPilotPort: '14', rightPilotPort: '12' } : {}),
    labelPrefix: '1V',
  };
}

const MONO_32: Operator[] = [
  'button',
  'pedal',
  'lever',
  'roller',
  'idleRoller',
  'pilot',
  'solenoid',
];
const MONO_52: Operator[] = ['button', 'lever', 'roller', 'pilot', 'solenoid'];

/** P1 directional valves (SPEC §5.1). Type ids are stable: exercises refer to them. */
export const VALVE_SPECS: ValveSpec[] = [
  ...MONO_32.map((op) => valve32('nc', op)),
  valve32('no', 'button'),
  valve32('no', 'pilot'),
  ...MONO_52.map(valve52mono),
  valve52bi('pilot', 'pn.valve.5-2.pilot'),
  valve52bi('solenoid', 'pn.valve.5-2.sol'),
  ...(['c', 'e', 'p'] as const).flatMap((c) => [valve53(c, 'pilot'), valve53(c, 'solenoid')]),
];

/** Port position in grid units: top ports one unit above the box, bottom ones one below. */
export function portGrid(slot: PortSlot): [number, number] {
  return [slot.x / 10, slot.side === 'top' ? -1 : BOX / 10 + 1];
}

/** Vertical position (px) of each operator on a side: one centred, or two stacked. */
export function operatorYs(count: number): number[] {
  return count === 1 ? [BOX / 2] : [10, 30];
}

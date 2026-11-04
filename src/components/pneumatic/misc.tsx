/** Non-directional P1 pneumatic parts (SPEC §5.1). */
import type { ComponentDef } from '../../core/componentDef';
import { ExhaustTriangle, FlowArrow, Seat, STROKE, SymbolGroup } from '../../symbols/primitives';

const label = { key: 'label', labelKey: 'param.label', type: 'string', default: '' } as const;

/** Exhaust to atmosphere. Port 1 on top. */
export const exhaust: ComponentDef<null> = {
  type: 'pn.exhaust',
  domain: 'pneumatic',
  group: 'supply',
  nameKey: 'comp.exhaust.name',
  helpKey: 'comp.exhaust.help',
  labelPrefix: '',
  bounds: [-1, -1, 2, 2],
  ports: [{ id: '1', kind: 'fluid', x: 0, y: -1 }],
  params: [],
  initState: () => null,
  symbol: () => (
    <SymbolGroup>
      <line x1={0} y1={-10} x2={0} y2={0} />
      <ExhaustTriangle x={0} y={0} />
    </SymbolGroup>
  ),
};

/** Pressure gauge. Port 1 at the bottom. */
export const gauge: ComponentDef<null> = {
  type: 'pn.gauge',
  domain: 'pneumatic',
  group: 'measure',
  nameKey: 'comp.gauge.name',
  helpKey: 'comp.gauge.help',
  labelPrefix: '0Z',
  bounds: [-1.5, -1.5, 3, 4.5],
  labelAt: [1.6, -0.6],
  ports: [{ id: '1', kind: 'fluid', x: 0, y: 3 }],
  params: [label],
  initState: () => null,
  symbol: () => (
    <SymbolGroup>
      <line x1={0} y1={12} x2={0} y2={30} />
      <circle cx={0} cy={0} r={12} />
      <FlowArrow x1={-7} y1={7} x2={7} y2={-7} head={5} />
    </SymbolGroup>
  ),
};

export interface CylinderState {
  position: number;
}

/** Double-acting cylinder: A feeds the cap end (extends), B the rod end (retracts). */
// TODO(galdetu): default bore/rod/stroke are the SPEC §4 example values (32/12/100 mm).
export const cylinderDouble: ComponentDef<CylinderState> = {
  type: 'pn.cyl.double',
  domain: 'pneumatic',
  group: 'actuators',
  nameKey: 'comp.cylDouble.name',
  helpKey: 'comp.cylDouble.help',
  labelPrefix: '1A',
  bounds: [0, -0.5, 18, 4.5],
  labelAt: [0, -0.8],
  ports: [
    { id: 'A', kind: 'fluid', x: 1, y: 4 },
    { id: 'B', kind: 'fluid', x: 9, y: 4 },
  ],
  params: [
    label,
    { key: 'boreMm', labelKey: 'param.boreMm', type: 'number', default: 32, unit: 'mm', min: 1 },
    { key: 'rodMm', labelKey: 'param.rodMm', type: 'number', default: 12, unit: 'mm', min: 1 },
    {
      key: 'strokeMm',
      labelKey: 'param.strokeMm',
      type: 'number',
      default: 100,
      unit: 'mm',
      min: 1,
    },
  ],
  initState: () => ({ position: 0 }),
  previewStates: [
    { nameKey: 'comp.cylSingle.retracted', state: { position: 0 } },
    { nameKey: 'comp.cylSingle.half', state: { position: 0.5 } },
    { nameKey: 'comp.cylSingle.extended', state: { position: 1 } },
  ],
  symbol: ({ state }) => {
    const p = Math.min(1, Math.max(0, state.position));
    const px = 16 + p * 58;
    const rodEnd = 110 + p * 58;
    return (
      <SymbolGroup>
        <line x1={10} y1={30} x2={10} y2={40} />
        <line x1={90} y1={30} x2={90} y2={40} />
        <rect x={0} y={0} width={100} height={30} />
        <rect x={px} y={2} width={4} height={26} fill={STROKE} />
        <rect x={px + 4} y={12} width={rodEnd - px - 4} height={6} fill="var(--panel)" />
      </SymbolGroup>
    );
  },
};

/** Ball and seat, free flow towards +x (ball lifts off the seat). */
function CheckElement({ x, y }: { x: number; y: number }) {
  return (
    <>
      <Seat x={x - 5} y={y} dir={1} />
      <circle cx={x + 3} cy={y} r={4.5} />
    </>
  );
}

/** Non-return valve: free flow 1 -> 2, blocked 2 -> 1. */
// TODO(galdetu): check-valve orientation and drawing against ISO 1219-1.
export const checkValve: ComponentDef<null> = {
  type: 'pn.valve.check',
  domain: 'pneumatic',
  group: 'logic',
  nameKey: 'comp.check.name',
  helpKey: 'comp.check.help',
  labelPrefix: '1V',
  bounds: [-0.5, -1.5, 5, 3],
  labelAt: [0, -1.7],
  ports: [
    { id: '1', kind: 'fluid', x: 0, y: 0 },
    { id: '2', kind: 'fluid', x: 4, y: 0 },
  ],
  params: [label],
  initState: () => null,
  symbol: () => (
    <SymbolGroup>
      <line x1={0} y1={0} x2={15} y2={0} />
      <CheckElement x={20} y={0} />
      <line x1={27.5} y1={0} x2={40} y2={0} />
    </SymbolGroup>
  ),
};

/** One-way flow control: throttled 1 -> 2, free return 2 -> 1 through the check valve. */
// TODO(galdetu): default speed factor (SPEC §6.2 "abiadura-faktorea") for the logic level.
export const flowControlOneWay: ComponentDef<null> = {
  type: 'pn.valve.flow-oneway',
  domain: 'pneumatic',
  group: 'logic',
  nameKey: 'comp.flowOneWay.name',
  helpKey: 'comp.flowOneWay.help',
  labelPrefix: '1V',
  bounds: [-0.5, -2.5, 7, 5],
  labelAt: [0, -2.7],
  ports: [
    { id: '1', kind: 'fluid', x: 0, y: 0 },
    { id: '2', kind: 'fluid', x: 6, y: 0 },
  ],
  params: [
    label,
    {
      key: 'speedFactor',
      labelKey: 'param.speedFactor',
      type: 'number',
      default: 0.5,
      min: 0.05,
      max: 1,
    },
  ],
  initState: () => null,
  symbol: () => (
    <SymbolGroup>
      <line x1={0} y1={0} x2={10} y2={0} />
      <line x1={50} y1={0} x2={60} y2={0} />
      {/* Throttle branch (top) */}
      <polyline points="10,0 10,-14 20,-14" />
      <path d="M 20 -18 Q 30 -12 40 -18" />
      <path d="M 20 -10 Q 30 -16 40 -10" />
      <polyline points="40,-14 50,-14 50,0" />
      <FlowArrow x1={22} y1={-4} x2={38} y2={-24} head={5} />
      {/* Bypass check valve (bottom), free flow 2 -> 1 */}
      <polyline points="10,0 10,14 22,14" />
      <g transform="translate(60 0) scale(-1 1)">
        <CheckElement x={30} y={14} />
      </g>
      <polyline points="37,14 50,14 50,0" />
    </SymbolGroup>
  ),
};

/**
 * Two-input logic valves. Inputs X (left) and Y (right), output 2 on top.
 * OR (shuttle): a free ball between two seats. AND (two-pressure): a double piston.
 */
// TODO(galdetu): port names of AND/OR valves (X, Y, 2?) and their drawing.
function logicValve(kind: 'or' | 'and'): ComponentDef<null> {
  return {
    type: `pn.valve.${kind}`,
    domain: 'pneumatic',
    group: 'logic',
    nameKey: `comp.${kind}.name`,
    helpKey: `comp.${kind}.help`,
    labelPrefix: '1V',
    bounds: [-0.5, -2.5, 5, 4],
    labelAt: [2.8, -1.6],
    ports: [
      { id: 'X', kind: 'fluid', x: 0, y: 0 },
      { id: 'Y', kind: 'fluid', x: 4, y: 0 },
      { id: '2', kind: 'fluid', x: 2, y: -2 },
    ],
    params: [label],
    initState: () => null,
    symbol: () => (
      <SymbolGroup>
        <line x1={0} y1={0} x2={6} y2={0} />
        <line x1={34} y1={0} x2={40} y2={0} />
        <line x1={20} y1={-20} x2={20} y2={-8} />
        <rect x={6} y={-8} width={28} height={16} />
        <Seat x={10} y={0} dir={1} />
        <Seat x={30} y={0} dir={-1} />
        {kind === 'or' ? (
          <circle cx={20} cy={0} r={4.5} />
        ) : (
          <>
            <rect x={13} y={-4.5} width={3} height={9} fill={STROKE} />
            <rect x={24} y={-4.5} width={3} height={9} fill={STROKE} />
            <line x1={16} y1={0} x2={24} y2={0} />
          </>
        )}
      </SymbolGroup>
    ),
  };
}

export const orValve = logicValve('or');
export const andValve = logicValve('and');

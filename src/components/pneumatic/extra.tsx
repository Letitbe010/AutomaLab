/**
 * P2/P3 pneumatic parts (SPEC §5.1): air preparation, more actuators, vacuum,
 * quick exhaust and two-way throttle. Symbols only until the solvers support them.
 */
// TODO(galdetu): review all these drawings against ISO 1219-1.
import type { ComponentDef } from '../../core/componentDef';
import {
  ExhaustTriangle,
  FlowArrow,
  Seat,
  Spring,
  STROKE,
  SymbolGroup,
  Throttle,
} from '../../symbols/primitives';
import type { CylinderState } from './misc';

const label = { key: 'label', labelKey: 'param.label', type: 'string', default: '' } as const;

/** Two horizontal ports, 1 (in) on the left and 2 (out) on the right, `len` grid units apart. */
const inOut = (len: number) =>
  [
    { id: '1', kind: 'fluid', x: 0, y: 0 },
    { id: '2', kind: 'fluid', x: len, y: 0 },
  ] as const;

const none = () => null;

/** Filter: diamond with a dashed filter element across. */
function FilterShape({ x }: { x: number }) {
  return (
    <>
      <polygon points={`${x},-10 ${x + 10},0 ${x},10 ${x - 10},0`} />
      <line x1={x} y1={-10} x2={x} y2={10} strokeDasharray="2.5 2" />
    </>
  );
}

export const filter: ComponentDef<null> = {
  type: 'pn.filter',
  domain: 'pneumatic',
  group: 'supply',
  nameKey: 'comp.filter.name',
  helpKey: 'comp.filter.help',
  labelPrefix: '0Z',
  bounds: [-0.5, -1.5, 5, 3],
  labelAt: [0, -1.6],
  ports: [...inOut(4)],
  params: [label],
  initState: none,
  symbol: () => (
    <SymbolGroup>
      <line x1={0} y1={0} x2={10} y2={0} />
      <FilterShape x={20} />
      <line x1={30} y1={0} x2={40} y2={0} />
    </SymbolGroup>
  ),
};

/** Pressure regulator body (relieving), centred at x. */
function RegulatorShape({ x }: { x: number }) {
  return (
    <>
      <rect x={x - 10} y={-10} width={20} height={20} />
      <FlowArrow x1={x - 10} y1={3} x2={x + 10} y2={3} head={5} />
      <g transform={`translate(${x} -10) rotate(90)`}>
        <Spring x1={0} x2={-14} y={0} amplitude={4} coils={3} />
      </g>
      <FlowArrow x1={x - 7} y1={-14} x2={x + 7} y2={-22} head={3.5} />
      <polyline points={`${x + 14},0 ${x + 14},16 ${x},16 ${x},10`} strokeDasharray="3 2.5" />
    </>
  );
}

export const pressureRegulator: ComponentDef<null> = {
  type: 'pn.valve.pressure-reg',
  domain: 'pneumatic',
  group: 'supply',
  nameKey: 'comp.regulator.name',
  helpKey: 'comp.regulator.help',
  labelPrefix: '0Z',
  bounds: [-0.5, -2.5, 5, 4.5],
  labelAt: [3.2, -1.6],
  ports: [...inOut(4)],
  params: [
    label,
    {
      key: 'setBar',
      labelKey: 'param.setBar',
      type: 'number',
      default: 6,
      unit: 'bar',
      min: 0,
      max: 16,
    },
  ],
  initState: none,
  symbol: () => (
    <SymbolGroup>
      <line x1={0} y1={0} x2={10} y2={0} />
      <RegulatorShape x={20} />
      <line x1={30} y1={0} x2={40} y2={0} />
    </SymbolGroup>
  ),
};

/** Service unit: filter, regulator and gauge inside a dash-dotted frame. */
export const serviceUnit: ComponentDef<null> = {
  type: 'pn.service-unit',
  domain: 'pneumatic',
  group: 'supply',
  nameKey: 'comp.serviceUnit.name',
  helpKey: 'comp.serviceUnit.help',
  labelPrefix: '0Z',
  bounds: [-0.5, -4.5, 9, 7],
  labelAt: [0, -4.6],
  ports: [...inOut(8)],
  params: [
    label,
    {
      key: 'setBar',
      labelKey: 'param.setBar',
      type: 'number',
      default: 6,
      unit: 'bar',
      min: 0,
      max: 16,
    },
  ],
  initState: none,
  symbol: () => (
    <SymbolGroup>
      <rect x={5} y={-40} width={70} height={62} strokeDasharray="8 3 2 3" />
      <line x1={0} y1={0} x2={10} y2={0} />
      <FilterShape x={20} />
      <line x1={30} y1={0} x2={40} y2={0} />
      <RegulatorShape x={50} />
      <line x1={60} y1={0} x2={80} y2={0} />
      <line x1={68} y1={0} x2={68} y2={-18} />
      <circle cx={68} cy={-27} r={9} />
      <FlowArrow x1={63} y1={-22} x2={73} y2={-32} head={4} />
    </SymbolGroup>
  ),
};

export const silencer: ComponentDef<null> = {
  type: 'pn.silencer',
  domain: 'pneumatic',
  group: 'supply',
  nameKey: 'comp.silencer.name',
  helpKey: 'comp.silencer.help',
  labelPrefix: '',
  bounds: [-1, -1, 2, 2.5],
  ports: [{ id: '1', kind: 'fluid', x: 0, y: -1 }],
  params: [],
  initState: none,
  symbol: () => (
    <SymbolGroup>
      <line x1={0} y1={-10} x2={0} y2={0} />
      <polygon points="0,0 -7,10 7,10" fill="var(--panel)" />
      <line x1={-7} y1={13} x2={7} y2={13} />
    </SymbolGroup>
  ),
};

/** Manual shut-off valve (2/2), drawn as a ball-valve bow-tie with a hand lever. */
export const shutOffValve: ComponentDef<null> = {
  type: 'pn.valve.shutoff',
  domain: 'pneumatic',
  group: 'supply',
  nameKey: 'comp.shutoff.name',
  helpKey: 'comp.shutoff.help',
  labelPrefix: '0V',
  bounds: [-0.5, -2, 5, 3.5],
  labelAt: [0, -2],
  ports: [...inOut(4)],
  params: [label],
  initState: none,
  symbol: () => (
    <SymbolGroup>
      <line x1={0} y1={0} x2={10} y2={0} />
      <polygon points="10,-7 20,0 10,7" />
      <polygon points="30,-7 20,0 30,7" />
      <line x1={30} y1={0} x2={40} y2={0} />
      <line x1={20} y1={0} x2={20} y2={-12} />
      <line x1={14} y1={-12} x2={26} y2={-12} />
    </SymbolGroup>
  ),
};

/** Double-acting cylinder with adjustable cushioning at both ends. */
// TODO(galdetu): default bore/rod/stroke are the SPEC §4 example values (32/12/100 mm).
function cylinderParams() {
  return [
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
    {
      key: 'strokeTimeS',
      labelKey: 'param.strokeTimeS',
      type: 'number',
      default: 1,
      unit: 's',
      min: 0.05,
      max: 60,
    },
  ] as ComponentDef['params'];
}

const cylPreview = [
  { nameKey: 'comp.cylSingle.retracted', state: { position: 0 } },
  { nameKey: 'comp.cylSingle.half', state: { position: 0.5 } },
  { nameKey: 'comp.cylSingle.extended', state: { position: 1 } },
];

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export const cylinderCushioned: ComponentDef<CylinderState> = {
  type: 'pn.cyl.double-cushion',
  domain: 'pneumatic',
  group: 'actuators',
  nameKey: 'comp.cylCushion.name',
  helpKey: 'comp.cylCushion.help',
  labelPrefix: '1A',
  bounds: [0, -0.5, 18, 4.5],
  limitMarks: { '-': [110, 12], '+': [156, 12] },
  labelAt: [0, -0.8],
  ports: [
    { id: 'A', kind: 'fluid', x: 1, y: 4 },
    { id: 'B', kind: 'fluid', x: 9, y: 4 },
  ],
  params: cylinderParams(),
  initState: () => ({ position: 0 }),
  previewStates: cylPreview,
  symbol: ({ state }) => {
    const p = clamp01(state.position);
    const px = 22 + p * 46;
    const rodEnd = 110 + p * 46;
    return (
      <SymbolGroup>
        <line x1={10} y1={30} x2={10} y2={40} />
        <line x1={90} y1={30} x2={90} y2={40} />
        <rect x={0} y={0} width={100} height={30} />
        <rect x={2} y={10} width={8} height={10} />
        <rect x={90} y={10} width={8} height={10} />
        <FlowArrow x1={0} y1={26} x2={14} y2={4} head={3.5} />
        <FlowArrow x1={86} y1={26} x2={100} y2={4} head={3.5} />
        <rect x={px} y={2} width={4} height={26} fill={STROKE} />
        <rect x={px - 6} y={11} width={6} height={8} fill={STROKE} />
        <rect x={px + 4} y={11} width={6} height={8} fill={STROKE} />
        <rect x={px + 10} y={12} width={rodEnd - px - 10} height={6} fill="var(--panel)" />
      </SymbolGroup>
    );
  },
};

/** Double-acting cylinder with a through rod (equal areas on both sides). */
export const cylinderDoubleRod: ComponentDef<CylinderState> = {
  type: 'pn.cyl.double-rod',
  domain: 'pneumatic',
  group: 'actuators',
  nameKey: 'comp.cylDoubleRod.name',
  helpKey: 'comp.cylDoubleRod.help',
  labelPrefix: '1A',
  bounds: [-8, -0.5, 26, 4.5],
  limitMarks: { '-': [116, 12], '+': [180, 12] },
  labelAt: [0, -0.8],
  ports: [
    { id: 'A', kind: 'fluid', x: 1, y: 4 },
    { id: 'B', kind: 'fluid', x: 9, y: 4 },
  ],
  params: cylinderParams(),
  initState: () => ({ position: 0 }),
  previewStates: cylPreview,
  symbol: ({ state }) => {
    const p = clamp01(state.position);
    const px = 16 + p * 64;
    // Rod length on each side exceeds the travel, so it always passes through both end caps.
    return (
      <SymbolGroup>
        <line x1={10} y1={30} x2={10} y2={40} />
        <line x1={90} y1={30} x2={90} y2={40} />
        <rect x={0} y={0} width={100} height={30} />
        <rect x={px - 90} y={12} width={90} height={6} fill="var(--panel)" />
        <rect x={px + 4} y={12} width={96} height={6} fill="var(--panel)" />
        <rect x={px} y={2} width={4} height={26} fill={STROKE} />
      </SymbolGroup>
    );
  },
};

/** Pneumatic motor, two directions: air in A turns one way, in B the other. */
export const motor: ComponentDef<null> = {
  type: 'pn.motor',
  domain: 'pneumatic',
  group: 'actuators',
  nameKey: 'comp.motor.name',
  helpKey: 'comp.motor.help',
  labelPrefix: '1M',
  bounds: [-1.5, -2, 4.5, 4],
  labelAt: [1.6, -1.4],
  ports: [
    { id: 'A', kind: 'fluid', x: 0, y: -2 },
    { id: 'B', kind: 'fluid', x: 0, y: 2 },
  ],
  params: [label],
  initState: none,
  symbol: () => (
    <SymbolGroup>
      <line x1={0} y1={-20} x2={0} y2={-12} />
      <line x1={0} y1={12} x2={0} y2={20} />
      <circle cx={0} cy={0} r={12} />
      <polygon points="0,-12 -4,-6 4,-6" fill="var(--panel)" />
      <polygon points="0,12 -4,6 4,6" fill="var(--panel)" />
      <line x1={12} y1={-2} x2={26} y2={-2} />
      <line x1={12} y1={2} x2={26} y2={2} />
      <path d="M 16 -14 A 16 16 0 0 1 16 14" />
    </SymbolGroup>
  ),
};

/** Vacuum generator (ejector): 1 supply, 3 exhaust, 2 vacuum. */
export const vacuumEjector: ComponentDef<null> = {
  type: 'pn.vacuum-ejector',
  domain: 'pneumatic',
  group: 'vacuum',
  nameKey: 'comp.ejector.name',
  helpKey: 'comp.ejector.help',
  labelPrefix: '1V',
  bounds: [-0.5, -2.5, 5, 4],
  labelAt: [0, -2.4],
  ports: [
    { id: '1', kind: 'fluid', x: 0, y: 0 },
    { id: '3', kind: 'fluid', x: 4, y: 0, vent: true },
    { id: '2', kind: 'fluid', x: 2, y: -2 },
  ],
  params: [label],
  initState: none,
  symbol: () => (
    <SymbolGroup>
      <line x1={0} y1={0} x2={6} y2={0} />
      <line x1={34} y1={0} x2={40} y2={0} />
      <line x1={20} y1={-20} x2={20} y2={-9} />
      <rect x={6} y={-9} width={28} height={18} />
      <polyline points="8,-6 18,0 8,6" />
      <polyline points="32,-6 22,0 32,6" />
      <line x1={18} y1={0} x2={22} y2={0} />
    </SymbolGroup>
  ),
};

/** Suction cup. Port 1 (vacuum) on top. */
export const suctionCup: ComponentDef<null> = {
  type: 'pn.suction-cup',
  domain: 'pneumatic',
  group: 'vacuum',
  nameKey: 'comp.cup.name',
  helpKey: 'comp.cup.help',
  labelPrefix: '1Z',
  bounds: [-1.5, -1, 3, 2.5],
  labelAt: [1.6, -0.2],
  ports: [{ id: '1', kind: 'fluid', x: 0, y: -1 }],
  params: [label],
  initState: none,
  symbol: () => (
    <SymbolGroup>
      <line x1={0} y1={-10} x2={0} y2={2} />
      <path d="M -12 12 Q -10 2 0 2 Q 10 2 12 12" />
      <line x1={-12} y1={12} x2={12} y2={12} />
    </SymbolGroup>
  ),
};

/** Quick exhaust valve: 1 -> 2 to the cylinder; 2 exhausts directly to atmosphere when 1 drops. */
export const quickExhaust: ComponentDef<null> = {
  type: 'pn.valve.quick-exhaust',
  domain: 'pneumatic',
  group: 'logic',
  nameKey: 'comp.quickExhaust.name',
  helpKey: 'comp.quickExhaust.help',
  labelPrefix: '1V',
  bounds: [-0.5, -2.5, 5, 4.5],
  labelAt: [2.8, -1.6],
  ports: [
    { id: '1', kind: 'fluid', x: 0, y: 0 },
    { id: '2', kind: 'fluid', x: 2, y: -2 },
  ],
  params: [label],
  initState: none,
  symbol: () => (
    <SymbolGroup>
      <line x1={0} y1={0} x2={6} y2={0} />
      <line x1={20} y1={-20} x2={20} y2={-8} />
      <rect x={6} y={-8} width={28} height={16} />
      <Seat x={10} y={0} dir={1} />
      <Seat x={30} y={0} dir={-1} />
      <circle cx={20} cy={0} r={4.5} />
      <line x1={34} y1={0} x2={40} y2={0} />
      <ExhaustTriangle x={40} y={0} />
    </SymbolGroup>
  ),
};

/** Two-way adjustable throttle: restricts flow in both directions. */
export const throttle: ComponentDef<null> = {
  type: 'pn.valve.throttle',
  domain: 'pneumatic',
  group: 'logic',
  nameKey: 'comp.throttle.name',
  helpKey: 'comp.throttle.help',
  labelPrefix: '1V',
  bounds: [-0.5, -1.5, 5, 3],
  labelAt: [0, -1.6],
  ports: [...inOut(4)],
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
  initState: none,
  symbol: () => (
    <SymbolGroup>
      <line x1={0} y1={0} x2={13} y2={0} />
      <Throttle x={20} y={0} />
      <line x1={27} y1={0} x2={40} y2={0} />
      <FlowArrow x1={12} y1={9} x2={28} y2={-10} head={4} />
    </SymbolGroup>
  ),
};

export const EXTRA_DEFS = [
  filter,
  pressureRegulator,
  serviceUnit,
  silencer,
  shutOffValve,
  cylinderCushioned,
  cylinderDoubleRod,
  motor,
  vacuumEjector,
  suctionCup,
  quickExhaust,
  throttle,
];

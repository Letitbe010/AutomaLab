/**
 * Electric control components, 24 V DC (SPEC §5.2), drawn after IEC 60617
 * with our own drawings. Layout convention (decided 2026-11-05): vertical
 * current paths, +24 V at the top and 0 V at the bottom, so two-terminal
 * parts have one port on top (0, 0) and one at the bottom (0, 4).
 * Terminal markings: NO contacts 13-14, NC contacts 21-22 (relays) /
 * 11-12 (push buttons); coils A1-A2; lamps X1-X2.
 */
import type { ComponentDef, ParamDef } from '../../core/componentDef';
import type { PortDef } from '../../core/componentDef';
import { STROKE, SymbolGroup } from '../../symbols/primitives';

export { ELECTRIC_ROLES, ELECTRIC_SENSOR_TYPES, type ElectricRole } from './roles';

const label: ParamDef = { key: 'label', labelKey: 'param.label', type: 'string', default: '' };
const SENSOR_PARAMS: ParamDef[] = [
  label,
  { key: 'cylinder', labelKey: 'param.cylinder', type: 'cylinderRef', default: '' },
  {
    key: 'at',
    labelKey: 'param.at',
    type: 'enum',
    default: '+',
    options: [
      { value: '-', labelKey: 'param.atRetracted' },
      { value: '+', labelKey: 'param.atExtended' },
    ],
  },
];

const twoPorts = (a: string, b: string): PortDef[] => [
  { id: a, kind: 'electric', x: 0, y: 0 },
  { id: b, kind: 'electric', x: 0, y: 4 },
];

const Terminals = ({ a, b }: { a: string; b: string }) => (
  <g fill={STROKE} stroke="none" fontSize={6.5} fontFamily="var(--mono)">
    <text x={3} y={8}>
      {a}
    </text>
    <text x={3} y={37}>
      {b}
    </text>
  </g>
);

/** Contact body: fixed ends and the moving blade (open = tilted left, closed = touching). */
function Contact({ normally, closed }: { normally: 'open' | 'closed'; closed: boolean }) {
  return (
    <>
      <line x1={0} y1={0} x2={0} y2={13} />
      <line x1={0} y1={27} x2={0} y2={40} />
      {normally === 'closed' && <line x1={0} y1={13} x2={6} y2={13} />}
      {closed ? (
        <line x1={0} y1={27} x2={normally === 'closed' ? 4 : -1} y2={13} />
      ) : normally === 'open' ? (
        <line x1={0} y1={27} x2={-8} y2={14} />
      ) : (
        <line x1={0} y1={27} x2={-7} y2={15} />
      )}
    </>
  );
}

/** Actuator link (dashed) from the blade to the operator on the left. */
const Link = ({ to = -14 }: { to?: number }) => (
  <line x1={-4} y1={20} x2={to} y2={20} strokeDasharray="2 2" />
);

type Operator = 'button' | 'switch' | 'estop' | 'limit' | 'reed' | 'none';

function OperatorMark({ op }: { op: Operator }) {
  switch (op) {
    case 'button':
      return (
        <>
          <Link />
          <polyline points="-14,15 -17,15 -17,25 -14,25" />
        </>
      );
    case 'switch':
      return (
        <>
          <Link />
          <polyline points="-14,15 -17,15 -17,25 -14,25" />
          <polyline points="-9,16 -7,20 -9,24" />
        </>
      );
    case 'estop':
      return (
        <>
          <Link />
          <path d="M -15 13 A 7 7 0 0 0 -15 27 Z" />
        </>
      );
    case 'limit':
      return (
        <>
          <Link to={-12} />
          <polyline points="-12,16 -17,20 -12,24" />
          <circle cx={-19} cy={20} r={2.5} />
        </>
      );
    case 'reed':
      return (
        <>
          <Link to={-11} />
          <polygon points="-17,13 -11,20 -17,27 -23,20" />
          <line x1={-20} y1={20} x2={-14} y2={20} />
        </>
      );
    case 'none':
      return null;
  }
}

interface ContactState {
  closed: boolean;
}

function contactDef(o: {
  type: string;
  nameKey: string;
  helpKey: string;
  group: string;
  normally: 'open' | 'closed';
  op: Operator;
  labelPrefix: string;
  params: ParamDef[];
  ports: [string, string];
  /** Text shown next to the symbol from a parameter (relay contacts show their relay). */
  textParam?: string;
}): ComponentDef<ContactState> {
  return {
    type: o.type,
    domain: 'electric',
    group: o.group,
    nameKey: o.nameKey,
    helpKey: o.helpKey,
    labelPrefix: o.labelPrefix,
    bounds: [-2.6, 0, 3.8, 4],
    labelAt: [-2.6, -0.2],
    ports: twoPorts(o.ports[0], o.ports[1]),
    params: o.params,
    initState: () => ({ closed: o.normally === 'closed' }),
    previewStates: [
      { nameKey: 'preview.rest', state: { closed: o.normally === 'closed' } },
      { nameKey: 'preview.actuated', state: { closed: o.normally !== 'closed' } },
    ],
    symbol: ({ state, params }) => (
      <>
        <SymbolGroup>
          <Contact normally={o.normally} closed={state.closed} />
          <OperatorMark op={o.op} />
        </SymbolGroup>
        <Terminals a={o.ports[0]} b={o.ports[1]} />
        {o.textParam && (
          <text x={-22} y={22} fill={STROKE} fontSize={8} fontFamily="var(--mono)" textAnchor="end">
            {String(params[o.textParam] ?? '')}
          </text>
        )}
      </>
    ),
  };
}

interface LoadState {
  on: boolean;
}

function loadDef(o: {
  type: string;
  nameKey: string;
  helpKey: string;
  labelPrefix: string;
  ports: [string, string];
  body: (on: boolean) => React.ReactNode;
}): ComponentDef<LoadState> {
  return {
    type: o.type,
    domain: 'electric',
    group: 'elOutputs',
    nameKey: o.nameKey,
    helpKey: o.helpKey,
    labelPrefix: o.labelPrefix,
    bounds: [-1.4, 0, 2.8, 4],
    labelAt: [1.3, 1.8],
    ports: twoPorts(o.ports[0], o.ports[1]),
    params: [label],
    initState: () => ({ on: false }),
    previewStates: [
      { nameKey: 'preview.off', state: { on: false } },
      { nameKey: 'preview.on', state: { on: true } },
    ],
    symbol: ({ state }) => (
      <>
        <SymbolGroup>
          <line x1={0} y1={0} x2={0} y2={13} />
          <line x1={0} y1={27} x2={0} y2={40} />
          {o.body(state.on)}
        </SymbolGroup>
        <Terminals a={o.ports[0]} b={o.ports[1]} />
      </>
    ),
  };
}

const ACTIVE_FILL = 'var(--c-amber, #d8920a)';

function terminal(potential: '+' | '-'): ComponentDef<null> {
  const plus = potential === '+';
  return {
    type: plus ? 'el.plus' : 'el.minus',
    domain: 'electric',
    group: 'elSupply',
    nameKey: plus ? 'comp.el.plus.name' : 'comp.el.minus.name',
    helpKey: 'comp.el.supply.help',
    labelPrefix: '',
    bounds: plus ? [-2, -1.6, 4, 2.6] : [-2, -1, 4, 2.6],
    ports: [{ id: 'p', kind: 'electric', x: 0, y: plus ? 1 : -1 }],
    params: [],
    initState: () => null,
    symbol: () => (
      <>
        <SymbolGroup>
          <line x1={0} y1={plus ? 10 : -10} x2={0} y2={0} />
          <line x1={-12} y1={0} x2={12} y2={0} strokeWidth={2.2} />
        </SymbolGroup>
        <text
          x={0}
          y={plus ? -5 : 11}
          fill={STROKE}
          fontSize={8}
          fontFamily="var(--mono)"
          textAnchor="middle"
        >
          {plus ? '+24 V' : '0 V'}
        </text>
      </>
    ),
  };
}

const electricJunction: ComponentDef<null> = {
  type: 'el.junction',
  domain: 'electric',
  group: 'elSupply',
  nameKey: 'comp.junction.name',
  labelPrefix: '',
  bounds: [-0.5, -0.5, 1, 1],
  libraryHidden: true,
  ports: [{ id: 'j', kind: 'electric', x: 0, y: 0 }],
  params: [],
  initState: () => null,
  symbol: () => <circle cx={0} cy={0} r={2.6} fill={STROKE} />,
};

const coilBody = (solenoid: boolean) => (on: boolean) => (
  <>
    <rect x={-9} y={13} width={18} height={14} fill={on ? ACTIVE_FILL : 'none'} />
    {solenoid && <line x1={-9} y1={27} x2={9} y2={13} />}
  </>
);

const RELAY_PARAM: ParamDef = {
  key: 'relay',
  labelKey: 'param.relay',
  type: 'string',
  default: 'K1',
};

const erase = <S,>(d: ComponentDef<S>) => d as unknown as ComponentDef<unknown>;

export const ELECTRIC_DEFS: ComponentDef<unknown>[] = [
  erase(terminal('+')),
  erase(terminal('-')),
  erase(
    contactDef({
      type: 'el.button.no',
      nameKey: 'comp.el.buttonNo.name',
      helpKey: 'comp.el.button.help',
      group: 'elInputs',
      normally: 'open',
      op: 'button',
      labelPrefix: 'S',
      params: [label],
      ports: ['13', '14'],
    }),
  ),
  erase(
    contactDef({
      type: 'el.button.nc',
      nameKey: 'comp.el.buttonNc.name',
      helpKey: 'comp.el.button.help',
      group: 'elInputs',
      normally: 'closed',
      op: 'button',
      labelPrefix: 'S',
      params: [label],
      ports: ['11', '12'],
    }),
  ),
  erase(
    contactDef({
      type: 'el.switch.no',
      nameKey: 'comp.el.switch.name',
      helpKey: 'comp.el.switch.help',
      group: 'elInputs',
      normally: 'open',
      op: 'switch',
      labelPrefix: 'S',
      params: [label],
      ports: ['13', '14'],
    }),
  ),
  erase(
    contactDef({
      type: 'el.estop',
      nameKey: 'comp.el.estop.name',
      helpKey: 'comp.el.estop.help',
      group: 'elInputs',
      normally: 'closed',
      op: 'estop',
      labelPrefix: 'S0',
      params: [label],
      ports: ['11', '12'],
    }),
  ),
  erase(
    contactDef({
      type: 'el.limit.no',
      nameKey: 'comp.el.limitNo.name',
      helpKey: 'comp.el.limit.help',
      group: 'elSensors',
      normally: 'open',
      op: 'limit',
      labelPrefix: '1B',
      params: SENSOR_PARAMS,
      ports: ['13', '14'],
    }),
  ),
  erase(
    contactDef({
      type: 'el.limit.nc',
      nameKey: 'comp.el.limitNc.name',
      helpKey: 'comp.el.limit.help',
      group: 'elSensors',
      normally: 'closed',
      op: 'limit',
      labelPrefix: '1B',
      params: SENSOR_PARAMS,
      ports: ['11', '12'],
    }),
  ),
  erase(
    contactDef({
      type: 'el.reed',
      nameKey: 'comp.el.reed.name',
      helpKey: 'comp.el.reed.help',
      group: 'elSensors',
      normally: 'open',
      op: 'reed',
      labelPrefix: '1B',
      params: SENSOR_PARAMS,
      ports: ['13', '14'],
    }),
  ),
  erase(
    contactDef({
      type: 'el.relay.no',
      nameKey: 'comp.el.relayNo.name',
      helpKey: 'comp.el.relayContact.help',
      group: 'elRelays',
      normally: 'open',
      op: 'none',
      labelPrefix: '',
      params: [RELAY_PARAM],
      ports: ['13', '14'],
      textParam: 'relay',
    }),
  ),
  erase(
    contactDef({
      type: 'el.relay.nc',
      nameKey: 'comp.el.relayNc.name',
      helpKey: 'comp.el.relayContact.help',
      group: 'elRelays',
      normally: 'closed',
      op: 'none',
      labelPrefix: '',
      params: [RELAY_PARAM],
      ports: ['21', '22'],
      textParam: 'relay',
    }),
  ),
  erase(
    loadDef({
      type: 'el.relay.coil',
      nameKey: 'comp.el.relayCoil.name',
      helpKey: 'comp.el.relayCoil.help',
      labelPrefix: 'K',
      ports: ['A1', 'A2'],
      body: coilBody(false),
    }),
  ),
  erase(
    loadDef({
      type: 'el.solenoid',
      nameKey: 'comp.el.solenoid.name',
      helpKey: 'comp.el.solenoid.help',
      labelPrefix: 'Y',
      ports: ['A1', 'A2'],
      body: coilBody(true),
    }),
  ),
  erase(
    loadDef({
      type: 'el.lamp',
      nameKey: 'comp.el.lamp.name',
      helpKey: 'comp.el.lamp.help',
      labelPrefix: 'H',
      ports: ['X1', 'X2'],
      body: (on) => (
        <>
          <circle cx={0} cy={20} r={7} fill={on ? ACTIVE_FILL : 'none'} />
          <line x1={-5} y1={15} x2={5} y2={25} />
          <line x1={5} y1={15} x2={-5} y2={25} />
        </>
      ),
    }),
  ),
  erase(
    loadDef({
      type: 'el.buzzer',
      nameKey: 'comp.el.buzzer.name',
      helpKey: 'comp.el.buzzer.help',
      labelPrefix: 'H',
      ports: ['X1', 'X2'],
      body: (on) => (
        <>
          <path d="M -8 23 A 8 8 0 0 1 8 23 Z" fill={on ? ACTIVE_FILL : 'none'} />
          <line x1={0} y1={13} x2={0} y2={15} />
          <line x1={0} y1={23} x2={0} y2={27} />
        </>
      ),
    }),
  ),
  erase(electricJunction),
];

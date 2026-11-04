import type { ComponentDef } from '../../core/componentDef';
import {
  Blocked,
  FlowArrow,
  PushButtonOperator,
  Spring,
  SymbolGroup,
  ValveBox,
} from '../../symbols/primitives';

export interface ValveState {
  /** 0 = rest (spring side), 1 = actuated (push-button side). */
  position: 0 | 1;
}

const BOX = 40;

/**
 * 3/2 directional valve, normally closed, push-button operated, spring return.
 * Ports (ISO 1219 numbering): 1 supply, 2 working line, 3 exhaust.
 * Local origin: top-left corner of the box that sits on the ports.
 * The boxes slide one box width when actuated; ports stay fixed.
 */
export const valve32ButtonSpring: ComponentDef<ValveState> = {
  type: 'pn.valve.3-2.button-spring',
  domain: 'pneumatic',
  nameKey: 'comp.valve32ButtonSpring.name',
  helpKey: 'comp.valve32ButtonSpring.help',
  labelPrefix: '1V',
  ports: [
    { id: '1', kind: 'fluid', x: 1, y: 5 },
    { id: '2', kind: 'fluid', x: 1, y: -1 },
    { id: '3', kind: 'fluid', x: 3, y: 5 },
  ],
  params: [{ key: 'label', labelKey: 'param.label', type: 'string', default: '' }],
  initState: () => ({ position: 0 }),
  previewStates: [
    { nameKey: 'comp.valve32ButtonSpring.rest', state: { position: 0 } },
    { nameKey: 'comp.valve32ButtonSpring.actuated', state: { position: 1 } },
  ],
  symbol: ({ state }) => (
    <SymbolGroup>
      {/* Port leads (fixed) */}
      <line x1={10} y1={-10} x2={10} y2={0} />
      <line x1={10} y1={BOX} x2={10} y2={BOX + 10} />
      <line x1={30} y1={BOX} x2={30} y2={BOX + 10} />
      <g transform={`translate(${state.position * BOX} 0)`}>
        {/* Actuated position (left box): 1 -> 2, 3 blocked */}
        <ValveBox x={-BOX} y={0} />
        <FlowArrow x1={-30} y1={BOX} x2={-30} y2={0} />
        <Blocked x={-10} y={BOX} dir="up" />
        {/* Rest position (right box): 2 -> 3, 1 blocked */}
        <ValveBox x={0} y={0} />
        <FlowArrow x1={10} y1={0} x2={30} y2={BOX} />
        <Blocked x={10} y={BOX} dir="up" />
        <PushButtonOperator x={-BOX} y={BOX / 2} />
        <Spring x1={BOX} x2={BOX + 22} y={BOX / 2} />
      </g>
    </SymbolGroup>
  ),
};

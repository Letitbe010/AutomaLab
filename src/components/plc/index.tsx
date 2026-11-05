/**
 * PLC block (SPEC §5.4): S7-1200 CPU 1214C DC/DC/DC digital I/O (decided
 * 2026-11-05). Wired in the electric schematic: inputs on top (I0.0…I1.5,
 * "1" when the terminal is at +24 V), outputs at the bottom (Q0.0…Q1.1,
 * +24 V when on). The CPU supply (L+/M) is assumed and not drawn.
 */
import type { ComponentDef } from '../../core/componentDef';
import { PLC_INPUTS, PLC_OUTPUTS } from '../../core/plc';
import { STROKE } from '../../symbols/primitives';

export interface PlcState {
  inputs: string[];
  outputs: string[];
}

const W = 30;
const H = 6;
const LED_ON = 'var(--c-green, #2f9e5b)';

export const PLC_TYPE = 'plc.cpu1214c';

export const plcCpu: ComponentDef<PlcState> = {
  type: PLC_TYPE,
  domain: 'plc',
  group: 'plcCpu',
  nameKey: 'comp.plc.cpu.name',
  helpKey: 'comp.plc.cpu.help',
  labelPrefix: 'PLC',
  bounds: [0, -0.4, W, H + 0.8],
  labelAt: [0, -0.6],
  ports: [
    ...PLC_INPUTS.map((id, i) => ({ id, kind: 'electric' as const, x: 2 + 2 * i, y: 0 })),
    ...PLC_OUTPUTS.map((id, i) => ({ id, kind: 'electric' as const, x: 2 + 2 * i, y: H })),
  ],
  params: [
    { key: 'label', labelKey: 'param.label', type: 'string', default: '' },
    {
      key: 'scanMs',
      labelKey: 'param.scanMs',
      type: 'number',
      default: 10,
      unit: 'ms',
      min: 1,
      max: 100,
    },
  ],
  initState: () => ({ inputs: [], outputs: [] }),
  previewStates: [
    { nameKey: 'preview.off', state: { inputs: [], outputs: [] } },
    { nameKey: 'preview.on', state: { inputs: ['I0.0', 'I0.2'], outputs: ['Q0.0'] } },
  ],
  symbol: ({ state }) => {
    const on = (list: string[], id: string) => list.includes(id);
    return (
      <g>
        <rect
          x={0}
          y={0}
          width={W * 10}
          height={H * 10}
          rx={3}
          fill="var(--panel, #fff)"
          stroke={STROKE}
          strokeWidth={1.5}
        />
        <text
          x={(W * 10) / 2}
          y={34}
          fill={STROKE}
          fontSize={9}
          fontFamily="var(--mono)"
          textAnchor="middle"
        >
          S7-1200 · CPU 1214C DC/DC/DC
        </text>
        {PLC_INPUTS.map((id, i) => (
          <g key={id}>
            <rect
              x={16 + 20 * i}
              y={4}
              width={8}
              height={4}
              fill={on(state.inputs, id) ? LED_ON : 'none'}
              stroke={STROKE}
              strokeWidth={0.6}
            />
            <text
              x={20 + 20 * i}
              y={17}
              fill={STROKE}
              fontSize={5.5}
              fontFamily="var(--mono)"
              textAnchor="middle"
            >
              {id.slice(1)}
            </text>
          </g>
        ))}
        {PLC_OUTPUTS.map((id, i) => (
          <g key={id}>
            <rect
              x={16 + 20 * i}
              y={52}
              width={8}
              height={4}
              fill={on(state.outputs, id) ? LED_ON : 'none'}
              stroke={STROKE}
              strokeWidth={0.6}
            />
            <text
              x={20 + 20 * i}
              y={48}
              fill={STROKE}
              fontSize={5.5}
              fontFamily="var(--mono)"
              textAnchor="middle"
            >
              {id.slice(1)}
            </text>
          </g>
        ))}
        <text x={4} y={17} fill={STROKE} fontSize={6} fontFamily="var(--mono)" fontWeight={700}>
          I
        </text>
        <text x={4} y={48} fill={STROKE} fontSize={6} fontFamily="var(--mono)" fontWeight={700}>
          Q
        </text>
      </g>
    );
  },
};

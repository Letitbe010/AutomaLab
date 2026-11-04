import type { ComponentDef } from '../../core/componentDef';
import { STROKE, SymbolGroup } from '../../symbols/primitives';

/**
 * Compressed-air source. Port 1 (outlet) is 3 grid units above the centre.
 * Symbol: circle with an outward hollow triangle (pneumatic energy source).
 */
// TODO(galdetu): confirm which ISO 1219-1 symbol is used in class for the air supply
// (pressure source vs. compressor).
export const pneumaticSource: ComponentDef<null> = {
  type: 'pn.source',
  domain: 'pneumatic',
  group: 'supply',
  nameKey: 'comp.source.name',
  helpKey: 'comp.source.help',
  labelPrefix: '0Z',
  bounds: [-1.5, -3, 3, 4.5],
  labelAt: [1.8, 0.4],
  ports: [{ id: '1', kind: 'fluid', x: 0, y: -3 }],
  params: [
    { key: 'label', labelKey: 'param.label', type: 'string', default: '' },
    {
      key: 'pressureBar',
      labelKey: 'param.pressureBar',
      type: 'number',
      default: 6,
      unit: 'bar',
      min: 0,
      max: 16,
    },
  ],
  initState: () => null,
  symbol: () => (
    <SymbolGroup>
      <line x1={0} y1={-30} x2={0} y2={-12} />
      <circle cx={0} cy={0} r={12} />
      <polygon points="0,-12 -5,-4 5,-4" fill="var(--panel)" stroke={STROKE} />
    </SymbolGroup>
  ),
};

import type { ComponentDef } from '../../core/componentDef';
import { STROKE, Spring, SymbolGroup } from '../../symbols/primitives';

export interface CylinderState {
  /** Rod position, 0 = fully retracted, 1 = fully extended. */
  position: number;
}

const LENGTH = 100;
const HEIGHT = 30;
/** Retracted piston sits right of port A so the cap-end chamber is visible. */
const PISTON_MIN = 16;
const TRAVEL = 58;

/**
 * Single-acting cylinder with spring return. Port A feeds the cap-end chamber.
 * Local origin: top-left corner of the barrel; barrel is 10 x 3 grid units.
 */
// TODO(galdetu): default bore/rod/stroke are the SPEC §4 example values (32/12/100 mm);
// confirm typical sizes used in class (SPEC §14).
export const cylinderSingle: ComponentDef<CylinderState> = {
  type: 'pn.cyl.single',
  domain: 'pneumatic',
  group: 'actuators',
  nameKey: 'comp.cylSingle.name',
  helpKey: 'comp.cylSingle.help',
  labelPrefix: '1A',
  bounds: [0, -0.5, 18, 4.5],
  labelAt: [0, -0.8],
  ports: [{ id: 'A', kind: 'fluid', x: 1, y: 4 }],
  params: [
    { key: 'label', labelKey: 'param.label', type: 'string', default: '' },
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
  ],
  initState: () => ({ position: 0 }),
  previewStates: [
    { nameKey: 'comp.cylSingle.retracted', state: { position: 0 } },
    { nameKey: 'comp.cylSingle.half', state: { position: 0.5 } },
    { nameKey: 'comp.cylSingle.extended', state: { position: 1 } },
  ],
  symbol: ({ state }) => {
    const p = Math.min(1, Math.max(0, state.position));
    const px = PISTON_MIN + p * TRAVEL;
    const rodEnd = LENGTH + 10 + p * TRAVEL;
    return (
      <SymbolGroup>
        <line x1={10} y1={HEIGHT} x2={10} y2={HEIGHT + 10} />
        <rect x={0} y={0} width={LENGTH} height={HEIGHT} />
        <rect x={px} y={2} width={4} height={HEIGHT - 4} fill={STROKE} />
        <rect x={px + 4} y={12} width={rodEnd - px - 4} height={6} fill="var(--panel)" />
        <Spring x1={px + 4} x2={LENGTH} y={HEIGHT / 2} amplitude={10} coils={4} />
      </SymbolGroup>
    );
  },
};

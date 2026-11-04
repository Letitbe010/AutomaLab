import { t } from '../../i18n';
import { useEditor } from '../editor/store';
import { spacePhase } from './interaction';
import { useSim } from './simStore';
import styles from './SpacePhase.module.css';

const LABEL_W = 44;
const STEP_W = 52;
const ROW_H = 34;
const TOP = 22;

/** Displacement–step diagram (SPEC §7.3), built live from end-of-stroke events. */
export function SpacePhaseView() {
  useSim((s) => s.version);
  const sim = useSim.getState().sim;
  const project = useEditor((s) => s.project);

  const cylinders = project.components
    .filter((c) => c.type.startsWith('pn.cyl.'))
    .map((c) => ({
      id: c.id,
      label: typeof c.params.label === 'string' && c.params.label !== '' ? c.params.label : c.id,
      start: 0,
    }));

  if (!sim) return <p className={styles.muted}>{t('sim.diagram.notRunning')}</p>;
  if (!cylinders.length) return <p className={styles.muted}>{t('sim.diagram.noCylinders')}</p>;

  const { steps, rows } = spacePhase(sim.events, cylinders);
  const width = LABEL_W + Math.max(steps.length, 1) * STEP_W + 16;
  const height = TOP + rows.length * ROW_H + 16;

  return (
    <div className={styles.scroll}>
      <svg
        width={width}
        height={height}
        className={styles.svg}
        role="img"
        aria-label={t('sim.diagram.title')}
        data-testid="space-phase"
      >
        {steps.map((name, i) => {
          const x = LABEL_W + i * STEP_W;
          return (
            <g key={i}>
              <line x1={x} y1={TOP - 4} x2={x} y2={height - 12} className={styles.grid} />
              <text x={x + STEP_W / 2} y={12} className={styles.step}>
                {name}
              </text>
            </g>
          );
        })}
        <line
          x1={LABEL_W + steps.length * STEP_W}
          y1={TOP - 4}
          x2={LABEL_W + steps.length * STEP_W}
          y2={height - 12}
          className={styles.grid}
        />
        {rows.map((row, r) => {
          const y0 = TOP + r * ROW_H;
          const yOf = (v: number) => y0 + ROW_H - 10 - v * (ROW_H - 16);
          const pts = row.values.map((v, i) => `${LABEL_W + i * STEP_W},${yOf(v)}`).join(' ');
          return (
            <g key={row.componentId}>
              <text x={4} y={y0 + ROW_H / 2 + 2} className={styles.label}>
                {row.label}
              </text>
              <line x1={LABEL_W} y1={yOf(0)} x2={width - 16} y2={yOf(0)} className={styles.base} />
              <line x1={LABEL_W} y1={yOf(1)} x2={width - 16} y2={yOf(1)} className={styles.top} />
              <polyline points={pts} className={styles.trace} />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

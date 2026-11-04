import { t } from '../../i18n';
import { formatSimTime } from './format';
import { SPEEDS, STEP_MS, useSim } from './simStore';
import styles from '../editor/Editor.module.css';

/** ▶ ⏸ ⏭ ⏹, speed, level and time (SPEC §7.1). */
export function SimControls() {
  const running = useSim((s) => s.running);
  const speed = useSim((s) => s.speed);
  useSim((s) => s.version);
  const timeMs = useSim.getState().sim?.timeMs ?? 0;
  const { play, pause, stepOnce, reset, setSpeed } = useSim.getState();

  return (
    <>
      <button
        type="button"
        className={styles.btn}
        onClick={running ? pause : play}
        aria-label={running ? t('sim.pause') : t('sim.play')}
        title={running ? t('sim.pause') : t('sim.play')}
      >
        {running ? '⏸' : '▶'}
      </button>
      <button
        type="button"
        className={styles.btn}
        onClick={stepOnce}
        aria-label={t('sim.step', { ms: STEP_MS })}
        title={t('sim.step', { ms: STEP_MS })}
      >
        ⏭
      </button>
      <button
        type="button"
        className={styles.btn}
        onClick={reset}
        aria-label={t('sim.reset')}
        title={t('sim.reset')}
      >
        ⏹
      </button>
      <label className={styles.inlineField}>
        {t('sim.speed')}
        <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))}>
          {SPEEDS.map((v) => (
            <option key={v} value={v}>
              ×{String(v).replace('.', ',')}
            </option>
          ))}
        </select>
      </label>
      <div className={styles.seg} role="group" aria-label={t('sim.level')}>
        <button type="button" aria-pressed>
          {t('sim.logic')}
        </button>
        <button type="button" aria-pressed={false} disabled title={t('sim.physicsLater')}>
          {t('sim.physics')}
        </button>
      </div>
      <span className={styles.simTime} data-testid="sim-time">
        t = {formatSimTime(timeMs)}
      </span>
    </>
  );
}

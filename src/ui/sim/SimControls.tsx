import { t } from '../../i18n';
import { IconButton } from '../editor/IconButton';
import { IconPause, IconPlay, IconStep, IconStop } from '../icons';
import { formatSimTime } from './format';
import { SPEEDS, STEP_MS, useSim } from './simStore';
import styles from '../editor/Editor.module.css';

/** Run / pause, single step, reset, speed, level and time (SPEC §7.1). */
export function SimControls() {
  const running = useSim((s) => s.running);
  const speed = useSim((s) => s.speed);
  useSim((s) => s.version);
  const timeMs = useSim.getState().sim?.timeMs ?? 0;
  const { play, pause, stepOnce, reset, setSpeed } = useSim.getState();

  return (
    <>
      <div className={styles.group}>
        <IconButton
          label={running ? t('sim.pause') : t('sim.play')}
          onClick={running ? pause : play}
        >
          {running ? <IconPause /> : <IconPlay />}
        </IconButton>
        <IconButton label={t('sim.step', { ms: STEP_MS })} onClick={stepOnce}>
          <IconStep />
        </IconButton>
        <IconButton label={t('sim.reset')} onClick={reset}>
          <IconStop />
        </IconButton>
      </div>
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
      <span className={styles.sep} />
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

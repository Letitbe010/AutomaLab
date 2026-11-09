import { t } from '../../i18n';
import styles from './Quiz.module.css';

const MINUTES = [0, 5, 10, 20, 30];

/** Exam mode switch and optional timer (SPEC §8.6.3). */
export function ExamOptions({
  exam,
  minutes,
  onExam,
  onMinutes,
}: {
  exam: boolean;
  minutes: number;
  onExam: (on: boolean) => void;
  onMinutes: (m: number) => void;
}) {
  return (
    <>
      <label className={styles.check}>
        <input type="checkbox" checked={exam} onChange={(e) => onExam(e.target.checked)} />
        {t('quiz.exam')}
      </label>
      {exam && (
        <label className={styles.check}>
          {t('quiz.timer')}
          <select value={minutes} onChange={(e) => onMinutes(Number(e.target.value))}>
            {MINUTES.map((m) => (
              <option key={m} value={m}>
                {m === 0 ? t('quiz.noTimer') : t('quiz.minutes', { n: m })}
              </option>
            ))}
          </select>
        </label>
      )}
    </>
  );
}

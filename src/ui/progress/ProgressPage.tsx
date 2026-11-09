import { EXERCISES } from '../../learning/exercises';
import { domainSummary } from '../../learning/progress';
import { TEMPLATES } from '../../learning/templates';
import { THEORY_SHEETS } from '../../learning/theory/sheets';
import { t } from '../../i18n';
import { downloadText } from '../../storage/download';
import { useProgress } from '../../storage/progress';
import { formatDate } from '../storage/format';
import { useLearning } from '../learning/store';
import { useNav } from '../navigation';
import { openTemplateInEditor } from '../templates/open';
import styles from './Progress.module.css';

const pct = (x: number) => `${Math.round(x * 100)} %`;

/** "Nire aurrerapena" (SPEC §8.7), basic version: templates, quizzes, theory. */
export function ProgressPage() {
  const progress = useProgress((s) => s.progress);
  const domains = domainSummary(progress, TEMPLATES);
  const read = THEORY_SHEETS.filter((s) => progress.theoryRead[s.id]);

  function exportProgress() {
    const date = new Date().toISOString().slice(0, 10);
    downloadText(`automalab-aurrerapena-${date}.json`, JSON.stringify(progress, null, 2));
  }

  function showTheory(id: string) {
    useLearning.getState().showTheory(id);
    useNav.getState().go('theory');
  }

  return (
    <div className={styles.page} data-testid="progress-page">
      <section className={styles.card}>
        <h2 className={styles.h2}>{t('progress.domains')}</h2>
        {Object.entries(domains).map(([domain, d]) => (
          <div key={domain} className={styles.domain} data-domain={domain}>
            <span className={styles.domainName}>{t(`domain.${domain}`)}</span>
            <span
              className={styles.bar}
              role="meter"
              aria-label={t(`domain.${domain}`)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(d.score * 100)}
            >
              <span style={{ width: pct(d.score) }} />
            </span>
            <span className={styles.num}>{pct(d.score)}</span>
            <span className={styles.muted}>
              {t('progress.quizzesDone', { done: d.done, total: d.total })}
            </span>
          </div>
        ))}
        <p className={styles.muted}>{t('progress.domainHint')}</p>
      </section>

      <section className={styles.card}>
        <h2 className={styles.h2}>{t('menu.templates')}</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t('progress.template')}</th>
              <th>{t('progress.opened')}</th>
              <th>{t('progress.best')}</th>
              <th>{t('progress.last')}</th>
              <th>{t('progress.attempts')}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {TEMPLATES.map((tpl) => {
              const p = progress.templates[tpl.id];
              return (
                <tr key={tpl.id} data-template-id={tpl.id}>
                  <td>{tpl.title}</td>
                  <td>{p?.openedAt ? formatDate(p.openedAt) : '—'}</td>
                  <td data-best>{p?.bestScore !== undefined ? pct(p.bestScore) : '—'}</td>
                  <td>
                    {p?.quizDoneAt ? `${pct(p.lastScore ?? 0)} · ${formatDate(p.quizDoneAt)}` : '—'}
                  </td>
                  <td>{p?.attempts ?? 0}</td>
                  <td>
                    <button
                      type="button"
                      className={styles.link}
                      onClick={() => void openTemplateInEditor(tpl.id)}
                    >
                      {t('templates.open')}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className={styles.card} data-testid="progress-exercises">
        <h2 className={styles.h2}>
          {t('progress.exercises')} ·{' '}
          {EXERCISES.filter((e) => progress.exercises[e.id]?.passedAt).length}/{EXERCISES.length}
        </h2>
        {Object.keys(progress.exercises).length === 0 ? (
          <p className={styles.muted}>{t('progress.noExercises')}</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('progress.exercises')}</th>
                <th>{t('exercises.kind')}</th>
                <th>{t('exercises.passed')}</th>
                <th>{t('progress.attempts')}</th>
              </tr>
            </thead>
            <tbody>
              {EXERCISES.filter((e) => progress.exercises[e.id]).map((e) => {
                const p = progress.exercises[e.id]!;
                return (
                  <tr key={e.id} data-exercise-id={e.id}>
                    <td>{e.title}</td>
                    <td>{t(`exercises.kinds.${e.kind}`)}</td>
                    <td data-passed={!!p.passedAt}>{p.passedAt ? formatDate(p.passedAt) : '—'}</td>
                    <td>{p.attempts}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      <div className={styles.row}>
        <section className={styles.card}>
          <h2 className={styles.h2}>{t('progress.byType')}</h2>
          {Object.keys(progress.questionTypes).length === 0 ? (
            <p className={styles.muted}>{t('progress.noAnswers')}</p>
          ) : (
            <ul className={styles.list}>
              {Object.entries(progress.questionTypes).map(([type, s]) => (
                <li key={type}>
                  <span>{t(`quiz.type.${type}`)}</span>
                  <span className={styles.num}>
                    {pct(s.total ? s.correct / s.total : 0)} ({s.correct}/{s.total})
                  </span>
                </li>
              ))}
            </ul>
          )}
          <h2 className={styles.h2}>{t('progress.randomQuiz')}</h2>
          <p className={styles.muted} data-testid="progress-random">
            {progress.randomQuiz.attempts === 0
              ? t('progress.randomNone')
              : t('progress.randomDone', {
                  n: progress.randomQuiz.attempts,
                  best: pct(progress.randomQuiz.bestScore ?? 0),
                  last: pct(progress.randomQuiz.lastScore ?? 0),
                })}
          </p>
        </section>

        <section className={styles.card}>
          <h2 className={styles.h2}>
            {t('menu.theory')} · {read.length}/{THEORY_SHEETS.length}
          </h2>
          <ul className={styles.list}>
            {THEORY_SHEETS.map((s) => (
              <li key={s.id}>
                <button type="button" className={styles.link} onClick={() => showTheory(s.id)}>
                  {s.title}
                </button>
                <span className={styles.muted}>
                  {progress.theoryRead[s.id] ? t('progress.read') : t('progress.unread')}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <p className={styles.footer}>
        {t('progress.storage')}{' '}
        <button type="button" className={styles.link} onClick={exportProgress}>
          {t('progress.export')}
        </button>
      </p>
    </div>
  );
}

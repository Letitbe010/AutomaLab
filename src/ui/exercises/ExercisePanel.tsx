import { useState } from 'react';
import { getComponentDef } from '../../components/registry';
import { getExercise } from '../../learning/exercises';
import { checkExercise, type ExerciseReport } from '../../learning/exercises/check';
import type { DesignExercise } from '../../learning/exercises/types';
import { t } from '../../i18n';
import { attachExercise } from '../../storage/persistence';
import { noteExerciseAttempt, useProgress } from '../../storage/progress';
import { exitSim } from '../editor/actions';
import { useEditor } from '../editor/store';
import { Thumb } from '../editor/Thumb';
import { useLearning } from '../learning/store';
import { MarkdownBody } from '../theory/MarkdownBody';
import { DraftBadge } from '../theory/TheorySheetView';
import { SOLUTION_AFTER } from './constants';
import { startExerciseInEditor } from './open';
import { reasonText, typeName } from './reason';
import tpl from '../templates/Templates.module.css';
import styles from './Exercises.module.css';

/** Statement and automatic check of a design exercise, beside the editor (SPEC §8.1). */
export function ExercisePanel() {
  const exerciseId = useEditor((s) => s.project.exerciseId);
  const exercise = exerciseId ? getExercise(exerciseId) : undefined;
  if (!exercise || exercise.kind !== 'design') return null;
  return <Panel key={exercise.id} exercise={exercise} />;
}

function Panel({ exercise }: { exercise: DesignExercise }) {
  const learning = useLearning();
  const [hints, setHints] = useState(0);
  const [report, setReport] = useState<ExerciseReport | null>(null);
  const progress = useProgress((s) => s.progress.exercises[exercise.id]);
  const statement = getExercise(exercise.id)!.statement;

  function check() {
    if (useEditor.getState().mode === 'sim') exitSim();
    const r = checkExercise(useEditor.getState().project, exercise);
    setReport(r);
    void noteExerciseAttempt(exercise.id, r.passed);
  }

  const canSeeSolution =
    progress?.passedAt !== undefined || (progress?.attempts ?? 0) >= SOLUTION_AFTER;

  return (
    <aside className={tpl.panel} aria-label={t('exercises.panel')} data-testid="exercise-panel">
      <header className={tpl.panelHead}>
        <div className={tpl.panelKicker}>
          {t('exercises.kicker')} <DraftBadge status={exercise.status} />
          {progress?.passedAt && <span className={styles.passed}>{t('exercises.passed')}</span>}
        </div>
        <button
          type="button"
          className={tpl.close}
          onClick={() => learning.setTemplatePanel(false)}
          aria-label={t('storage.close')}
        >
          ×
        </button>
        <h2>{exercise.title}</h2>
      </header>

      <div className={tpl.tabs} role="tablist">
        {(['statement', 'check'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={learning.exerciseTab === tab}
            onClick={() => learning.setExerciseTab(tab)}
          >
            {t(`exercises.tab.${tab}`)}
          </button>
        ))}
      </div>

      <div hidden={learning.exerciseTab !== 'statement'}>
        <MarkdownBody
          text={statement}
          onLink={(scheme, target) => scheme === 'theory' && learning.openDrawer(target)}
          className={tpl.description}
        />
        {exercise.allowedComponents.length > 0 && (
          <>
            <h3 className={styles.h3}>{t('exercises.allowed')}</h3>
            <ul className={styles.allowed}>
              {exercise.allowedComponents.map((type) => {
                const def = getComponentDef(type);
                return (
                  <li key={type}>
                    {def && <Thumb def={def} className={styles.thumb} />}
                    <span>{typeName(type)}</span>
                  </li>
                );
              })}
            </ul>
          </>
        )}
        <h3 className={styles.h3}>{t('exercises.hints')}</h3>
        {exercise.hints_md.slice(0, hints).map((h, i) => (
          <div key={i} className={styles.hint}>
            <MarkdownBody text={`**${i + 1}.** ${h}`} onLink={() => undefined} />
          </div>
        ))}
        {hints < exercise.hints_md.length && (
          <button type="button" className={styles.secondary} onClick={() => setHints(hints + 1)}>
            {t('exercises.showHint', { n: hints + 1, total: exercise.hints_md.length })}
          </button>
        )}
      </div>

      <div hidden={learning.exerciseTab !== 'check'} className={styles.checkTab}>
        <p className={styles.muted}>{t('exercises.checkIntro')}</p>
        <button type="button" className={styles.primary} onClick={check}>
          {t('exercises.check')}
        </button>
        <ul className={styles.results} data-testid="exercise-results">
          {(report?.results ?? []).map((r, i) => (
            <li key={i} className={r.ok ? styles.ok : styles.bad} data-ok={r.ok}>
              <span className={styles.mark} aria-hidden="true">
                {r.ok ? '✓' : '✗'}
              </span>
              <span>
                <strong>{r.title || t('exercises.allowedCheck')}</strong>
                {r.reason && <span className={styles.reason}>{reasonText(r.reason)}</span>}
              </span>
            </li>
          ))}
          {!report &&
            exercise.checks.map((c, i) => (
              <li key={i} className={styles.pending}>
                <span className={styles.mark} aria-hidden="true">
                  ○
                </span>
                <span>{c.title}</span>
              </li>
            ))}
        </ul>
        {report && (
          <p
            className={report.passed ? styles.summaryOk : styles.summaryBad}
            role="status"
            data-testid="exercise-summary"
          >
            {report.passed
              ? t('exercises.allPassed')
              : t('exercises.someFailed', {
                  n: report.results.filter((r) => !r.ok).length,
                  total: report.results.length,
                })}
          </p>
        )}
        {progress && (
          <p className={styles.muted}>{t('exercises.attempts', { n: progress.attempts })}</p>
        )}
        <div className={styles.footer}>
          {canSeeSolution ? (
            <button
              type="button"
              className={styles.secondary}
              onClick={() => void startExerciseInEditor(exercise.id, true)}
            >
              {t('exercises.seeSolution')}
            </button>
          ) : (
            <p className={styles.muted}>{t('exercises.solutionLater', { n: SOLUTION_AFTER })}</p>
          )}
          <button type="button" className={styles.link} onClick={() => attachExercise(null)}>
            {t('exercises.detach')}
          </button>
        </div>
      </div>
    </aside>
  );
}

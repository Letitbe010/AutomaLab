import { useState } from 'react';
import { EXERCISES, getExercise } from '../../learning/exercises';
import type { CalcExercise, Exercise } from '../../learning/exercises/types';
import { isCorrect, parseNumber } from '../../learning/quiz/grade';
import { getSheet } from '../../learning/theory/sheets';
import { t } from '../../i18n';
import { noteExerciseAttempt, useProgress } from '../../storage/progress';
import { useEditor } from '../editor/store';
import { useLearning } from '../learning/store';
import { useNav } from '../navigation';
import { MarkdownBody } from '../theory/MarkdownBody';
import { DraftBadge } from '../theory/TheorySheetView';
import { SOLUTION_AFTER } from './constants';
import { checkCurrentProject, startExerciseInEditor } from './open';
import styles from './Exercises.module.css';

type Kind = '' | 'design' | 'calc';

/** "Ariketak" section: design exercises (draw and check) and calculation exercises. */
export function ExercisesPage() {
  const [kind, setKind] = useState<Kind>('');
  const [level, setLevel] = useState(0);
  const [calcId, setCalcId] = useState<string | null>(null);
  const progress = useProgress((s) => s.progress.exercises);
  const projectName = useEditor((s) => s.project.name);

  const open = calcId ? getExercise(calcId) : undefined;
  if (open?.kind === 'calc') return <CalcView exercise={open} onBack={() => setCalcId(null)} />;

  const list = EXERCISES.filter((e) => (!kind || e.kind === kind) && (!level || e.level === level));
  const passed = EXERCISES.filter((e) => progress[e.id]?.passedAt).length;

  return (
    <div className={styles.page}>
      <p className={styles.intro}>{t('exercises.intro')}</p>
      <div className={styles.filters}>
        <label>
          {t('exercises.kind')}
          <select value={kind} onChange={(e) => setKind(e.target.value as Kind)}>
            <option value="">{t('theory.all')}</option>
            <option value="design">{t('exercises.kinds.design')}</option>
            <option value="calc">{t('exercises.kinds.calc')}</option>
          </select>
        </label>
        <label>
          {t('templates.level')}
          <select value={level} onChange={(e) => setLevel(Number(e.target.value))}>
            <option value={0}>{t('theory.all')}</option>
            {[1, 2, 3].map((l) => (
              <option key={l} value={l}>
                {t(`templates.levels.${l}`)}
              </option>
            ))}
          </select>
        </label>
        <span className={styles.count}>
          {t('exercises.passedCount', { n: passed, total: EXERCISES.length })}
        </span>
      </div>

      <ul className={styles.grid}>
        {list.map((e) => (
          <Card
            key={e.id}
            exercise={e}
            passed={!!progress[e.id]?.passedAt}
            attempts={progress[e.id]?.attempts ?? 0}
            projectName={projectName}
            onSolve={() => setCalcId(e.id)}
          />
        ))}
      </ul>
    </div>
  );
}

function Card({
  exercise: e,
  passed,
  attempts,
  projectName,
  onSolve,
}: {
  exercise: Exercise;
  passed: boolean;
  attempts: number;
  projectName: string;
  onSolve: () => void;
}) {
  return (
    <li className={styles.card} data-exercise-id={e.id}>
      <div className={styles.meta}>
        <span>{t(`exercises.kinds.${e.kind}`)}</span>
        <span>·</span>
        <span>{t(`templates.levels.${e.level}`)}</span>
        <DraftBadge status={e.status} />
        {passed ? (
          <span className={styles.passed}>{t('exercises.passed')}</span>
        ) : attempts > 0 ? (
          <span className={styles.muted}>{t('exercises.attempts', { n: attempts })}</span>
        ) : null}
      </div>
      <h2 className={styles.title}>{e.title}</h2>
      <div className={styles.tags}>
        {e.tags.map((tg) => (
          <span key={tg} className={styles.tag}>
            {tg}
          </span>
        ))}
      </div>
      <div className={styles.actions}>
        {e.kind === 'design' ? (
          <>
            <button
              type="button"
              className={styles.primary}
              onClick={() => void startExerciseInEditor(e.id)}
            >
              {t('exercises.start')}
            </button>
            <button
              type="button"
              className={styles.secondary}
              title={t('exercises.checkCurrentHint', { name: projectName })}
              onClick={() => checkCurrentProject(e.id)}
            >
              {t('exercises.checkCurrent')}
            </button>
          </>
        ) : (
          <button type="button" className={styles.primary} onClick={onSolve}>
            {t('exercises.solve')}
          </button>
        )}
      </div>
    </li>
  );
}

function CalcView({ exercise, onBack }: { exercise: CalcExercise & Exercise; onBack: () => void }) {
  const [texts, setTexts] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const progress = useProgress((s) => s.progress.exercises[exercise.id]);
  const [hints, setHints] = useState(0);

  const results = exercise.parts.map((p) => {
    const n = parseNumber(texts[p.id] ?? '');
    return (
      n !== null &&
      isCorrect(
        { id: p.id, type: 'numeric', prompt_md: '', explanation_md: '', answer: p.answer },
        n,
      )
    );
  });
  const allFilled = exercise.parts.every((p) => parseNumber(texts[p.id] ?? '') !== null);

  function check() {
    setChecked(true);
    void noteExerciseAttempt(exercise.id, results.every(Boolean));
  }

  function showTheory(id: string) {
    useLearning.getState().showTheory(id);
    useNav.getState().go('theory');
  }

  return (
    <div className={styles.calc} data-testid="calc-exercise">
      <button type="button" className={styles.link} onClick={onBack}>
        ← {t('exercises.back')}
      </button>
      <div className={styles.meta}>
        <span>{t('exercises.kinds.calc')}</span>
        <DraftBadge status={exercise.status} />
        {progress?.passedAt && <span className={styles.passed}>{t('exercises.passed')}</span>}
      </div>
      <h2 className={styles.calcTitle}>{exercise.title}</h2>
      <MarkdownBody text={exercise.statement} onLink={() => undefined} />

      <ul className={styles.parts}>
        {exercise.parts.map((p, i) => (
          <li key={p.id}>
            <label>
              <span className={styles.partLabel}>
                <strong>{p.id})</strong>{' '}
                <MarkdownBody text={p.prompt_md} onLink={() => undefined} />
              </span>
              <span className={styles.partInput}>
                <input
                  type="text"
                  inputMode="decimal"
                  value={texts[p.id] ?? ''}
                  onChange={(e) => {
                    setTexts({ ...texts, [p.id]: e.target.value });
                    setChecked(false);
                  }}
                />
                {p.answer.unit && <span>{p.answer.unit}</span>}
                {checked && (
                  <span
                    className={results[i] ? styles.okMark : styles.badMark}
                    data-ok={results[i]}
                  >
                    {results[i] ? '✓' : '✗'}
                  </span>
                )}
              </span>
            </label>
          </li>
        ))}
      </ul>

      <div className={styles.actions}>
        <button type="button" className={styles.primary} disabled={!allFilled} onClick={check}>
          {t('exercises.check')}
        </button>
        {hints < exercise.hints_md.length && (
          <button type="button" className={styles.secondary} onClick={() => setHints(hints + 1)}>
            {t('exercises.showHint', { n: hints + 1, total: exercise.hints_md.length })}
          </button>
        )}
      </div>
      {exercise.hints_md.slice(0, hints).map((h, i) => (
        <div key={i} className={styles.hint}>
          <MarkdownBody text={`**${i + 1}.** ${h}`} onLink={() => undefined} />
        </div>
      ))}

      {checked && (
        <div
          className={results.every(Boolean) ? styles.summaryOk : styles.summaryBad}
          role="status"
          data-testid="calc-summary"
        >
          <strong>
            {results.every(Boolean)
              ? t('exercises.allPassed')
              : t('exercises.someWrong', {
                  n: results.filter((r) => !r).length,
                  total: results.length,
                })}
          </strong>
          {results.every(Boolean) || (progress?.attempts ?? 0) >= SOLUTION_AFTER ? (
            <>
              <h3 className={styles.h3}>{t('exercises.solution')}</h3>
              <MarkdownBody text={exercise.solution_md} onLink={() => undefined} />
              <p className={styles.muted}>
                {exercise.parts
                  .map(
                    (p) =>
                      `${p.id}) ${String(p.answer.value).replace('.', ',')} ${p.answer.unit} (±${p.answer.tolerancePct} %)`,
                  )
                  .join(' · ')}
              </p>
            </>
          ) : (
            <p className={styles.muted}>{t('exercises.solutionLater', { n: SOLUTION_AFTER })}</p>
          )}
        </div>
      )}

      <div className={styles.theory}>
        {exercise.theoryRefs.map((id) => {
          const sheet = getSheet(id);
          return sheet ? (
            <button key={id} type="button" className={styles.link} onClick={() => showTheory(id)}>
              {t('templates.theory')}: {sheet.title}
            </button>
          ) : null;
        })}
        {exercise.source && (
          <p className={styles.muted}>
            {t('exercises.source')}: {exercise.source}
          </p>
        )}
      </div>
    </div>
  );
}

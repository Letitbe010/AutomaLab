import { useEffect, useMemo, useRef, useState } from 'react';
import { gradeQuiz, isCorrect, parseNumber, type QuizResult } from '../../learning/quiz/grade';
import { runStimuli } from '../../learning/quiz/simulate';
import type { Response } from '../../learning/quiz/types';
import { getTemplate } from '../../learning/templates';
import { getSheet } from '../../learning/theory/sheets';
import { t } from '../../i18n';
import { useLearning } from '../learning/store';
import { MarkdownBody } from '../theory/MarkdownBody';
import { CircuitPreview } from '../templates/CircuitPreview';
import { hasOptions, type Item } from './items';
import styles from './Quiz.module.css';

const pct = (x: number) => `${Math.round(x * 100)} %`;
const fmtEvents = (e: string[]) =>
  e.length ? e.map((x) => x.replace('-', '−')).join(' → ') : t('quiz.noMovement');
const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

function componentLabel(templateId: string, id: string): string {
  const c = getTemplate(templateId)?.circuit.components.find((k) => k.id === id);
  return typeof c?.params.label === 'string' && c.params.label !== '' ? c.params.label : id;
}

/** The right answer, in words, for the final review. */
function answerText({ q, templateId }: Item): string {
  switch (q.type) {
    case 'single':
    case 'predict':
      return q.options[q.answer.index]!;
    case 'multiple':
      return q.answer.indices.map((i) => q.options[i]!).join(' · ');
    case 'truefalse':
      return t(q.answer.value ? 'quiz.true' : 'quiz.false');
    case 'numeric':
      return `${String(q.answer.value).replace('.', ',')} ${q.answer.unit}`;
    case 'identify':
      return q.answer.componentIds.map((id) => componentLabel(templateId, id)).join(' · ');
  }
}

/**
 * Runs a quiz (SPEC §8.6.3). Learning mode: feedback after every question.
 * Exam mode: free navigation, correction at the end, optional timer.
 */
export function QuizRunner({
  items,
  exam,
  minutes,
  showCircuit,
  onFinish,
  onRestart,
  againLabel,
}: {
  items: Item[];
  exam: boolean;
  minutes: number;
  showCircuit: boolean;
  onFinish: (r: QuizResult) => void;
  onRestart: () => void;
  againLabel: string;
}) {
  const [index, setIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, Response>>({});
  const [checked, setChecked] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [left, setLeft] = useState(minutes * 60);
  const openDrawer = useLearning((s) => s.openDrawer);

  const finish = () => {
    const r = gradeQuiz(
      items.map((i) => i.q),
      responses,
    );
    setResult(r);
    onFinish(r);
  };
  const finishRef = useRef(finish);
  useEffect(() => {
    finishRef.current = finish;
  });

  const timed = exam && minutes > 0 && !result;
  useEffect(() => {
    if (!timed) return;
    const id = setInterval(() => {
      setLeft((s) => {
        if (s > 1) return s - 1;
        clearInterval(id);
        setTimedOut(true);
        finishRef.current();
        return 0;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [timed]);

  const theoryLink = (id?: string) => {
    const sheet = id ? getSheet(id) : undefined;
    return sheet ? (
      <button type="button" className={styles.link} onClick={() => openDrawer(sheet.id)}>
        {t('quiz.theory')}: {sheet.title}
      </button>
    ) : null;
  };

  if (result) {
    const wrong = items.filter((i) => result.wrong.includes(i.q.id));
    const unanswered = items.filter((i) => responses[i.q.id] === undefined).length;
    return (
      <div className={styles.result} data-testid="quiz-result">
        {timedOut && <p className={styles.muted}>{t('quiz.timeUp')}</p>}
        <div className={styles.score}>
          <span className={styles.scoreValue}>{pct(result.score)}</span>
          <span>{t('quiz.scoreOf', { correct: result.correct, total: result.total })}</span>
        </div>
        {exam && unanswered > 0 && (
          <p className={styles.muted}>{t('quiz.unanswered', { n: unanswered })}</p>
        )}
        <p className={styles.muted}>{t('quiz.saved')}</p>
        {wrong.length > 0 && (
          <>
            <h3 className={styles.h3}>{t('quiz.review')}</h3>
            <ol className={styles.review}>
              {wrong.map((item) => (
                <li key={item.q.id}>
                  <MarkdownBody text={item.q.prompt_md} onLink={() => undefined} />
                  <p>
                    <strong>{t('quiz.correctAnswer', { answer: answerText(item) })}</strong>
                  </p>
                  <MarkdownBody text={item.q.explanation_md} onLink={() => undefined} />
                  {theoryLink(item.q.theoryRef)}
                </li>
              ))}
            </ol>
          </>
        )}
        <button type="button" className={styles.primary} onClick={onRestart}>
          {againLabel}
        </button>
      </div>
    );
  }

  const item = items[index]!;
  const last = index + 1 === items.length;
  return (
    <>
      {timed && (
        <p className={styles.timer} data-testid="quiz-timer">
          {t('quiz.remaining', { time: clock(left) })}
        </p>
      )}
      <QuestionCard
        key={item.q.id}
        item={item}
        number={index + 1}
        total={items.length}
        exam={exam}
        showCircuit={showCircuit}
        response={responses[item.q.id]}
        checked={checked}
        onResponse={(r) => {
          const next = { ...responses };
          if (r === undefined) delete next[item.q.id];
          else next[item.q.id] = r;
          setResponses(next);
        }}
        onCheck={() => setChecked(true)}
        theoryLink={theoryLink(item.q.theoryRef)}
        onPrevious={index > 0 ? () => setIndex(index - 1) : null}
        onNext={() => {
          if (last) finish();
          else {
            setIndex(index + 1);
            setChecked(false);
          }
        }}
        onFinishExam={finish}
        last={last}
      />
    </>
  );
}

function QuestionCard({
  item,
  number,
  total,
  exam,
  showCircuit,
  response,
  checked,
  onResponse,
  onCheck,
  onPrevious,
  onNext,
  onFinishExam,
  last,
  theoryLink,
}: {
  item: Item;
  number: number;
  total: number;
  exam: boolean;
  showCircuit: boolean;
  response: Response | undefined;
  checked: boolean;
  onResponse: (r: Response | undefined) => void;
  onCheck: () => void;
  onPrevious: (() => void) | null;
  onNext: () => void;
  onFinishExam: () => void;
  last: boolean;
  theoryLink: React.ReactNode;
}) {
  const { q, order, templateId } = item;
  const [text, setText] = useState(
    typeof response === 'number' ? String(response).replace('.', ',') : '',
  );
  const ok = checked && response !== undefined && isCorrect(q, response);
  const template = getTemplate(templateId);
  const simulated = useMemo(() => {
    if (!checked || q.type !== 'predict') return null;
    return template ? runStimuli(template.circuit, q.stimuli) : null;
  }, [checked, q, template]);

  // "Identify": the next click on the canvas is the answer.
  const picking = q.type === 'identify' && !checked;
  const setPickMode = useLearning((s) => s.setPickMode);
  const pickedId = useLearning((s) => s.pickedId);
  useEffect(() => {
    if (!picking) return;
    setPickMode(true);
    return () => setPickMode(false);
  }, [picking, setPickMode]);
  useEffect(() => {
    if (picking && pickedId) {
      onResponse(pickedId);
      useLearning.getState().highlight(pickedId);
    }
    // onResponse changes on every render; only a new pick matters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickedId, picking]);

  const selectedList = Array.isArray(response) ? response : [];

  const choice = (value: boolean | number, label: string, key: string | number) => {
    const selected =
      q.type === 'multiple' ? selectedList.includes(value as number) : response === value;
    const correct =
      checked &&
      ((q.type === 'truefalse' && q.answer.value === value) ||
        (q.type === 'multiple' && q.answer.indices.includes(value as number)) ||
        ((q.type === 'single' || q.type === 'predict') && q.answer.index === value));
    const click = () => {
      if (q.type !== 'multiple') {
        onResponse(value);
        return;
      }
      const n = value as number;
      const next = selected ? selectedList.filter((i) => i !== n) : [...selectedList, n];
      onResponse(next.length ? next : undefined);
    };
    return (
      <li key={key}>
        <button
          type="button"
          className={`${styles.option} ${correct ? styles.correct : ''} ${checked && selected && !correct ? styles.wrong : ''}`}
          aria-pressed={selected}
          disabled={checked}
          onClick={click}
        >
          {label}
        </button>
      </li>
    );
  };

  const canCheck = response !== undefined && !(q.type === 'numeric' && parseNumber(text) === null);

  return (
    <div className={styles.card} data-testid="quiz-question" data-question-id={q.id}>
      <div className={styles.progress}>
        {t('quiz.questionOf', { n: number, total })} · {t(`quiz.type.${q.type}`)}
      </div>
      {showCircuit && template && (
        <details className={styles.circuit}>
          <summary>
            {t('quiz.fromTemplate', { title: template.title })} · {t('quiz.showCircuit')}
          </summary>
          <CircuitPreview project={template.circuit} />
        </details>
      )}
      <MarkdownBody text={q.prompt_md} onLink={() => undefined} className={styles.prompt} />
      {q.type === 'predict' && !exam && <p className={styles.hint}>{t('quiz.predictHint')}</p>}
      {q.type === 'multiple' && <p className={styles.hint}>{t('quiz.multipleHint')}</p>}
      {q.type === 'identify' && (
        <>
          <p className={styles.hint}>{t('quiz.identifyHint')}</p>
          <p data-testid="quiz-picked">
            {typeof response === 'string'
              ? t('quiz.identifyPicked', { label: componentLabel(templateId, response) })
              : t('quiz.identifyNone')}
          </p>
        </>
      )}

      {hasOptions(q) && (
        <ul className={styles.options}>
          {order.map((i) => choice(i, (q as { options: string[] }).options[i]!, i))}
        </ul>
      )}
      {q.type === 'truefalse' && (
        <ul className={styles.options}>
          {choice(true, t('quiz.true'), 't')}
          {choice(false, t('quiz.false'), 'f')}
        </ul>
      )}
      {q.type === 'numeric' && (
        <div className={styles.numeric}>
          <input
            type="text"
            inputMode="decimal"
            aria-label={t('quiz.answer')}
            value={text}
            disabled={checked}
            onChange={(e) => {
              setText(e.target.value);
              onResponse(parseNumber(e.target.value) ?? undefined);
            }}
          />
          {q.answer.unit && <span>{q.answer.unit}</span>}
        </div>
      )}

      {checked && (
        <div className={`${styles.feedback} ${ok ? styles.okBox : styles.badBox}`} role="status">
          <strong>{ok ? t('quiz.correct') : t('quiz.incorrect')}</strong>
          {q.type === 'numeric' && (
            <span>
              {' '}
              {t('quiz.expected')}: {String(q.answer.value).replace('.', ',')} {q.answer.unit} (±
              {q.answer.tolerancePct} %)
            </span>
          )}
          {q.type === 'identify' && !ok && (
            <p>{t('quiz.correctAnswer', { answer: answerText(item) })}</p>
          )}
          {simulated && (
            <p className={styles.sim} data-testid="quiz-simulated">
              {t('quiz.simulated')}: <code>{fmtEvents(simulated)}</code>
            </p>
          )}
          <MarkdownBody text={q.explanation_md} onLink={() => undefined} />
          {theoryLink}
        </div>
      )}

      <div className={styles.actions}>
        {exam ? (
          <>
            {onPrevious && (
              <button type="button" className={styles.secondary} onClick={onPrevious}>
                {t('quiz.previous')}
              </button>
            )}
            {!last && (
              <button type="button" className={styles.secondary} onClick={onNext}>
                {t('quiz.next')}
              </button>
            )}
            <button type="button" className={styles.primary} onClick={onFinishExam}>
              {t('quiz.finishExam')}
            </button>
          </>
        ) : !checked ? (
          <button type="button" className={styles.primary} disabled={!canCheck} onClick={onCheck}>
            {t('quiz.check')}
          </button>
        ) : (
          <button type="button" className={styles.primary} onClick={onNext}>
            {last ? t('quiz.finish') : t('quiz.next')}
          </button>
        )}
      </div>
    </div>
  );
}

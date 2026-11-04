import { useMemo, useState } from 'react';
import { getQuiz } from '../../learning/quiz';
import {
  gradeQuiz,
  isCorrect,
  parseNumber,
  shuffled,
  type QuizResult,
} from '../../learning/quiz/grade';
import { runStimuli } from '../../learning/quiz/simulate';
import type { Question, Response } from '../../learning/quiz/types';
import { getTemplate } from '../../learning/templates';
import { getSheet } from '../../learning/theory/sheets';
import { t } from '../../i18n';
import { noteQuizResult } from '../../storage/progress';
import { useLearning } from '../learning/store';
import { MarkdownBody } from '../theory/MarkdownBody';
import styles from './Quiz.module.css';

interface Item {
  q: Question;
  /** Display order of the options (indices into q.options). */
  order: number[];
}

function build(questions: Question[], mix: boolean): Item[] {
  const qs = mix ? shuffled(questions) : questions;
  return qs.map((q) => {
    const n = q.type === 'single' || q.type === 'predict' ? q.options.length : 0;
    const idx = [...Array(n).keys()];
    return { q, order: mix ? shuffled(idx) : idx };
  });
}

const pct = (x: number) => `${Math.round(x * 100)} %`;
const fmtEvents = (e: string[]) =>
  e.length ? e.map((x) => x.replace('-', '−')).join(' → ') : t('quiz.noMovement');

/** Learning-mode quiz (SPEC §8.6.3): feedback and explanation after every question. */
export function QuizView({ templateId }: { templateId: string }) {
  const quiz = getQuiz(templateId);
  const [mix, setMix] = useState(false);
  const [items, setItems] = useState<Item[] | null>(null);
  const [index, setIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, Response>>({});
  const [checked, setChecked] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const openDrawer = useLearning((s) => s.openDrawer);

  if (!quiz) return <p className={styles.muted}>{t('quiz.none')}</p>;

  const start = () => {
    setItems(build(quiz.questions, mix));
    setIndex(0);
    setResponses({});
    setChecked(false);
    setResult(null);
  };

  if (!items) {
    return (
      <div className={styles.intro} data-testid="quiz-intro">
        <p>{t('quiz.intro', { n: quiz.questions.length })}</p>
        <label className={styles.check}>
          <input type="checkbox" checked={mix} onChange={(e) => setMix(e.target.checked)} />
          {t('quiz.shuffle')}
        </label>
        <button type="button" className={styles.primary} onClick={start}>
          {t('quiz.start')}
        </button>
      </div>
    );
  }

  const theoryLink = (id?: string) => {
    const sheet = id ? getSheet(id) : undefined;
    return sheet ? (
      <button type="button" className={styles.link} onClick={() => openDrawer(sheet.id)}>
        {t('quiz.theory')}: {sheet.title}
      </button>
    ) : null;
  };

  if (result) {
    const wrong = quiz.questions.filter((q) => result.wrong.includes(q.id));
    return (
      <div className={styles.result} data-testid="quiz-result">
        <div className={styles.score}>
          <span className={styles.scoreValue}>{pct(result.score)}</span>
          <span>{t('quiz.scoreOf', { correct: result.correct, total: result.total })}</span>
        </div>
        <p className={styles.muted}>{t('quiz.saved')}</p>
        {wrong.length > 0 && (
          <>
            <h3 className={styles.h3}>{t('quiz.review')}</h3>
            <ol className={styles.review}>
              {wrong.map((q) => (
                <li key={q.id}>
                  <MarkdownBody text={q.prompt_md} onLink={() => undefined} />
                  <MarkdownBody text={q.explanation_md} onLink={() => undefined} />
                  {theoryLink(q.theoryRef)}
                </li>
              ))}
            </ol>
          </>
        )}
        <button type="button" className={styles.primary} onClick={start}>
          {t('quiz.again')}
        </button>
      </div>
    );
  }

  const item = items[index]!;
  return (
    <QuestionCard
      key={item.q.id}
      item={item}
      number={index + 1}
      total={items.length}
      templateId={templateId}
      response={responses[item.q.id]}
      checked={checked}
      onResponse={(r) => setResponses({ ...responses, [item.q.id]: r })}
      onCheck={() => setChecked(true)}
      theoryLink={theoryLink(item.q.theoryRef)}
      onNext={() => {
        if (index + 1 < items.length) {
          setIndex(index + 1);
          setChecked(false);
        } else {
          const r = gradeQuiz(quiz.questions, responses);
          setResult(r);
          void noteQuizResult(templateId, r);
        }
      }}
      last={index + 1 === items.length}
    />
  );
}

function QuestionCard({
  item,
  number,
  total,
  templateId,
  response,
  checked,
  onResponse,
  onCheck,
  onNext,
  last,
  theoryLink,
}: {
  item: Item;
  number: number;
  total: number;
  templateId: string;
  response: Response | undefined;
  checked: boolean;
  onResponse: (r: Response) => void;
  onCheck: () => void;
  onNext: () => void;
  last: boolean;
  theoryLink: React.ReactNode;
}) {
  const { q, order } = item;
  const [text, setText] = useState('');
  const ok = checked && response !== undefined && isCorrect(q, response);
  const simulated = useMemo(() => {
    if (!checked || q.type !== 'predict') return null;
    const tpl = getTemplate(templateId);
    return tpl ? runStimuli(tpl.circuit, q.stimuli) : null;
  }, [checked, q, templateId]);

  const choice = (value: Response, label: string, key: string | number) => {
    const selected = response === value;
    const correct =
      checked &&
      ((q.type === 'truefalse' && q.answer.value === value) ||
        ((q.type === 'single' || q.type === 'predict') && q.answer.index === value));
    return (
      <li key={key}>
        <button
          type="button"
          className={`${styles.option} ${correct ? styles.correct : ''} ${checked && selected && !correct ? styles.wrong : ''}`}
          aria-pressed={selected}
          disabled={checked}
          onClick={() => onResponse(value)}
        >
          {label}
        </button>
      </li>
    );
  };

  return (
    <div className={styles.card} data-testid="quiz-question" data-question-id={q.id}>
      <div className={styles.progress}>
        {t('quiz.questionOf', { n: number, total })} · {t(`quiz.type.${q.type}`)}
      </div>
      <MarkdownBody text={q.prompt_md} onLink={() => undefined} className={styles.prompt} />
      {q.type === 'predict' && <p className={styles.hint}>{t('quiz.predictHint')}</p>}

      {(q.type === 'single' || q.type === 'predict') && (
        <ul className={styles.options}>{order.map((i) => choice(i, q.options[i]!, i))}</ul>
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
              const n = parseNumber(e.target.value);
              if (n !== null) onResponse(n);
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
        {!checked ? (
          <button
            type="button"
            className={styles.primary}
            disabled={
              response === undefined || (q.type === 'numeric' && parseNumber(text) === null)
            }
            onClick={onCheck}
          >
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

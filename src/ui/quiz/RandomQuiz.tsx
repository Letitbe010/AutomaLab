import { useMemo, useState } from 'react';
import {
  poolDomains,
  poolTags,
  questionPool,
  randomQuestions,
  type PoolFilter,
} from '../../learning/quiz/pool';
import { t } from '../../i18n';
import { noteRandomQuiz } from '../../storage/progress';
import { ExamOptions } from './ExamOptions';
import { buildItems, type Item } from './items';
import { QuizRunner } from './QuizRunner';
import styles from './Quiz.module.css';

const COUNTS = [5, 10, 20, 40];

/** Random quiz: questions of several templates, chosen by domain, level and tag. */
export function RandomQuiz({ onBack }: { onBack: () => void }) {
  const [filter, setFilter] = useState<PoolFilter>({ domain: '', level: 0, tag: '' });
  const [count, setCount] = useState(10);
  const [exam, setExam] = useState(false);
  const [minutes, setMinutes] = useState(0);
  const [items, setItems] = useState<Item[] | null>(null);
  const [run, setRun] = useState(0);
  const available = useMemo(() => questionPool(filter).length, [filter]);

  const start = () => {
    setItems(buildItems(randomQuestions(filter, count), true));
    setRun(run + 1);
  };

  return (
    <div className={styles.randomPage} data-testid="random-quiz">
      <button type="button" className={styles.link} onClick={onBack}>
        ← {t('quiz.random.back')}
      </button>
      {items ? (
        <QuizRunner
          key={run}
          items={items}
          exam={exam}
          minutes={minutes}
          showCircuit
          onFinish={(r) => void noteRandomQuiz(r)}
          onRestart={() => setItems(null)}
          againLabel={t('quiz.random.again')}
        />
      ) : (
        <div className={styles.intro}>
          <p>{t('quiz.random.intro')}</p>
          <div className={styles.filters}>
            <label>
              {t('quiz.random.domain')}
              <select
                value={filter.domain}
                onChange={(e) => setFilter({ ...filter, domain: e.target.value })}
              >
                <option value="">{t('theory.all')}</option>
                {poolDomains().map((d) => (
                  <option key={d} value={d}>
                    {t(`domain.${d}`)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {t('quiz.random.level')}
              <select
                value={filter.level}
                onChange={(e) => setFilter({ ...filter, level: Number(e.target.value) })}
              >
                <option value={0}>{t('theory.all')}</option>
                {[1, 2, 3].map((l) => (
                  <option key={l} value={l}>
                    {t(`templates.levels.${l}`)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {t('quiz.random.tag')}
              <select
                value={filter.tag}
                onChange={(e) => setFilter({ ...filter, tag: e.target.value })}
              >
                <option value="">{t('theory.all')}</option>
                {poolTags().map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {t('quiz.random.count')}
              <select value={count} onChange={(e) => setCount(Number(e.target.value))}>
                {COUNTS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <p className={styles.muted} data-testid="random-available">
            {available === 0 ? t('quiz.random.none') : t('quiz.random.available', { n: available })}
          </p>
          <ExamOptions exam={exam} minutes={minutes} onExam={setExam} onMinutes={setMinutes} />
          <button
            type="button"
            className={styles.primary}
            disabled={available === 0}
            onClick={start}
          >
            {t('quiz.random.start')}
          </button>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { getQuiz } from '../../learning/quiz';
import { t } from '../../i18n';
import { noteQuizResult } from '../../storage/progress';
import { buildItems, type Item } from './items';
import { QuizRunner } from './QuizRunner';
import { ExamOptions } from './ExamOptions';
import styles from './Quiz.module.css';

/** Quiz of a template, in its side panel (SPEC §8.6.3). */
export function QuizView({ templateId }: { templateId: string }) {
  const quiz = getQuiz(templateId);
  const [mix, setMix] = useState(false);
  const [exam, setExam] = useState(false);
  const [minutes, setMinutes] = useState(0);
  const [items, setItems] = useState<Item[] | null>(null);
  const [run, setRun] = useState(0);

  if (!quiz) return <p className={styles.muted}>{t('quiz.none')}</p>;

  const start = () => {
    setItems(
      buildItems(
        quiz.questions.map((question) => ({ question, templateId })),
        mix,
      ),
    );
    setRun(run + 1);
  };

  if (!items) {
    return (
      <div className={styles.intro} data-testid="quiz-intro">
        <p>{t('quiz.intro', { n: quiz.questions.length })}</p>
        <label className={styles.check}>
          <input type="checkbox" checked={mix} onChange={(e) => setMix(e.target.checked)} />
          {t('quiz.shuffle')}
        </label>
        <ExamOptions exam={exam} minutes={minutes} onExam={setExam} onMinutes={setMinutes} />
        <button type="button" className={styles.primary} onClick={start}>
          {t('quiz.start')}
        </button>
      </div>
    );
  }

  return (
    <QuizRunner
      key={run}
      items={items}
      exam={exam}
      minutes={minutes}
      showCircuit={false}
      onFinish={(r) => void noteQuizResult(templateId, r)}
      onRestart={start}
      againLabel={t('quiz.again')}
    />
  );
}

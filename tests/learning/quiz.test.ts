/** Quiz engine and quiz content (SPEC §8.6, §11). */
import {
  airPerCycleNl,
  compressionRatio,
  cylinderForceN,
} from '../../src/learning/calculators/pneumatic';
import { renderMarkdown } from '../../src/learning/markdown';
import { getQuiz, questionProblem, QUIZZES } from '../../src/learning/quiz';
import { gradeQuiz, isCorrect, parseNumber, shuffled } from '../../src/learning/quiz/grade';
import { runStimuli, simulatedOption } from '../../src/learning/quiz/simulate';
import type { NumericQuestion, PredictQuestion, Question } from '../../src/learning/quiz/types';
import { getTemplate, TEMPLATES } from '../../src/learning/templates';
import { getSheet } from '../../src/learning/theory/sheets';

const numeric = (templateId: string, id: string) =>
  getQuiz(templateId)!.questions.find((q) => q.id === id) as NumericQuestion;

describe('grading', () => {
  const single: Question = {
    id: 'a',
    type: 'single',
    prompt_md: '?',
    explanation_md: '',
    options: ['x', 'y'],
    answer: { index: 1 },
  };
  const tf: Question = {
    id: 'b',
    type: 'truefalse',
    prompt_md: '?',
    explanation_md: '',
    answer: { value: false },
  };
  const num: Question = {
    id: 'c',
    type: 'numeric',
    prompt_md: '?',
    explanation_md: '',
    answer: { value: 434, unit: 'N', tolerancePct: 2 },
  };

  it('checks single, true/false and numeric answers with tolerance', () => {
    expect(isCorrect(single, 1)).toBe(true);
    expect(isCorrect(single, 0)).toBe(false);
    expect(isCorrect(tf, false)).toBe(true);
    expect(isCorrect(tf, true)).toBe(false);
    expect(isCorrect(num, 440)).toBe(true); // within 2 % (±8,68)
    expect(isCorrect(num, 443)).toBe(false);
    expect(isCorrect(num, Number.NaN)).toBe(false);
  });

  it('parses numbers with a decimal comma or point', () => {
    expect(parseNumber('6,92')).toBe(6.92);
    expect(parseNumber(' 1 040 ')).toBe(1040);
    expect(parseNumber('1.04')).toBe(1.04);
    expect(parseNumber('abc')).toBeNull();
    expect(parseNumber('')).toBeNull();
  });

  it('grades a quiz: score, wrong answers and per-type counts', () => {
    const r = gradeQuiz([single, tf, num], { a: 1, b: true });
    expect(r).toEqual({
      score: 1 / 3,
      correct: 1,
      total: 3,
      wrong: ['b', 'c'],
      byType: { single: [1, 1], truefalse: [0, 1], numeric: [0, 1] },
    });
  });

  it('shuffles without losing items', () => {
    let i = 0;
    const seq = [0.9, 0.1, 0.5, 0.3];
    const out = shuffled([1, 2, 3, 4, 5], () => seq[i++ % seq.length]!);
    expect([...out].sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it('rejects malformed questions', () => {
    expect(questionProblem({ ...single, answer: { index: 5 } })).toBe('options/answer.index');
    expect(questionProblem({ ...num, answer: { value: 1 } })).not.toBeNull();
    expect(
      questionProblem({ id: 'x', type: 'other', prompt_md: '', explanation_md: '', answer: {} }),
    ).toBe('type');
  });
});

describe('quiz content', () => {
  it('every template has a quiz with 3 to 5 questions', () => {
    for (const t of TEMPLATES) {
      const quiz = getQuiz(t.id);
      expect(quiz, t.id).toBeDefined();
      expect(quiz!.questions.length).toBeGreaterThanOrEqual(3);
      expect(quiz!.questions.length).toBeLessThanOrEqual(5);
    }
    expect(QUIZZES.every((q) => getTemplate(q.templateId))).toBe(true);
  });

  describe.each(QUIZZES.map((q) => [q.templateId, q] as const))('%s', (templateId, quiz) => {
    const circuit = getTemplate(templateId)!.circuit;

    it('has unique ids, valid theory links and formulas that render', () => {
      const ids = quiz.questions.map((q) => q.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const q of quiz.questions) {
        if (q.theoryRef) expect(getSheet(q.theoryRef), q.theoryRef).toBeDefined();
        expect(() => renderMarkdown(q.prompt_md, { strict: true })).not.toThrow();
        expect(() => renderMarkdown(q.explanation_md, { strict: true })).not.toThrow();
        expect(q.explanation_md.length).toBeGreaterThan(20);
      }
    });

    const predicts = quiz.questions.filter((q): q is PredictQuestion => q.type === 'predict');
    it.each(predicts.map((q) => [q.id, q] as const))(
      'predict %s: the engine agrees with the answer and options are distinguishable',
      (_id, q) => {
        const keys = q.optionEvents.map((e) => e.join(' '));
        expect(new Set(keys).size).toBe(keys.length);
        if (q.verifyBySimulation) expect(simulatedOption(circuit, q)).toBe(q.answer.index);
      },
    );
  });

  it('has at least one predict question per template, all verified by simulation', () => {
    for (const quiz of QUIZZES) {
      const p = quiz.questions.filter((q) => q.type === 'predict');
      expect(p.length, quiz.templateId).toBeGreaterThan(0);
      expect(p.every((q) => q.type === 'predict' && q.verifyBySimulation)).toBe(true);
    }
  });

  it('numeric answers match the calculator functions (SPEC §8.6.2)', () => {
    const r = compressionRatio(6);
    expect(isCorrect(numeric('tpl-pn-01', 'q4'), r)).toBe(true);
    expect(numeric('tpl-pn-01', 'q4').answer.value).toBeCloseTo(r, 2);
    const f = cylinderForceN({ pressureBar: 6, boreMm: 32, efficiency: 0.9, direction: 'extend' });
    expect(numeric('tpl-pn-02', 'q4').answer.value).toBe(Math.round(f));
    const air = airPerCycleNl({
      pressureBar: 6,
      boreMm: 32,
      rodMm: 12,
      strokeMm: 100,
      doubleActing: true,
    });
    expect(numeric('tpl-pn-04', 'q4').answer.value).toBeCloseTo(air, 2);
  });

  it('stimuli refer to existing labels', () => {
    expect(() => runStimuli(getTemplate('tpl-pn-01')!.circuit, [['press', 'nope']])).toThrow();
  });
});

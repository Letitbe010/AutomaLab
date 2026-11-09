/** Quiz engine and quiz content (SPEC §8.6, §11). */
import {
  airPerCycleNl,
  compressionRatio,
  cylinderForceN,
} from '../../src/learning/calculators/pneumatic';
import { renderMarkdown } from '../../src/learning/markdown';
import { getQuiz, questionProblem, QUIZZES } from '../../src/learning/quiz';
import { questionPool, randomQuestions } from '../../src/learning/quiz/pool';
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

describe('multiple and identify questions', () => {
  const multiple: Question = {
    id: 'm',
    type: 'multiple',
    prompt_md: '?',
    explanation_md: '',
    options: ['a', 'b', 'c'],
    answer: { indices: [0, 2] },
  };
  const identify: Question = {
    id: 'i',
    type: 'identify',
    prompt_md: '?',
    explanation_md: '',
    answer: { componentIds: ['v3', 'v4'] },
  };

  it('needs every correct option and no other, in any order', () => {
    expect(isCorrect(multiple, [2, 0])).toBe(true);
    expect(isCorrect(multiple, [0])).toBe(false);
    expect(isCorrect(multiple, [0, 1, 2])).toBe(false);
    expect(isCorrect(multiple, [0, 0])).toBe(false);
    expect(isCorrect(multiple, 0)).toBe(false);
  });

  it('accepts any of the listed components', () => {
    expect(isCorrect(identify, 'v4')).toBe(true);
    expect(isCorrect(identify, 'v1')).toBe(false);
    expect(isCorrect(identify, 3)).toBe(false);
  });

  it('rejects malformed questions', () => {
    expect(questionProblem(multiple)).toBeNull();
    expect(questionProblem(identify)).toBeNull();
    expect(questionProblem({ ...multiple, answer: { indices: [] } })).not.toBeNull();
    expect(questionProblem({ ...multiple, answer: { indices: [5] } })).not.toBeNull();
    expect(questionProblem({ ...multiple, answer: { indices: [1, 1] } })).not.toBeNull();
    expect(questionProblem({ ...identify, answer: { componentIds: [] } })).not.toBeNull();
  });

  it('every identify answer exists in its template circuit (SPEC §11)', () => {
    let count = 0;
    for (const quiz of QUIZZES) {
      const ids = getTemplate(quiz.templateId)!.circuit.components.map((c) => c.id);
      for (const q of quiz.questions) {
        if (q.type !== 'identify') continue;
        count += 1;
        for (const id of q.answer.componentIds) expect(ids).toContain(id);
      }
    }
    expect(count).toBeGreaterThanOrEqual(9);
  });
});

describe('random quiz pool', () => {
  const all = { domain: '', level: 0, tag: '' };

  it('leaves identify out and has unique ids', () => {
    const pool = questionPool(all);
    expect(pool.some((p) => p.question.type === 'identify')).toBe(false);
    expect(new Set(pool.map((p) => p.question.id)).size).toBe(pool.length);
  });

  it('filters by domain, level and tag', () => {
    const domain = questionPool({ ...all, domain: 'pneumatic' });
    expect(domain.length).toBeGreaterThan(0);
    expect(domain.length).toBeLessThan(questionPool(all).length);
    for (const p of domain) expect(getTemplate(p.templateId)!.domain).toBe('pneumatic');
    const tag = getTemplate('tpl-pn-05')!.tags[0]!;
    for (const p of questionPool({ ...all, tag })) {
      expect(getTemplate(p.templateId)!.tags).toContain(tag);
    }
    expect(questionPool({ ...all, level: 9 })).toEqual([]);
  });

  it('draws at most the requested number, without repeats', () => {
    const r = randomQuestions(all, 7, () => 0.3);
    expect(r).toHaveLength(7);
    expect(new Set(r.map((p) => p.question.id)).size).toBe(7);
  });
});

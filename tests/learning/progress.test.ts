import {
  domainSummary,
  emptyProgress,
  markTheoryRead,
  mergeProgress,
  progressFromObject,
  recordQuizResult,
  recordTemplateOpened,
} from '../../src/learning/progress';
import type { QuizResult } from '../../src/learning/quiz/grade';

const result = (score: number): QuizResult => ({
  score,
  correct: Math.round(score * 4),
  total: 4,
  wrong: [],
  byType: { single: [Math.round(score * 4), 4] },
});
const t1 = new Date('2026-11-04T10:00:00Z');
const t2 = new Date('2026-11-05T10:00:00Z');

describe('progress', () => {
  it('records openings, quiz attempts, best and last score', () => {
    let p = recordTemplateOpened(emptyProgress(), 'tpl-a', t1);
    p = recordQuizResult(p, 'tpl-a', result(0.75), t1);
    p = recordQuizResult(p, 'tpl-a', result(0.5), t2);
    expect(p.templates['tpl-a']).toEqual({
      openedAt: t1.toISOString(),
      quizDoneAt: t2.toISOString(),
      bestScore: 0.75,
      lastScore: 0.5,
      attempts: 2,
    });
    expect(p.questionTypes.single).toEqual({ correct: 5, total: 8 });
  });

  it('marks a theory sheet read only once', () => {
    const p = markTheoryRead(emptyProgress(), 'pn-x', t1);
    expect(markTheoryRead(p, 'pn-x', t2)).toBe(p);
  });

  it('summarises by domain, counting templates without a quiz as 0', () => {
    const p = recordQuizResult(emptyProgress(), 'a', result(1), t1);
    const s = domainSummary(p, [
      { id: 'a', domain: 'pneumatic' },
      { id: 'b', domain: 'pneumatic' },
      { id: 'c', domain: 'hydraulic' },
    ]);
    expect(s).toEqual({
      pneumatic: { score: 0.5, done: 1, total: 2 },
      hydraulic: { score: 0, done: 0, total: 1 },
    });
  });

  it('merging an import keeps the best results of both', () => {
    const local = recordQuizResult(emptyProgress(), 'a', result(0.5), t2);
    const imported = markTheoryRead(recordQuizResult(emptyProgress(), 'a', result(1), t1), 's', t1);
    const m = mergeProgress(local, imported);
    expect(m.templates.a!.bestScore).toBe(1);
    expect(m.templates.a!.lastScore).toBe(0.5); // local attempt is newer
    expect(m.templates.a!.quizDoneAt).toBe(t2.toISOString());
    expect(m.theoryRead.s).toBe(t1.toISOString());
  });

  it('reads progress back from JSON and drops invalid parts', () => {
    const p = recordQuizResult(emptyProgress(), 'a', result(0.25), t1);
    expect(progressFromObject(JSON.parse(JSON.stringify(p)))).toEqual(p);
    expect(
      progressFromObject({ templates: { x: { attempts: 'no' } }, theoryRead: { y: 3 } }),
    ).toEqual({
      ...emptyProgress(),
      templates: { x: { attempts: 0 } },
    });
    expect(progressFromObject(null)).toEqual(emptyProgress());
  });
});

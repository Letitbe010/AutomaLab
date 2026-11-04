/** "Nire aurrerapena" (SPEC §8.7): pure data model and updates. Dates are ISO strings. */
import type { QuizResult } from './quiz/grade';

export interface TemplateProgress {
  openedAt?: string;
  quizDoneAt?: string;
  /** Best and last quiz score (0..1). */
  bestScore?: number;
  lastScore?: number;
  attempts: number;
}

export interface Progress {
  version: 1;
  templates: Record<string, TemplateProgress>;
  /** Theory sheet id -> first time read. */
  theoryRead: Record<string, string>;
  /** Per question type: answers given and correct ones. */
  questionTypes: Record<string, { correct: number; total: number }>;
}

export const emptyProgress = (): Progress => ({
  version: 1,
  templates: {},
  theoryRead: {},
  questionTypes: {},
});

const tpl = (p: Progress, id: string): TemplateProgress => p.templates[id] ?? { attempts: 0 };

export function recordTemplateOpened(p: Progress, id: string, now = new Date()): Progress {
  return {
    ...p,
    templates: { ...p.templates, [id]: { ...tpl(p, id), openedAt: now.toISOString() } },
  };
}

export function recordQuizResult(
  p: Progress,
  id: string,
  result: QuizResult,
  now = new Date(),
): Progress {
  const prev = tpl(p, id);
  const questionTypes = { ...p.questionTypes };
  for (const [type, [correct, total]] of Object.entries(result.byType)) {
    const t = questionTypes[type] ?? { correct: 0, total: 0 };
    questionTypes[type] = { correct: t.correct + correct, total: t.total + total };
  }
  return {
    ...p,
    questionTypes,
    templates: {
      ...p.templates,
      [id]: {
        ...prev,
        quizDoneAt: now.toISOString(),
        lastScore: result.score,
        bestScore: Math.max(prev.bestScore ?? 0, result.score),
        attempts: prev.attempts + 1,
      },
    },
  };
}

export function markTheoryRead(p: Progress, sheetId: string, now = new Date()): Progress {
  if (p.theoryRead[sheetId]) return p;
  return { ...p, theoryRead: { ...p.theoryRead, [sheetId]: now.toISOString() } };
}

/**
 * Average best quiz score per domain, over all templates of that domain
 * (templates without a finished quiz count as 0).
 */
export function domainSummary(
  p: Progress,
  templates: readonly { id: string; domain: string }[],
): Record<string, { score: number; done: number; total: number }> {
  const out: Record<string, { score: number; done: number; total: number }> = {};
  for (const t of templates) {
    const d = (out[t.domain] ??= { score: 0, done: 0, total: 0 });
    const best = p.templates[t.id]?.bestScore;
    d.total += 1;
    if (best !== undefined) {
      d.done += 1;
      d.score += best;
    }
  }
  for (const d of Object.values(out)) d.score = d.total ? d.score / d.total : 0;
  return out;
}

const later = (a?: string, b?: string) => (!a ? b : !b ? a : a > b ? a : b);
const earlier = (a?: string, b?: string) => (!a ? b : !b ? a : a < b ? a : b);
const opt = <K extends string, V>(k: K, v: V | undefined) =>
  (v === undefined ? {} : { [k]: v }) as Partial<Record<K, V>>;

/** Combines local progress with an imported one (an import never loses results). */
export function mergeProgress(a: Progress, b: Progress): Progress {
  const templates: Record<string, TemplateProgress> = { ...a.templates };
  for (const [id, y] of Object.entries(b.templates)) {
    const x = templates[id];
    if (!x) {
      templates[id] = y;
      continue;
    }
    const newer = (later(x.quizDoneAt, y.quizDoneAt) ?? '') === (y.quizDoneAt ?? '') ? y : x;
    const best = Math.max(x.bestScore ?? -1, y.bestScore ?? -1);
    templates[id] = {
      attempts: Math.max(x.attempts, y.attempts),
      ...opt('openedAt', later(x.openedAt, y.openedAt)),
      ...opt('quizDoneAt', later(x.quizDoneAt, y.quizDoneAt)),
      ...opt('lastScore', newer.lastScore ?? x.lastScore ?? y.lastScore),
      ...opt('bestScore', best < 0 ? undefined : best),
    };
  }
  const theoryRead = { ...a.theoryRead };
  for (const [id, at] of Object.entries(b.theoryRead))
    theoryRead[id] = earlier(theoryRead[id], at)!;
  const questionTypes = { ...a.questionTypes };
  for (const [type, y] of Object.entries(b.questionTypes)) {
    const x = questionTypes[type];
    // Counts cannot be told apart after a round trip, so keep the larger history.
    questionTypes[type] = !x || y.total > x.total ? y : x;
  }
  return { version: 1, templates, theoryRead, questionTypes };
}

/** Reads progress from unknown data (backup file); invalid parts are dropped. */
export function progressFromObject(raw: unknown): Progress {
  const p = emptyProgress();
  if (typeof raw !== 'object' || raw === null) return p;
  const o = raw as Record<string, unknown>;
  const obj = (v: unknown) =>
    typeof v === 'object' && v !== null ? (v as Record<string, unknown>) : {};
  const str = (v: unknown) => (typeof v === 'string' ? v : undefined);
  const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : undefined);
  for (const [id, v] of Object.entries(obj(o.templates))) {
    const t = obj(v);
    p.templates[id] = {
      attempts: num(t.attempts) ?? 0,
      ...opt('openedAt', str(t.openedAt)),
      ...opt('quizDoneAt', str(t.quizDoneAt)),
      ...opt('bestScore', num(t.bestScore)),
      ...opt('lastScore', num(t.lastScore)),
    };
  }
  for (const [id, v] of Object.entries(obj(o.theoryRead))) {
    const s = str(v);
    if (s) p.theoryRead[id] = s;
  }
  for (const [type, v] of Object.entries(obj(o.questionTypes))) {
    const t = obj(v);
    const correct = num(t.correct);
    const total = num(t.total);
    if (correct !== undefined && total !== undefined) p.questionTypes[type] = { correct, total };
  }
  return p;
}

/** Quizzes bundled with the templates: src/learning/templates/<folder>/quiz.json. */
import type { Question, Quiz, Stimulus } from './types';

const files = import.meta.glob<unknown>('../templates/*/quiz.json', {
  import: 'default',
  eager: true,
});

const isStr = (v: unknown): v is string => typeof v === 'string';
const isStrArr = (v: unknown): v is string[] => Array.isArray(v) && v.every(isStr);
const isIndex = (v: unknown, n: number) =>
  Number.isInteger(v) && (v as number) >= 0 && (v as number) < n;

function isStimulus(v: unknown): v is Stimulus {
  if (!Array.isArray(v)) return false;
  const [k, a, b] = v as unknown[];
  if (k === 'wait') return v.length === 2 && typeof a === 'number' && a >= 0;
  if (k === 'press' || k === 'release') return v.length === 2 && isStr(a);
  if (k === 'pulse')
    return isStr(a) && (v.length === 2 || (v.length === 3 && typeof b === 'number'));
  return false;
}

/** Checks one question; returns a reason when it is invalid. */
export function questionProblem(raw: unknown): string | null {
  const q = raw as Record<string, unknown> | null;
  if (!q || typeof q !== 'object') return 'not an object';
  if (!isStr(q.id) || !isStr(q.prompt_md) || !isStr(q.explanation_md))
    return 'id/prompt/explanation';
  if (q.theoryRef !== undefined && !isStr(q.theoryRef)) return 'theoryRef';
  const a = q.answer as Record<string, unknown> | undefined;
  if (!a || typeof a !== 'object') return 'answer';
  switch (q.type) {
    case 'single':
      return isStrArr(q.options) && q.options.length >= 2 && isIndex(a.index, q.options.length)
        ? null
        : 'options/answer.index';
    case 'truefalse':
      return typeof a.value === 'boolean' ? null : 'answer.value';
    case 'numeric':
      return typeof a.value === 'number' &&
        isStr(a.unit) &&
        typeof a.tolerancePct === 'number' &&
        a.tolerancePct >= 0
        ? null
        : 'answer value/unit/tolerancePct';
    case 'predict':
      if (!isStrArr(q.options) || q.options.length < 2) return 'options';
      if (!isIndex(a.index, q.options.length)) return 'answer.index';
      if (!Array.isArray(q.stimuli) || !q.stimuli.every(isStimulus)) return 'stimuli';
      if (
        !Array.isArray(q.optionEvents) ||
        q.optionEvents.length !== q.options.length ||
        !q.optionEvents.every(isStrArr)
      )
        return 'optionEvents';
      if (typeof q.verifyBySimulation !== 'boolean') return 'verifyBySimulation';
      return null;
    default:
      return 'type';
  }
}

function load(): Quiz[] {
  const list: Quiz[] = [];
  for (const [file, raw] of Object.entries(files)) {
    const o = raw as { templateId?: unknown; questions?: unknown };
    if (!isStr(o.templateId) || !Array.isArray(o.questions)) {
      throw new Error(`${file}: invalid quiz`);
    }
    o.questions.forEach((q, i) => {
      const p = questionProblem(q);
      if (p) throw new Error(`${file}: question ${i}: ${p}`);
    });
    list.push({ templateId: o.templateId, questions: o.questions as Question[] });
  }
  return list;
}

export const QUIZZES: readonly Quiz[] = load();

export const getQuiz = (templateId: string) => QUIZZES.find((q) => q.templateId === templateId);

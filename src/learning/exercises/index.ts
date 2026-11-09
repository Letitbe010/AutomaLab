/** Exercises bundled at build time: src/learning/exercises/<folder>/. */
import { parseProject } from '../../core/serialization';
import type { Check, Exercise, ExerciseMeta } from './types';

const metas = import.meta.glob<unknown>('./*/exercise.json', { import: 'default', eager: true });
const statements = import.meta.glob<string>('./*/statement.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});
const solutions = import.meta.glob<string>('./*/solution.automalab.json', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const isStr = (v: unknown): v is string => typeof v === 'string';
const isStrArr = (v: unknown): v is string[] => Array.isArray(v) && v.every(isStr);

function checkProblem(raw: unknown): string | null {
  const c = raw as Partial<Check> & Record<string, unknown>;
  if (!c || !isStr(c.title)) return 'title';
  if (c.type === 'uses') return isStrArr(c.componentTypes) ? null : 'componentTypes';
  if (c.type === 'plcLanguage')
    return c.language === 'grafcet' || c.language === 'ladder' ? null : 'language';
  if (!Array.isArray(c.stimuli)) return 'stimuli';
  if (c.type === 'sequence') return isStrArr(c.expect) ? null : 'expect';
  if (c.type === 'never') return isStrArr(c.events) ? null : 'events';
  if (c.type === 'duration') return isStr(c.from) && isStr(c.to) ? null : 'from/to';
  return 'type';
}

/** Returns a reason when the metadata is invalid. */
export function exerciseProblem(raw: unknown): string | null {
  const e = raw as Record<string, unknown> | null;
  if (!e || typeof e !== 'object') return 'not an object';
  if (!isStr(e.id) || !isStr(e.title)) return 'id/title';
  if (![1, 2, 3].includes(e.level as number)) return 'level';
  if (!isStrArr(e.tags) || !isStrArr(e.theoryRefs) || !isStrArr(e.hints_md)) return 'lists';
  if (e.status !== 'draft' && e.status !== 'reviewed') return 'status';
  if (e.kind === 'design') {
    if (!isStrArr(e.allowedComponents)) return 'allowedComponents';
    if (!Array.isArray(e.checks) || e.checks.length === 0) return 'checks';
    for (const [i, c] of e.checks.entries()) {
      const p = checkProblem(c);
      if (p) return `checks[${i}].${p}`;
    }
    return null;
  }
  if (e.kind === 'calc') {
    if (!isStr(e.solution_md)) return 'solution_md';
    if (!Array.isArray(e.parts) || e.parts.length === 0) return 'parts';
    for (const [i, p] of (e.parts as Record<string, unknown>[]).entries()) {
      const a = p.answer as Record<string, unknown> | undefined;
      if (!isStr(p.id) || !isStr(p.prompt_md) || !a) return `parts[${i}]`;
      if (typeof a.value !== 'number' || !isStr(a.unit) || typeof a.tolerancePct !== 'number') {
        return `parts[${i}].answer`;
      }
    }
    return null;
  }
  return 'kind';
}

function load(): Exercise[] {
  const list: Exercise[] = [];
  for (const [file, meta] of Object.entries(metas)) {
    const dir = file.slice(0, file.lastIndexOf('/'));
    const folder = dir.slice(2);
    const problem = exerciseProblem(meta);
    if (problem) throw new Error(`${folder}/exercise.json: ${problem}`);
    const m = meta as ExerciseMeta;
    const text = solutions[`${dir}/solution.automalab.json`];
    let solution;
    if (text !== undefined) {
      const parsed = parseProject(text);
      if (!parsed.ok) throw new Error(`${folder}: solution ${JSON.stringify(parsed.error)}`);
      solution = parsed.project;
    }
    list.push({
      ...m,
      folder,
      statement: statements[`${dir}/statement.md`] ?? '',
      ...(solution ? { solution } : {}),
    });
  }
  return list.sort((a, b) => a.id.localeCompare(b.id));
}

export const EXERCISES: readonly Exercise[] = load();

export const getExercise = (id: string) => EXERCISES.find((e) => e.id === id);

export const exercisesForTheory = (sheetId: string) =>
  EXERCISES.filter((e) => e.theoryRefs.includes(sheetId));

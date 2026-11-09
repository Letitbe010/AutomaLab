/** Random quiz (SPEC §8.6.3): questions from several templates, mixed. */
import { TEMPLATES } from '../templates';
import { shuffled } from './grade';
import { QUIZZES } from './index';
import type { Question } from './types';

export interface PoolFilter {
  domain: string;
  level: number;
  tag: string;
}

export interface PoolQuestion {
  templateId: string;
  /** Copy of the question whose id is unique across templates. */
  question: Question;
}

/** Questions that match; "identify" is left out because it needs its circuit open. */
export function questionPool(filter: PoolFilter): PoolQuestion[] {
  const out: PoolQuestion[] = [];
  for (const tpl of TEMPLATES) {
    if (filter.domain && tpl.domain !== filter.domain) continue;
    if (filter.level && tpl.level !== filter.level) continue;
    if (filter.tag && !tpl.tags.includes(filter.tag)) continue;
    const quiz = QUIZZES.find((q) => q.templateId === tpl.id);
    for (const q of quiz?.questions ?? []) {
      if (q.type === 'identify') continue;
      out.push({ templateId: tpl.id, question: { ...q, id: `${tpl.id}/${q.id}` } });
    }
  }
  return out;
}

export function randomQuestions(
  filter: PoolFilter,
  count: number,
  random = Math.random,
): PoolQuestion[] {
  return shuffled(questionPool(filter), random).slice(0, count);
}

export const poolDomains = () => [...new Set(TEMPLATES.map((t) => t.domain))];
export const poolTags = () => [...new Set(TEMPLATES.flatMap((t) => t.tags))].sort();

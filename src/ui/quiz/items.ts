import { shuffled } from '../../learning/quiz/grade';
import type { Question } from '../../learning/quiz/types';

export interface Item {
  q: Question;
  templateId: string;
  /** Display order of the options (indices into q.options). */
  order: number[];
}

export const hasOptions = (q: Question) =>
  q.type === 'single' || q.type === 'multiple' || q.type === 'predict';

export function buildItems(
  list: { question: Question; templateId: string }[],
  mix: boolean,
): Item[] {
  const qs = mix ? shuffled(list) : list;
  return qs.map(({ question: q, templateId }) => {
    const n = hasOptions(q) ? (q as { options: string[] }).options.length : 0;
    const idx = [...Array(n).keys()];
    return { q, templateId, order: mix ? shuffled(idx) : idx };
  });
}

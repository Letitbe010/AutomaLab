/** Quiz grading: pure functions (SPEC §8.6.3). */
import type { Question, Response } from './types';

/** Parses a number typed by the user: decimal comma or point, spaces ignored. */
export function parseNumber(text: string): number | null {
  const s = text.trim().replace(/\s/g, '').replace(',', '.');
  if (!/^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(s)) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export function isCorrect(q: Question, response: Response): boolean {
  switch (q.type) {
    case 'single':
    case 'predict':
      return response === q.answer.index;
    case 'truefalse':
      return response === q.answer.value;
    case 'numeric': {
      if (typeof response !== 'number' || !Number.isFinite(response)) return false;
      const tol = (Math.abs(q.answer.value) * q.answer.tolerancePct) / 100;
      return Math.abs(response - q.answer.value) <= tol + 1e-9;
    }
  }
}

export interface QuizResult {
  /** Correct answers / questions (0..1). */
  score: number;
  correct: number;
  total: number;
  /** Question ids answered wrongly. */
  wrong: string[];
  /** Per question type: [correct, total]. */
  byType: Record<string, [number, number]>;
}

export function gradeQuiz(questions: Question[], responses: Record<string, Response>): QuizResult {
  const byType: Record<string, [number, number]> = {};
  const wrong: string[] = [];
  let correct = 0;
  for (const q of questions) {
    const r = responses[q.id];
    const ok = r !== undefined && isCorrect(q, r);
    const t = (byType[q.type] ??= [0, 0]);
    t[1] += 1;
    if (ok) {
      correct += 1;
      t[0] += 1;
    } else wrong.push(q.id);
  }
  const total = questions.length;
  return { score: total ? correct / total : 0, correct, total, wrong, byType };
}

/** Fisher–Yates shuffle with an injectable random source (tests). */
export function shuffled<T>(items: readonly T[], random = Math.random): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

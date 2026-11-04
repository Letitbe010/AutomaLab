/** Learning progress in IndexedDB (SPEC §8.7), with a small store for the UI. */
import { create } from 'zustand';
import {
  emptyProgress,
  markTheoryRead,
  mergeProgress,
  progressFromObject,
  recordExerciseAttempt,
  recordQuizResult,
  recordTemplateOpened,
  type Progress,
} from '../learning/progress';
import type { QuizResult } from '../learning/quiz/grade';
import * as db from './db';

export const useProgress = create<{ progress: Progress; loaded: boolean }>()(() => ({
  progress: emptyProgress(),
  loaded: false,
}));

let queue: Promise<void> = Promise.resolve();

export async function loadProgress(): Promise<void> {
  const progress = progressFromObject(await db.getProgress());
  useProgress.setState({ progress, loaded: true });
}

/** Applies an update and saves it; saves run one after another. */
function update(fn: (p: Progress) => Progress): Promise<void> {
  const { progress } = useProgress.getState();
  const next = fn(progress);
  if (next === progress) return queue;
  useProgress.setState({ progress: next });
  queue = queue.then(() => db.saveProgress(next)).catch(() => undefined);
  return queue;
}

export const noteTemplateOpened = (id: string) => update((p) => recordTemplateOpened(p, id));
export const noteQuizResult = (id: string, r: QuizResult) =>
  update((p) => recordQuizResult(p, id, r));
export const noteExerciseAttempt = (id: string, passed: boolean) =>
  update((p) => recordExerciseAttempt(p, id, passed));
export const noteTheoryRead = (id: string) => update((p) => markTheoryRead(p, id));

/** "Import all": keeps everything already recorded and adds the backup's results. */
export const mergeImportedProgress = (raw: unknown) =>
  update((p) => mergeProgress(p, progressFromObject(raw)));

/** For tests: forget the loaded progress. */
export function resetProgressStore(): void {
  useProgress.setState({ progress: emptyProgress(), loaded: false });
}

/** For tests. */
export async function flushProgress(): Promise<void> {
  await queue;
}

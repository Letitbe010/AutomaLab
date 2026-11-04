import { create } from 'zustand';
import { THEORY_SHEETS } from '../../learning/theory/sheets';

interface LearningState {
  /** Sheet shown in the Theory section. */
  theoryId: string;
  /** Sheet shown in the editor's side panel (null = closed). */
  drawerTheoryId: string | null;
  showTheory(id: string): void;
  openDrawer(id: string): void;
  closeDrawer(): void;
}

export const useLearning = create<LearningState>()((set) => ({
  theoryId: THEORY_SHEETS[0]?.id ?? '',
  drawerTheoryId: null,
  showTheory: (id) => set({ theoryId: id }),
  openDrawer: (id) => set({ drawerTheoryId: id }),
  closeDrawer: () => set({ drawerTheoryId: null }),
}));

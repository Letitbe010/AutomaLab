import { create } from 'zustand';
import { THEORY_SHEETS } from '../../learning/theory/sheets';

interface LearningState {
  /** Sheet shown in the Theory section. */
  theoryId: string;
  /** Sheet shown in the editor's side panel (null = closed). */
  drawerTheoryId: string | null;
  /** Template description panel beside the editor. */
  templatePanelOpen: boolean;
  templateTab: 'description' | 'quiz';
  /** Component briefly highlighted on the canvas (clicked in a description). */
  highlightId: string | null;
  showTheory(id: string): void;
  openDrawer(id: string): void;
  closeDrawer(): void;
  setTemplatePanel(open: boolean): void;
  setTemplateTab(tab: 'description' | 'quiz'): void;
  highlight(id: string | null): void;
}

export const HIGHLIGHT_MS = 2500;
let highlightTimer: ReturnType<typeof setTimeout> | null = null;

export const useLearning = create<LearningState>()((set) => ({
  theoryId: THEORY_SHEETS[0]?.id ?? '',
  drawerTheoryId: null,
  templatePanelOpen: false,
  templateTab: 'description',
  highlightId: null,
  showTheory: (id) => set({ theoryId: id }),
  openDrawer: (id) => set({ drawerTheoryId: id }),
  closeDrawer: () => set({ drawerTheoryId: null }),
  setTemplatePanel: (open) => set({ templatePanelOpen: open }),
  setTemplateTab: (tab) => set({ templateTab: tab }),
  highlight(id) {
    if (highlightTimer) clearTimeout(highlightTimer);
    set({ highlightId: id });
    if (id) highlightTimer = setTimeout(() => set({ highlightId: null }), HIGHLIGHT_MS);
  },
}));

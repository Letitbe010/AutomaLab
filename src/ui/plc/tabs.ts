import { create } from 'zustand';

/** Editor views (SPEC §7.1): schematic, Ladder program and I/O table. */
export type EditorTab = 'schematic' | 'ladder' | 'io';

export const useEditorTab = create<{ tab: EditorTab; setTab(tab: EditorTab): void }>()((set) => ({
  tab: 'schematic',
  setTab: (tab) => set({ tab }),
}));

import { create } from 'zustand';
import type { SectionId } from './sections';

/** Active main-menu section, shared so that other sections can jump to the editor. */
export const useNav = create<{ section: SectionId; go(section: SectionId): void }>()((set) => ({
  section: 'editor',
  go: (section) => set({ section }),
}));

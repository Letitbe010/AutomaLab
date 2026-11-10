import { create } from 'zustand';
import type { Point } from '../../core/types';

/**
 * Pointer position over the canvas, in world pixels snapped to the grid.
 * Kept out of the editor store so that moving the mouse re-renders only the
 * status bar.
 */
export const useCursor = create<{ at: Point | null; set(at: Point | null): void }>()(
  (set, get) => ({
    at: null,
    set: (at) => {
      const prev = get().at;
      if (prev === at || (prev && at && prev[0] === at[0] && prev[1] === at[1])) return;
      set({ at });
    },
  }),
);

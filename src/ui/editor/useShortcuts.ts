import { useEffect } from 'react';
import {
  copySelection,
  deleteSelection,
  mirrorSelection,
  paste,
  rotateSelection,
  selectAll,
} from './actions';
import { useEditor } from './store';

/** Editor keyboard shortcuts (SPEC §7.2). Ignored while typing in a form field. */
export function useShortcuts() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) return;
      if (document.querySelector('dialog[open]')) return;
      const st = useEditor.getState();
      const ctrl = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      if (key === 'escape') {
        if (st.wireDraft) st.setWireDraft(null);
        else st.select({});
        st.setNotice(null);
        return;
      }
      if (st.mode !== 'edit') return;

      if (ctrl && key === 'z' && !e.shiftKey) st.undo();
      else if (ctrl && (key === 'y' || (key === 'z' && e.shiftKey))) st.redo();
      else if (ctrl && key === 'c') copySelection();
      else if (ctrl && key === 'v') paste();
      else if (ctrl && key === 'a') selectAll();
      else if (!ctrl && key === 'r') rotateSelection();
      else if (!ctrl && key === 'm') mirrorSelection();
      else if (key === 'delete' || key === 'backspace') deleteSelection();
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}

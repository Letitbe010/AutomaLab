import { produce } from 'immer';
import { create } from 'zustand';
import { createEmptyProject } from '../../core/project';
import type { Point, PortRef, Project } from '../../core/types';
import type { Clipboard } from './model/ops';

export const HISTORY_LIMIT = 100;

export type EditorMode = 'edit' | 'sim';

export interface View {
  x: number;
  y: number;
  zoom: number;
}

export interface Selection {
  components: string[];
  connections: string[];
}

export interface WireDraft {
  from: PortRef;
  points: Point[];
  cursor: Point;
}

export interface EditorState {
  project: Project;
  past: Project[];
  future: Project[];
  selection: Selection;
  mode: EditorMode;
  view: View;
  viewport: { width: number; height: number };
  clipboard: Clipboard | null;
  pasteCount: number;
  wireDraft: WireDraft | null;
  /** i18n key of a short status message (e.g. why a connection was refused). */
  notice: string | null;

  /** Runs fn on a draft of the project. Records an undo step unless record is false. */
  apply<T>(fn: (draft: Project) => T, record?: boolean): T;
  /** Saves an undo step before a continuous edit (drag); see endGesture. */
  beginGesture(): void;
  /** Drops the step saved by beginGesture if nothing changed. */
  endGesture(): void;
  undo(): void;
  redo(): void;
  loadProject(project: Project): void;
  select(selection: Partial<Selection>): void;
  setMode(mode: EditorMode): void;
  setView(view: View): void;
  setViewport(width: number, height: number): void;
  setClipboard(clip: Clipboard): void;
  setWireDraft(draft: WireDraft | null): void;
  setNotice(key: string | null): void;
}

const EMPTY_SELECTION: Selection = { components: [], connections: [] };

function pruneSelection(sel: Selection, project: Project): Selection {
  const comps = new Set(project.components.map((c) => c.id));
  const wires = new Set(project.connections.map((w) => w.id));
  return {
    components: sel.components.filter((id) => comps.has(id)),
    connections: sel.connections.filter((id) => wires.has(id)),
  };
}

let gestureStart: Project | null = null;

export const useEditor = create<EditorState>()((set, get) => ({
  project: createEmptyProject('Proiektu berria'),
  past: [],
  future: [],
  selection: EMPTY_SELECTION,
  mode: 'edit',
  view: { x: 80, y: 80, zoom: 1.5 },
  viewport: { width: 800, height: 600 },
  clipboard: null,
  pasteCount: 0,
  wireDraft: null,
  notice: null,

  apply(fn, record = true) {
    let result!: ReturnType<typeof fn>;
    const { project, past } = get();
    const next = produce(project, (draft) => {
      result = fn(draft);
    });
    if (next === project) return result;
    set(
      record
        ? { project: next, past: [...past, project].slice(-HISTORY_LIMIT), future: [] }
        : { project: next },
    );
    return result;
  },

  beginGesture() {
    const { project, past } = get();
    gestureStart = project;
    set({ past: [...past, project].slice(-HISTORY_LIMIT), future: [] });
  },

  endGesture() {
    const { project, past } = get();
    if (gestureStart === project && past[past.length - 1] === project) {
      set({ past: past.slice(0, -1) });
    }
    gestureStart = null;
  },

  undo() {
    const { past, future, project, selection } = get();
    const prev = past[past.length - 1];
    if (!prev) return;
    set({
      project: prev,
      past: past.slice(0, -1),
      future: [project, ...future],
      selection: pruneSelection(selection, prev),
      wireDraft: null,
    });
  },

  redo() {
    const { past, future, project, selection } = get();
    const next = future[0];
    if (!next) return;
    set({
      project: next,
      past: [...past, project].slice(-HISTORY_LIMIT),
      future: future.slice(1),
      selection: pruneSelection(selection, next),
      wireDraft: null,
    });
  },

  loadProject(project) {
    set({ project, past: [], future: [], selection: EMPTY_SELECTION, wireDraft: null });
  },

  select(selection) {
    set({ selection: { ...EMPTY_SELECTION, ...selection } });
  },

  setMode(mode) {
    set({ mode, wireDraft: null, selection: mode === 'sim' ? EMPTY_SELECTION : get().selection });
  },

  setView(view) {
    set({ view });
  },

  setViewport(width, height) {
    set({ viewport: { width, height } });
  },

  setClipboard(clip) {
    set({ clipboard: clip, pasteCount: 0 });
  },

  setWireDraft(draft) {
    set({ wireDraft: draft });
  },

  setNotice(key) {
    set({ notice: key });
  },
}));

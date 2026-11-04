/**
 * Connects the editor store with IndexedDB: startup, 5 s autosave, project
 * management, single-project JSON and full backups (SPEC §10).
 */
import { create } from 'zustand';
import { createEmptyProject } from '../core/project';
import {
  FILE_EXTENSION,
  parseProject,
  serializeProject,
  type ParseError,
} from '../core/serialization';
import type { Project } from '../core/types';
import { t } from '../i18n';
import { getTemplate, templateCopy } from '../learning/templates';
import { exitSim } from '../ui/editor/actions';
import { useEditor } from '../ui/editor/store';
import {
  backupFileName,
  backupReminderDays,
  buildBackup,
  parseBackup,
  previewImport,
  type BackupFile,
  type BackupParseError,
  type ImportPreview,
} from './backup';
import * as db from './db';
import { downloadText, safeFileName } from './download';
import { DEFAULT_META, type StorageMeta } from './types';

export const AUTOSAVE_MS = 5000;

export type SaveStatus = 'loading' | 'saved' | 'dirty' | 'saving' | 'error';

export interface ProjectSummary {
  id: string;
  name: string;
  updatedAt: string;
}

interface StorageState {
  ready: boolean;
  projectId: string | null;
  status: SaveStatus;
  projects: ProjectSummary[];
  meta: StorageMeta;
  persisted: boolean;
  reminderDays: number | null;
}

export const useStorage = create<StorageState>()(() => ({
  ready: false,
  projectId: null,
  status: 'loading',
  projects: [],
  meta: DEFAULT_META,
  persisted: false,
  reminderDays: null,
}));

let savedProject: Project | null = null;
let timer: ReturnType<typeof setInterval> | null = null;
let unsubscribe: (() => void) | null = null;
let saving: Promise<void> | null = null;

async function refresh(): Promise<void> {
  const [records, meta] = await Promise.all([db.listProjects(), db.getMeta()]);
  useStorage.setState({
    projects: records.map((r) => ({ id: r.id, name: r.project.name, updatedAt: r.updatedAt })),
    meta,
    reminderDays: backupReminderDays(meta),
  });
}

function show(id: string, project: Project) {
  savedProject = project;
  useEditor.getState().loadProject(project);
  useStorage.setState({ projectId: id, status: 'saved' });
  void db.updateMeta({ lastOpenedId: id });
}

/** Saves the current project if it changed since the last save. */
export async function flush(): Promise<void> {
  if (saving) await saving;
  const { projectId } = useStorage.getState();
  const { project } = useEditor.getState();
  if (!projectId) return;
  if (project === savedProject) {
    if (useStorage.getState().status === 'dirty') useStorage.setState({ status: 'saved' });
    return;
  }
  useStorage.setState({ status: 'saving' });
  saving = (async () => {
    try {
      await db.saveProject(projectId, project);
      savedProject = project;
      useStorage.setState({
        status: useEditor.getState().project === project ? 'saved' : 'dirty',
      });
      await refresh();
    } catch {
      useStorage.setState({ status: 'error' });
    }
  })();
  await saving;
  saving = null;
}

/** Loads the last opened (or most recent) project and starts autosave. Idempotent. */
export async function bootstrap(): Promise<void> {
  if (useStorage.getState().ready) return;
  useStorage.setState({ ready: true });
  try {
    await start();
  } catch {
    useStorage.setState({ status: 'error' });
  }
}

async function start(): Promise<void> {
  const persisted = await db.requestPersistentStorage();
  useStorage.setState({ persisted });
  const meta = await db.getMeta();
  const records = await db.listProjects();
  const record =
    (meta.lastOpenedId && records.find((r) => r.id === meta.lastOpenedId)) || records[0];
  if (record) {
    show(record.id, record.project);
  } else {
    const id = db.newProjectId();
    const project = createEmptyProject(t('storage.defaultName'));
    await db.saveProject(id, project);
    show(id, project);
  }
  await refresh();

  unsubscribe = useEditor.subscribe((s, prev) => {
    if (s.project === prev.project) return;
    // Undo can return to exactly the saved snapshot: nothing left to save then.
    useStorage.setState({ status: s.project === savedProject ? 'saved' : 'dirty' });
  });
  timer = setInterval(() => void flush(), AUTOSAVE_MS);
  window.addEventListener('pagehide', () => void flush());
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') void flush();
  });
}

/** For tests: stops autosave and resets module state. */
export function shutdown(): void {
  if (timer) clearInterval(timer);
  unsubscribe?.();
  timer = null;
  unsubscribe = null;
  savedProject = null;
  useStorage.setState({ ready: false, projectId: null, status: 'loading' });
}

export async function openProject(id: string): Promise<void> {
  await flush();
  const record = await db.getProject(id);
  if (record) show(record.id, record.project);
}

export async function newProject(): Promise<void> {
  await flush();
  const id = db.newProjectId();
  const project = createEmptyProject(t('storage.defaultName'));
  await db.saveProject(id, project);
  show(id, project);
  await refresh();
}

export async function removeProject(id: string): Promise<void> {
  await db.deleteProject(id);
  if (useStorage.getState().projectId === id) {
    const rest = await db.listProjects();
    if (rest[0]) show(rest[0].id, rest[0].project);
    else {
      useStorage.setState({ projectId: null });
      await newProject();
    }
  }
  await refresh();
}

export async function exportCurrentProject(): Promise<void> {
  await flush();
  const { project } = useEditor.getState();
  downloadText(safeFileName(project.name) + FILE_EXTENSION, serializeProject(project));
}

/** Opens a circuit template as a new project: a copy, the template never changes. */
export async function openTemplate(id: string): Promise<boolean> {
  const tpl = getTemplate(id);
  if (!tpl) return false;
  await flush();
  const projectId = db.newProjectId();
  const project = templateCopy(tpl);
  await db.saveProject(projectId, project);
  show(projectId, project);
  await refresh();
  return true;
}

/** Puts the template circuit back into the current project (one undo step). */
export function resetToTemplate(): boolean {
  const editor = useEditor.getState();
  const tpl = editor.project.templateId ? getTemplate(editor.project.templateId) : undefined;
  if (!tpl) return false;
  if (editor.mode === 'sim') exitSim();
  const copy = templateCopy(tpl);
  useEditor.getState().apply((d) => {
    d.components = copy.components;
    d.connections = copy.connections;
    d.tags = copy.tags;
    d.simulation = copy.simulation;
  });
  return true;
}

/** Imports a single project file as a new project (never overwrites). */
export async function importProjectFile(
  text: string,
): Promise<{ ok: true } | { ok: false; error: ParseError }> {
  const parsed = parseProject(text);
  if (!parsed.ok) return parsed;
  await flush();
  const id = db.newProjectId();
  await db.saveProject(id, parsed.project);
  show(id, parsed.project);
  await refresh();
  return { ok: true };
}

export async function exportAll(): Promise<void> {
  await flush();
  const now = new Date();
  const backup = buildBackup(await db.listProjects(), now);
  downloadText(backupFileName(now), JSON.stringify(backup, null, 2));
  await db.updateMeta({ lastBackupAt: now.toISOString() });
  await refresh();
}

export async function prepareImportAll(
  text: string,
): Promise<
  { ok: true; backup: BackupFile; preview: ImportPreview } | { ok: false; error: BackupParseError }
> {
  const parsed = parseBackup(text);
  if (!parsed.ok) return parsed;
  await flush();
  return {
    ok: true,
    backup: parsed.backup,
    preview: previewImport(await db.listProjects(), parsed.backup),
  };
}

export async function applyImportAll(backup: BackupFile): Promise<void> {
  await db.putProjects(backup.projects);
  // The imported data already exists in a backup file: no reminder for it.
  await db.updateMeta({ lastBackupAt: new Date().toISOString() });
  const { projectId } = useStorage.getState();
  const current = backup.projects.find((r) => r.id === projectId) ?? backup.projects[0];
  if (current) show(current.id, current.project);
  await refresh();
}

export async function setBackupWarnDays(days: number): Promise<void> {
  await db.updateMeta({ backupWarnDays: days });
  await refresh();
}

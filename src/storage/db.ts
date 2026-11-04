/**
 * IndexedDB persistence (SPEC §10) through idb-keyval.
 * Keys: "project:<id>" -> ProjectRecord, "meta" -> StorageMeta.
 */
import { createStore, del, entries, get, set, setMany } from 'idb-keyval';
import type { Project } from '../core/types';
import { DEFAULT_META, type ProjectRecord, type StorageMeta } from './types';

const PROJECT_PREFIX = 'project:';
const META_KEY = 'meta';

let store: ReturnType<typeof createStore> | null = null;
const db = () => (store ??= createStore('automalab', 'kv'));

/** For tests: forget the open database so a new indexedDB factory is used. */
export function resetDbConnection(): void {
  store = null;
}

export function newProjectId(): string {
  return `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function listProjects(): Promise<ProjectRecord[]> {
  const all = await entries<string, unknown>(db());
  return all
    .filter(([k]) => typeof k === 'string' && k.startsWith(PROJECT_PREFIX))
    .map(([, v]) => v as ProjectRecord)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getProject(id: string): Promise<ProjectRecord | undefined> {
  return get<ProjectRecord>(PROJECT_PREFIX + id, db());
}

export async function saveProject(
  id: string,
  project: Project,
  now = new Date(),
): Promise<ProjectRecord> {
  const existing = await getProject(id);
  const record: ProjectRecord = {
    id,
    createdAt: existing?.createdAt ?? now.toISOString(),
    updatedAt: now.toISOString(),
    project,
  };
  await set(PROJECT_PREFIX + id, record, db());
  await touch(now);
  return record;
}

/** Writes records as they are (used by "Import all"). */
export async function putProjects(records: ProjectRecord[], now = new Date()): Promise<void> {
  await setMany(
    records.map((r) => [PROJECT_PREFIX + r.id, r]),
    db(),
  );
  await touch(now);
}

export async function deleteProject(id: string, now = new Date()): Promise<void> {
  await del(PROJECT_PREFIX + id, db());
  await touch(now);
}

export async function getMeta(): Promise<StorageMeta> {
  return { ...DEFAULT_META, ...((await get<StorageMeta>(META_KEY, db())) ?? {}) };
}

export async function updateMeta(patch: Partial<StorageMeta>): Promise<StorageMeta> {
  const next = { ...(await getMeta()), ...patch };
  await set(META_KEY, next, db());
  return next;
}

async function touch(now: Date): Promise<void> {
  const meta = await getMeta();
  const iso = now.toISOString();
  await updateMeta({ lastChangeAt: iso, firstChangeAt: meta.firstChangeAt ?? iso });
}

/** Asks the browser not to evict our data (SPEC §10). Returns whether storage is persistent. */
export async function requestPersistentStorage(): Promise<boolean> {
  try {
    if (!navigator.storage?.persist) return false;
    if (await navigator.storage.persisted()) return true;
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}

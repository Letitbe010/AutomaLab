/** Full backup file ("Export all" / "Import all", SPEC §10). Pure functions. */
import { projectFromObject } from '../core/serialization';
import type { ProjectRecord, StorageMeta } from './types';

export const BACKUP_FORMAT = 'automalab-backup';
export const BACKUP_VERSION = 1;

export interface BackupFile {
  format: typeof BACKUP_FORMAT;
  version: typeof BACKUP_VERSION;
  exportedAt: string;
  projects: ProjectRecord[];
  /** Filled in later phases (SPEC §8.5–8.7); kept so the format does not change. */
  personalTemplates: unknown[];
  customQuestions: unknown[];
  progress: Record<string, unknown>;
}

export type BackupParseError =
  | { code: 'invalidJson' }
  | { code: 'notABackup' }
  | { code: 'newerVersion'; version: number }
  | { code: 'invalidProject'; index: number; path?: string };

export function buildBackup(projects: ProjectRecord[], now = new Date()): BackupFile {
  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: now.toISOString(),
    projects,
    personalTemplates: [],
    customQuestions: [],
    progress: {},
  };
}

const pad = (n: number) => String(n).padStart(2, '0');

/** automalab-babeskopia-AAAA-HH-EE.json (local date). */
export function backupFileName(now = new Date()): string {
  return `automalab-babeskopia-${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}.json`;
}

export function parseBackup(
  text: string,
): { ok: true; backup: BackupFile } | { ok: false; error: BackupParseError } {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: { code: 'invalidJson' } };
  }
  if (typeof raw !== 'object' || raw === null) return { ok: false, error: { code: 'notABackup' } };
  const o = raw as Record<string, unknown>;
  if (o.format !== BACKUP_FORMAT || typeof o.version !== 'number' || !Array.isArray(o.projects)) {
    return { ok: false, error: { code: 'notABackup' } };
  }
  if (o.version > BACKUP_VERSION) {
    return { ok: false, error: { code: 'newerVersion', version: o.version } };
  }
  const projects: ProjectRecord[] = [];
  for (const [index, item] of o.projects.entries()) {
    const r = item as Partial<ProjectRecord> | null;
    if (!r || typeof r.id !== 'string' || typeof r.updatedAt !== 'string') {
      return { ok: false, error: { code: 'invalidProject', index } };
    }
    const parsed = projectFromObject(r.project);
    if (!parsed.ok) {
      const path = parsed.error.code === 'invalidField' ? parsed.error.path : undefined;
      return { ok: false, error: { code: 'invalidProject', index, ...(path ? { path } : {}) } };
    }
    projects.push({
      id: r.id,
      createdAt: typeof r.createdAt === 'string' ? r.createdAt : r.updatedAt,
      updatedAt: r.updatedAt,
      project: parsed.project,
    });
  }
  return {
    ok: true,
    backup: {
      format: BACKUP_FORMAT,
      version: BACKUP_VERSION,
      exportedAt: typeof o.exportedAt === 'string' ? o.exportedAt : '',
      projects,
      personalTemplates: Array.isArray(o.personalTemplates) ? o.personalTemplates : [],
      customQuestions: Array.isArray(o.customQuestions) ? o.customQuestions : [],
      progress:
        typeof o.progress === 'object' && o.progress !== null
          ? (o.progress as Record<string, unknown>)
          : {},
    },
  };
}

export interface ImportPreview {
  /** Projects that already exist (same id) and will be overwritten. */
  overwrite: { id: string; name: string; localUpdatedAt: string; backupUpdatedAt: string }[];
  added: { id: string; name: string }[];
}

export function previewImport(existing: ProjectRecord[], backup: BackupFile): ImportPreview {
  const byId = new Map(existing.map((r) => [r.id, r]));
  const preview: ImportPreview = { overwrite: [], added: [] };
  for (const r of backup.projects) {
    const local = byId.get(r.id);
    if (local) {
      preview.overwrite.push({
        id: r.id,
        name: r.project.name,
        localUpdatedAt: local.updatedAt,
        backupUpdatedAt: r.updatedAt,
      });
    } else {
      preview.added.push({ id: r.id, name: r.project.name });
    }
  }
  return preview;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Days since the last backup when the reminder should show, otherwise null.
 * Shows only if something changed after the last backup (SPEC §10). With no
 * backup ever, the clock starts at the first recorded change.
 */
export function backupReminderDays(meta: StorageMeta, now = new Date()): number | null {
  if (!meta.lastChangeAt) return null;
  if (meta.lastBackupAt && meta.lastChangeAt <= meta.lastBackupAt) return null;
  const since = meta.lastBackupAt ?? meta.firstChangeAt ?? meta.lastChangeAt;
  const days = Math.floor((now.getTime() - new Date(since).getTime()) / DAY_MS);
  return days >= meta.backupWarnDays ? days : null;
}

import type { Project } from '../core/types';

/** A project as stored in IndexedDB. Dates are ISO strings. */
export interface ProjectRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  project: Project;
}

export interface StorageMeta {
  lastOpenedId?: string;
  /** Last time "Export all" was used. */
  lastBackupAt?: string;
  /** Last time any stored data changed. */
  lastChangeAt?: string;
  /** First recorded change; starts the reminder clock when no backup exists yet. */
  firstChangeAt?: string;
  /** Days without a backup before the reminder appears (SPEC §10). */
  backupWarnDays: number;
}

export const DEFAULT_META: StorageMeta = { backupWarnDays: 7 };

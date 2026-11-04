import { createEmptyProject } from '../../src/core/project';
import {
  backupFileName,
  backupReminderDays,
  buildBackup,
  parseBackup,
  previewImport,
} from '../../src/storage/backup';
import type { ProjectRecord } from '../../src/storage/types';

const rec = (id: string, name: string, updatedAt = '2026-11-01T10:00:00.000Z'): ProjectRecord => ({
  id,
  createdAt: updatedAt,
  updatedAt,
  project: createEmptyProject(name),
});

describe('backup file', () => {
  it('names the file automalab-babeskopia-AAAA-HH-EE.json', () => {
    expect(backupFileName(new Date(2026, 10, 4, 15, 0))).toBe(
      'automalab-babeskopia-2026-11-04.json',
    );
  });

  it('round-trips through JSON', () => {
    const backup = buildBackup([rec('a', 'A'), rec('b', 'B')], new Date('2026-11-04T12:00:00Z'));
    const parsed = parseBackup(JSON.stringify(backup));
    expect(parsed).toEqual({ ok: true, backup });
  });

  it('rejects other JSON files and newer versions', () => {
    expect(parseBackup('{}')).toEqual({ ok: false, error: { code: 'notABackup' } });
    expect(parseBackup('nope')).toEqual({ ok: false, error: { code: 'invalidJson' } });
    const newer = { ...buildBackup([]), version: 9 };
    expect(parseBackup(JSON.stringify(newer))).toEqual({
      ok: false,
      error: { code: 'newerVersion', version: 9 },
    });
  });

  it('rejects a backup containing an invalid project', () => {
    const backup = buildBackup([rec('a', 'A')]) as unknown as { projects: { project: unknown }[] };
    backup.projects[0]!.project = { schemaVersion: 1, name: 5 };
    expect(parseBackup(JSON.stringify(backup))).toMatchObject({
      ok: false,
      error: { code: 'invalidProject', index: 0 },
    });
  });

  it('previews what will be overwritten and what is new', () => {
    const backup = buildBackup([rec('a', 'A2', '2026-11-03T00:00:00Z'), rec('c', 'C')]);
    expect(previewImport([rec('a', 'A'), rec('b', 'B')], backup)).toEqual({
      overwrite: [
        {
          id: 'a',
          name: 'A2',
          localUpdatedAt: '2026-11-01T10:00:00.000Z',
          backupUpdatedAt: '2026-11-03T00:00:00Z',
        },
      ],
      added: [{ id: 'c', name: 'C' }],
    });
  });
});

describe('backup reminder', () => {
  const now = new Date('2026-11-20T12:00:00Z');

  it('does not show without changes', () => {
    expect(backupReminderDays({ backupWarnDays: 7 }, now)).toBeNull();
  });

  it('does not show when the last backup is newer than the last change', () => {
    const meta = {
      backupWarnDays: 7,
      lastBackupAt: '2026-11-01T00:00:00Z',
      lastChangeAt: '2026-10-30T00:00:00Z',
    };
    expect(backupReminderDays(meta, now)).toBeNull();
  });

  it('shows after N days with changes since the last backup', () => {
    const meta = {
      backupWarnDays: 7,
      lastBackupAt: '2026-11-11T12:00:00Z',
      lastChangeAt: '2026-11-19T00:00:00Z',
    };
    expect(backupReminderDays(meta, now)).toBe(9);
    expect(backupReminderDays({ ...meta, backupWarnDays: 10 }, now)).toBeNull();
  });

  it('counts from the first change when no backup was ever made', () => {
    const meta = {
      backupWarnDays: 7,
      firstChangeAt: '2026-11-01T12:00:00Z',
      lastChangeAt: '2026-11-19T00:00:00Z',
    };
    expect(backupReminderDays(meta, now)).toBe(19);
  });
});

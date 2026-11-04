import { useEffect, useRef, useState } from 'react';
import { t } from '../../i18n';
import type { BackupFile, ImportPreview } from '../../storage/backup';
import {
  applyImportAll,
  exportAll,
  exportCurrentProject,
  importProjectFile,
  newProject,
  openProject,
  prepareImportAll,
  removeProject,
  setBackupWarnDays,
  useStorage,
} from '../../storage/persistence';
import styles from './Storage.module.css';

import { formatDate } from './format';

async function readFile(input: HTMLInputElement): Promise<string | null> {
  const file = input.files?.[0];
  input.value = '';
  return file ? file.text() : null;
}

export function ProjectsDialog({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const projectFileRef = useRef<HTMLInputElement>(null);
  const backupFileRef = useRef<HTMLInputElement>(null);
  const projects = useStorage((s) => s.projects);
  const currentId = useStorage((s) => s.projectId);
  const meta = useStorage((s) => s.meta);
  const persisted = useStorage((s) => s.persisted);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<{ backup: BackupFile; preview: ImportPreview } | null>(
    null,
  );

  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
  }, []);

  async function onImportProject() {
    const text = projectFileRef.current && (await readFile(projectFileRef.current));
    if (!text) return;
    const r = await importProjectFile(text);
    if (r.ok) onClose();
    else
      setError(
        t(
          `storage.error.${r.error.code}`,
          r.error.code === 'invalidField' ? { path: r.error.path } : {},
        ),
      );
  }

  async function onImportBackup() {
    const text = backupFileRef.current && (await readFile(backupFileRef.current));
    if (!text) return;
    const r = await prepareImportAll(text);
    if (r.ok) {
      setPending(r);
      setError(null);
    } else {
      setError(
        t(`storage.error.${r.error.code}`, 'index' in r.error ? { n: r.error.index + 1 } : {}),
      );
    }
  }

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      onClose={onClose}
      aria-labelledby="projects-title"
      data-testid="projects-dialog"
    >
      <div className={styles.head}>
        <h2 id="projects-title">{t('storage.projects')}</h2>
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label={t('storage.close')}
        >
          ×
        </button>
      </div>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      {pending ? (
        <section className={styles.section}>
          <h3>{t('storage.importAll.previewTitle')}</h3>
          <p className={styles.note}>
            {t('storage.importAll.summary', {
              added: pending.preview.added.length,
              overwrite: pending.preview.overwrite.length,
            })}
          </p>
          {pending.preview.overwrite.length > 0 && (
            <>
              <div className={styles.label}>{t('storage.importAll.overwrite')}</div>
              <ul className={styles.plainList}>
                {pending.preview.overwrite.map((p) => (
                  <li key={p.id}>
                    <b>{p.name}</b> —{' '}
                    {t('storage.importAll.dates', {
                      local: formatDate(p.localUpdatedAt),
                      backup: formatDate(p.backupUpdatedAt),
                    })}
                  </li>
                ))}
              </ul>
            </>
          )}
          {pending.preview.added.length > 0 && (
            <>
              <div className={styles.label}>{t('storage.importAll.added')}</div>
              <ul className={styles.plainList}>
                {pending.preview.added.map((p) => (
                  <li key={p.id}>{p.name}</li>
                ))}
              </ul>
            </>
          )}
          <div className={styles.actions}>
            <button type="button" className={styles.btn} onClick={() => setPending(null)}>
              {t('storage.cancel')}
            </button>
            <button
              type="button"
              className={`${styles.btn} ${styles.primary}`}
              onClick={async () => {
                await applyImportAll(pending.backup);
                setPending(null);
                onClose();
              }}
            >
              {t('storage.importAll.confirm')}
            </button>
          </div>
        </section>
      ) : (
        <>
          <section className={styles.section}>
            <div className={styles.rowHead}>
              <div className={styles.label}>{t('storage.myProjects')}</div>
              <button
                type="button"
                className={`${styles.btn} ${styles.primary}`}
                onClick={async () => {
                  await newProject();
                  onClose();
                }}
              >
                {t('storage.new')}
              </button>
            </div>
            <ul className={styles.projectList}>
              {projects.map((p) => (
                <li key={p.id} className={p.id === currentId ? styles.current : undefined}>
                  <div>
                    <div className={styles.projectName}>{p.name}</div>
                    <div className={styles.meta}>{formatDate(p.updatedAt)}</div>
                  </div>
                  <span className={styles.spacer} />
                  {p.id === currentId ? (
                    <span className={styles.tag}>{t('storage.open')}</span>
                  ) : (
                    <button
                      type="button"
                      className={styles.btn}
                      onClick={async () => {
                        await openProject(p.id);
                        onClose();
                      }}
                    >
                      {t('storage.openAction')}
                    </button>
                  )}
                  <button
                    type="button"
                    className={`${styles.btn} ${styles.danger}`}
                    onClick={() => {
                      if (window.confirm(t('storage.confirmDelete', { name: p.name }))) {
                        void removeProject(p.id);
                      }
                    }}
                  >
                    {t('storage.delete')}
                  </button>
                </li>
              ))}
            </ul>
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.btn}
                onClick={() => void exportCurrentProject()}
              >
                {t('storage.exportProject')}
              </button>
              <button
                type="button"
                className={styles.btn}
                onClick={() => projectFileRef.current?.click()}
              >
                {t('storage.importProject')}
              </button>
              <input
                ref={projectFileRef}
                type="file"
                accept=".json,application/json"
                hidden
                data-testid="import-project-input"
                onChange={() => void onImportProject()}
              />
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.label}>{t('storage.backup')}</div>
            <p className={styles.note}>{t('storage.backupNote')}</p>
            <p className={styles.meta}>
              {t('storage.lastBackup')}: {formatDate(meta.lastBackupAt)}
              {' · '}
              {persisted ? t('storage.persisted') : t('storage.notPersisted')}
            </p>
            <div className={styles.actions}>
              <button
                type="button"
                className={`${styles.btn} ${styles.primary}`}
                onClick={() => void exportAll()}
              >
                {t('storage.exportAll')}
              </button>
              <button
                type="button"
                className={styles.btn}
                onClick={() => backupFileRef.current?.click()}
              >
                {t('storage.importAll.button')}
              </button>
              <input
                ref={backupFileRef}
                type="file"
                accept=".json,application/json"
                hidden
                data-testid="import-backup-input"
                onChange={() => void onImportBackup()}
              />
            </div>
            <label className={styles.inline}>
              {t('storage.warnDays')}
              <input
                type="number"
                min={1}
                max={90}
                defaultValue={meta.backupWarnDays}
                onBlur={(e) => {
                  const n = Math.round(Number(e.target.value));
                  if (n >= 1 && n <= 90) void setBackupWarnDays(n);
                  else e.target.value = String(meta.backupWarnDays);
                }}
              />
            </label>
          </section>
        </>
      )}
    </dialog>
  );
}

import { useState } from 'react';
import { t } from '../../i18n';
import { useStorage } from '../../storage/persistence';
import { useEditor } from '../editor/store';
import { IconFolder } from '../icons';
import { ProjectsDialog } from './ProjectsDialog';
import styles from './Storage.module.css';

/** Project name, save status and the projects/backup dialog button. */
export function ProjectBar() {
  const name = useEditor((s) => s.project.name);
  const apply = useEditor((s) => s.apply);
  const status = useStorage((s) => s.status);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);

  const commit = () => {
    const v = draft?.trim();
    if (v && v !== name) {
      apply((p) => {
        p.name = v;
      });
    }
    setDraft(null);
  };

  return (
    <div className={styles.bar}>
      <input
        className={styles.nameInput}
        aria-label={t('storage.projectName')}
        value={draft ?? name}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
          if (e.key === 'Escape') setDraft(null);
        }}
      />
      <span className={styles.status} data-status={status} data-testid="save-status">
        {t(`storage.status.${status}`)}
      </span>
      <button type="button" className={styles.btn} onClick={() => setOpen(true)}>
        <IconFolder />
        {t('storage.projects')}
      </button>
      {open && <ProjectsDialog onClose={() => setOpen(false)} />}
    </div>
  );
}

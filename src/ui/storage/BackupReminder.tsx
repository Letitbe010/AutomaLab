import { t } from '../../i18n';
import { exportAll, useStorage } from '../../storage/persistence';
import styles from './Storage.module.css';

/** Discreet band shown when there are changes and no backup for N days (SPEC §10). */
export function BackupReminder() {
  const days = useStorage((s) => s.reminderDays);
  if (days === null) return null;
  return (
    <div className={styles.reminder} role="status">
      <span>{t('storage.reminder', { days })}</span>
      <button type="button" className={styles.reminderBtn} onClick={() => void exportAll()}>
        {t('storage.exportNow')}
      </button>
    </div>
  );
}

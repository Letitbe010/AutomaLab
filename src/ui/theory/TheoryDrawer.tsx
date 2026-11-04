import { getSheet } from '../../learning/theory/sheets';
import { t } from '../../i18n';
import { useLearning } from '../learning/store';
import { TheorySheetView } from './TheorySheetView';
import styles from './Theory.module.css';

/** Theory sheet in a side panel over the editor (SPEC §7.4: "without leaving the editor"). */
export function TheoryDrawer() {
  const id = useLearning((s) => s.drawerTheoryId);
  const open = useLearning((s) => s.openDrawer);
  const close = useLearning((s) => s.closeDrawer);
  const sheet = id ? getSheet(id) : undefined;
  if (!sheet) return null;
  return (
    <aside className={styles.drawer} aria-label={t('theory.panel')} data-testid="theory-drawer">
      <button
        type="button"
        className={styles.drawerClose}
        onClick={close}
        aria-label={t('storage.close')}
      >
        ×
      </button>
      <TheorySheetView sheet={sheet} onNavigate={open} compact />
    </aside>
  );
}

import { t } from '../../i18n';
import { Canvas } from './Canvas';
import { IssuesPanel } from './IssuesPanel';
import { Library } from './Library';
import { PropertiesPanel } from './PropertiesPanel';
import { Toolbar } from './Toolbar';
import { useEditor } from './store';
import { useShortcuts } from './useShortcuts';
import styles from './Editor.module.css';

export function Editor() {
  useShortcuts();
  const mode = useEditor((s) => s.mode);
  const notice = useEditor((s) => s.notice);
  const drafting = useEditor((s) => s.wireDraft !== null);

  return (
    <div className={styles.editor}>
      <Toolbar />
      <div className={styles.body}>
        <Library />
        <div className={styles.stage}>
          <Canvas />
          {mode === 'sim' && <div className={styles.banner}>{t('editor.simPending')}</div>}
          {(notice || drafting) && (
            <div className={styles.status} role="status">
              {notice ? t(notice) : t('editor.wireHint')}
            </div>
          )}
        </div>
        <PropertiesPanel />
      </div>
      <IssuesPanel />
    </div>
  );
}

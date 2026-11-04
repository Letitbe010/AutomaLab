import { useEffect } from 'react';
import { t } from '../../i18n';
import { useStorage } from '../../storage/persistence';
import { useSimLoop } from '../sim/useSimLoop';
import { Canvas } from './Canvas';
import { IssuesPanel } from './IssuesPanel';
import { Library } from './Library';
import { PropertiesPanel } from './PropertiesPanel';
import { Toolbar } from './Toolbar';
import { useEditor } from './store';
import { useShortcuts } from './useShortcuts';
import styles from './Editor.module.css';

const NOTICE_MS = 5000;

export function Editor() {
  // Wait for the stored project, so early edits are not replaced when it loads.
  const loading = useStorage((s) => s.status === 'loading');
  if (loading) return <p className={styles.loading}>{t('storage.status.loading')}</p>;
  return <EditorView />;
}

function EditorView() {
  useShortcuts();
  useSimLoop();
  const mode = useEditor((s) => s.mode);
  const notice = useEditor((s) => s.notice);
  const drafting = useEditor((s) => s.wireDraft !== null);

  useEffect(() => {
    if (!notice) return;
    const id = setTimeout(() => useEditor.getState().setNotice(null), NOTICE_MS);
    return () => clearTimeout(id);
  }, [notice]);

  return (
    <div className={styles.editor} data-mode={mode}>
      <Toolbar />
      <div className={styles.body}>
        <Library />
        <div className={styles.stage}>
          <Canvas />
          {mode === 'sim' && <div className={styles.banner}>{t('sim.banner')}</div>}
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

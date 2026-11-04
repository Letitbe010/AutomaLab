import { lazy, Suspense, useEffect } from 'react';
import { t } from '../../i18n';
import { useStorage } from '../../storage/persistence';
import { useSimLoop } from '../sim/useSimLoop';
import { Canvas } from './Canvas';
import { IssuesPanel } from './IssuesPanel';
import { Library } from './Library';
import { PropertiesPanel } from './PropertiesPanel';
import { Toolbar } from './Toolbar';
import { useLearning } from '../learning/store';
import { useEditor } from './store';
import { useShortcuts } from './useShortcuts';
import styles from './Editor.module.css';

const NOTICE_MS = 5000;

const TheoryDrawer = lazy(() =>
  import('../theory/TheoryDrawer').then((m) => ({ default: m.TheoryDrawer })),
);
const ExercisePanel = lazy(() =>
  import('../exercises/ExercisePanel').then((m) => ({ default: m.ExercisePanel })),
);
const TemplatePanel = lazy(() =>
  import('../templates/TemplatePanel').then((m) => ({ default: m.TemplatePanel })),
);

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
  const drawerOpen = useLearning((s) => s.drawerTheoryId !== null);
  const templateOpen = useLearning((s) => s.templatePanelOpen);
  const hasTemplate = useEditor((s) => s.project.templateId !== undefined);
  const hasExercise = useEditor((s) => s.project.exerciseId !== undefined);

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
        {templateOpen && hasExercise && (
          <Suspense fallback={null}>
            <ExercisePanel />
          </Suspense>
        )}
        {templateOpen && hasTemplate && !hasExercise && (
          <Suspense fallback={null}>
            <TemplatePanel />
          </Suspense>
        )}
        {drawerOpen && (
          <Suspense fallback={null}>
            <TheoryDrawer />
          </Suspense>
        )}
      </div>
      <IssuesPanel />
    </div>
  );
}

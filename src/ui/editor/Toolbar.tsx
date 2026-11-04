import { t } from '../../i18n';
import { deleteSelection, fitView, mirrorSelection, rotateSelection, zoomBy } from './actions';
import { ProjectBar } from '../storage/ProjectBar';
import { useEditor } from './store';
import styles from './Editor.module.css';

export function Toolbar() {
  const mode = useEditor((s) => s.mode);
  const setMode = useEditor((s) => s.setMode);
  const canUndo = useEditor((s) => s.past.length > 0);
  const canRedo = useEditor((s) => s.future.length > 0);
  const undo = useEditor((s) => s.undo);
  const redo = useEditor((s) => s.redo);
  const hasComps = useEditor((s) => s.selection.components.length > 0);
  const hasSel = useEditor(
    (s) => s.selection.components.length + s.selection.connections.length > 0,
  );
  const zoom = useEditor((s) => s.view.zoom);
  const edit = mode === 'edit';

  return (
    <div className={styles.toolbar} role="toolbar" aria-label={t('editor.toolbar')}>
      <ProjectBar />
      <span className={styles.sep} />
      <div className={styles.seg} role="group" aria-label={t('editor.mode.label')}>
        <button type="button" aria-pressed={edit} onClick={() => setMode('edit')}>
          {t('editor.mode.edit')}
        </button>
        <button type="button" aria-pressed={!edit} onClick={() => setMode('sim')}>
          {t('editor.mode.sim')}
        </button>
      </div>
      <span className={styles.sep} />
      <button
        type="button"
        className={styles.btn}
        disabled={!edit || !canUndo}
        onClick={undo}
        title="Ctrl+Z"
      >
        {t('editor.tool.undo')}
      </button>
      <button
        type="button"
        className={styles.btn}
        disabled={!edit || !canRedo}
        onClick={redo}
        title="Ctrl+Y"
      >
        {t('editor.tool.redo')}
      </button>
      <span className={styles.sep} />
      <button
        type="button"
        className={styles.btn}
        disabled={!edit || !hasComps}
        onClick={rotateSelection}
        title="R"
      >
        {t('editor.tool.rotate')}
      </button>
      <button
        type="button"
        className={styles.btn}
        disabled={!edit || !hasComps}
        onClick={mirrorSelection}
        title="M"
      >
        {t('editor.tool.mirror')}
      </button>
      <button
        type="button"
        className={styles.btn}
        disabled={!edit || !hasSel}
        onClick={deleteSelection}
        title="Supr"
      >
        {t('editor.tool.delete')}
      </button>
      <span className={styles.spacer} />
      <button
        type="button"
        className={styles.btn}
        onClick={() => zoomBy(1 / 1.25)}
        aria-label={t('editor.tool.zoomOut')}
      >
        −
      </button>
      <span className={styles.zoom}>{Math.round(zoom * 100)} %</span>
      <button
        type="button"
        className={styles.btn}
        onClick={() => zoomBy(1.25)}
        aria-label={t('editor.tool.zoomIn')}
      >
        +
      </button>
      <button type="button" className={styles.btn} onClick={fitView}>
        {t('editor.tool.fit')}
      </button>
    </div>
  );
}

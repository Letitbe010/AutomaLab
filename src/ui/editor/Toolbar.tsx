import { t } from '../../i18n';
import { ProjectBar } from '../storage/ProjectBar';
import { SimControls } from '../sim/SimControls';
import {
  deleteSelection,
  enterSim,
  exitSim,
  fitView,
  mirrorSelection,
  rotateSelection,
  zoomBy,
} from './actions';
import { useEditor } from './store';
import styles from './Editor.module.css';

function EditTools() {
  const canUndo = useEditor((s) => s.past.length > 0);
  const canRedo = useEditor((s) => s.future.length > 0);
  const undo = useEditor((s) => s.undo);
  const redo = useEditor((s) => s.redo);
  const hasComps = useEditor((s) => s.selection.components.length > 0);
  const hasSel = useEditor(
    (s) => s.selection.components.length + s.selection.connections.length > 0,
  );
  const tool = (label: string, onClick: () => void, enabled: boolean, title: string) => (
    <button
      type="button"
      className={styles.btn}
      disabled={!enabled}
      onClick={onClick}
      title={title}
    >
      {label}
    </button>
  );
  return (
    <>
      {tool(t('editor.tool.undo'), undo, canUndo, 'Ctrl+Z')}
      {tool(t('editor.tool.redo'), redo, canRedo, 'Ctrl+Y')}
      <span className={styles.sep} />
      {tool(t('editor.tool.rotate'), rotateSelection, hasComps, 'R')}
      {tool(t('editor.tool.mirror'), mirrorSelection, hasComps, 'M')}
      {tool(t('editor.tool.delete'), deleteSelection, hasSel, 'Supr')}
    </>
  );
}

export function Toolbar() {
  const mode = useEditor((s) => s.mode);
  const zoom = useEditor((s) => s.view.zoom);
  const edit = mode === 'edit';

  return (
    <div className={styles.toolbar} role="toolbar" aria-label={t('editor.toolbar')}>
      <ProjectBar />
      <span className={styles.sep} />
      <div className={styles.seg} role="group" aria-label={t('editor.mode.label')}>
        <button type="button" aria-pressed={edit} onClick={() => !edit && exitSim()}>
          {t('editor.mode.edit')}
        </button>
        <button type="button" aria-pressed={!edit} onClick={() => edit && enterSim()}>
          {t('editor.mode.sim')}
        </button>
      </div>
      <span className={styles.sep} />
      {edit ? <EditTools /> : <SimControls />}
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

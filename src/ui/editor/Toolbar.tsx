import { t } from '../../i18n';
import { ProjectBar } from '../storage/ProjectBar';
import { SimControls } from '../sim/SimControls';
import {
  IconDelete,
  IconFit,
  IconMirror,
  IconRedo,
  IconRotate,
  IconSidePanel,
  IconUndo,
  IconZoomIn,
  IconZoomOut,
} from '../icons';
import {
  deleteSelection,
  enterSim,
  exitSim,
  fitView,
  mirrorSelection,
  rotateSelection,
  zoomBy,
} from './actions';
import { useLearning } from '../learning/store';
import { useEditorTab } from '../plc/tabs';
import { IconButton } from './IconButton';
import { useEditor } from './store';
import styles from './Editor.module.css';

function EditTools({ schematic }: { schematic: boolean }) {
  const canUndo = useEditor((s) => s.past.length > 0);
  const canRedo = useEditor((s) => s.future.length > 0);
  const undo = useEditor((s) => s.undo);
  const redo = useEditor((s) => s.redo);
  const hasComps = useEditor((s) => s.selection.components.length > 0);
  const hasSel = useEditor(
    (s) => s.selection.components.length + s.selection.connections.length > 0,
  );
  return (
    <>
      <div className={styles.group}>
        <IconButton
          label={t('editor.tool.undo')}
          shortcut="Ctrl+Z"
          onClick={undo}
          disabled={!canUndo}
        >
          <IconUndo />
        </IconButton>
        <IconButton
          label={t('editor.tool.redo')}
          shortcut="Ctrl+Y"
          onClick={redo}
          disabled={!canRedo}
        >
          <IconRedo />
        </IconButton>
      </div>
      {schematic && <span className={styles.sep} />}
      <div className={styles.group} hidden={!schematic}>
        <IconButton
          label={t('editor.tool.rotate')}
          shortcut="R"
          onClick={rotateSelection}
          disabled={!hasComps}
        >
          <IconRotate />
        </IconButton>
        <IconButton
          label={t('editor.tool.mirror')}
          shortcut="M"
          onClick={mirrorSelection}
          disabled={!hasComps}
        >
          <IconMirror />
        </IconButton>
        <IconButton
          label={t('editor.tool.delete')}
          shortcut="Supr"
          onClick={deleteSelection}
          disabled={!hasSel}
          className={styles.dangerIcon}
        >
          <IconDelete />
        </IconButton>
      </div>
    </>
  );
}

export function Toolbar() {
  const mode = useEditor((s) => s.mode);
  const zoom = useEditor((s) => s.view.zoom);
  const edit = mode === 'edit';
  // Zoom and symbol tools only act on the schematic canvas.
  const schematic = useEditorTab((s) => s.tab === 'schematic');
  const hasTemplate = useEditor((s) => s.project.templateId !== undefined);
  const hasExercise = useEditor((s) => s.project.exerciseId !== undefined);
  const templateOpen = useLearning((s) => s.templatePanelOpen);
  const setTemplatePanel = useLearning((s) => s.setTemplatePanel);

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
      {edit ? <EditTools schematic={schematic} /> : <SimControls />}
      <span className={styles.spacer} />
      {(hasTemplate || hasExercise) && (
        <>
          <button
            type="button"
            className={styles.btn}
            aria-pressed={templateOpen}
            onClick={() => setTemplatePanel(!templateOpen)}
            title={t('templates.panelToggleHint')}
          >
            <IconSidePanel />
            {hasExercise ? t('exercises.panelToggle') : t('templates.panelToggle')}
          </button>
          {schematic && <span className={styles.sep} />}
        </>
      )}
      <div className={styles.group} hidden={!schematic}>
        <IconButton label={t('editor.tool.zoomOut')} onClick={() => zoomBy(1 / 1.25)}>
          <IconZoomOut />
        </IconButton>
        <span className={styles.zoom}>{Math.round(zoom * 100)} %</span>
        <IconButton label={t('editor.tool.zoomIn')} onClick={() => zoomBy(1.25)}>
          <IconZoomIn />
        </IconButton>
        <IconButton label={t('editor.tool.fit')} onClick={fitView}>
          <IconFit />
        </IconButton>
      </div>
    </div>
  );
}

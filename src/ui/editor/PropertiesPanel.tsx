import { useState } from 'react';
import type { ParamDef } from '../../core/componentDef';
import type { ParamValue } from '../../core/types';
import { getComponentDef } from '../../components/registry';
import { componentHelp, componentName } from '../../components/text';
import { t } from '../../i18n';
import { deleteSelection, mirrorSelection, rotateSelection } from './actions';
import { setParam } from './model/ops';
import { useLearning } from '../learning/store';
import { useEditor } from './store';
import styles from './Editor.module.css';

/**
 * Text/number field that commits on blur or Enter (one undo step per edit).
 * The parent keys it by component and value, so it resets when the value changes elsewhere.
 */
function ParamField({
  def,
  value,
  disabled,
  onCommit,
  cylinderLabels,
}: {
  def: ParamDef;
  value: ParamValue | undefined;
  disabled: boolean;
  onCommit: (v: ParamValue) => void;
  /** Choices for cylinder references (labels of the project's cylinders). */
  cylinderLabels: string[];
}) {
  const [text, setText] = useState(String(value ?? ''));

  if (def.type === 'enum' || def.type === 'cylinderRef') {
    const current = typeof value === 'string' ? value : '';
    const options =
      def.type === 'enum'
        ? def.options.map((o) => ({ value: o.value, label: t(o.labelKey) }))
        : [
            { value: '', label: t('param.unbound') },
            // Keep a reference to a cylinder that no longer exists visible.
            ...[...new Set([...cylinderLabels, ...(current ? [current] : [])])]
              .sort()
              .map((l) => ({ value: l, label: l })),
          ];
    return (
      <select value={current} disabled={disabled} onChange={(e) => onCommit(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    );
  }

  if (def.type === 'boolean') {
    return (
      <input
        type="checkbox"
        checked={value === true}
        disabled={disabled}
        onChange={(e) => onCommit(e.target.checked)}
      />
    );
  }
  const commit = () => {
    if (def.type === 'number') {
      const n = Number(text.replace(',', '.'));
      const ok =
        text.trim() !== '' &&
        Number.isFinite(n) &&
        (def.min === undefined || n >= def.min) &&
        (def.max === undefined || n <= def.max);
      if (ok && n !== value) onCommit(n);
      else setText(String(value ?? ''));
    } else if (def.type === 'string' && text !== value) {
      onCommit(text.trim());
    }
  };
  return (
    <span className={styles.fieldRow}>
      <input
        type="text"
        inputMode={def.type === 'number' ? 'decimal' : undefined}
        value={text}
        disabled={disabled}
        onChange={(e) => setText(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
          if (e.key === 'Escape') setText(String(value ?? ''));
        }}
      />
      {def.type === 'number' && def.unit && <span className={styles.unit}>{def.unit}</span>}
    </span>
  );
}

export function PropertiesPanel() {
  const project = useEditor((s) => s.project);
  const selection = useEditor((s) => s.selection);
  const mode = useEditor((s) => s.mode);
  const apply = useEditor((s) => s.apply);
  const disabled = mode !== 'edit';

  const comps = selection.components;
  const wires = selection.connections;
  const cylinderLabels = project.components
    .filter((c) => getComponentDef(c.type)?.limitMarks)
    .map((c) => c.params.label)
    .filter((l): l is string => typeof l === 'string' && l !== '');

  let body;
  if (comps.length === 1 && wires.length === 0) {
    const comp = project.components.find((c) => c.id === comps[0]);
    const def = comp && getComponentDef(comp.type);
    if (comp && def) {
      body = (
        <>
          <div className={styles.propName}>{componentName(def)}</div>
          <code className={styles.propType}>{def.type}</code>
          {def.params.map((p) => (
            <label key={p.key} className={styles.field}>
              <span>{t(p.labelKey)}</span>
              <ParamField
                key={`${comp.id}:${String(comp.params[p.key])}`}
                def={p}
                value={comp.params[p.key] ?? p.default}
                disabled={disabled}
                cylinderLabels={cylinderLabels}
                onCommit={(v) => apply((d) => setParam(d, comp.id, p.key, v))}
              />
            </label>
          ))}
          <div className={styles.propMeta}>
            {t('editor.props.rotation')}: {comp.rot}° · {t('editor.props.mirror')}:{' '}
            {comp.mirror ? t('editor.yes') : t('editor.no')}
          </div>
          {def.helpKey && <p className={styles.helpText}>{componentHelp(def)}</p>}
          {def.theoryRef && (
            <button
              type="button"
              className={styles.theoryLink}
              onClick={() => useLearning.getState().openDrawer(def.theoryRef!)}
            >
              {t('theory.more')} →
            </button>
          )}
        </>
      );
    }
  } else if (comps.length === 0 && wires.length === 1) {
    const w = project.connections.find((c) => c.id === wires[0]);
    if (w) {
      body = (
        <>
          <div className={styles.propName}>{t('editor.props.connection')}</div>
          <code className={styles.propType}>
            {w.from.join(':')} → {w.to.join(':')}
          </code>
          <p className={styles.helpText}>{t('editor.props.wireHelp')}</p>
        </>
      );
    }
  } else if (comps.length + wires.length > 1) {
    body = (
      <div className={styles.propName}>
        {t('editor.props.multi', { components: comps.length, connections: wires.length })}
      </div>
    );
  }

  const hasSelection = comps.length + wires.length > 0;
  return (
    <aside className={styles.props} aria-label={t('editor.props.title')}>
      <div className={styles.panelTitle}>{t('editor.props.title')}</div>
      {body ?? <p className={styles.muted}>{t('editor.props.none')}</p>}
      {hasSelection && !disabled && (
        <div className={styles.propActions}>
          {comps.length > 0 && (
            <>
              <button type="button" className={styles.btn} onClick={rotateSelection}>
                {t('editor.tool.rotate')}
              </button>
              <button type="button" className={styles.btn} onClick={mirrorSelection}>
                {t('editor.tool.mirror')}
              </button>
            </>
          )}
          <button
            type="button"
            className={`${styles.btn} ${styles.danger}`}
            onClick={deleteSelection}
          >
            {t('editor.tool.delete')}
          </button>
        </div>
      )}
    </aside>
  );
}

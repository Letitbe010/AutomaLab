import { useMemo, useState } from 'react';
import { validateProject } from '../../core/validation';
import { getComponentDef } from '../../components/registry';
import { componentName } from '../../components/text';
import type { Issue } from '../../core/validation';
import type { Project } from '../../core/types';
import type { SimWarning } from '../../engine/types';
import { t } from '../../i18n';
import { formatSimTime } from '../sim/format';
import { useSim } from '../sim/simStore';
import { SpacePhaseView } from '../sim/SpacePhaseView';
import { GRID } from '../../core/geometry';
import { IconChevronDown, IconChevronUp, IconError, IconWarning } from '../icons';
import { useCursor } from './cursor';
import { useEditor } from './store';
import styles from './Editor.module.css';

function portName(project: Project, key: string): string {
  const [id, port] = key.split('|');
  const c = project.components.find((k) => k.id === id);
  const label = typeof c?.params.label === 'string' && c.params.label !== '' ? c.params.label : id;
  return `${label}:${port}`;
}

function simWarningText(w: SimWarning, project: Project): string {
  switch (w.code) {
    case 'oscillation':
      return t('sim.warning.oscillation', { t: formatSimTime(w.timeMs) });
    case 'supplyVented':
      return t('sim.warning.supplyVented', {
        t: formatSimTime(w.timeMs),
        ports: w.ports.map((k) => portName(project, k)).join(', '),
      });
    case 'bothSignals': {
      const c = project.components.find((k) => k.id === w.componentId);
      const label =
        typeof c?.params.label === 'string' && c.params.label !== ''
          ? c.params.label
          : w.componentId;
      return t('sim.warning.bothSignals', { t: formatSimTime(w.timeMs), component: label });
    }
    case 'shortCircuit':
      return t('sim.warning.shortCircuit', { t: formatSimTime(w.timeMs) });
    case 'unsupported': {
      const def = getComponentDef(w.type);
      return t('sim.warning.unsupported', { name: def ? componentName(def) : w.type });
    }
  }
}

function IssueList({
  issues,
  simWarnings,
  project,
}: {
  issues: Issue[];
  simWarnings: readonly SimWarning[];
  project: Project;
}) {
  const select = useEditor((s) => s.select);
  if (issues.length + simWarnings.length === 0) {
    return <p className={styles.muted}>{t('editor.issues.none')}</p>;
  }
  return (
    <ul className={styles.issueList}>
      {simWarnings.map((w, i) => (
        <li key={`sim${i}`}>
          <div className={styles.issue} data-severity="warning" data-testid="sim-warning">
            <span className={styles.issueTag}>{t('sim.warning.tag')}</span>
            {simWarningText(w, project)}
          </div>
        </li>
      ))}
      {issues.map((issue, i) => (
        <li key={i}>
          <button
            type="button"
            className={styles.issue}
            data-severity={issue.severity}
            onClick={() =>
              select({ components: issue.componentIds, connections: issue.connectionIds })
            }
          >
            <span className={styles.issueTag}>
              {issue.severity === 'error' ? t('editor.issues.error') : t('editor.issues.warning')}
            </span>
            {t(`validation.${issue.code}`, issue.vars)}
          </button>
        </li>
      ))}
    </ul>
  );
}

/** Pointer position in grid units, as in a CAD status bar. */
function CursorReadout() {
  const at = useCursor((s) => s.at);
  const fmt = (v: number) => String(Math.round(v / GRID)).padStart(4, ' ');
  return (
    <span className={`${styles.statusField} ${styles.coords}`} title={t('editor.status.cursor')}>
      {at ? `X${fmt(at[0])}  Y${fmt(at[1])}` : 'X   —  Y   —'}
    </span>
  );
}

type Tab = 'issues' | 'diagram';

/**
 * Bottom of the editor: a status bar (panel tabs, issue counters, cursor
 * position) and, above it, a collapsible panel with the validation and
 * simulation warnings or the space-phase diagram.
 */
export function IssuesPanel() {
  const mode = useEditor((s) => s.mode);
  const project = useEditor((s) => s.project);
  useSim((s) => s.version);
  const sim = useSim.getState().sim;
  const [tab, setTab] = useState<Tab>('issues');
  // null = automatic: open while there is something to report.
  const [openPref, setOpenPref] = useState<boolean | null>(null);

  const issues = useMemo(() => validateProject(project, getComponentDef), [project]);
  const simWarnings = sim?.warnings ?? [];
  const errors = issues.filter((i) => i.severity === 'error').length;
  const warnings = issues.length - errors + simWarnings.length;

  const shown: Tab = mode === 'sim' ? tab : 'issues';
  const open = openPref ?? (shown === 'diagram' || issues.length + simWarnings.length > 0);

  const pick = (next: Tab) => {
    // Clicking the tab that is already showing folds the panel away.
    setOpenPref(next === shown && open ? false : true);
    setTab(next);
  };

  return (
    <section className={styles.bottom} aria-label={t('editor.issues.title')}>
      {open && (
        <div className={styles.bottomBody}>
          {shown === 'issues' ? (
            <IssueList issues={issues} simWarnings={simWarnings} project={project} />
          ) : (
            <SpacePhaseView />
          )}
        </div>
      )}
      <div className={styles.statusBar}>
        <div className={styles.tabs} role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={shown === 'issues'}
            onClick={() => pick('issues')}
          >
            {t('editor.issues.title')}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={shown === 'diagram'}
            disabled={mode !== 'sim'}
            onClick={() => pick('diagram')}
          >
            {t('sim.diagram.title')}
          </button>
        </div>
        <span className={`${styles.badge} ${errors ? styles.badgeError : ''}`}>
          <IconError />
          {t('editor.issues.errors', { n: errors })}
        </span>
        <span className={`${styles.badge} ${warnings ? styles.badgeWarning : ''}`}>
          <IconWarning />
          {t('editor.issues.warnings', { n: warnings })}
        </span>
        <span className={styles.spacer} />
        <CursorReadout />
        <span className={styles.statusField}>{t('editor.status.grid', { n: GRID })}</span>
        <button
          type="button"
          className={styles.statusBtn}
          aria-expanded={open}
          aria-label={open ? t('editor.issues.hide') : t('editor.issues.show')}
          title={open ? t('editor.issues.hide') : t('editor.issues.show')}
          onClick={() => setOpenPref(!open)}
        >
          {open ? <IconChevronDown /> : <IconChevronUp />}
        </button>
      </div>
    </section>
  );
}

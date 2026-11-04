import { useMemo, useState } from 'react';
import { validateProject } from '../../core/validation';
import { getComponentDef } from '../../components/registry';
import { componentName } from '../../components/text';
import type { Project } from '../../core/types';
import type { SimWarning } from '../../engine/types';
import { t } from '../../i18n';
import { formatSimTime } from '../sim/format';
import { useSim } from '../sim/simStore';
import { SpacePhaseView } from '../sim/SpacePhaseView';
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
    case 'unsupported': {
      const def = getComponentDef(w.type);
      return t('sim.warning.unsupported', { name: def ? componentName(def) : w.type });
    }
  }
}

function Issues() {
  const project = useEditor((s) => s.project);
  const select = useEditor((s) => s.select);
  useSim((s) => s.version);
  const sim = useSim.getState().sim;
  const issues = useMemo(() => validateProject(project, getComponentDef), [project]);
  const simWarnings = sim?.warnings ?? [];
  const errors = issues.filter((i) => i.severity === 'error').length;
  const warnings = issues.length - errors + simWarnings.length;

  return (
    <>
      <div className={styles.issuesHead}>
        <span className={`${styles.badge} ${errors ? styles.badgeError : ''}`}>
          {t('editor.issues.errors', { n: errors })}
        </span>
        <span className={`${styles.badge} ${warnings ? styles.badgeWarning : ''}`}>
          {t('editor.issues.warnings', { n: warnings })}
        </span>
      </div>
      {issues.length + simWarnings.length === 0 ? (
        <p className={styles.muted}>{t('editor.issues.none')}</p>
      ) : (
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
                  {issue.severity === 'error'
                    ? t('editor.issues.error')
                    : t('editor.issues.warning')}
                </span>
                {t(`validation.${issue.code}`, issue.vars)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

type Tab = 'issues' | 'diagram';

/** Bottom panel: validation and simulation warnings, and the space-phase diagram. */
export function IssuesPanel() {
  const mode = useEditor((s) => s.mode);
  const [tab, setTab] = useState<Tab>('issues');
  const shown: Tab = mode === 'sim' ? tab : 'issues';

  return (
    <section className={styles.issues} aria-label={t('editor.issues.title')}>
      <div className={styles.tabs} role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={shown === 'issues'}
          onClick={() => setTab('issues')}
        >
          {t('editor.issues.title')}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={shown === 'diagram'}
          disabled={mode !== 'sim'}
          onClick={() => setTab('diagram')}
        >
          {t('sim.diagram.title')}
        </button>
      </div>
      {shown === 'issues' ? <Issues /> : <SpacePhaseView />}
    </section>
  );
}

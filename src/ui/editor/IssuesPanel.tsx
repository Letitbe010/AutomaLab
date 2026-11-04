import { useMemo } from 'react';
import { validateProject } from '../../core/validation';
import { getComponentDef } from '../../components/registry';
import { t } from '../../i18n';
import { useEditor } from './store';
import styles from './Editor.module.css';

export function IssuesPanel() {
  const project = useEditor((s) => s.project);
  const select = useEditor((s) => s.select);
  const issues = useMemo(() => validateProject(project, getComponentDef), [project]);
  const errors = issues.filter((i) => i.severity === 'error').length;
  const warnings = issues.length - errors;

  return (
    <section className={styles.issues} aria-label={t('editor.issues.title')}>
      <div className={styles.issuesHead}>
        <span className={styles.panelTitle}>{t('editor.issues.title')}</span>
        <span className={`${styles.badge} ${errors ? styles.badgeError : ''}`}>
          {t('editor.issues.errors', { n: errors })}
        </span>
        <span className={`${styles.badge} ${warnings ? styles.badgeWarning : ''}`}>
          {t('editor.issues.warnings', { n: warnings })}
        </span>
      </div>
      {issues.length === 0 ? (
        <p className={styles.muted}>{t('editor.issues.none')}</p>
      ) : (
        <ul className={styles.issueList}>
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
    </section>
  );
}

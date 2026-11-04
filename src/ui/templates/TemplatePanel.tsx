import { getTemplate } from '../../learning/templates';
import { t } from '../../i18n';
import { resetToTemplate } from '../../storage/persistence';
import { focusComponent } from '../editor/actions';
import { useEditor } from '../editor/store';
import { useLearning } from '../learning/store';
import { QuizView } from '../quiz/QuizView';
import { MarkdownBody } from '../theory/MarkdownBody';
import { DraftBadge } from '../theory/TheorySheetView';
import styles from './Templates.module.css';

/** Description of the template the current project was opened from (SPEC §8.5). */
export function TemplatePanel() {
  const templateId = useEditor((s) => s.project.templateId);
  const components = useEditor((s) => s.project.components);
  const tpl = templateId ? getTemplate(templateId) : undefined;
  const learning = useLearning();
  if (!tpl) return null;

  function onLink(scheme: string, target: string) {
    if (scheme === 'theory') {
      learning.openDrawer(target);
      return;
    }
    const comp = components.find((c) => c.params.label === target);
    if (!comp) {
      useEditor.getState().setNotice('templates.missingComponent');
      return;
    }
    focusComponent(comp.id);
    learning.highlight(comp.id);
  }

  function reset() {
    if (window.confirm(t('templates.resetConfirm'))) resetToTemplate();
  }

  return (
    <aside className={styles.panel} aria-label={t('templates.panel')} data-testid="template-panel">
      <header className={styles.panelHead}>
        <div className={styles.panelKicker}>
          {t('templates.kicker')} <DraftBadge status={tpl.status} />
        </div>
        <button
          type="button"
          className={styles.close}
          onClick={() => learning.setTemplatePanel(false)}
          aria-label={t('storage.close')}
        >
          ×
        </button>
        <h2>{tpl.title}</h2>
        <button type="button" className={styles.reset} onClick={reset}>
          {t('templates.reset')}
        </button>
      </header>
      <div className={styles.tabs} role="tablist">
        {(['description', 'quiz'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={learning.templateTab === tab}
            onClick={() => learning.setTemplateTab(tab)}
          >
            {t(`templates.tab.${tab}`)}
          </button>
        ))}
      </div>
      {/* Both stay mounted so a quiz in progress survives switching tabs. */}
      <div hidden={learning.templateTab !== 'description'}>
        <p className={styles.hint}>{t('templates.labelHint')}</p>
        <MarkdownBody text={tpl.description} onLink={onLink} className={styles.description} />
      </div>
      <div hidden={learning.templateTab !== 'quiz'}>
        <QuizView key={tpl.id} templateId={tpl.id} />
      </div>
    </aside>
  );
}

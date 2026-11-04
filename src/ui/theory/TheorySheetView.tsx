import { getCalculator } from '../../learning/calculators';
import { templatesForTheory } from '../../learning/templates';
import { getSheet, type TheorySheet } from '../../learning/theory/sheets';
import { t } from '../../i18n';
import { openTemplateInEditor } from '../templates/open';
import { MarkdownBody } from './MarkdownBody';
import styles from './Theory.module.css';

export function DraftBadge({ status }: { status: TheorySheet['status'] }) {
  if (status !== 'draft') return null;
  return <span className={styles.draft}>{t('theory.draft')}</span>;
}

/** Renders one theory sheet: Markdown + KaTeX, embedded symbols, related content and sources. */
export function TheorySheetView({
  sheet,
  onNavigate,
  compact = false,
}: {
  sheet: TheorySheet;
  onNavigate: (id: string) => void;
  /** Side-panel layout (no related column). */
  compact?: boolean;
}) {
  const related = sheet.related.theory.map(getSheet).filter((s): s is TheorySheet => !!s);
  const calculators = sheet.related.calculators.map(getCalculator).filter((c) => !!c);
  const templates = templatesForTheory(sheet.id);

  return (
    <article
      className={`${styles.sheet} ${compact ? styles.compact : ''}`}
      data-testid="theory-sheet"
    >
      <header className={styles.sheetHead}>
        <h2>{sheet.title}</h2>
        <DraftBadge status={sheet.status} />
        <div className={styles.tags}>
          {sheet.tags.map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
      </header>
      <div className={styles.layout}>
        <MarkdownBody
          text={sheet.body}
          onLink={(scheme, target) => scheme === 'theory' && onNavigate(target)}
        />
        <aside className={styles.related} aria-label={t('theory.related')}>
          <div className={styles.relTitle}>{t('theory.related')}</div>
          {related.length > 0 && (
            <ul>
              {related.map((s) => (
                <li key={s.id}>
                  <button type="button" className={styles.link} onClick={() => onNavigate(s.id)}>
                    {s.title}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {templates.length > 0 && (
            <>
              <div className={styles.relSub}>{t('theory.templates')}</div>
              <ul data-testid="theory-templates">
                {templates.map((tpl) => (
                  <li key={tpl.id}>
                    <button
                      type="button"
                      className={styles.link}
                      title={t('templates.openHint')}
                      onClick={() => void openTemplateInEditor(tpl.id)}
                    >
                      {tpl.title}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
          {calculators.length > 0 && (
            <>
              <div className={styles.relSub}>{t('theory.calculators')}</div>
              <ul>
                {calculators.map((c) => (
                  <li key={c.id} className={styles.muted}>
                    {t(c.nameKey)} · {t('theory.soon')}
                  </li>
                ))}
              </ul>
            </>
          )}
          {templates.length === 0 && related.length === 0 && (
            <p className={styles.muted}>{t('theory.noRelated')}</p>
          )}
          <div className={styles.relSub}>{t('theory.sources')}</div>
          <ul className={styles.sources}>
            {sheet.sources.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </aside>
      </div>
    </article>
  );
}

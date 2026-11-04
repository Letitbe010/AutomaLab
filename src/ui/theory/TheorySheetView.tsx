import 'katex/dist/katex.min.css';
import { useLayoutEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { getComponentDef } from '../../components/registry';
import { componentName } from '../../components/text';
import { getCalculator } from '../../learning/calculators';
import { renderMarkdown } from '../../learning/markdown';
import { getSheet, type TheorySheet } from '../../learning/theory/sheets';
import { t } from '../../i18n';
import { Thumb } from '../editor/Thumb';
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
  const html = useMemo(() => renderMarkdown(sheet.body), [sheet.body]);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [slots, setSlots] = useState<{ el: Element; type: string }[]>([]);

  // Library symbols are mounted into the placeholders left by the Markdown renderer.
  useLayoutEffect(() => {
    const els = bodyRef.current?.querySelectorAll('.md-symbol') ?? [];
    setSlots([...els].map((el) => ({ el, type: el.getAttribute('data-symbol') ?? '' })));
  }, [html]);

  function onClick(e: MouseEvent<HTMLDivElement>) {
    const a = (e.target as Element).closest('a');
    const href = a?.getAttribute('href');
    if (!href) return;
    e.preventDefault();
    if (href.startsWith('theory:')) onNavigate(href.slice('theory:'.length));
    else window.open(href, '_blank', 'noopener');
  }

  const related = sheet.related.theory.map(getSheet).filter((s): s is TheorySheet => !!s);
  const calculators = sheet.related.calculators.map(getCalculator).filter((c) => !!c);

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
        <div
          ref={bodyRef}
          className={styles.body}
          onClick={onClick}
          dangerouslySetInnerHTML={{ __html: html }}
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
          {sheet.related.templates.length === 0 && related.length === 0 && (
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
      {slots.map(({ el, type }, i) => {
        const def = getComponentDef(type);
        return createPortal(
          def ? (
            <span className={styles.symbol} title={componentName(def)}>
              <Thumb def={def} className={styles.symbolSvg} />
              <span className={styles.symbolName}>{componentName(def)}</span>
            </span>
          ) : (
            <code>{type}</code>
          ),
          el,
          `${type}-${i}`,
        );
      })}
    </article>
  );
}

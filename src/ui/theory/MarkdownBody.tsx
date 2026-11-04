import 'katex/dist/katex.min.css';
import { useLayoutEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { getComponentDef } from '../../components/registry';
import { componentName } from '../../components/text';
import { renderMarkdown } from '../../learning/markdown';
import { Thumb } from '../editor/Thumb';
import styles from './Theory.module.css';

/**
 * Rendered Markdown (formulas, embedded library symbols). Links with a custom
 * scheme (theory:, comp:) go to `onLink`; other links open in a new tab.
 */
export function MarkdownBody({
  text,
  onLink,
  className,
}: {
  text: string;
  onLink: (scheme: string, target: string) => void;
  className?: string | undefined;
}) {
  const html = useMemo(() => renderMarkdown(text), [text]);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [slots, setSlots] = useState<{ el: Element; type: string }[]>([]);

  // Library symbols are mounted into the placeholders left by the Markdown renderer.
  useLayoutEffect(() => {
    const els = bodyRef.current?.querySelectorAll('.md-symbol') ?? [];
    setSlots([...els].map((el) => ({ el, type: el.getAttribute('data-symbol') ?? '' })));
    for (const a of bodyRef.current?.querySelectorAll('a[href^="comp:"]') ?? []) {
      a.setAttribute('data-comp', decodeURIComponent(a.getAttribute('href')!.slice(5)));
    }
  }, [html]);

  function onClick(e: MouseEvent<HTMLDivElement>) {
    const a = (e.target as Element).closest('a');
    const href = a?.getAttribute('href');
    if (!href) return;
    e.preventDefault();
    const m = /^(theory|comp):(.+)$/.exec(href);
    if (m) onLink(m[1]!, decodeURIComponent(m[2]!));
    else window.open(href, '_blank', 'noopener');
  }

  return (
    <>
      <div
        ref={bodyRef}
        className={`${styles.body} ${className ?? ''}`}
        onClick={onClick}
        dangerouslySetInnerHTML={{ __html: html }}
      />
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
    </>
  );
}

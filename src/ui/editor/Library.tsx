import { useState } from 'react';
import type { ComponentDef } from '../../core/componentDef';
import type { Domain } from '../../core/types';
import { COMPONENT_DEFS } from '../../components/registry';
import { t } from '../../i18n';
import { addAtViewCenter } from './actions';
import { DND_TYPE } from './Canvas';
import { useEditor } from './store';
import styles from './Editor.module.css';

const DOMAINS: Domain[] = ['pneumatic', 'hydraulic', 'electric', 'plc'];

/** Small static preview of a symbol, fitted to its bounds. */
function Thumb({ def }: { def: ComponentDef<unknown> }) {
  const [bx, by, bw, bh] = def.bounds;
  const pad = 0.6;
  const Symbol = def.symbol;
  const params = Object.fromEntries(def.params.map((p) => [p.key, p.default]));
  return (
    <svg
      viewBox={`${(bx - pad) * 10} ${(by - pad) * 10} ${(bw + 2 * pad) * 10} ${(bh + 2 * pad) * 10}`}
      className={styles.thumb}
      aria-hidden="true"
    >
      <Symbol state={def.initState(params)} params={params} />
    </svg>
  );
}

export function Library() {
  const [query, setQuery] = useState('');
  const mode = useEditor((s) => s.mode);
  const q = query.trim().toLowerCase();
  const visible = COMPONENT_DEFS.filter(
    (d) => !d.libraryHidden && (!q || t(d.nameKey).toLowerCase().includes(q) || d.type.includes(q)),
  );

  return (
    <aside className={styles.library} aria-label={t('editor.library')}>
      <div className={styles.panelTitle}>{t('editor.library')}</div>
      <input
        type="search"
        className={styles.search}
        placeholder={t('editor.search')}
        aria-label={t('editor.search')}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {DOMAINS.map((domain) => {
        const items = visible.filter((d) => d.domain === domain);
        if (!items.length) return null;
        return (
          <section key={domain}>
            <div className={styles.groupTitle}>{t(`domain.${domain}`)}</div>
            <ul className={styles.libList}>
              {items.map((def) => (
                <li key={def.type}>
                  <button
                    type="button"
                    className={styles.libItem}
                    draggable={mode === 'edit'}
                    disabled={mode !== 'edit'}
                    data-type={def.type}
                    title={def.helpKey ? t(def.helpKey) : undefined}
                    onDragStart={(e) => {
                      e.dataTransfer.setData(DND_TYPE, def.type);
                      e.dataTransfer.effectAllowed = 'copy';
                    }}
                    onClick={() => addAtViewCenter(def.type)}
                  >
                    <Thumb def={def} />
                    <span>{t(def.nameKey)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
      {!visible.length && <p className={styles.muted}>{t('editor.noResults')}</p>}
    </aside>
  );
}

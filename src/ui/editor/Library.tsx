import { useEffect, useState } from 'react';
import type { ComponentDef } from '../../core/componentDef';
import type { Domain } from '../../core/types';
import { HelpCard } from '../help/HelpCard';
import { Thumb } from './Thumb';
import { COMPONENT_DEFS } from '../../components/registry';
import { componentName, GROUP_ORDER } from '../../components/text';
import { t } from '../../i18n';
import { addAtViewCenter } from './actions';
import { DND_TYPE } from './Canvas';
import { useEditor } from './store';
import styles from './Editor.module.css';

const DOMAINS: Domain[] = ['pneumatic', 'hydraulic', 'electric', 'plc'];

function groupRank(group: string): number {
  const i = (GROUP_ORDER as readonly string[]).indexOf(group);
  return i < 0 ? GROUP_ORDER.length : i;
}

export function Library() {
  const [query, setQuery] = useState('');
  const mode = useEditor((s) => s.mode);
  const [hover, setHover] = useState<{
    def: ComponentDef<unknown>;
    left: number;
    top: number;
    shown: boolean;
  } | null>(null);

  useEffect(() => {
    if (!hover || hover.shown) return;
    const id = setTimeout(() => setHover({ ...hover, shown: true }), 400);
    return () => clearTimeout(id);
  }, [hover]);
  const q = query.trim().toLowerCase();
  const visible = COMPONENT_DEFS.filter(
    (d) =>
      !d.libraryHidden && (!q || componentName(d).toLowerCase().includes(q) || d.type.includes(q)),
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
        const groups = [...new Set(items.map((d) => d.group))].sort(
          (a, b) => groupRank(a) - groupRank(b),
        );
        return (
          <section key={domain}>
            <div className={styles.groupTitle}>{t(`domain.${domain}`)}</div>
            {groups.map((group) => (
              <details key={group} className={styles.libGroup} open>
                <summary>{t(`group.${group}`)}</summary>
                <ul className={styles.libList}>
                  {items
                    .filter((d) => d.group === group)
                    .map((def) => (
                      <li key={def.type}>
                        <button
                          type="button"
                          className={styles.libItem}
                          draggable={mode === 'edit'}
                          disabled={mode !== 'edit'}
                          data-type={def.type}
                          onMouseEnter={(e) => {
                            const r = e.currentTarget.getBoundingClientRect();
                            setHover({ def, left: r.right + 8, top: r.top, shown: false });
                          }}
                          onMouseLeave={() => setHover(null)}
                          onDragStart={(e) => {
                            setHover(null);
                            e.dataTransfer.setData(DND_TYPE, def.type);
                            e.dataTransfer.effectAllowed = 'copy';
                          }}
                          onClick={() => addAtViewCenter(def.type)}
                        >
                          <Thumb def={def} className={styles.thumb} />
                          <span>{componentName(def)}</span>
                        </button>
                      </li>
                    ))}
                </ul>
              </details>
            ))}
          </section>
        );
      })}
      {!visible.length && <p className={styles.muted}>{t('editor.noResults')}</p>}
      {hover?.shown && (
        <HelpCard
          def={hover.def}
          style={{
            position: 'fixed',
            left: hover.left,
            top: Math.min(hover.top, window.innerHeight - 200),
            pointerEvents: 'none',
          }}
        />
      )}
    </aside>
  );
}

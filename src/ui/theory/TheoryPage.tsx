import { useState } from 'react';
import type { Domain } from '../../core/types';
import { getSheet, searchSheets, THEORY_SHEETS } from '../../learning/theory/sheets';
import { t } from '../../i18n';
import { useLearning } from '../learning/store';
import { DraftBadge, TheorySheetView } from './TheorySheetView';
import styles from './Theory.module.css';

const DOMAINS = [...new Set(THEORY_SHEETS.map((s) => s.domain))];

/** Theory section (SPEC §8.3): searchable list of sheets and the selected sheet. */
export function TheoryPage() {
  const [query, setQuery] = useState('');
  const [domain, setDomain] = useState<Domain | undefined>(undefined);
  const theoryId = useLearning((s) => s.theoryId);
  const showTheory = useLearning((s) => s.showTheory);
  const results = searchSheets(query, domain);
  const sheet = getSheet(theoryId);

  return (
    <div className={styles.page}>
      <nav className={styles.list} aria-label={t('theory.list')}>
        <input
          type="search"
          className={styles.search}
          placeholder={t('theory.search')}
          aria-label={t('theory.search')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className={styles.chips} role="group" aria-label={t('theory.domain')}>
          <button type="button" aria-pressed={!domain} onClick={() => setDomain(undefined)}>
            {t('theory.all')}
          </button>
          {DOMAINS.map((d) => (
            <button key={d} type="button" aria-pressed={domain === d} onClick={() => setDomain(d)}>
              {t(`domain.${d}`)}
            </button>
          ))}
        </div>
        <ul className={styles.items}>
          {results.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                className={styles.item}
                aria-current={s.id === theoryId ? 'page' : undefined}
                onClick={() => showTheory(s.id)}
              >
                <span className={styles.itemTitle}>{s.title}</span>
                <DraftBadge status={s.status} />
              </button>
            </li>
          ))}
        </ul>
        {results.length === 0 && <p className={styles.muted}>{t('theory.noResults')}</p>}
      </nav>
      <div className={styles.content}>
        {sheet ? (
          <TheorySheetView sheet={sheet} onNavigate={showTheory} />
        ) : (
          <p className={styles.muted}>{t('theory.notFound')}</p>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { t } from '../i18n';
import { SECTIONS, type SectionId } from './sections';
import styles from './App.module.css';

/** Placeholder logo: a double-acting cylinder outline. */
function Logo() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--accent)"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="8" width="14" height="8" rx="1" />
      <path d="M9 8v8M9 12h13" />
      <path d="M5 16v3M13 16v3" />
    </svg>
  );
}

export function App() {
  const [active, setActive] = useState<SectionId>('editor');

  return (
    <div className={styles.app}>
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <div className={styles.logo}>
            <Logo />
          </div>
          <div>
            <div className={styles.brandName}>{t('app.name')}</div>
            <div className={styles.brandSub}>{t('app.tagline')}</div>
          </div>
        </div>
        <nav aria-label={t('menu.label')}>
          <ul className={styles.menu}>
            {SECTIONS.map((id) => (
              <li key={id}>
                <button
                  type="button"
                  className={styles.menuItem}
                  aria-current={active === id ? 'page' : undefined}
                  onClick={() => setActive(id)}
                >
                  {t(`menu.${id}`)}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main className={styles.main}>
        <div className={styles.sectionTitle}>
          <h1>{t(`menu.${active}`)}</h1>
          <span className={styles.rule} />
        </div>
        <div className={styles.card}>
          <div className={styles.empty}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <path d="M3 9h18" />
            </svg>
            <div className={styles.emptyTitle}>{t('section.emptyTitle')}</div>
            <p className={styles.emptyText}>{t('section.empty')}</p>
          </div>
        </div>
      </main>
    </div>
  );
}

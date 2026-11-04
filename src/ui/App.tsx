import { useState } from 'react';
import { t } from '../i18n';
import { SECTIONS, type SectionId } from './sections';
import styles from './App.module.css';

export function App() {
  const [active, setActive] = useState<SectionId>('editor');

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <span className={styles.brand}>{t('app.name')}</span>
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
        <h1>{t(`menu.${active}`)}</h1>
        <p className={styles.empty}>{t('section.empty')}</p>
      </main>
    </div>
  );
}

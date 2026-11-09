import { lazy, Suspense, useEffect } from 'react';
import { t } from '../i18n';
import { bootstrap } from '../storage/persistence';
import { BackupReminder } from './storage/BackupReminder';
import { useNav } from './navigation';
import { SECTIONS, type SectionId } from './sections';
import { Editor } from './editor/Editor';
import { SymbolGallery } from './symbols/SymbolGallery';
import { useHashRoute } from './useHashRoute';
import styles from './App.module.css';

// Theory (Markdown + KaTeX) is loaded only when the section is opened.
const TheoryPage = lazy(() =>
  import('./theory/TheoryPage').then((m) => ({ default: m.TheoryPage })),
);
const ProgressPage = lazy(() =>
  import('./progress/ProgressPage').then((m) => ({ default: m.ProgressPage })),
);
const ExercisesPage = lazy(() =>
  import('./exercises/ExercisesPage').then((m) => ({ default: m.ExercisesPage })),
);
const GeneratorPage = lazy(() =>
  import('./generator/GeneratorPage').then((m) => ({ default: m.GeneratorPage })),
);
const TemplatesPage = lazy(() =>
  import('./templates/TemplatesPage').then((m) => ({ default: m.TemplatesPage })),
);

/** Logo: an "A" drawn as orthogonal schematic lines, with ports and T-junction dots. */
function Logo() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--accent)"
      strokeWidth="1.9"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
    >
      <path d="M5 20V6h14v14" />
      <path d="M5 13h14" />
      <path d="M12 6V2.5" />
      <g fill="var(--accent)" stroke="none">
        <circle cx="5" cy="13" r="1.7" />
        <circle cx="19" cy="13" r="1.7" />
        <circle cx="12" cy="6" r="1.7" />
      </g>
      <g fill="var(--panel)" strokeWidth="1.5">
        <circle cx="5" cy="20.5" r="1.7" />
        <circle cx="19" cy="20.5" r="1.7" />
        <circle cx="12" cy="2.5" r="1.5" />
      </g>
    </svg>
  );
}

export function App() {
  const route = useHashRoute();
  return route === '/symbols' ? <SymbolGallery /> : <MainLayout />;
}

function MainLayout() {
  const active = useNav((s) => s.section);
  const setActive = useNav((s) => s.go);
  useEffect(() => {
    void bootstrap();
  }, []);

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
      <BackupReminder />
      {active === 'editor' ? (
        <main className={styles.editorMain}>
          <h1 className={styles.srOnly}>{t('menu.editor')}</h1>
          <Editor />
        </main>
      ) : active === 'theory' ? (
        <main className={styles.editorMain}>
          <h1 className={styles.srOnly}>{t('menu.theory')}</h1>
          <Suspense fallback={<p className={styles.loading}>{t('storage.status.loading')}</p>}>
            <TheoryPage />
          </Suspense>
        </main>
      ) : active === 'progress' ? (
        <main className={styles.main}>
          <div className={styles.sectionTitle}>
            <h1>{t('menu.progress')}</h1>
            <span className={styles.rule} />
          </div>
          <Suspense fallback={<p className={styles.loading}>{t('storage.status.loading')}</p>}>
            <ProgressPage />
          </Suspense>
        </main>
      ) : active === 'exercises' ? (
        <main className={styles.main}>
          <div className={styles.sectionTitle}>
            <h1>{t('menu.exercises')}</h1>
            <span className={styles.rule} />
          </div>
          <Suspense fallback={<p className={styles.loading}>{t('storage.status.loading')}</p>}>
            <ExercisesPage />
          </Suspense>
        </main>
      ) : active === 'generator' ? (
        <main className={styles.main}>
          <div className={styles.sectionTitle}>
            <h1>{t('menu.generator')}</h1>
            <span className={styles.rule} />
          </div>
          <Suspense fallback={<p className={styles.loading}>{t('storage.status.loading')}</p>}>
            <GeneratorPage />
          </Suspense>
        </main>
      ) : active === 'templates' ? (
        <main className={styles.main}>
          <div className={styles.sectionTitle}>
            <h1>{t('menu.templates')}</h1>
            <span className={styles.rule} />
          </div>
          <Suspense fallback={<p className={styles.loading}>{t('storage.status.loading')}</p>}>
            <TemplatesPage />
          </Suspense>
        </main>
      ) : (
        <SectionPlaceholder active={active} />
      )}
    </div>
  );
}

function SectionPlaceholder({ active }: { active: SectionId }) {
  return (
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
  );
}

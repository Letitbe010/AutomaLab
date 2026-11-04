import { Component, type ErrorInfo, type ReactNode } from 'react';
import { t } from '../i18n';
import styles from './ErrorBoundary.module.css';

interface State {
  error: Error | null;
}

/**
 * Shows a readable message with a reload button instead of a blank page when
 * rendering fails (e.g. stale modules after the dev server restarts).
 */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error(error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <div className={styles.page} role="alert">
        <div className={styles.card}>
          <h1>{t('error.title')}</h1>
          <p>{t('error.text')}</p>
          <code className={styles.detail}>{error.message}</code>
          <button type="button" className={styles.btn} onClick={() => window.location.reload()}>
            {t('error.reload')}
          </button>
          <p className={styles.hint}>{t('error.hint')}</p>
        </div>
      </div>
    );
  }
}

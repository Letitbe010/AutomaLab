import type { CSSProperties } from 'react';
import type { ComponentDef } from '../../core/componentDef';
import { componentHelp, componentName } from '../../components/text';
import { t } from '../../i18n';
import { Thumb } from '../editor/Thumb';
import styles from './HelpCard.module.css';

/**
 * Contextual help card (SPEC §7.4): symbol, name, function and ports.
 * "Teoria gehiago" links arrive with the theory section (phase 3).
 */
export function HelpCard({
  def,
  style,
  onClose,
  onTheory,
}: {
  def: ComponentDef<unknown>;
  style?: CSSProperties;
  onClose?: () => void;
  onTheory?: (theoryId: string) => void;
}) {
  const ports = def.ports.map((p) => p.id);
  return (
    <div className={styles.card} style={style} role="tooltip" data-testid="help-card">
      <div className={styles.head}>
        <Thumb def={def} className={styles.thumb} />
        <div className={styles.name}>{componentName(def)}</div>
        {onClose && (
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label={t('storage.close')}
          >
            ×
          </button>
        )}
      </div>
      {componentHelp(def) && <p className={styles.text}>{componentHelp(def)}</p>}
      {def.theoryRef && onTheory && (
        <button type="button" className={styles.theory} onClick={() => onTheory(def.theoryRef!)}>
          {t('theory.more')} →
        </button>
      )}
      {ports.length > 0 && (
        <div className={styles.ports}>
          {t('help.ports')}:{' '}
          {ports.map((p) => (
            <code key={p}>{p}</code>
          ))}
        </div>
      )}
    </div>
  );
}

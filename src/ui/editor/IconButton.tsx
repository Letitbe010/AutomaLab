import type { ReactNode } from 'react';
import styles from './Editor.module.css';

/** Icon-only tool button: the label is the accessible name, the shortcut goes in the tooltip. */
export function IconButton({
  label,
  shortcut,
  onClick,
  disabled = false,
  className = '',
  children,
}: {
  label: string;
  shortcut?: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string | undefined;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={`${styles.iconBtn} ${className}`}
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      title={shortcut ? `${label} (${shortcut})` : label}
    >
      {children}
    </button>
  );
}

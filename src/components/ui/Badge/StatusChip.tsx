import clsx from 'clsx';
import type { ReactNode } from 'react';

import styles from './Badge.module.css';

/** `brass` marks a premium tier (e.g. Gold members); the rest describe state. */
export type StatusTone = 'success' | 'warning' | 'danger' | 'muted' | 'solid' | 'brass';

interface StatusChipProps {
  tone: StatusTone;
  children: ReactNode;
  /** Hide the leading dot, e.g. when the chip sits next to its own icon. */
  hideDot?: boolean;
  size?: 'default' | 'compact';
  className?: string;
}

/** Colour is never the only signal: every chip carries a word. */
export function StatusChip({ tone, children, hideDot, size = 'default', className }: StatusChipProps) {
  return (
    <span className={clsx(styles.chip, styles[tone], size === 'compact' && styles.compact, className)}>
      {!hideDot && <span className={styles.dot} aria-hidden="true" />}
      {children}
    </span>
  );
}

import clsx from 'clsx';
import type { ReactNode } from 'react';

import styles from './UnsavedChangesBar.module.css';

interface UnsavedChangesBarProps {
  /** "2 unsaved changes to fare families" */
  title: string;
  description: string;
  /** Errors block saving: the dot turns Garnet. */
  hasErrors?: boolean;
  /** Usually Discard and the save action. */
  actions: ReactNode;
  /** Sticks to the bottom of the viewport while the page scrolls. */
  sticky?: boolean;
  className?: string;
}

/** Sits under edited settings until they are saved or discarded. */
export function UnsavedChangesBar({
  title,
  description,
  hasErrors = false,
  actions,
  sticky = false,
  className,
}: UnsavedChangesBarProps) {
  return (
    <div
      role="region"
      aria-label="Unsaved changes"
      className={clsx(styles.bar, sticky && styles.sticky, className)}
    >
      <span className={styles.summary}>
        <span aria-hidden="true" className={clsx(styles.dot, hasErrors && styles.dotError)} />
        <span className={styles.text}>
          <span className={styles.title}>{title}</span>
          <span className={styles.description}>{description}</span>
        </span>
      </span>
      <span className={styles.actions}>{actions}</span>
    </div>
  );
}

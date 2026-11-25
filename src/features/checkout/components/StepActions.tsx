import type { ReactNode } from 'react';
import { Link } from 'react-router';

import { Icon } from '@/components/icons';

import styles from './StepActions.module.css';

interface StepActionsProps {
  backTo: string;
  backLabel: string;
  /** Short status beside the main action, e.g. "Fix 2 issues to continue". */
  hint?: ReactNode;
  hintTone?: 'neutral' | 'success' | 'danger';
  /** The main action, usually a large primary button. */
  children: ReactNode;
}

/** Back link on the left, status and the main action on the right; wraps with the action first on phones. */
export function StepActions({ backTo, backLabel, hint, hintTone = 'neutral', children }: StepActionsProps) {
  return (
    <div className={styles.actions}>
      <Link to={backTo} className={styles.back}>
        <Icon name="chevronLeft" size={16} strokeWidth={1.8} />
        {backLabel}
      </Link>
      <div className={styles.forward}>
        {hint && (
          <span className={styles[hintTone]} role="status">
            {hint}
          </span>
        )}
        {children}
      </div>
    </div>
  );
}

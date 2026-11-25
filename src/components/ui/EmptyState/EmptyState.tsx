import clsx from 'clsx';
import type { ReactNode } from 'react';

import { Icon, type IconName } from '@/components/icons';

import styles from './EmptyState.module.css';

interface EmptyStateProps {
  icon?: IconName;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  variant?: 'dashed' | 'plain';
  /** Heading level of the title, so it fits the page outline. */
  headingLevel?: 2 | 3;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actions,
  variant = 'dashed',
  headingLevel = 2,
  className,
}: EmptyStateProps) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';

  return (
    <div className={clsx(styles.emptyState, variant === 'dashed' && styles.dashed, className)}>
      {icon && (
        <span className={styles.icon}>
          <Icon name={icon} size={22} />
        </span>
      )}
      <Heading className={styles.title}>{title}</Heading>
      {description && <p className={styles.description}>{description}</p>}
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  );
}

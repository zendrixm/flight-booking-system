import clsx from 'clsx';
import type { ReactNode } from 'react';

import { Breadcrumbs, type BreadcrumbItem } from '../Breadcrumbs';
import styles from './PageHeader.module.css';

interface PageHeaderProps {
  title: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  eyebrow?: ReactNode;
  description?: ReactNode;
  /** Buttons or filters aligned to the bottom-right of the title block. */
  actions?: ReactNode;
  variant?: 'site' | 'console';
  className?: string;
}

/** Breadcrumb 8px above the title, title 8px above the description. */
export function PageHeader({
  title,
  breadcrumbs,
  eyebrow,
  description,
  actions,
  variant = 'site',
  className,
}: PageHeaderProps) {
  return (
    <header className={clsx(styles.header, variant === 'console' && styles.console, className)}>
      <div className={styles.titles}>
        {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
        {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
        <h1 className={styles.title}>{title}</h1>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </header>
  );
}

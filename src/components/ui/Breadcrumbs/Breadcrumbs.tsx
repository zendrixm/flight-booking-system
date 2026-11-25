import clsx from 'clsx';
import { Link } from 'react-router';

import { Icon } from '@/components/icons';

import styles from './Breadcrumbs.module.css';

export interface BreadcrumbItem {
  label: string;
  /** Omit for the current page (always the last item). */
  to?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  surface?: 'light' | 'dark';
  className?: string;
}

/** Sits 8px above every inner-page title. */
export function Breadcrumbs({ items, surface = 'light', className }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className={clsx(styles.list, surface === 'dark' && styles.dark)}>
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;
          return (
            <li key={item.label} className={styles.item}>
              {isCurrent || !item.to ? (
                <span
                  className={isCurrent ? styles.current : undefined}
                  aria-current={isCurrent ? 'page' : undefined}
                >
                  {item.label}
                </span>
              ) : (
                <Link className={styles.link} to={item.to}>
                  {item.label}
                </Link>
              )}
              {!isCurrent && <Icon name="chevronRight" size={14} strokeWidth={1.8} />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

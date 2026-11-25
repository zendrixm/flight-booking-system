import type { ReactNode } from 'react';

import { Icon, type IconName } from '@/components/icons';

import styles from './ExtrasSection.module.css';

interface ExtrasSectionProps {
  id: string;
  icon?: IconName;
  title: string;
  description?: ReactNode;
  /** Right-aligned note beside the heading, e.g. what's already included. */
  badge?: ReactNode;
  children: ReactNode;
}

/** A bordered card with an icon tile, a heading and its content. */
export function ExtrasSection({ id, icon, title, description, badge, children }: ExtrasSectionProps) {
  return (
    <section className={styles.section} aria-labelledby={id}>
      <div className={styles.header}>
        <div className={styles.heading}>
          {icon && (
            <span className={styles.iconTile}>
              <Icon name={icon} size={22} />
            </span>
          )}
          <div className={styles.headingText}>
            <h2 id={id} className={styles.title}>
              {title}
            </h2>
            {description && <p className={styles.description}>{description}</p>}
          </div>
        </div>
        {badge}
      </div>
      {children}
    </section>
  );
}

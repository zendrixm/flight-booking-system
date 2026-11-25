import clsx from 'clsx';
import type { ReactNode } from 'react';

import { Icon, type IconName } from '@/components/icons';

import styles from './AuthHeading.module.css';

export type AuthBadgeTone = 'attention' | 'success' | 'danger';

interface AuthHeadingProps {
  title: ReactNode;
  subtitle: ReactNode;
  badge?: { icon: IconName; tone: AuthBadgeTone };
}

export function AuthHeading({ title, subtitle, badge }: AuthHeadingProps) {
  return (
    <div className={styles.heading}>
      {badge && (
        <span className={clsx(styles.badge, styles[badge.tone])} aria-hidden="true">
          <Icon name={badge.icon} size={26} strokeWidth={badge.tone === 'success' ? 2.2 : 1.6} />
        </span>
      )}
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.subtitle}>{subtitle}</p>
    </div>
  );
}

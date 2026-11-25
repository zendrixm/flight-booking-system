import clsx from 'clsx';
import type { ReactNode } from 'react';

import { Icon, type IconName } from '@/components/icons';

import styles from './LoginSteps.module.css';

interface LoginHeadingProps {
  title: string;
  children: ReactNode;
  badge?: { icon: IconName; tone: 'attention' | 'danger' | 'success' };
  /** Announce the heading and text, e.g. on a lock-out or success screen. */
  role?: 'status' | 'alert';
}

export function LoginHeading({ title, children, badge, role }: LoginHeadingProps) {
  return (
    <>
      {badge && (
        <span className={clsx(styles.badge, styles[badge.tone])} aria-hidden="true">
          <Icon
            name={badge.icon}
            size={badge.tone === 'success' ? 22 : 20}
            strokeWidth={badge.tone === 'success' ? 2.2 : 1.8}
          />
        </span>
      )}
      <div className={styles.heading} role={role}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.subtitle}>{children}</p>
      </div>
    </>
  );
}

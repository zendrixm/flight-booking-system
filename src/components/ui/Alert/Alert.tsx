import clsx from 'clsx';
import type { ReactNode } from 'react';

import { Icon, type IconName } from '@/components/icons';

import styles from './Alert.module.css';

export type AlertTone = 'info' | 'attention' | 'success' | 'danger';

const DEFAULT_ICON: Record<AlertTone, IconName> = {
  info: 'info',
  attention: 'clock',
  success: 'checkCircle',
  danger: 'alertCircle',
};

interface AlertProps {
  tone?: AlertTone;
  title?: ReactNode;
  children?: ReactNode;
  icon?: IconName | null;
  action?: ReactNode;
  /** Announce changes politely (`status`) or immediately (`alert`). Omit for static messages. */
  role?: 'status' | 'alert';
  className?: string;
}

/** An inline message that belongs to the page, e.g. a held fare or a declined card. */
export function Alert({ tone = 'info', title, children, icon, action, role, className }: AlertProps) {
  const iconName = icon === undefined ? DEFAULT_ICON[tone] : icon;

  return (
    <div role={role} className={clsx(styles.alert, styles[tone], className)}>
      {iconName && <Icon name={iconName} size={16} strokeWidth={1.8} className={styles.icon} />}
      <div className={styles.body}>
        {title && <span className={styles.title}>{title}</span>}
        {children}
      </div>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}

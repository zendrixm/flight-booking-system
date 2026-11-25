import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';

import { paths } from '@/app/paths';
import { Icon } from '@/components/icons';
import { Popover, StatusChip, type StatusTone } from '@/components/ui';
import { listConsoleNotifications, markAllNotificationsRead } from '@/services/console/consoleShellService';
import type { ConsoleArea, ConsoleNotification } from '@/types/console/notification';

import styles from './NotificationBell.module.css';

const AREA_LABEL: Record<ConsoleArea, string> = {
  bookings: 'Bookings',
  flights: 'Flights',
  refunds: 'Refunds',
  pricing: 'Pricing',
  customers: 'Customers',
  users: 'Users',
  settings: 'Settings',
};

const SEVERITY_TONE: Record<ConsoleNotification['severity'], StatusTone> = {
  critical: 'danger',
  warning: 'warning',
  info: 'muted',
};

const AREA_PATH: Record<ConsoleArea, string> = {
  bookings: paths.console.bookings,
  flights: paths.console.flights,
  refunds: paths.console.refunds,
  pricing: paths.console.pricing,
  customers: paths.console.customers,
  users: paths.console.users,
  settings: paths.console.settings,
};

/** The bell in the console app bar: the last 24 hours of operational alerts. */
export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<ConsoleNotification[]>([]);

  useEffect(() => {
    let isCurrent = true;
    listConsoleNotifications().then((loaded) => {
      if (isCurrent) setNotifications(loaded);
    });
    return () => {
      isCurrent = false;
    };
  }, []);

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      align="end"
      width={380}
      label="Notifications"
      panelClassName={styles.panel}
      trigger={(triggerProps) => (
        <button
          {...triggerProps}
          type="button"
          className={styles.bell}
          aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : 'Notifications, all read'}
        >
          <Icon name="bell" size={18} />
          {unreadCount > 0 && <span className={styles.unreadDot} aria-hidden="true" />}
        </button>
      )}
    >
      <div className={styles.header}>
        <span className={styles.headerText}>
          <span className={styles.title}>Notifications</span>
          <span className={styles.summary}>
            {unreadCount ? `${unreadCount} unread` : 'You’re all caught up'}
          </span>
        </span>
        <button
          type="button"
          className={styles.markAll}
          disabled={unreadCount === 0}
          onClick={async () => setNotifications(await markAllNotificationsRead())}
        >
          Mark all as read
        </button>
      </div>
      <ul className={styles.list}>
        {notifications.map((notification) => (
          <li key={notification.id}>
            <Link
              to={AREA_PATH[notification.area]}
              className={clsx(styles.item, !notification.isRead && styles.unread)}
              onClick={() => setOpen(false)}
            >
              <span className={styles.itemDot} aria-hidden="true" />
              <span className={styles.itemText}>
                <span className={styles.itemTitle}>
                  {!notification.isRead && <span className="visually-hidden">Unread: </span>}
                  {notification.title}
                </span>
                <span className={styles.itemBody}>{notification.body}</span>
                <span className={styles.itemTime}>{notification.timeLabel}</span>
              </span>
              <StatusChip tone={SEVERITY_TONE[notification.severity]} hideDot size="compact">
                {AREA_LABEL[notification.area]}
              </StatusChip>
            </Link>
          </li>
        ))}
      </ul>
      <div className={styles.footer}>
        <span>Showing the last 24 hours</span>
        <Link
          to={paths.console.settingsTab('notifications')}
          className={styles.settingsLink}
          onClick={() => setOpen(false)}
        >
          Notification settings
        </Link>
      </div>
    </Popover>
  );
}

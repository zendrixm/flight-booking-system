export type ConsoleArea = 'bookings' | 'flights' | 'refunds' | 'pricing' | 'customers' | 'users' | 'settings';

export interface ConsoleNotification {
  id: string;
  title: string;
  body: string;
  /** "6 min ago", "Yesterday, 17:42" */
  timeLabel: string;
  area: ConsoleArea;
  severity: 'critical' | 'warning' | 'info';
  isRead: boolean;
}

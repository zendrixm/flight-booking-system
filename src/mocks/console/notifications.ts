import type { ConsoleNotification } from '@/types/console/notification';

export const CONSOLE_NOTIFICATIONS: readonly ConsoleNotification[] = [
  {
    id: 'n1',
    title: 'PQ 117 delayed 2h 10m',
    body: 'HND → MNL · new ETA 14:50 · travelers notified',
    timeLabel: '6 min ago',
    area: 'flights',
    severity: 'critical',
    isRead: false,
  },
  {
    id: 'n2',
    title: 'SJ 806 cancelled by the airline',
    body: '46 Vela travelers rebooked on SJ 808',
    timeLabel: '38 min ago',
    area: 'flights',
    severity: 'critical',
    isRead: false,
  },
  {
    id: 'n3',
    title: '3 refunds are past the service target',
    body: '12 waiting for review in Philippines',
    timeLabel: '1 h ago',
    area: 'refunds',
    severity: 'warning',
    isRead: false,
  },
  {
    id: 'n4',
    title: 'Mika Tan hasn’t accepted her invite',
    body: 'Support agent · invite sent 7 Oct, expires in 5 days',
    timeLabel: 'Yesterday, 17:42',
    area: 'users',
    severity: 'info',
    isRead: false,
  },
];

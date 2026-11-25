import { paths } from '@/app/paths';
import type { IconName } from '@/components/icons';
import type { ConsoleNavCounts } from '@/types/console/staff';

export type ConsoleSection =
  'dashboard' | 'bookings' | 'flights' | 'refunds' | 'pricing' | 'customers' | 'users' | 'settings';

export interface ConsoleNavItem {
  id: ConsoleSection;
  label: string;
  icon: IconName;
  to: string;
  /** Which count to show, and the words read after it ("18 need action"). */
  count?: { key: keyof ConsoleNavCounts; label: string; isUrgent?: boolean };
}

export interface ConsoleNavGroup {
  label: string;
  items: ConsoleNavItem[];
}

export const CONSOLE_NAV_GROUPS: readonly ConsoleNavGroup[] = [
  {
    label: 'Overview',
    items: [{ id: 'dashboard', label: 'Dashboard', icon: 'layoutGrid', to: paths.console.dashboard }],
  },
  {
    label: 'Operations',
    items: [
      {
        id: 'bookings',
        label: 'Bookings',
        icon: 'ticket',
        to: paths.console.bookings,
        count: { key: 'bookingsNeedingAction', label: 'need action' },
      },
      {
        id: 'flights',
        label: 'Flight operations',
        icon: 'plane',
        to: paths.console.flights,
        count: { key: 'flightDisruptions', label: 'disruptions', isUrgent: true },
      },
      {
        id: 'refunds',
        label: 'Refunds',
        icon: 'rotateCcw',
        to: paths.console.refunds,
        count: { key: 'refundsToReview', label: 'to review' },
      },
    ],
  },
  {
    label: 'Commercial',
    items: [
      { id: 'pricing', label: 'Pricing & promotions', icon: 'tag', to: paths.console.pricing },
      { id: 'customers', label: 'Customers', icon: 'users', to: paths.console.customers },
    ],
  },
  {
    label: 'Governance',
    items: [
      { id: 'users', label: 'Users & roles', icon: 'shield', to: paths.console.users },
      { id: 'settings', label: 'Settings', icon: 'sliders', to: paths.console.settings },
    ],
  },
];

/** The breadcrumb parent of each section, e.g. Operations › Bookings. */
export function navGroupOf(section: ConsoleSection): ConsoleNavGroup | undefined {
  return CONSOLE_NAV_GROUPS.find((group) => group.items.some((item) => item.id === section));
}

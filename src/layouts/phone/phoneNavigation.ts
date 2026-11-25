import { paths } from '@/app/paths';
import type { IconName } from '@/components/icons';

export interface PhoneTab {
  label: string;
  to: string;
  icon: IconName;
}

/** The phone app's bottom tab bar, left to right. */
export const PHONE_TABS: readonly PhoneTab[] = [
  { label: 'Search', to: paths.phone.search, icon: 'search' },
  { label: 'Trips', to: paths.phone.trips, icon: 'ticket' },
  { label: 'Alerts', to: paths.phone.alerts, icon: 'bell' },
  { label: 'Account', to: paths.phone.account, icon: 'user' },
];

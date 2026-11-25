import type { AlertNotificationSettings, PriceAlert, WatchSuggestion } from '@/types/priceAlert';

export const PRICE_ALERTS: readonly PriceAlert[] = [
  {
    id: 'alert_mnl_icn',
    from: 'MNL',
    to: 'ICN',
    departDate: null,
    returnDate: null,
    datesLabel: 'Any week in December',
    travelersLabel: '1 adult · Economy',
    mode: 'below',
    targetPrice: 11500,
    watchNearbyDates: true,
    channels: { email: true, push: false },
    priceHistory: [12900, 12760, 12850, 12620, 12480, 12560, 12420, 12340, 11720, 11240],
    lastCheckedOn: '2026-10-09',
    isPaused: false,
    statusNote: 'Checked today, 4:00 AM',
  },
  {
    id: 'alert_mnl_tpe',
    from: 'MNL',
    to: 'TPE',
    departDate: '2027-01-15',
    returnDate: '2027-01-19',
    datesLabel: '15 – 19 Jan 2027',
    travelersLabel: '2 adults · Economy',
    mode: 'below',
    targetPrice: 6500,
    watchNearbyDates: false,
    channels: { email: true, push: false },
    priceHistory: [7620, 7480, 7550, 7480, 7700, 7580, 7520, 7480, 7480, 7480],
    lastCheckedOn: '2026-10-09',
    isPaused: false,
    statusNote: 'Checked today, 4:00 AM',
  },
  {
    id: 'alert_mnl_sin',
    from: 'MNL',
    to: 'SIN',
    departDate: null,
    returnDate: null,
    datesLabel: 'Flexible · February 2027',
    travelersLabel: '1 adult · Premium economy',
    mode: 'below',
    targetPrice: 9000,
    watchNearbyDates: true,
    channels: { email: true, push: false },
    priceHistory: [10420, 10200, 10380, 10150, 9980, 10060, 9900, 9860, 9940, 9860],
    lastCheckedOn: '2026-10-03',
    isPaused: true,
    statusNote: 'Paused 3 Oct · last fare shown is from then',
  },
];

export const WATCH_SUGGESTIONS: readonly WatchSuggestion[] = [
  { from: 'MNL', to: 'CEB', lowestFare: 2180 },
  { from: 'MNL', to: 'BKK', lowestFare: 6950 },
  { from: 'MNL', to: 'HKG', lowestFare: 5420 },
];

export const ALERT_NOTIFICATION_SETTINGS: AlertNotificationSettings = {
  email: true,
  sms: false,
  push: false,
  frequency: 'instant',
  quietHours: true,
};

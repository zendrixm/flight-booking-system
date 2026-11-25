import type { IsoDate } from '@/lib/date';

/** "drop": any fall in the lowest fare. "below": only when it goes under `targetPrice`. */
export type PriceAlertMode = 'drop' | 'below';

export interface PriceAlertChannels {
  email: boolean;
  push: boolean;
}

export interface PriceAlert {
  id: string;
  from: string;
  to: string;
  /** Set when the alert watches exact dates; flexible alerts only have a label. */
  departDate: IsoDate | null;
  returnDate: IsoDate | null;
  /** "15 – 19 Jan 2027", "Any week in December". */
  datesLabel: string;
  /** "2 adults · Economy". */
  travelersLabel: string;
  mode: PriceAlertMode;
  targetPrice: number | null;
  watchNearbyDates: boolean;
  channels: PriceAlertChannels;
  /**
   * Lowest fare per traveler over the last 30 days, oldest first, one point every
   * `PRICE_HISTORY_INTERVAL_DAYS`, ending on `lastCheckedOn`.
   */
  priceHistory: number[];
  lastCheckedOn: IsoDate;
  isPaused: boolean;
  /** "Checked today, 4:00 AM". */
  statusNote: string;
}

export const PRICE_HISTORY_INTERVAL_DAYS = 3;

/** A route suggested from past trips, with the lowest round-trip fare over the next 3 months. */
export interface WatchSuggestion {
  from: string;
  to: string;
  lowestFare: number;
}

export type AlertFrequency = 'instant' | 'daily' | 'weekly';

export interface AlertNotificationSettings {
  email: boolean;
  sms: boolean;
  /** Push needs the phone app; it can't be switched on from the website. */
  push: boolean;
  frequency: AlertFrequency;
  /** No texts or pushes from 10 PM to 7 AM Manila time. */
  quietHours: boolean;
}

export interface NewPriceAlert {
  from: string;
  to: string;
  departDate: IsoDate | null;
  returnDate: IsoDate | null;
  datesLabel: string;
  travelersLabel: string;
  mode: PriceAlertMode;
  targetPrice: number | null;
  watchNearbyDates: boolean;
  channels: PriceAlertChannels;
}

import { formatDayMonth, formatDayRange } from '@/lib/date';
import { formatPeso } from '@/lib/format';
import type { FlightSearchParams } from '@/types/flight';
import type { NewPriceAlert, PriceAlertMode } from '@/types/priceAlert';

import { travelersLabel } from './searchForm';

export interface TrackPricesForm {
  mode: PriceAlertMode;
  /** As typed: digits and thousands separators only. */
  targetInput: string;
  watchNearbyDates: boolean;
  notifyByEmail: boolean;
  notifyByPush: boolean;
}

export type TrackPricesErrors = Partial<Record<'target' | 'channels', string>>;

export const INITIAL_TRACK_PRICES_FORM: TrackPricesForm = {
  mode: 'drop',
  targetInput: '',
  watchNearbyDates: true,
  notifyByEmail: true,
  notifyByPush: false,
};

/** Lowest believable fare on these routes; targets under it are almost certainly typos. */
const MIN_REALISTIC_TARGET = 5000;
const SUGGESTED_TARGET = 9000;

/** Keeps only digits and commas while typing a peso amount. */
export function sanitizeAmountInput(value: string): string {
  return value.replace(/[^\d,]/g, '');
}

export function parseAmount(value: string): number {
  return Number(value.replace(/\D/g, ''));
}

export function getTrackPricesErrors(form: TrackPricesForm, lowestFare: number): TrackPricesErrors {
  const errors: TrackPricesErrors = {};
  if (form.mode === 'below') {
    const target = parseAmount(form.targetInput);
    if (!target) errors.target = 'Enter a target price per traveler.';
    else if (target >= lowestFare)
      errors.target = `Set a target below today’s lowest fare of ${formatPeso(lowestFare)}.`;
    else if (target < MIN_REALISTIC_TARGET)
      errors.target = `That’s lower than any fare we’ve seen on this route. Try ${formatPeso(SUGGESTED_TARGET)} or more.`;
  }
  if (!form.notifyByEmail && !form.notifyByPush) {
    errors.channels = 'Choose at least one way for us to reach you.';
  }
  return errors;
}

/** The alert request for tracking a search, shared by the website and the phone app. */
export function priceAlertForSearch(search: FlightSearchParams, form: TrackPricesForm): NewPriceAlert {
  return {
    from: search.from,
    to: search.to,
    departDate: search.departDate,
    returnDate: search.returnDate,
    datesLabel: search.returnDate
      ? formatDayRange(search.departDate, search.returnDate)
      : formatDayMonth(search.departDate),
    travelersLabel: travelersLabel(search),
    mode: form.mode,
    targetPrice: form.mode === 'below' ? parseAmount(form.targetInput) : null,
    watchNearbyDates: form.watchNearbyDates,
    channels: { email: form.notifyByEmail, push: form.notifyByPush },
  };
}

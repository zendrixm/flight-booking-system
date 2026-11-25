import { findAirport } from '@/data/airports';
import type { NewPriceAlert, PriceAlert } from '@/types/priceAlert';

/** Alerts made in the app always watch from the phone's home airport. */
export const HOME_AIRPORT = 'MNL';

export const ALERT_DESTINATIONS = ['HND', 'KIX', 'ICN', 'TPE', 'SIN', 'HKG', 'BKK', 'CEB'] as const;

export const ALERT_DATE_OPTIONS = [
  'Any dates · next 3 months',
  'Any week in December',
  'January 2027',
  'February 2027',
] as const;

export const ALERT_TRAVELER_OPTIONS = ['1 adult', '2 adults', '2 adults, 1 child'] as const;

export interface NewAlertForm {
  to: string;
  datesLabel: (typeof ALERT_DATE_OPTIONS)[number];
  travelers: (typeof ALERT_TRAVELER_OPTIONS)[number];
  /** As typed; validated on create. Empty means "tell me about big drops". */
  targetInput: string;
  emailToo: boolean;
}

export const INITIAL_NEW_ALERT_FORM: NewAlertForm = {
  to: '',
  datesLabel: ALERT_DATE_OPTIONS[0],
  travelers: ALERT_TRAVELER_OPTIONS[0],
  targetInput: '',
  emailToo: true,
};

export type NewAlertErrors = Partial<Record<'to' | 'target', string>>;

function targetDigits(input: string): string {
  return input.replace(/[,\s₱]/g, '');
}

export function newAlertErrors(form: NewAlertForm, existing: readonly PriceAlert[]): NewAlertErrors {
  const errors: NewAlertErrors = {};
  if (!form.to) {
    errors.to = 'Choose where you want to go.';
  } else if (existing.some((alert) => alert.from === HOME_AIRPORT && alert.to === form.to)) {
    errors.to = `You’re already watching Manila → ${findAirport(form.to)?.city ?? form.to}.`;
  }
  const digits = targetDigits(form.targetInput);
  if (digits && !/^\d+$/.test(digits)) errors.target = 'Enter a whole amount in pesos, like 9,500.';
  return errors;
}

/** The request for a valid form. Push is always on: it's the app. */
export function toNewPriceAlert(form: NewAlertForm): NewPriceAlert {
  const digits = targetDigits(form.targetInput);
  const targetPrice = digits ? Number(digits) : null;
  return {
    from: HOME_AIRPORT,
    to: form.to,
    departDate: null,
    returnDate: null,
    datesLabel: form.datesLabel,
    travelersLabel: `${form.travelers} · Economy`,
    mode: targetPrice === null ? 'drop' : 'below',
    targetPrice,
    watchNearbyDates: true,
    channels: { push: true, email: form.emailToo },
  };
}

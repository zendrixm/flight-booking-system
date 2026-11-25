import { DEMO_TODAY } from '@/config/demo';
import { addMonths, formatShortDate } from '@/lib/date';
import { formatPeso } from '@/lib/format';

/** Credits above this need Finance; staff can issue up to it themselves. */
export const MAX_STAFF_CREDIT = 20_000;
export const MIN_CREDIT = 100;

/** Why a travel credit amount can't be issued, or null. Shared by the form and the server. */
export function travelCreditAmountError(amount: number): string | null {
  if (!Number.isFinite(amount) || amount <= 0) return 'Enter an amount.';
  if (!Number.isInteger(amount)) return 'Use whole pesos, e.g. 1,500.';
  if (amount < MIN_CREDIT) return `The smallest credit is ${formatPeso(MIN_CREDIT)}.`;
  if (amount > MAX_STAFF_CREDIT) {
    return `Over ${formatPeso(MAX_STAFF_CREDIT)} needs Finance approval — issue up to ${formatPeso(MAX_STAFF_CREDIT)} here.`;
  }
  return null;
}

/** "9 Oct 2027" for a credit issued today. */
export function creditExpiryDate(validForMonths: number): string {
  return formatShortDate(addMonths(DEMO_TODAY, validForMonths));
}

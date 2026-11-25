import { formatPeso } from '@/lib/format';
import { creditExpiryDate, travelCreditAmountError } from '@/services/console/customerRules';
import {
  TRAVEL_CREDIT_REASONS,
  type TravelCreditReason,
  type TravelCreditRequest,
} from '@/types/console/customer';

export interface TravelCreditFormValues {
  amount: string;
  reason: TravelCreditReason;
  validForMonths: TravelCreditRequest['validForMonths'];
  message: string;
}

export const VALIDITY_OPTIONS: ReadonlyArray<{
  value: TravelCreditRequest['validForMonths'];
  label: string;
}> = [
  { value: 6, label: '6 months' },
  { value: 12, label: '12 months' },
  { value: 24, label: '24 months' },
];

export const INITIAL_CREDIT_VALUES: TravelCreditFormValues = {
  amount: '',
  reason: TRAVEL_CREDIT_REASONS[0],
  validForMonths: 12,
  message: '',
};

const AMOUNT_TEXT = /^[\d,\s]+$/;

/** Pesos typed as "1,500"; NaN when the text isn't a number. */
export function parseCreditAmount(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return AMOUNT_TEXT.test(trimmed) ? Number(trimmed.replace(/[,\s]/g, '')) : Number.NaN;
}

export function creditAmountError(text: string): string | null {
  const amount = parseCreditAmount(text);
  if (Number.isNaN(amount)) return 'Use numbers only, e.g. 1,500.';
  return travelCreditAmountError(amount);
}

export function creditSummary(values: TravelCreditFormValues, currentBalance: number) {
  const amount = creditAmountError(values.amount) ? 0 : parseCreditAmount(values.amount);
  return {
    newBalance: formatPeso(currentBalance + amount),
    expires: creditExpiryDate(values.validForMonths),
    submitLabel: amount ? `Issue ${formatPeso(amount)}` : 'Issue credit',
  };
}

export function toCreditRequest(values: TravelCreditFormValues): TravelCreditRequest {
  return {
    amount: parseCreditAmount(values.amount),
    reason: values.reason,
    validForMonths: values.validForMonths,
    message: values.message.trim(),
  };
}

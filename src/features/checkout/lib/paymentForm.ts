import { MONTHS_SHORT } from '@/lib/date';
import {
  detectCardBrand,
  digitsOnly,
  isCardExpiryValid,
  isValidCardNumber,
  isValidSecurityCode,
} from '@/lib/validation';
import type { PaymentMethodKind } from '@/types/payment';

export interface NewCardForm {
  holderName: string;
  number: string;
  /** "MM / YY" */
  expiry: string;
  securityCode: string;
  billingCountry: string;
  saveToAccount: boolean;
}

export type NewCardField = 'holderName' | 'number' | 'expiry' | 'securityCode';
export type NewCardErrors = Partial<Record<NewCardField, string>>;

export const EMPTY_NEW_CARD: NewCardForm = {
  holderName: '',
  number: '',
  expiry: '',
  securityCode: '',
  billingCountry: 'Philippines',
  saveToAccount: true,
};

export interface PaymentChoice {
  method: PaymentMethodKind;
  /** `saved` uses the default card; `new` uses the card form. */
  cardSource: 'saved' | 'new';
  walletId: string;
  bankId: string | null;
}

const EXPIRY_PATTERN = /^(\d{2})\s*\/\s*(\d{2})$/;

/** An expiry that is well-formed but already in the past, e.g. "09 / 26" in October 2026. */
export function expiredMonthLabel(expiry: string, today: { year: number; month: number }): string | null {
  const match = EXPIRY_PATTERN.exec(expiry);
  if (!match || isCardExpiryValid(expiry, today)) return null;
  const month = Number(match[1]);
  if (month < 1 || month > 12) return null;
  return `${MONTHS_SHORT[month - 1]} 20${match[2]}`;
}

/**
 * Errors for the new-card form. An expired card is reported straight away; everything else
 * waits until the person tries to pay (`showAll`).
 */
export function getNewCardErrors(
  form: NewCardForm,
  today: { year: number; month: number },
  showAll: boolean,
): NewCardErrors {
  const errors: NewCardErrors = {};
  const digits = digitsOnly(form.number);
  const expired = expiredMonthLabel(form.expiry, today);

  if (expired) errors.expiry = `This card expired in ${expired}. Try a card that’s still valid.`;
  if (!showAll) return errors;

  if (!form.holderName.trim()) errors.holderName = 'Enter the name exactly as it’s printed on the card.';
  if (!digits) errors.number = 'Enter your card number.';
  else if (digits.length < 15) errors.number = 'That number looks too short — check all 16 digits.';
  else if (!isValidCardNumber(digits))
    errors.number = 'Check the card number — one of the digits looks wrong.';
  if (!expired && !EXPIRY_PATTERN.test(form.expiry)) {
    errors.expiry = form.expiry ? 'Enter the expiry as MM / YY.' : 'Enter the expiry date.';
  }
  if (!isValidSecurityCode(form.securityCode, detectCardBrand(digits))) {
    errors.securityCode = 'Enter the 3-digit code on the back of the card.';
  }
  return errors;
}

export function isNewCardComplete(form: NewCardForm, today: { year: number; month: number }): boolean {
  return Object.keys(getNewCardErrors(form, today, true)).length === 0;
}

export const FARE_RULES: ReadonlyArray<{ topic: string; rule: string }> = [
  { topic: 'Baggage', rule: 'Personal item and 7 kg carry-on, plus 1 checked bag of 23 kg each way' },
  { topic: 'Seats', rule: 'Standard seat selection included; extra legroom from ₱1,150' },
  { topic: 'Changes', rule: '₱2,500 per traveler plus any fare difference, up to 3 hours before departure' },
  { topic: 'Cancellation', rule: 'Non-refundable. Unused taxes and add-ons are returned to your card' },
  { topic: 'Name corrections', rule: 'Up to 3 letters free within 24 hours of booking' },
  { topic: 'No-show', rule: 'If you miss the outbound flight, the return is cancelled automatically' },
];

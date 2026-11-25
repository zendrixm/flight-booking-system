import { MONTHS_SHORT } from '@/lib/date';
import {
  detectCardBrand,
  digitsOnly,
  isCardExpiryValid,
  isValidCardNumber,
  isValidSecurityCode,
  isValidTin,
} from '@/lib/validation';
import type { BillingAddress, CompanyBillingDetails, SavedCard } from '@/types/payment';

type MonthOfYear = { year: number; month: number };

/** A saved card's "08/29" expiry has passed. */
export function isSavedCardExpired(card: Pick<SavedCard, 'expiry'>, today: MonthOfYear): boolean {
  return !isCardExpiryValid(card.expiry.replace('/', ' / '), today);
}

// ---------- New card ----------

export interface NewCardDraft {
  holderName: string;
  number: string;
  /** "MM / YY" */
  expiry: string;
  securityCode: string;
  makeDefault: boolean;
}

export type NewCardDraftErrors = Partial<Record<'holderName' | 'number' | 'expiry' | 'securityCode', string>>;

const EXPIRY_PATTERN = /^(0[1-9]|1[0-2])\s*\/\s*(\d{2})$/;

/**
 * An expired card is flagged as soon as the expiry is complete; every other problem waits
 * for a save attempt (`showAll`).
 */
export function newCardErrors(draft: NewCardDraft, today: MonthOfYear, showAll: boolean): NewCardDraftErrors {
  const errors: NewCardDraftErrors = {};
  const digits = digitsOnly(draft.number);
  const isWellFormedExpiry = EXPIRY_PATTERN.test(draft.expiry.trim());

  if (isWellFormedExpiry && !isCardExpiryValid(draft.expiry, today)) {
    errors.expiry = `This card has expired. Use a card that’s valid after ${MONTHS_SHORT[today.month - 1]} ${today.year}.`;
  }
  if (!showAll) return errors;

  if (!draft.holderName.trim()) errors.holderName = 'Enter the name exactly as it’s printed on the card.';
  if (digits.length < 15) errors.number = 'Enter the full card number — 16 digits (15 for Amex).';
  else if (!isValidCardNumber(digits))
    errors.number = 'That card number isn’t valid. Check it against your card.';
  if (!isWellFormedExpiry) errors.expiry = 'Enter the expiry as MM / YY, like 08 / 29.';
  if (!isValidSecurityCode(draft.securityCode, detectCardBrand(digits))) {
    errors.securityCode = 'Enter the 3 digits on the back (4 on the front for Amex).';
  }
  return errors;
}

// ---------- Billing address ----------

export type BillingAddressErrors = Partial<Record<keyof BillingAddress, string>>;

export function billingAddressErrors(address: BillingAddress): BillingAddressErrors {
  const errors: BillingAddressErrors = {};
  const postalCode = address.postalCode.trim();
  if (!address.line1.trim()) errors.line1 = 'Enter the street address your bank has on file.';
  if (!address.city.trim()) errors.city = 'Enter a city.';
  if (address.country === 'Philippines' ? !/^\d{4}$/.test(postalCode) : postalCode.length < 3) {
    errors.postalCode =
      address.country === 'Philippines'
        ? 'Philippine postal codes have 4 digits, like 1200.'
        : 'Enter a postal code.';
  }
  return errors;
}

// ---------- Company details on receipts ----------

export type CompanyDetailsErrors = Partial<Record<keyof CompanyBillingDetails, string>>;

const MIN_ADDRESS_LENGTH = 10;

export function companyDetailsErrors(company: CompanyBillingDetails): CompanyDetailsErrors {
  const errors: CompanyDetailsErrors = {};
  if (!company.name.trim()) errors.name = 'Enter the name as registered with the BIR.';
  if (!isValidTin(company.tin)) {
    errors.tin = 'A TIN has 9 digits plus a 3–5 digit branch code, like 123-456-789-00000.';
  }
  if (company.address.trim().length < MIN_ADDRESS_LENGTH) {
    errors.address = 'Enter the address on the company’s BIR certificate.';
  }
  return errors;
}

// ---------- E-wallet ----------

/** 10 digits after +63, e.g. "917 482 4567". */
export function isWalletNumberComplete(value: string): boolean {
  return digitsOnly(value).length === 10;
}

function localMobileDigits(value: string): string {
  return digitsOnly(value).replace(/^63/, '');
}

/** "+63 917 ••• 4567", for the person confirming which phone a request went to. */
export function partlyMaskMobileNumber(value: string): string {
  const digits = localMobileDigits(value);
  return `+63 ${digits.slice(0, 3)} ••• ${digits.slice(-4)}`;
}

/** "+63 ••• ••• 4567", for numbers shown at rest. */
export function maskMobileNumber(value: string): string {
  return `+63 ••• ••• ${localMobileDigits(value).slice(-4)}`;
}

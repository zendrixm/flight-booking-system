/** Field validators. Each returns true when the value is acceptable. */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const BOOKING_REFERENCE_PATTERN = /^[A-Z0-9]{6}$/;
const PHILIPPINE_PASSPORT_PATTERN = /^[A-Z]\d{7}[A-Z]$/;
const GENERIC_PASSPORT_PATTERN = /^[A-Z0-9]{7,9}$/;

export function isBlank(value: string | null | undefined): boolean {
  return !value || value.trim().length === 0;
}

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

/** Six letters and numbers, e.g. VL7Q2K. */
export function isValidBookingReference(value: string): boolean {
  return BOOKING_REFERENCE_PATTERN.test(value.trim().toUpperCase());
}

/** Philippine mobile numbers: 10 digits after +63, starting with 9 (e.g. 917 482 4567). */
export function isValidPhilippineMobile(value: string): boolean {
  const digits = value.replace(/\D/g, '').replace(/^63/, '').replace(/^0/, '');
  return /^9\d{9}$/.test(digits);
}

/** A letter, 7 digits and a letter, e.g. P4831207A. */
export function isValidPhilippinePassport(value: string): boolean {
  return PHILIPPINE_PASSPORT_PATTERN.test(value.trim().toUpperCase());
}

/** 6 to 9 letters and numbers with no spaces. */
export function isValidPassportNumber(value: string): boolean {
  return GENERIC_PASSPORT_PATTERN.test(value.trim().toUpperCase());
}

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

/** Luhn checksum used by every major card network. */
export function passesLuhnCheck(cardNumber: string): boolean {
  const digits = digitsOnly(cardNumber);
  if (digits.length < 12) return false;
  let sum = 0;
  let shouldDouble = false;
  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

export type CardBrand = 'Visa' | 'Mastercard' | 'Amex' | 'JCB' | null;

export function detectCardBrand(cardNumber: string): CardBrand {
  const digits = digitsOnly(cardNumber);
  if (/^4/.test(digits)) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'Mastercard';
  if (/^3[47]/.test(digits)) return 'Amex';
  if (/^35/.test(digits)) return 'JCB';
  return null;
}

/** 16 digits (15 for Amex) that pass the Luhn check. */
export function isValidCardNumber(cardNumber: string): boolean {
  const digits = digitsOnly(cardNumber);
  const expectedLength = detectCardBrand(digits) === 'Amex' ? 15 : 16;
  return digits.length === expectedLength && passesLuhnCheck(digits);
}

/** "MM / YY" in the future relative to `today` (year and month, 1-based month). */
export function isCardExpiryValid(value: string, today: { year: number; month: number }): boolean {
  const match = /^(\d{2})\s*\/\s*(\d{2})$/.exec(value.trim());
  if (!match) return false;
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) return false;
  return year > today.year || (year === today.year && month >= today.month);
}

/** 3 digits, or 4 for Amex. */
export function isValidSecurityCode(value: string, brand: CardBrand): boolean {
  return new RegExp(`^\\d{${brand === 'Amex' ? 4 : 3}}$`).test(value.trim());
}

/** Formats digits as "4821 1234 5678 9012" while typing. */
export function formatCardNumberInput(value: string): string {
  return digitsOnly(value)
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, '$1 ');
}

/** Formats digits as "MM / YY" while typing. */
export function formatExpiryInput(value: string): string {
  const digits = digitsOnly(value).slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)} / ${digits.slice(2)}` : digits;
}

/** Philippine TIN: 9 digits plus a 3–5 digit branch code, e.g. 123-456-789-00000. */
export function isValidTin(value: string): boolean {
  return /^\d{9}\d{3,5}$/.test(digitsOnly(value));
}

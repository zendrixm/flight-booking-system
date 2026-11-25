import { addMonths, formatShortDate, type IsoDate } from '@/lib/date';
import { digitsOnly, isBlank, isValidPassportNumber } from '@/lib/validation';
import type { ContactDetails, TravelerDetails } from '@/types/traveler';

export type TravelerField = 'firstNames' | 'lastName' | 'dateOfBirth' | 'passportNumber' | 'passportExpiry';

export type TravelerErrors = Partial<Record<TravelerField, string>>;

/** Airlines on the demo route need passports valid for 6 months after the last flight. */
export const PASSPORT_VALIDITY_MONTHS = 6;

export function minimumPassportExpiry(lastFlightDate: IsoDate): IsoDate {
  return addMonths(lastFlightDate, PASSPORT_VALIDITY_MONTHS);
}

export function validateTraveler(
  traveler: TravelerDetails,
  today: IsoDate,
  minExpiry: IsoDate,
): TravelerErrors {
  const errors: TravelerErrors = {};
  if (isBlank(traveler.firstNames)) {
    errors.firstNames = 'Enter first and middle names as shown on the passport.';
  }
  if (isBlank(traveler.lastName)) errors.lastName = 'Enter the last name as shown on the passport.';
  if (!traveler.dateOfBirth) errors.dateOfBirth = 'Enter a date of birth.';
  else if (traveler.dateOfBirth > today) errors.dateOfBirth = 'Date of birth can’t be in the future.';
  if (isBlank(traveler.passportNumber)) errors.passportNumber = 'Enter the passport number.';
  else if (!isValidPassportNumber(traveler.passportNumber))
    errors.passportNumber = 'Passport numbers have 7 to 9 letters and numbers.';
  if (!traveler.passportExpiry) errors.passportExpiry = 'Enter the passport expiry date.';
  else if (traveler.passportExpiry < minExpiry)
    errors.passportExpiry = `This passport expires too soon. It must be valid until ${formatShortDate(minExpiry)} or later.`;
  return errors;
}

export function validateContactMobile(contact: ContactDetails): string | undefined {
  const digits = digitsOnly(contact.mobileNumber);
  if (!digits) return 'Enter a mobile number for schedule changes.';
  if (digits.length < 10) return 'Enter the full 10-digit mobile number, like 917 123 4567.';
  return undefined;
}

export function countErrors(
  travelerErrors: readonly TravelerErrors[],
  mobileError: string | undefined,
): number {
  return travelerErrors.reduce((sum, errors) => sum + Object.keys(errors).length, 0) + (mobileError ? 1 : 0);
}

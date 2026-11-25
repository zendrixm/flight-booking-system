import { isBlank, isValidBookingReference } from '@/lib/validation';

export interface BookingLookupValues {
  reference: string;
  lastName: string;
}

export type BookingLookupErrors = Partial<Record<keyof BookingLookupValues, string>>;

/** Upper-cases a typed reference and drops anything that can't be part of one. */
export function normalizeReferenceInput(value: string): string {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 6);
}

export function getBookingLookupErrors({ reference, lastName }: BookingLookupValues): BookingLookupErrors {
  const errors: BookingLookupErrors = {};
  if (isBlank(reference)) errors.reference = 'Enter your 6-character booking reference.';
  else if (!isValidBookingReference(reference))
    errors.reference = 'Booking references have 6 letters and numbers, like VL7Q2K.';
  if (isBlank(lastName)) errors.lastName = 'Enter the last name on the booking.';
  return errors;
}

export function hasErrors(errors: BookingLookupErrors): boolean {
  return Object.keys(errors).length > 0;
}

import { DEMO_TODAY } from '@/config/demo';
import { isBlank, isValidEmail } from '@/lib/validation';
import type { AirlineCode, FareName, ManualBookingInput, TripType } from '@/types/console/booking';

export const MANUAL_BOOKING_AIRPORTS: ReadonlyArray<{ value: string; label: string }> = [
  { value: 'MNL', label: 'Manila (MNL)' },
  { value: 'CEB', label: 'Cebu (CEB)' },
  { value: 'HND', label: 'Tokyo Haneda (HND)' },
  { value: 'NRT', label: 'Tokyo Narita (NRT)' },
  { value: 'ICN', label: 'Seoul Incheon (ICN)' },
  { value: 'SIN', label: 'Singapore (SIN)' },
  { value: 'TPE', label: 'Taipei (TPE)' },
  { value: 'BKK', label: 'Bangkok (BKK)' },
  { value: 'HKG', label: 'Hong Kong (HKG)' },
];

export const FARE_OPTIONS: ReadonlyArray<{ value: FareName; label: string }> = [
  { value: 'Saver', label: 'Saver' },
  { value: 'Classic', label: 'Classic' },
  { value: 'Flex', label: 'Flex' },
];

export const MAX_MANUAL_TRAVELERS = 9;

export interface ManualBookingForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  from: string;
  to: string;
  tripType: TripType;
  departDate: string;
  returnDate: string;
  airline: AirlineCode;
  fare: FareName;
  travelerCount: number;
  /** As typed, e.g. "36,900". */
  total: string;
  paymentMethod: 'link' | 'invoice';
  note: string;
}

export const BLANK_MANUAL_BOOKING: ManualBookingForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  from: 'MNL',
  to: 'HND',
  tripType: 'return',
  departDate: '',
  returnDate: '',
  airline: 'MR',
  fare: 'Classic',
  travelerCount: 1,
  total: '',
  paymentMethod: 'link',
  note: '',
};

export type ManualBookingErrors = Partial<Record<keyof ManualBookingForm, string>>;

/** "36,900" → 36900; 0 when there are no digits. */
export function parseQuotedTotal(total: string): number {
  return Number(total.replace(/[^0-9]/g, '')) || 0;
}

export function manualBookingErrors(
  form: ManualBookingForm,
  today: string = DEMO_TODAY,
): ManualBookingErrors {
  const errors: ManualBookingErrors = {};
  if (isBlank(form.firstName)) errors.firstName = 'Enter the first name as on the passport.';
  if (isBlank(form.lastName)) errors.lastName = 'Enter the last name as on the passport.';
  if (isBlank(form.email)) errors.email = 'Enter an email for the itinerary and payment link.';
  else if (!isValidEmail(form.email)) errors.email = 'This email looks incomplete — check it before sending.';
  if (form.from === form.to) errors.to = 'Choose a destination different from the origin.';
  if (!form.departDate) errors.departDate = 'Choose a departure date.';
  else if (form.departDate < today) errors.departDate = 'Departure can’t be in the past.';
  if (form.tripType === 'return') {
    if (!form.returnDate) errors.returnDate = 'Choose a return date.';
    else if (form.departDate && form.returnDate < form.departDate)
      errors.returnDate = 'Return must be on or after departure.';
  }
  if (isBlank(form.total)) errors.total = 'Enter the total you quoted the customer.';
  else if (!parseQuotedTotal(form.total)) errors.total = 'Use numbers only, e.g. 18,450.';
  return errors;
}

export function isManualBookingChanged(form: ManualBookingForm): boolean {
  return (Object.keys(BLANK_MANUAL_BOOKING) as Array<keyof ManualBookingForm>).some(
    (key) => form[key] !== BLANK_MANUAL_BOOKING[key],
  );
}

/** "2 travelers · MNL ⇄ HND" */
export function manualBookingSummary(form: ManualBookingForm): string {
  const travelers = `${form.travelerCount} ${form.travelerCount === 1 ? 'traveler' : 'travelers'}`;
  return `${travelers} · ${form.from} ${form.tripType === 'return' ? '⇄' : '→'} ${form.to}`;
}

export function toManualBookingInput(form: ManualBookingForm): ManualBookingInput {
  return {
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    from: form.from,
    to: form.to,
    tripType: form.tripType,
    departDate: form.departDate,
    returnDate: form.tripType === 'return' ? form.returnDate : null,
    airline: form.airline,
    fare: form.fare,
    travelerCount: form.travelerCount,
    total: parseQuotedTotal(form.total),
    paymentMethod: form.paymentMethod,
    note: form.note.trim(),
  };
}

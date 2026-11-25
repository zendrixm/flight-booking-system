import type { StatusTone } from '@/components/ui';
import {
  addMonths,
  formatShortDate,
  MONTHS_SHORT,
  parseIsoDate,
  yearsBetween,
  type IsoDate,
} from '@/lib/date';
import type { SavedTraveler } from '@/types/traveler';

/** The editable part of a saved traveler. */
export type TravelerProfile = Pick<
  SavedTraveler,
  | 'title'
  | 'firstNames'
  | 'lastName'
  | 'dateOfBirth'
  | 'nationality'
  | 'passportNumber'
  | 'passportExpiry'
  | 'loyaltyNumber'
  | 'seatPreference'
  | 'assistance'
>;

export type TravelerProfileField = keyof TravelerProfile;
export type TravelerProfileErrors = Partial<Record<TravelerProfileField, string>>;

export const BLANK_PROFILE: TravelerProfile = {
  title: 'Ms',
  firstNames: '',
  lastName: '',
  dateOfBirth: '',
  nationality: 'Philippines',
  passportNumber: '',
  passportExpiry: '',
  loyaltyNumber: '',
  seatPreference: 'No preference',
  assistance: 'None',
};

const PROFILE_FIELDS = Object.keys(BLANK_PROFILE) as TravelerProfileField[];

/** Many destinations refuse passports with less than this left. */
const PASSPORT_VALIDITY_MONTHS = 6;
const PASSPORT_NUMBER_PATTERN = /^[A-Za-z0-9]{6,9}$/;

export function profileOf(traveler: SavedTraveler): TravelerProfile {
  return Object.fromEntries(PROFILE_FIELDS.map((field) => [field, traveler[field]])) as TravelerProfile;
}

export function isProfileChanged(original: TravelerProfile, draft: TravelerProfile): boolean {
  return PROFILE_FIELDS.some((field) => original[field] !== draft[field]);
}

export type PassportState = 'missing' | 'expired' | 'expiringSoon' | 'valid';

export function passportStateOf(
  profile: Pick<TravelerProfile, 'passportNumber' | 'passportExpiry'>,
  today: IsoDate,
): PassportState {
  if (!profile.passportNumber || !profile.passportExpiry) return 'missing';
  if (profile.passportExpiry < today) return 'expired';
  if (profile.passportExpiry < addMonths(today, PASSPORT_VALIDITY_MONTHS)) return 'expiringSoon';
  return 'valid';
}

export interface StatusLabel {
  label: string;
  tone: StatusTone;
}

export function passportStatus(profile: TravelerProfile, today: IsoDate): StatusLabel {
  const expiry = profile.passportExpiry;
  switch (passportStateOf(profile, today)) {
    case 'missing':
      return { label: 'No passport saved', tone: 'muted' };
    case 'expired':
      return { label: 'Passport expired', tone: 'danger' };
    case 'expiringSoon':
      return { label: `Passport expires ${formatShortDate(expiry)}`, tone: 'warning' };
    case 'valid': {
      const date = parseIsoDate(expiry);
      return {
        label: `Passport valid to ${MONTHS_SHORT[date.getUTCMonth()]} ${date.getUTCFullYear()}`,
        tone: 'success',
      };
    }
  }
}

/** "Child · 7 years", "Adult · 67 years", "Adult · You". */
export function travelerKindLabel(
  traveler: Pick<SavedTraveler, 'dateOfBirth' | 'isAccountHolder'>,
  today: IsoDate,
): string {
  const age = traveler.dateOfBirth ? yearsBetween(traveler.dateOfBirth, today) : null;
  const kind =
    age === null
      ? 'Traveler'
      : age < 2
        ? 'Infant'
        : age < 12
          ? `Child · ${age} years`
          : age >= 65
            ? `Adult · ${age} years`
            : 'Adult';
  return traveler.isAccountHolder ? `${kind} · You` : kind;
}

export const EXPIRED_PASSPORT_MESSAGE =
  'This passport has expired. Add a new one before booking international flights.';

/** A note under the passport fields when the passport needs attention. An expired passport is an error instead. */
export function passportNote(
  profile: TravelerProfile,
  today: IsoDate,
  isNew: boolean,
): { text: string; tone: 'attention' | 'neutral' } | null {
  switch (passportStateOf(profile, today)) {
    case 'expiringSoon':
      return {
        text: `Expires ${formatShortDate(profile.passportExpiry)}, less than 6 months away. Many destinations and airlines won’t accept it, so renew it before the next international trip.`,
        tone: 'attention',
      };
    case 'missing':
      return !profile.passportNumber && !isNew
        ? { text: 'Add a passport to book international flights faster.', tone: 'neutral' }
        : null;
    case 'expired':
    case 'valid':
      return null;
  }
}

export function validateTravelerProfile(
  profile: TravelerProfile,
  today: IsoDate,
  isNameLocked: boolean,
): TravelerProfileErrors {
  const errors: TravelerProfileErrors = {};
  if (!isNameLocked) {
    if (!profile.firstNames.trim()) errors.firstNames = 'Enter first and middle names as on the passport.';
    if (!profile.lastName.trim()) errors.lastName = 'Enter the last name as on the passport.';
    if (!profile.dateOfBirth) {
      errors.dateOfBirth = 'Add a date of birth — airlines use it to set the fare type.';
    }
  }
  if (profile.dateOfBirth && profile.dateOfBirth > today) {
    errors.dateOfBirth = 'Date of birth can’t be in the future.';
  }

  const passportNumber = profile.passportNumber.trim();
  if (passportNumber && !PASSPORT_NUMBER_PATTERN.test(passportNumber)) {
    errors.passportNumber = 'Passport numbers are 6 to 9 letters and numbers, no spaces or dashes.';
  }
  if (passportNumber && !profile.passportExpiry) errors.passportExpiry = 'Add the passport’s expiry date.';
  if (passportNumber && profile.passportExpiry && profile.passportExpiry < today) {
    errors.passportExpiry = EXPIRED_PASSPORT_MESSAGE;
  }
  return errors;
}

/** "Sofia" from "Sofia Isabel". */
export function travelerInitials(profile: Pick<TravelerProfile, 'firstNames' | 'lastName'>): string {
  return `${profile.firstNames.trim()[0] ?? ''}${profile.lastName.trim()[0] ?? ''}`.toUpperCase();
}

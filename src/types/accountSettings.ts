import type { IsoDate } from '@/lib/date';

import type { SeatPreference } from './traveler';

/** Profile fields that only change through support, plus an email change awaiting confirmation. */
export interface AccountProfileDetails {
  dateOfBirth: IsoDate;
  memberSince: number;
  /** New address waiting for the person to click the confirmation link. */
  pendingEmail: string | null;
}

/** Used to pre-fill searches. */
export interface SearchDefaults {
  homeAirport: string;
  cabin: string;
  seat: SeatPreference;
}

export interface SecuritySettings {
  /** "Last changed 14 Jun 2026". */
  passwordNote: string;
  isTwoStepOn: boolean;
  authenticatorSetUpOn: IsoDate;
  backupCodesLeft: number;
}

export interface SignedInDevice {
  id: string;
  kind: 'laptop' | 'phone';
  name: string;
  /** "Makati City, Philippines · Active now". */
  detail: string;
  isCurrent: boolean;
}

export interface EmailPreferences {
  /** Always on while the customer has upcoming bookings. */
  tripUpdates: boolean;
  deals: boolean;
  partnerOffers: boolean;
}

export interface AccountSettings {
  profile: AccountProfileDetails;
  searchDefaults: SearchDefaults;
  security: SecuritySettings;
  devices: SignedInDevice[];
  emails: EmailPreferences;
  isDataExportPending: boolean;
}

export interface ProfileUpdate {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  mobile: string;
}

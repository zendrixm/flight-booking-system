import type { IsoDate } from '@/lib/date';

export type PersonTitle = 'Ms' | 'Mr' | 'Mx';

export type SeatPreference = 'Window' | 'Aisle' | 'No preference';

export type AssistanceRequest =
  | 'None'
  | 'Wheelchair to the gate'
  | 'Wheelchair to the seat'
  | 'Visual or hearing support'
  | 'Travelling with a service animal';

/** Passenger details as entered for one booking. Names must match the passport. */
export interface TravelerDetails {
  title: PersonTitle;
  /** First and middle names, as on the passport. */
  firstNames: string;
  lastName: string;
  dateOfBirth: IsoDate | '';
  nationality: string;
  passportNumber: string;
  passportExpiry: IsoDate | '';
  passportCountry: string;
  loyaltyProgram: string;
  loyaltyNumber: string;
  assistance: AssistanceRequest;
}

/** A traveler saved to the account for faster checkout. */
export interface SavedTraveler extends Omit<TravelerDetails, 'loyaltyProgram'> {
  id: string;
  /** The signed-in customer. */
  isAccountHolder: boolean;
  /** Names are locked once the traveler has ticketed bookings. */
  isNameLocked: boolean;
  /** The upcoming booking that locks the name, shown so the person knows why. */
  nameLockedBy?: string;
  seatPreference: SeatPreference;
}

export interface ContactDetails {
  email: string;
  countryCode: string;
  mobileNumber: string;
  wantsSmsUpdates: boolean;
}

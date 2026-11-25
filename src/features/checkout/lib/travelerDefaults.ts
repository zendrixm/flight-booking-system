import type { FlightSearchParams } from '@/types/flight';
import type { ContactDetails, SavedTraveler, TravelerDetails } from '@/types/traveler';

export type PassengerType = 'Adult' | 'Child' | 'Infant';

export const EMPTY_TRAVELER: TravelerDetails = {
  title: 'Ms',
  firstNames: '',
  lastName: '',
  dateOfBirth: '',
  nationality: 'Philippines',
  passportNumber: '',
  passportExpiry: '',
  passportCountry: 'Philippines',
  loyaltyProgram: 'Meridian Miles',
  loyaltyNumber: '',
  assistance: 'None',
};

/** Passenger types in booking order: adults first, then children, then infants. */
export function passengerTypesFor(
  search: Pick<FlightSearchParams, 'adults' | 'children' | 'infants'>,
): PassengerType[] {
  return [
    ...Array<PassengerType>(search.adults).fill('Adult'),
    ...Array<PassengerType>(search.children).fill('Child'),
    ...Array<PassengerType>(search.infants).fill('Infant'),
  ];
}

export function travelerFromSaved(
  saved: SavedTraveler,
  previous: TravelerDetails = EMPTY_TRAVELER,
): TravelerDetails {
  return {
    ...previous,
    title: saved.title,
    firstNames: saved.firstNames,
    lastName: saved.lastName,
    dateOfBirth: saved.dateOfBirth,
    nationality: saved.nationality,
    passportNumber: saved.passportNumber,
    passportExpiry: saved.passportExpiry,
    passportCountry: saved.passportCountry,
    loyaltyNumber: saved.loyaltyNumber,
    assistance: saved.assistance,
  };
}

/** Same person, ignoring case and surrounding spaces. */
export function isSamePerson(
  traveler: Pick<TravelerDetails, 'firstNames' | 'lastName'>,
  saved: SavedTraveler,
): boolean {
  return (
    traveler.firstNames.trim().toLowerCase() === saved.firstNames.toLowerCase() &&
    traveler.lastName.trim().toLowerCase() === saved.lastName.toLowerCase()
  );
}

/** True when the traveler's identity and passport already match the saved profile. */
export function matchesSaved(traveler: TravelerDetails, saved: SavedTraveler): boolean {
  return (
    isSamePerson(traveler, saved) &&
    traveler.dateOfBirth === saved.dateOfBirth &&
    traveler.passportNumber === saved.passportNumber &&
    traveler.passportExpiry === saved.passportExpiry
  );
}

/** First visit: the account holder fills the lead traveler, everyone else starts blank. */
export function initialTravelers(count: number, accountHolder: SavedTraveler | undefined): TravelerDetails[] {
  return Array.from({ length: count }, (_, index) =>
    index === 0 && accountHolder ? travelerFromSaved(accountHolder) : { ...EMPTY_TRAVELER },
  );
}

/** Splits "+63 917 555 0123" into the country selector and the national number. */
export function initialContact(email: string, mobile: string): ContactDetails {
  const match = /^\+63\s*(.*)$/.exec(mobile);
  return {
    email,
    countryCode: 'PH +63',
    mobileNumber: match ? match[1] : mobile,
    wantsSmsUpdates: true,
  };
}

import { ACCOUNT_TRIPS, GUEST_TRIPS } from '@/mocks/trips';
import type { Trip } from '@/types/trip';

import { ApiError, mockRequest } from './mockApi';

/** References added to the account during this visit ("Add a booking by reference"). */
const addedReferences = new Set<string>();

function accountTrips(): Trip[] {
  const added = GUEST_TRIPS.filter((trip) => addedReferences.has(trip.reference));
  return [...ACCOUNT_TRIPS, ...added];
}

function matchesLastName(trip: Trip, lastName: string): boolean {
  const wanted = lastName.trim().toLowerCase();
  return trip.travelerLastNames.some((name) => name.toLowerCase() === wanted);
}

export function listTrips(): Promise<Trip[]> {
  return mockRequest(accountTrips);
}

export function getTrip(reference: string): Promise<Trip> {
  return mockRequest(() => {
    const trip = [...ACCOUNT_TRIPS, ...GUEST_TRIPS].find((candidate) => candidate.reference === reference);
    if (!trip) throw new ApiError('not_found', `No booking with reference ${reference}.`);
    return trip;
  });
}

export type TripLookupResult =
  | { kind: 'found'; trip: Trip }
  | { kind: 'alreadyInAccount'; trip: Trip }
  | { kind: 'notFound' };

/**
 * Looks a booking up by reference and a traveler's last name, the way guests and the
 * "Add a booking" dialog do. Bookings already in the account are reported as such.
 */
export function lookUpTrip(reference: string, lastName: string): Promise<TripLookupResult> {
  return mockRequest((): TripLookupResult => {
    const inAccount = accountTrips().find((trip) => trip.reference === reference);
    if (inAccount && matchesLastName(inAccount, lastName)) {
      return { kind: 'alreadyInAccount', trip: inAccount };
    }
    const guestTrip = GUEST_TRIPS.find((trip) => trip.reference === reference);
    if (guestTrip && matchesLastName(guestTrip, lastName)) return { kind: 'found', trip: guestTrip };
    return { kind: 'notFound' };
  });
}

export function addTripToAccount(reference: string): Promise<Trip> {
  return mockRequest(() => {
    const trip = GUEST_TRIPS.find((candidate) => candidate.reference === reference);
    if (!trip) throw new ApiError('not_found', `No booking with reference ${reference}.`);
    addedReferences.add(reference);
    return trip;
  });
}

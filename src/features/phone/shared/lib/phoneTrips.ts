import { DEMO_TODAY } from '@/config/demo';
import { isCheckInOpen } from '@/features/trips/lib/tripDates';
import { getBoardingPass } from '@/services/boardingPassService';
import { listTrips } from '@/services/tripsService';
import type { BoardingPass } from '@/types/boardingPass';
import type { Trip } from '@/types/trip';

export interface PhoneTrip {
  trip: Trip;
  /** Only loaded for trips whose check-in is open. */
  boardingPass: BoardingPass | null;
}

/** The account's trips, with the boarding pass of any trip that's open for check-in. */
export async function loadPhoneTrips(): Promise<PhoneTrip[]> {
  const trips = await listTrips();
  return Promise.all(
    trips.map(async (trip) => ({
      trip,
      boardingPass: isCheckInOpen(trip, DEMO_TODAY)
        ? await getBoardingPass(trip.reference).catch(() => null)
        : null,
    })),
  );
}

export function upcomingTrips(trips: readonly PhoneTrip[]): PhoneTrip[] {
  return trips
    .filter(({ trip }) => trip.status === 'upcoming')
    .sort((a, b) => a.trip.departDate.localeCompare(b.trip.departDate));
}

export function pastTrips(trips: readonly PhoneTrip[]): PhoneTrip[] {
  return trips
    .filter(({ trip }) => trip.status === 'past')
    .sort((a, b) => b.trip.departDate.localeCompare(a.trip.departDate));
}

/** The trip to put on the search screen: the soonest one that's open for check-in. */
export function nextTripOf(trips: readonly PhoneTrip[]): PhoneTrip | undefined {
  return upcomingTrips(trips).find(({ trip }) => isCheckInOpen(trip, DEMO_TODAY));
}

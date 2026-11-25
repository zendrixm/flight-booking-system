import type { ChangeFlightOption } from '@/mocks/managedBookings';
import { CHANGE_FEE_PER_TRAVELER, CHANGE_OPTIONS, SOLD_OUT_FLIGHTS } from '@/services/manageBookingService';
import type { SegmentKey } from '@/types/managedBooking';

export interface SegmentChoice {
  segment: SegmentKey;
  date: string | null;
  flightNumber: string | null;
}

export function isSoldOut(date: string, flightNumber: string): boolean {
  return SOLD_OUT_FLIGHTS.some((flight) => flight.date === date && flight.flightNumber === flightNumber);
}

/** Fare difference per traveler for one flight on one day; never negative (lower fares aren't refunded). */
export function fareDifference(segment: SegmentKey, date: string, flight: ChangeFlightOption): number {
  const day = CHANGE_OPTIONS[segment].days.find((option) => option.date === date);
  return Math.max(0, (day?.baseDifference ?? 0) + flight.adjustment);
}

/** The cheapest available flight's difference that day, shown under each date. */
export function lowestDifference(segment: SegmentKey, date: string): number {
  const available = CHANGE_OPTIONS[segment].flights.filter((flight) => !isSoldOut(date, flight.flightNumber));
  return Math.min(...available.map((flight) => fareDifference(segment, date, flight)));
}

export function flightOption(
  segment: SegmentKey,
  flightNumber: string | null,
): ChangeFlightOption | undefined {
  return CHANGE_OPTIONS[segment].flights.find((flight) => flight.flightNumber === flightNumber);
}

export interface ChangeQuote {
  differencePerTraveler: number;
  changeFee: number;
  fareDifference: number;
  total: number;
}

export function quoteChange(choices: readonly SegmentChoice[], travelerCount: number): ChangeQuote {
  const differencePerTraveler = choices.reduce((sum, choice) => {
    const flight = flightOption(choice.segment, choice.flightNumber);
    return sum + (flight && choice.date ? fareDifference(choice.segment, choice.date, flight) : 0);
  }, 0);
  const changeFee = CHANGE_FEE_PER_TRAVELER * travelerCount;
  const difference = differencePerTraveler * travelerCount;
  return { differencePerTraveler, changeFee, fareDifference: difference, total: changeFee + difference };
}

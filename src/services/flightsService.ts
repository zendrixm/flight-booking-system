import { daysBetween, isWeekend, parseIsoDate, type IsoDate } from '@/lib/date';
import {
  DEPARTURE_DATE_FARES,
  FARE_FAMILIES,
  MANILA_TOKYO_OPTIONS,
  ORIGIN_DEALS,
  REFERENCE_LOWEST_FARE,
  TODAY_FARES_FROM_MANILA,
} from '@/mocks/flightOffers';
import type { FareFamily, FlightOption, FlightSearchParams } from '@/types/flight';

import { mockRequest } from './mockApi';

export interface FlightSearchResult {
  options: FlightOption[];
  /** Saver, Classic and Flex: what each fare includes. */
  fareFamilies: FareFamily[];
  /** Lowest fare for nearby departure dates (return date unchanged). */
  dateFares: ReadonlyArray<{ date: IsoDate; lowestFare: number }>;
}

function roundToTen(value: number): number {
  return Math.round(value / 10) * 10;
}

/**
 * Searches round trips. The mock always returns the Manila–Tokyo inventory, re-priced for
 * the chosen departure date so the date strip and the list agree.
 */
export function searchFlights(params: FlightSearchParams): Promise<FlightSearchResult> {
  return mockRequest(() => {
    const dateFare = DEPARTURE_DATE_FARES.find((entry) => entry.date === params.departDate);
    const factor = dateFare ? dateFare.lowestFare / REFERENCE_LOWEST_FARE : 1;
    const scale = (amount: number) => (factor === 1 ? amount : roundToTen(amount * factor));

    const options = MANILA_TOKYO_OPTIONS.map((option) => ({
      ...option,
      outbound: { ...option.outbound, date: params.departDate },
      fares: {
        saver: scale(option.fares.saver),
        classic: scale(option.fares.classic),
        flex: scale(option.fares.flex),
      },
    }));

    return { options, fareFamilies: [...FARE_FAMILIES], dateFares: DEPARTURE_DATE_FARES };
  });
}

export function getFlightOption(optionId: string): FlightOption | undefined {
  return MANILA_TOKYO_OPTIONS.find((option) => option.id === optionId);
}

export function getFareFamily(fareFamilyId: FareFamily['id']): FareFamily | undefined {
  return FARE_FAMILIES.find((fare) => fare.id === fareFamilyId);
}

/** Lowest round-trip fare per traveler from Manila today, if we have one for the destination. */
export function getTodaysLowestFare(destinationCode: string): Promise<number | null> {
  return mockRequest(() => TODAY_FARES_FROM_MANILA[destinationCode] ?? null);
}

export function getOriginDeals(originCode: string) {
  return ORIGIN_DEALS[originCode] ?? ORIGIN_DEALS.MNL;
}

// ---------------------------------------------------------------------------------------------
// Fare calendar: a deterministic estimate so the same day always shows the same price.
// ---------------------------------------------------------------------------------------------

const CALENDAR_EPOCH: IsoDate = '2026-10-01';
const SHORT_NOTICE_DAYS = 20;

/** Prices already quoted on other screens (results date strip and the 19 Nov return). */
const QUOTED_FARES: Record<IsoDate, number> = {
  '2026-11-10': 17240,
  '2026-11-11': 16105,
  '2026-11-12': 12940,
  '2026-11-13': 19330,
  '2026-11-14': 21880,
  '2026-11-15': 18960,
  '2026-11-16': 13990,
  '2026-11-19': 13480,
};

function seasonalMultiplier(date: IsoDate): number {
  const value = parseIsoDate(date);
  const year = value.getUTCFullYear();
  const month = value.getUTCMonth();
  const day = value.getUTCDate();
  if (daysBetween(CALENDAR_EPOCH, date) < SHORT_NOTICE_DAYS) return 1.22;
  if (year === 2026 && month === 11 && day >= 18) return 1.38; // Christmas rush
  if (year === 2027 && month === 0 && day <= 3) return 1.3; // New Year
  if (year === 2027 && month === 0) return 0.9; // quiet January
  if (year === 2027 && month === 1 && day >= 4 && day <= 14) return 1.18; // Lunar New Year
  if (year === 2027 && month === 2 && day >= 20) return 1.26; // cherry blossom
  return 1;
}

interface CalendarFareOptions {
  /** 0 for the main trip; 1+ for additional multi-city flights (priced one way). */
  legIndex?: number;
  /** Show one-way prices for the main trip. */
  oneWay?: boolean;
}

/** Lowest fare per traveler for a departure on `date`, taxes included. */
export function estimateCalendarFare(
  date: IsoDate,
  { legIndex = 0, oneWay = false }: CalendarFareOptions = {},
): number {
  const dayIndex = daysBetween(CALENDAR_EPOCH, date);
  let roundTripFare: number;
  if (legIndex === 0 && QUOTED_FARES[date]) {
    roundTripFare = QUOTED_FARES[date];
  } else {
    const variation = (((dayIndex + 1) * 7919 + legIndex * 104729) % 97) * 92;
    const base = 11800 + variation + (isWeekend(date) ? 2400 : 0);
    roundTripFare = roundToTen(base * seasonalMultiplier(date) * (legIndex ? 0.6 : 1));
  }
  if (legIndex > 0) return roundTripFare;
  return oneWay ? roundToTen(roundTripFare * 0.58) : roundTripFare;
}

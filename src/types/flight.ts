import type { IsoDate } from '@/lib/date';

export interface Airport {
  code: string;
  city: string;
  name: string;
  country: string;
}

export type AirlineId = 'meridian' | 'crest' | 'solenne' | 'halcyon' | 'kestrel';

export interface Airline {
  id: AirlineId;
  name: string;
  /** Two-letter monogram shown in the airline tile. */
  monogram: string;
  /** Tile colouring: `dark` for Vela's partner airline, `light` for everyone else. */
  tileTone: 'dark' | 'light';
}

export const CABIN_CLASSES = ['Economy', 'Premium economy', 'Business', 'First'] as const;

export type CabinClass = (typeof CABIN_CLASSES)[number];

export type TripType = 'round' | 'oneway' | 'multi';

export type DepartureWindow = 'early' | 'morning' | 'afternoon' | 'evening';

export interface FlightLeg {
  flightNumber: string;
  date: IsoDate;
  departureTime: string;
  arrivalTime: string;
  /** Arrives the day after it departs ("+1"). */
  arrivesNextDay?: boolean;
  from: string;
  to: string;
  durationMinutes: number;
  stops: number;
  via?: string;
  /** e.g. "Airbus A321neo · Terminal 1 → Terminal 3" or a connection note. */
  details: string;
  /** Known for nonstop flights. */
  aircraft?: string;
  departureTerminal?: string;
  arrivalTerminal?: string;
}

export type FareFamilyId = 'saver' | 'classic' | 'flex';

export interface FareInclusion {
  kind: 'included' | 'fee' | 'excluded';
  text: string;
}

export interface FareFamily {
  id: FareFamilyId;
  name: string;
  blurb: string;
  isPopular: boolean;
  inclusions: FareInclusion[];
  /** One line used in the checkout summary. */
  summary: string;
}

export interface FlightOption {
  id: string;
  airlineId: AirlineId;
  departureWindow: DepartureWindow;
  outbound: FlightLeg;
  inbound: FlightLeg;
  /** Round-trip price per traveler, taxes included. */
  fares: Record<FareFamilyId, number>;
  includesCheckedBag: boolean;
  /** Lower is better; drives the "Best" sort. */
  rank: number;
}

export interface FlightSearchParams {
  tripType: TripType;
  from: string;
  to: string;
  departDate: IsoDate;
  returnDate: IsoDate | null;
  adults: number;
  children: number;
  infants: number;
  cabin: CabinClass;
}

export interface DateFare {
  date: IsoDate;
  lowestFare: number;
}

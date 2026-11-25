import { BOOKING_HORIZON, DEMO_TODAY, MAX_TRAVELERS_PER_BOOKING } from '@/config/demo';
import { findAirport, resolveAirport } from '@/data/airports';
import { addDays, minDate, type IsoDate } from '@/lib/date';
import { travelerCountLabel } from '@/lib/format';
import type { CabinClass, FlightSearchParams, TripType } from '@/types/flight';

/** What the person typed in an airport box and the airport it resolves to (null = not recognised). */
export interface PlaceInput {
  query: string;
  code: string | null;
}

export interface MultiCityLeg {
  from: PlaceInput;
  to: PlaceInput;
  date: IsoDate;
}

export interface SearchFormState {
  tripType: TripType;
  from: PlaceInput;
  to: PlaceInput;
  departDate: IsoDate;
  returnDate: IsoDate | null;
  /** Flights 2–4 of a multi-city trip. */
  extraLegs: MultiCityLeg[];
  adults: number;
  children: number;
  infants: number;
  cabin: CabinClass;
  flexibleDates: boolean;
  /** Errors are shown only after the first search attempt. */
  hasTriedSearch: boolean;
}

export const MAX_EXTRA_LEGS = 3;

export function placeFromCode(code: string): PlaceInput {
  const airport = findAirport(code);
  return { query: airport?.city ?? code, code: airport ? code : null };
}

export function placeFromQuery(query: string): PlaceInput {
  return { query, code: resolveAirport(query)?.code ?? null };
}

export const INITIAL_SEARCH_FORM: SearchFormState = {
  tripType: 'round',
  from: placeFromCode('MNL'),
  to: placeFromCode('HND'),
  departDate: '2026-11-12',
  returnDate: '2026-11-19',
  extraLegs: [{ from: placeFromCode('HND'), to: placeFromCode('ICN'), date: '2026-11-17' }],
  adults: 2,
  children: 0,
  infants: 0,
  cabin: 'Economy',
  flexibleDates: false,
  hasTriedSearch: false,
};

/** Pre-fills the form from a search, e.g. when "Modify search" comes back from the results page. */
export function searchFormFromParams(params: FlightSearchParams): SearchFormState {
  return {
    ...INITIAL_SEARCH_FORM,
    tripType: params.tripType,
    from: placeFromCode(params.from),
    to: placeFromCode(params.to),
    departDate: params.departDate,
    returnDate: params.returnDate,
    adults: params.adults,
    children: params.children,
    infants: params.infants,
    cabin: params.cabin,
  };
}

export type TravelerKind = 'adults' | 'children' | 'infants';

export function totalTravelers(state: Pick<SearchFormState, TravelerKind>): number {
  return state.adults + state.children + state.infants;
}

/** "2 adults, 1 child · Economy" */
/** "2 adults, 1 child" */
/** "2 adults, 1 child · Economy" */
export function travelersLabel(state: Pick<SearchFormState, TravelerKind | 'cabin'>): string {
  return `${travelerCountLabel(state)} · ${state.cabin}`;
}

export function travelerLimits(state: Pick<SearchFormState, TravelerKind>, kind: TravelerKind) {
  const atCapacity = totalTravelers(state) >= MAX_TRAVELERS_PER_BOOKING;
  const limits: Record<TravelerKind, { min: number; max: number }> = {
    adults: { min: 1, max: 9 },
    children: { min: 0, max: 8 },
    // One lap infant per adult.
    infants: { min: 0, max: state.adults },
  };
  const { min, max } = limits[kind];
  return { canDecrease: state[kind] > min, canIncrease: state[kind] < max && !atCapacity };
}

/** Keeps every multi-city flight on or after the one before it. */
export function chainLegDates(departDate: IsoDate, legs: MultiCityLeg[]): MultiCityLeg[] {
  let previous = departDate;
  return legs.map((leg) => {
    const date = leg.date < previous ? minDate(BOOKING_HORIZON, addDays(previous, 2)) : leg.date;
    previous = date;
    return date === leg.date ? leg : { ...leg, date };
  });
}

export interface SearchError {
  field: 'from' | 'to' | 'return' | 'legs';
  message: string;
}

export function getSearchErrors(state: SearchFormState): SearchError[] {
  const errors: SearchError[] = [];

  (['from', 'to'] as const).forEach((field) => {
    const place = state[field];
    if (place.code) return;
    const query = place.query.trim();
    const target = field === 'from' ? 'a departure airport' : 'a destination';
    errors.push({
      field,
      message: query
        ? `We don’t recognise “${query}”. Choose ${target} from the list.`
        : `Enter where you’re flying ${field === 'from' ? 'from' : 'to'}.`,
    });
  });

  if (state.from.code && state.from.code === state.to.code) {
    errors.push({
      field: 'to',
      message: 'Origin and destination are the same. Choose a different destination.',
    });
  }
  if (state.tripType === 'round' && !state.returnDate) {
    errors.push({ field: 'return', message: 'Choose a return date, or switch to One way.' });
  }
  if (state.tripType === 'multi') {
    state.extraLegs.forEach((leg, index) => {
      if (!leg.from.code || !leg.to.code) {
        errors.push({ field: 'legs', message: `Flight ${index + 2}: choose both airports from the list.` });
      }
    });
  }
  return errors;
}

export function toSearchParams(state: SearchFormState): FlightSearchParams {
  return {
    tripType: state.tripType,
    from: state.from.code ?? '',
    to: state.to.code ?? '',
    departDate: state.departDate,
    returnDate: state.tripType === 'round' ? state.returnDate : null,
    adults: state.adults,
    children: state.children,
    infants: state.infants,
    cabin: state.cabin,
  };
}

/** Earliest date the calendar allows for the main trip. */
export const EARLIEST_DEPARTURE = DEMO_TODAY;

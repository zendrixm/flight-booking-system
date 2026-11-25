import { formatDayLabel, formatDayRange } from '@/lib/date';
import { DEFAULT_SEARCH } from '@/lib/flightSearchUrl';
import { travelerCountLabel } from '@/lib/format';
import { readStoredValue, writeStoredValue } from '@/lib/storage';
import type { FlightSearchParams } from '@/types/flight';

/** Recent searches live on the device, like the native app's. */
const STORAGE_KEY = 'vela.phone.recentSearches';
export const MAX_RECENT_SEARCHES = 5;

/** What a fresh install of the demo has searched before. */
const SEEDED_SEARCHES: readonly FlightSearchParams[] = [
  DEFAULT_SEARCH,
  { ...DEFAULT_SEARCH, to: 'ICN', departDate: '2026-12-05', returnDate: '2026-12-12' },
  { ...DEFAULT_SEARCH, to: 'TPE', departDate: '2027-01-15', returnDate: '2027-01-19' },
];

function isSameSearch(a: FlightSearchParams, b: FlightSearchParams): boolean {
  return (
    a.tripType === b.tripType &&
    a.from === b.from &&
    a.to === b.to &&
    a.departDate === b.departDate &&
    a.returnDate === b.returnDate &&
    a.adults === b.adults &&
    a.children === b.children &&
    a.infants === b.infants &&
    a.cabin === b.cabin
  );
}

export function readRecentSearches(): FlightSearchParams[] {
  return readStoredValue('local', STORAGE_KEY, [...SEEDED_SEARCHES]);
}

/** Moves the search to the front of the list, dropping the oldest beyond the limit. */
export function rememberSearch(search: FlightSearchParams): FlightSearchParams[] {
  const next = [search, ...readRecentSearches().filter((recent) => !isSameSearch(recent, search))].slice(
    0,
    MAX_RECENT_SEARCHES,
  );
  writeStoredValue('local', STORAGE_KEY, next);
  return next;
}

/** "MNL → HND" and "12–19 Nov · 2 adults". */
export function describeSearch(search: FlightSearchParams): { route: string; detail: string } {
  const dates = search.returnDate
    ? formatDayRange(search.departDate, search.returnDate)
    : formatDayLabel(search.departDate);
  return { route: `${search.from} → ${search.to}`, detail: `${dates} · ${travelerCountLabel(search)}` };
}

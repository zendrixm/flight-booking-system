import type { AirlineId, DepartureWindow, FlightOption } from '@/types/flight';

export type SortOrder = 'best' | 'cheapest' | 'fastest';

export const SORT_ORDERS: readonly SortOrder[] = ['best', 'cheapest', 'fastest'];

export const PRICE_STEP = 250;

export interface ResultsFilters {
  /** Allowed stop counts; 2 means "2 or more". */
  stops: ReadonlyArray<0 | 1 | 2>;
  /** Upper price limit per traveler; `null` means no limit. */
  maxPrice: number | null;
  /** Empty means every departure window. */
  departureWindows: readonly DepartureWindow[];
  /** Empty means every airline. */
  airlines: readonly AirlineId[];
  checkedBagOnly: boolean;
}

export const DEFAULT_FILTERS: ResultsFilters = {
  stops: [0, 1],
  maxPrice: null,
  departureWindows: [],
  airlines: [],
  checkedBagOnly: false,
};

/** The price shown on a result: its cheapest fare family. */
export function lowestFareOf(option: FlightOption): number {
  return Math.min(option.fares.saver, option.fares.classic, option.fares.flex);
}

export function totalDurationOf(option: FlightOption): number {
  return option.outbound.durationMinutes + option.inbound.durationMinutes;
}

function stopBucket(stops: number): 0 | 1 | 2 {
  return stops >= 2 ? 2 : (stops as 0 | 1);
}

/** Bounds of the price slider, rounded outwards to the slider step. */
export function priceBoundsOf(options: readonly FlightOption[]): { floor: number; cap: number } {
  if (options.length === 0) return { floor: 0, cap: 0 };
  const prices = options.map(lowestFareOf);
  return {
    floor: Math.floor(Math.min(...prices) / PRICE_STEP) * PRICE_STEP,
    cap: Math.ceil(Math.max(...prices) / PRICE_STEP) * PRICE_STEP,
  };
}

export function matchesFilters(option: FlightOption, filters: ResultsFilters): boolean {
  const price = lowestFareOf(option);
  return (
    filters.stops.includes(stopBucket(option.outbound.stops)) &&
    (filters.maxPrice === null || price <= filters.maxPrice) &&
    (filters.airlines.length === 0 || filters.airlines.includes(option.airlineId)) &&
    (filters.departureWindows.length === 0 || filters.departureWindows.includes(option.departureWindow)) &&
    (!filters.checkedBagOnly || option.includesCheckedBag)
  );
}

const COMPARATORS: Record<SortOrder, (a: FlightOption, b: FlightOption) => number> = {
  best: (a, b) => a.rank - b.rank,
  cheapest: (a, b) => lowestFareOf(a) - lowestFareOf(b),
  fastest: (a, b) => totalDurationOf(a) - totalDurationOf(b) || lowestFareOf(a) - lowestFareOf(b),
};

export function sortOptions(options: readonly FlightOption[], order: SortOrder): FlightOption[] {
  return [...options].sort(COMPARATORS[order]);
}

/** The option that would come first for a sort order, ignoring filters. */
export function topOptionFor(options: readonly FlightOption[], order: SortOrder): FlightOption | undefined {
  return sortOptions(options, order)[0];
}

export function applyFilters(
  options: readonly FlightOption[],
  filters: ResultsFilters,
  order: SortOrder,
): FlightOption[] {
  return sortOptions(
    options.filter((option) => matchesFilters(option, filters)),
    order,
  );
}

export function hasActiveFilters(filters: ResultsFilters): boolean {
  return (
    !filters.stops.includes(0) ||
    !filters.stops.includes(1) ||
    filters.maxPrice !== null ||
    filters.departureWindows.length > 0 ||
    filters.airlines.length > 0 ||
    filters.checkedBagOnly
  );
}

/** Lowest price among options matching `predicate`, or `null` when none do. */
export function lowestPriceWhere(
  options: readonly FlightOption[],
  predicate: (option: FlightOption) => boolean,
): number | null {
  const prices = options.filter(predicate).map(lowestFareOf);
  return prices.length ? Math.min(...prices) : null;
}

export function toggleValue<Value>(values: readonly Value[], value: Value): Value[] {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

export function isSortOrder(value: string | null): value is SortOrder {
  return SORT_ORDERS.includes(value as SortOrder);
}

import { formatPeso } from '@/lib/format';
import type { Destination, RegionId } from '@/types/destination';

export type RegionFilter = RegionId | 'all';
export type DestinationSort = 'price' | 'time' | 'name';

export const REGION_FILTERS: ReadonlyArray<{ id: RegionFilter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'ph', label: 'Philippines' },
  { id: 'eastAsia', label: 'East Asia' },
  { id: 'southeastAsia', label: 'Southeast Asia' },
  { id: 'oceania', label: 'Oceania' },
];

export const SORT_OPTIONS: ReadonlyArray<{ id: DestinationSort; label: string; phrase: string }> = [
  { id: 'price', label: 'Lowest price', phrase: 'lowest price' },
  { id: 'time', label: 'Shortest flight', phrase: 'shortest flight' },
  { id: 'name', label: 'A–Z', phrase: 'name' },
];

/** The "Under ₱10,000" filter. */
export const BUDGET_LIMIT = 10_000;

export interface DestinationFilters {
  region: RegionFilter;
  sort: DestinationSort;
  isUnderBudget: boolean;
}

const COMPARATORS: Record<DestinationSort, (a: Destination, b: Destination) => number> = {
  price: (a, b) => a.lowestFare - b.lowestFare,
  time: (a, b) => a.flightMinutes - b.flightMinutes,
  name: (a, b) => a.city.localeCompare(b.city),
};

export function inRegion(destination: Destination, region: RegionFilter): boolean {
  return region === 'all' || destination.region === region;
}

export function filterDestinations(
  destinations: readonly Destination[],
  filters: DestinationFilters,
): Destination[] {
  return destinations
    .filter((destination) => inRegion(destination, filters.region))
    .filter((destination) => !filters.isUnderBudget || destination.lowestFare < BUDGET_LIMIT)
    .sort(COMPARATORS[filters.sort]);
}

/** "1h 25m" */
export function formatFlightTime(minutes: number): string {
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, '0')}m`;
}

export function isRegionFilter(value: string | null): value is RegionFilter {
  return REGION_FILTERS.some((region) => region.id === value);
}

export function isDestinationSort(value: string | null): value is DestinationSort {
  return SORT_OPTIONS.some((option) => option.id === value);
}

export const DEFAULT_DESTINATION_FILTERS: DestinationFilters = {
  region: 'all',
  sort: 'price',
  isUnderBudget: false,
};

/** Reads the filters from `?region=…&sort=…&under=10000`, ignoring anything unknown. */
export function filtersFromParams(params: URLSearchParams): DestinationFilters {
  const region = params.get('region');
  const sort = params.get('sort');
  return {
    region: isRegionFilter(region) ? region : DEFAULT_DESTINATION_FILTERS.region,
    sort: isDestinationSort(sort) ? sort : DEFAULT_DESTINATION_FILTERS.sort,
    isUnderBudget: params.get('under') === String(BUDGET_LIMIT),
  };
}

/** Writes the filters into a copy of `params`, leaving defaults out to keep the URL short. */
export function filtersToParams(
  filters: DestinationFilters,
  params = new URLSearchParams(),
): URLSearchParams {
  const next = new URLSearchParams(params);
  const entries: Array<[string, string | null]> = [
    ['region', filters.region === DEFAULT_DESTINATION_FILTERS.region ? null : filters.region],
    ['sort', filters.sort === DEFAULT_DESTINATION_FILTERS.sort ? null : filters.sort],
    ['under', filters.isUnderBudget ? String(BUDGET_LIMIT) : null],
  ];
  for (const [key, value] of entries) {
    if (value) next.set(key, value);
    else next.delete(key);
  }
  return next;
}

/** "5 destinations in East Asia under ₱10,000 · sorted by lowest price" */
export function resultsSummary(count: number, filters: DestinationFilters): string {
  if (count === 0) return 'No destinations match';
  const region = filters.region === 'all' ? '' : ` in ${regionLabel(filters.region)}`;
  const budget = filters.isUnderBudget ? ` under ${formatPeso(BUDGET_LIMIT)}` : '';
  const sort = SORT_OPTIONS.find((option) => option.id === filters.sort)?.phrase ?? '';
  return `${count} ${count === 1 ? 'destination' : 'destinations'}${region}${budget} · sorted by ${sort}`;
}

export function regionLabel(region: RegionFilter): string {
  return REGION_FILTERS.find((candidate) => candidate.id === region)?.label ?? 'All';
}

/** How many destinations each region tab would show with the budget filter applied. */
export function regionCount(
  destinations: readonly Destination[],
  region: RegionFilter,
  isUnderBudget: boolean,
): number {
  return destinations.filter(
    (destination) =>
      inRegion(destination, region) && (!isUnderBudget || destination.lowestFare < BUDGET_LIMIT),
  ).length;
}

/** The cheapest destination in a region, ignoring the budget filter (for the empty state). */
export function cheapestIn(
  destinations: readonly Destination[],
  region: RegionFilter,
): Destination | undefined {
  return filterDestinations(destinations, { region, sort: 'price', isUnderBudget: false })[0];
}

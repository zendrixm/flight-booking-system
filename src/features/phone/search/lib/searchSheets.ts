import type { SegmentedOption } from '@/components/ui';
import type { CabinClass, TripType } from '@/types/flight';

/** The sheets the search card opens. Only one is open at a time. */
export type SearchSheet = 'from' | 'to' | 'depart' | 'return' | 'travelers';

export const TRIP_TYPE_OPTIONS: ReadonlyArray<SegmentedOption<TripType>> = [
  { value: 'round', label: 'Round trip' },
  { value: 'oneway', label: 'One way' },
  { value: 'multi', label: 'Multi-city' },
];

/** The app sells three cabins; First is booked on the website. */
export const PHONE_CABINS: readonly CabinClass[] = ['Economy', 'Premium economy', 'Business'];

/** Airports listed first in the "Flying from" sheet. */
export const NEARBY_AIRPORTS = ['MNL', 'CRK'] as const;

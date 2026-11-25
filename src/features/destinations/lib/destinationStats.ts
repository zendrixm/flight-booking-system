import { formatPeso } from '@/lib/format';
import type { Destination } from '@/types/destination';

import { formatFlightTime } from './destinationFilters';

export interface DestinationStat {
  label: string;
  value: string;
  detail: string;
}

function extremeBy(
  destinations: readonly Destination[],
  score: (destination: Destination) => number,
  pick: 'min' | 'max',
) {
  return destinations.reduce((best, destination) =>
    (pick === 'min' ? score(destination) < score(best) : score(destination) > score(best))
      ? destination
      : best,
  );
}

/** The three headline numbers in the hero: cheapest fare, shortest hop and longest nonstop. */
export function destinationStats(destinations: readonly Destination[]): DestinationStat[] {
  if (destinations.length === 0) return [];
  const cheapest = extremeBy(destinations, (destination) => destination.lowestFare, 'min');
  const shortest = extremeBy(destinations, (destination) => destination.flightMinutes, 'min');
  const furthest = extremeBy(destinations, (destination) => destination.flightMinutes, 'max');
  return [
    { label: 'Lowest fare', value: formatPeso(cheapest.lowestFare), detail: `${cheapest.city}, round trip` },
    { label: 'Shortest hop', value: formatFlightTime(shortest.flightMinutes), detail: shortest.city },
    {
      label: 'Furthest',
      value: formatFlightTime(furthest.flightMinutes),
      detail: `${furthest.city}, nonstop`,
    },
  ];
}

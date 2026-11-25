import type { AirlineCode } from '@/types/console/booking';
import type { AirlineId } from '@/types/flight';

/** Two-letter flight-number prefixes used across Vela Console. */
export const AIRLINE_NAMES: Record<AirlineCode, string> = {
  MR: 'Meridian Air',
  PQ: 'Pacific Crest',
  HC: 'Halcyon',
  SJ: 'Solenne',
  KS: 'Kestrel Airways',
};

/** The customer-site airline for each designator, e.g. to show its monogram tile. */
export const AIRLINE_IDS: Record<AirlineCode, AirlineId> = {
  MR: 'meridian',
  PQ: 'crest',
  HC: 'halcyon',
  SJ: 'solenne',
  KS: 'kestrel',
};

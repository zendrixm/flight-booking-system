import type { StatusTone } from '@/components/ui';
import { topOptionFor, type ResultsFilters, type SortOrder } from '@/features/booking/lib/resultsFilters';
import { INITIAL_TRACK_PRICES_FORM, type TrackPricesForm } from '@/features/booking/lib/trackPricesForm';
import type { DepartureWindow, FlightOption } from '@/types/flight';

/** The departure windows the phone filters offer; overnight departures are rare from Manila. */
export const PHONE_DEPARTURE_WINDOWS: ReadonlyArray<{
  value: DepartureWindow;
  label: string;
  hours: string;
}> = [
  { value: 'morning', label: 'Morning', hours: '06–12' },
  { value: 'afternoon', label: 'Afternoon', hours: '12–18' },
  { value: 'evening', label: 'Evening', hours: '18–24' },
];

export const SORT_LABELS: Record<SortOrder, string> = {
  best: 'Best',
  cheapest: 'Cheapest',
  fastest: 'Fastest',
};

const TAG_TONES: Record<SortOrder, StatusTone> = { best: 'solid', cheapest: 'success', fastest: 'brass' };

/** The one tag a card shows: the option that tops Best, else Cheapest, else Fastest. */
export function resultTagOf(
  option: FlightOption,
  options: readonly FlightOption[],
): { label: string; tone: StatusTone } | null {
  const order = (['best', 'cheapest', 'fastest'] as const).find(
    (sort) => topOptionFor(options, sort)?.id === option.id,
  );
  return order ? { label: SORT_LABELS[order], tone: TAG_TONES[order] } : null;
}

export function isNonstopOnly(filters: ResultsFilters): boolean {
  return !filters.stops.includes(1);
}

export function withNonstopOnly(filters: ResultsFilters, nonstopOnly: boolean): ResultsFilters {
  return { ...filters, stops: nonstopOnly ? [0] : [0, 1] };
}

/** Nonstop only, each departure window and each airline count as one filter. */
export function activeFilterCount(filters: ResultsFilters): number {
  return (isNonstopOnly(filters) ? 1 : 0) + filters.departureWindows.length + filters.airlines.length;
}

/** On the phone, alerts default to a target price and arrive as push notifications. */
export const PHONE_TRACK_PRICES_FORM: TrackPricesForm = {
  ...INITIAL_TRACK_PRICES_FORM,
  mode: 'below',
  notifyByPush: true,
  notifyByEmail: false,
};

import { CABIN_CLASSES, type CabinClass, type FlightSearchParams, type TripType } from '@/types/flight';

export const DEFAULT_SEARCH: FlightSearchParams = {
  tripType: 'round',
  from: 'MNL',
  to: 'HND',
  departDate: '2026-11-12',
  returnDate: '2026-11-19',
  adults: 2,
  children: 0,
  infants: 0,
  cabin: 'Economy',
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Serialises a search for the results URL, e.g. /flights?from=MNL&to=HND&depart=2026-11-12… */
export function searchToQueryString(params: FlightSearchParams): string {
  const query = new URLSearchParams({
    trip: params.tripType,
    from: params.from,
    to: params.to,
    depart: params.departDate,
    adults: String(params.adults),
    cabin: params.cabin,
  });
  if (params.returnDate) query.set('return', params.returnDate);
  if (params.children) query.set('children', String(params.children));
  if (params.infants) query.set('infants', String(params.infants));
  return query.toString();
}

function readCount(value: string | null, fallback: number, min: number, max: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= min && parsed <= max ? parsed : fallback;
}

/** Reads a search from the URL, falling back to the demo search for anything missing or invalid. */
export function searchFromQuery(query: URLSearchParams): FlightSearchParams {
  const trip = query.get('trip');
  const tripType: TripType = trip === 'oneway' || trip === 'multi' ? trip : 'round';
  const depart = query.get('depart');
  const returnDate = query.get('return');
  const cabin = query.get('cabin');

  return {
    tripType,
    from: query.get('from')?.toUpperCase() || DEFAULT_SEARCH.from,
    to: query.get('to')?.toUpperCase() || DEFAULT_SEARCH.to,
    departDate: depart && ISO_DATE.test(depart) ? depart : DEFAULT_SEARCH.departDate,
    returnDate:
      tripType === 'round'
        ? returnDate && ISO_DATE.test(returnDate)
          ? returnDate
          : DEFAULT_SEARCH.returnDate
        : null,
    adults: readCount(query.get('adults'), DEFAULT_SEARCH.adults, 1, 9),
    children: readCount(query.get('children'), 0, 0, 8),
    infants: readCount(query.get('infants'), 0, 0, 9),
    cabin: CABIN_CLASSES.includes(cabin as CabinClass) ? (cabin as CabinClass) : DEFAULT_SEARCH.cabin,
  };
}

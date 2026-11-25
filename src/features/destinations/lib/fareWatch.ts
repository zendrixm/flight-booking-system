import { paths } from '@/app/paths';
import { DEFAULT_SEARCH, searchToQueryString } from '@/lib/flightSearchUrl';
import type { Destination } from '@/types/destination';
import type { NewPriceAlert, PriceAlert } from '@/types/priceAlert';

/** Every fare on the destinations page is from Manila. */
export const ORIGIN_CODE = 'MNL';

/** "Watch fare" follows the route on any dates, like the fares on the page. */
export const FARE_WATCH_DATES_LABEL = 'Any dates · next 6 months';

export function destinationResultsUrl(destinationCode: string): string {
  return `${paths.flights}?${searchToQueryString({ ...DEFAULT_SEARCH, from: ORIGIN_CODE, to: destinationCode, adults: 1 })}`;
}

export function fareWatchFor(destination: Destination): NewPriceAlert {
  return {
    from: ORIGIN_CODE,
    to: destination.code,
    departDate: null,
    returnDate: null,
    datesLabel: FARE_WATCH_DATES_LABEL,
    travelersLabel: '1 adult · Economy',
    mode: 'drop',
    targetPrice: null,
    watchNearbyDates: true,
    channels: { email: true, push: false },
  };
}

/** Alert ids of the fare watches made from this page, by destination code. */
export function fareWatchesByCode(alerts: readonly PriceAlert[]): Record<string, string> {
  return Object.fromEntries(
    alerts
      .filter((alert) => alert.from === ORIGIN_CODE && alert.datesLabel === FARE_WATCH_DATES_LABEL)
      .map((alert) => [alert.to, alert.id]),
  );
}

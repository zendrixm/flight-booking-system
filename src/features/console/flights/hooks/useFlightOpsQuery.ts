import { setOrDelete, useUrlQuery } from '@/hooks';
import type { IsoDate } from '@/lib/date';

import { filterFromParam, filterToParam, type FlightStatusFilter } from '../lib/flightOpsPresentation';

interface QueryChanges {
  day?: IsoDate;
  /** `null` closes the details drawer. */
  flight?: string | null;
  filter?: FlightStatusFilter;
}

/**
 * Flight operations' view state in the URL, so a link opens the same day, filter and flight:
 * `?day=2026-10-10&status=delayed&flight=PQ117`. Search links carry only `?flight=`, and the
 * board then opens on the day that flight operates.
 */
export function useFlightOpsQuery() {
  const [searchParams, updateQuery] = useUrlQuery();
  const requestedDate = searchParams.get('day');
  const drawerFlightId = searchParams.get('flight')?.toUpperCase() ?? null;
  const filter = filterFromParam(searchParams.get('status'));

  /** Key for loading the board: a day, or the flight a search link asked for. */
  const boardKey = requestedDate ?? `flight:${drawerFlightId ?? ''}`;

  /**
   * Writes the query. The day on screen is always written, so later changes (like opening a
   * flight) never send the board back to look the day up again.
   */
  const update = (shownDate: IsoDate, changes: QueryChanges) =>
    updateQuery((params) => {
      params.set('day', changes.day ?? shownDate);
      if (changes.filter !== undefined) setOrDelete(params, 'status', filterToParam(changes.filter));
      if (changes.flight !== undefined) setOrDelete(params, 'flight', changes.flight);
    });

  return { requestedDate, drawerFlightId, filter, boardKey, update };
}

export type FlightOpsQuery = ReturnType<typeof useFlightOpsQuery>;

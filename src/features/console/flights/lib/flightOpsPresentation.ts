import { daysBetween, formatCompactDay, type IsoDate } from '@/lib/date';
import type { FlightOpsRecord, FlightPhase, OpsFlight } from '@/types/console/flightOps';

import type { FilterDotTone } from '../../shared/components/FilterChips';

export type FlightStatusFilter = 'all' | FlightPhase;

export const STATUS_FILTERS: ReadonlyArray<{ id: FlightStatusFilter; label: string; dot: FilterDotTone }> = [
  { id: 'all', label: 'All flights', dot: 'neutral' },
  { id: 'onTime', label: 'On time', dot: 'success' },
  { id: 'delayed', label: 'Delayed', dot: 'warning' },
  { id: 'cancelled', label: 'Cancelled', dot: 'danger' },
  { id: 'departed', label: 'Departed', dot: 'neutral' },
];

/** URL values for the status filter: `?status=on-time`. */
const FILTER_SLUGS: Record<FlightStatusFilter, string> = {
  all: '',
  onTime: 'on-time',
  delayed: 'delayed',
  cancelled: 'cancelled',
  departed: 'departed',
};

export function filterToParam(filter: FlightStatusFilter): string {
  return FILTER_SLUGS[filter];
}

export function filterFromParam(value: string | null): FlightStatusFilter {
  const match = (Object.keys(FILTER_SLUGS) as FlightStatusFilter[]).find(
    (filter) => FILTER_SLUGS[filter] === value,
  );
  return match ?? 'all';
}

export function matchesFilter(flight: OpsFlight, filter: FlightStatusFilter): boolean {
  return filter === 'all' || flight.phase === filter;
}

export function countMatching(records: readonly FlightOpsRecord[], filter: FlightStatusFilter): number {
  return records.filter((record) => matchesFilter(record.flight, filter)).length;
}

/** "No cancelled flights on Sat 10 Oct." */
export function emptyFilterMessage(filter: FlightStatusFilter, date: IsoDate): string {
  const label = STATUS_FILTERS.find((option) => option.id === filter)?.label ?? 'matching';
  return `No ${label.toLowerCase()} flights on ${formatCompactDay(date)}.`;
}

/** "Today · Fri 9 Oct"; days further out show only the date. */
export function operatingDayLabel(date: IsoDate, today: IsoDate): string {
  const prefix = { [-1]: 'Yesterday', 0: 'Today', 1: 'Tomorrow' }[daysBetween(today, date)];
  return prefix ? `${prefix} · ${formatCompactDay(date)}` : formatCompactDay(date);
}

/**
 * The flight the status panel opens on: the first delay, then the first flight that hasn't left.
 * Keeps ops looking at what needs attention.
 */
export function defaultFlightId(records: readonly FlightOpsRecord[]): string | undefined {
  const flights = records.map((record) => record.flight);
  return (
    flights.find((flight) => flight.phase === 'delayed') ??
    flights.find((flight) => flight.phase !== 'departed') ??
    flights[0]
  )?.id;
}

/** Departed flights belong to the airline feed. */
export function isStatusLocked(flight: OpsFlight): boolean {
  return flight.phase === 'departed';
}

export function lockedStatusMessage(record: FlightOpsRecord): string {
  const { flight, airlineName } = record;
  const verb = flight.status.label === 'Landed' ? 'landed' : 'departed';
  return `${flight.flightNumber} has ${verb}. Status now comes from the ${airlineName} feed and can’t be edited.`;
}

export function loadLabel(flight: OpsFlight): string {
  return flight.loadPercent ? `${flight.loadPercent}%` : '—';
}

/** "Delayed 2h 10m · departs 14:50" or just "On time". */
export function statusWithDeparture(flight: OpsFlight): string {
  return flight.phase === 'delayed' && flight.estimatedTime !== '—'
    ? `${flight.status.label} · departs ${flight.estimatedTime}`
    : flight.status.label;
}

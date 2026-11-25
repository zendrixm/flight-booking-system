import {
  addDays,
  daysBetween,
  formatDayLabel,
  formatShortDate,
  MONTHS_LONG,
  parseIsoDate,
  type IsoDate,
} from '@/lib/date';
import type { Trip } from '@/types/trip';

/** Online check-in opens 48 hours before departure. */
export const CHECK_IN_OPENS_DAYS_BEFORE = 2;

/** "Departs today", "Departs tomorrow", "In 34 days". */
export function departureCountdown(departDate: IsoDate, today: IsoDate): string {
  const days = daysBetween(today, departDate);
  if (days <= 0) return 'Departs today';
  if (days === 1) return 'Departs tomorrow';
  return `In ${days} days`;
}

export function isCheckInOpen(trip: Trip, today: IsoDate): boolean {
  const days = daysBetween(today, trip.departDate);
  return trip.status === 'upcoming' && days >= 0 && days <= CHECK_IN_OPENS_DAYS_BEFORE - 1;
}

/** "Tue, 10 Nov · 08:40" */
export function checkInOpensLabel(trip: Trip): string {
  return `${formatDayLabel(addDays(trip.departDate, -CHECK_IN_OPENS_DAYS_BEFORE))} · ${trip.outbound.departure.time}`;
}

/** "Thu, 12 Nov – Thu, 19 Nov" */
export function tripDateRange(trip: Trip): string {
  return trip.returnDate
    ? `${formatDayLabel(trip.departDate)} – ${formatDayLabel(trip.returnDate)}`
    : formatDayLabel(trip.departDate);
}

/** "14 – 17 Aug 2026" */
export function pastTripDateRange(trip: Trip): string {
  if (!trip.returnDate) return formatShortDate(trip.departDate);
  const start = parseIsoDate(trip.departDate);
  const end = parseIsoDate(trip.returnDate);
  const sameMonth =
    start.getUTCMonth() === end.getUTCMonth() && start.getUTCFullYear() === end.getUTCFullYear();
  return sameMonth
    ? `${start.getUTCDate()} – ${formatShortDate(trip.returnDate)}`
    : `${formatShortDate(trip.departDate)} – ${formatShortDate(trip.returnDate)}`;
}

/** "your August trip" (this year) or "your December 2025 trip". */
export function tripMonthPhrase(trip: Trip, today: IsoDate): string {
  const date = parseIsoDate(trip.departDate);
  const month = MONTHS_LONG[date.getUTCMonth()];
  const sameYear = date.getUTCFullYear() === parseIsoDate(today).getUTCFullYear();
  const cancelled = trip.status === 'cancelled' ? 'cancelled ' : '';
  return `your ${cancelled}${month}${sameYear ? '' : ` ${date.getUTCFullYear()}`} trip`;
}

export function tripNights(trip: Trip): number {
  return trip.returnDate ? daysBetween(trip.departDate, trip.returnDate) : 0;
}

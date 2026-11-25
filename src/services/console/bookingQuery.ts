import { addDays, type IsoDate } from '@/lib/date';
import type {
  BookingFilters,
  BookingListQuery,
  BookingView,
  ConsoleBooking,
  ConsoleBookingStatus,
  CreatedRange,
} from '@/types/console/booking';

/**
 * How the bookings endpoint filters the ledger. Kept apart from the service so the rules can be
 * unit-tested and read in one place.
 */

const NEEDS_ACTION: readonly ConsoleBookingStatus[] = [
  'Ticketing',
  'Payment failed',
  'Schedule change',
  'Refund requested',
];

/** Statuses with e-tickets, so an itinerary can be resent. */
export const TICKETED_STATUSES: readonly ConsoleBookingStatus[] = [
  'Ticketed',
  'Checked in',
  'Schedule change',
  'Refund requested',
];

export const BOOKING_VIEWS: readonly BookingView[] = [
  'all',
  'needsAction',
  'ticketing',
  'refundRequested',
  'cancelled',
];
export const CREATED_RANGES: readonly CreatedRange[] = ['today', 'yesterday', 'week', 'month'];

export function matchesView(booking: ConsoleBooking, view: BookingView): boolean {
  switch (view) {
    case 'needsAction':
      return NEEDS_ACTION.includes(booking.status);
    case 'ticketing':
      return booking.status === 'Ticketing';
    case 'refundRequested':
      return booking.status === 'Refund requested';
    case 'cancelled':
      return booking.status === 'Cancelled';
    default:
      return true;
  }
}

/** First and last creation date of each range, relative to `today`. */
export function createdRangeBounds(range: CreatedRange, today: IsoDate): { from: IsoDate; to: IsoDate } {
  switch (range) {
    case 'today':
      return { from: today, to: today };
    case 'yesterday':
      return { from: addDays(today, -1), to: addDays(today, -1) };
    case 'week':
      return { from: addDays(today, -6), to: today };
    default:
      return { from: addDays(today, -29), to: today };
  }
}

export function isCreatedIn(booking: ConsoleBooking, range: CreatedRange, today: IsoDate): boolean {
  const { from, to } = createdRangeBounds(range, today);
  const createdOn = booking.createdAt.slice(0, 10);
  return createdOn >= from && createdOn <= to;
}

export function matchesFilters(booking: ConsoleBooking, filters: BookingFilters): boolean {
  if (filters.market && booking.market !== filters.market) return false;
  if (filters.payment && booking.payment !== filters.payment) return false;
  if (filters.airline && booking.airline !== filters.airline) return false;
  if (filters.tripType && (filters.tripType === 'return') !== booking.route.includes('⇄')) return false;
  if (filters.assignedToMe && !booking.isAssignedToMe) return false;
  return true;
}

export function matchesSearch(booking: ConsoleBooking, search: string): boolean {
  const needle = search.trim().toLowerCase();
  if (!needle) return true;
  return `${booking.reference} ${booking.leadTraveler} ${booking.email}`.toLowerCase().includes(needle);
}

/** Everything except the view and the date range. */
export function matchesSearchAndFilters(booking: ConsoleBooking, query: BookingListQuery): boolean {
  return (
    (query.channel === 'all' || booking.channel === query.channel) &&
    matchesFilters(booking, query.filters) &&
    matchesSearch(booking, query.search)
  );
}

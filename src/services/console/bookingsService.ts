import { CONSOLE_BOOKINGS, LEDGER_TODAY, MANUAL_BOOKING_REFERENCES } from '@/mocks/console/bookings';
import type {
  BookingExportRequest,
  BookingListQuery,
  BookingListResult,
  BookingView,
  ConsoleBooking,
  CreatedRange,
  ManualBookingInput,
} from '@/types/console/booking';
import type { PreparedExport } from '@/types/console/export';

import { ApiError, mockRequest } from '../mockApi';
import {
  BOOKING_VIEWS,
  CREATED_RANGES,
  isCreatedIn,
  matchesSearchAndFilters,
  matchesView,
  TICKETED_STATUSES,
} from './bookingQuery';

/** Bookings made in the console this session, newest first. */
let manualBookings: ConsoleBooking[] = [];
const assignedReferences = new Set<string>();

function ledger(): ConsoleBooking[] {
  return [...manualBookings, ...CONSOLE_BOOKINGS].map((booking) => ({
    ...booking,
    isAssignedToMe: assignedReferences.has(booking.reference),
  }));
}

function runQuery(bookings: ConsoleBooking[], query: BookingListQuery) {
  const searchable = bookings.filter((booking) => matchesSearchAndFilters(booking, query));
  const inRange = searchable.filter((booking) => isCreatedIn(booking, query.range, LEDGER_TODAY));
  const matches = inRange.filter((booking) => matchesView(booking, query.view));
  return { searchable, inRange, matches };
}

export function listConsoleBookings(query: BookingListQuery): Promise<BookingListResult> {
  return mockRequest(() => {
    const { searchable, inRange, matches } = runQuery(ledger(), query);
    const start = query.page * query.pageSize;
    return {
      rows: matches.slice(start, start + query.pageSize),
      total: matches.length,
      inRange: inRange.length,
      viewCounts: Object.fromEntries(
        BOOKING_VIEWS.map((view) => [view, inRange.filter((booking) => matchesView(booking, view)).length]),
      ) as Record<BookingView, number>,
      rangeCounts: Object.fromEntries(
        CREATED_RANGES.map((range) => [
          range,
          searchable.filter((booking) => isCreatedIn(booking, range, LEDGER_TODAY)).length,
        ]),
      ) as Record<CreatedRange, number>,
      hasMatchesInLast30Days: searchable.some(
        (booking) => isCreatedIn(booking, 'month', LEDGER_TODAY) && matchesView(booking, query.view),
      ),
    };
  }, 150);
}

export function getConsoleBookings(references: readonly string[]): Promise<ConsoleBooking[]> {
  return mockRequest(() => {
    const byReference = new Map(ledger().map((booking) => [booking.reference, booking]));
    return references.flatMap((reference) => byReference.get(reference) ?? []);
  });
}

export function findConsoleBooking(reference: string): Promise<ConsoleBooking | null> {
  return mockRequest(() => ledger().find((booking) => booking.reference === reference.toUpperCase()) ?? null);
}

export function assignBookingsToMe(references: readonly string[]): Promise<number> {
  return mockRequest(() => {
    references.forEach((reference) => assignedReferences.add(reference));
    return references.length;
  });
}

/** Only ticketed bookings have an itinerary to resend; the rest are skipped. */
export function resendItineraries(references: readonly string[]): Promise<{ sent: number; skipped: number }> {
  return mockRequest(() => {
    const selected = new Set(references);
    const bookings = ledger().filter((booking) => selected.has(booking.reference));
    const sent = bookings.filter((booking) => TICKETED_STATUSES.includes(booking.status)).length;
    return { sent, skipped: bookings.length - sent };
  }, 600);
}

const VIEW_FILE_SLUG: Record<BookingView, string> = {
  all: '',
  needsAction: '_needs-action',
  ticketing: '_ticketing',
  refundRequested: '_refund-requested',
  cancelled: '_cancelled',
};

const RANGE_FILE_SLUG: Record<CreatedRange, string> = {
  today: '2026-10-09',
  yesterday: '2026-10-08',
  week: '2026-10-03_to_2026-10-09',
  month: '2026-09-10_to_2026-10-09',
};

function describeExport(request: BookingExportRequest): PreparedExport {
  const rowCount = request.references
    ? request.references.length
    : runQuery(ledger(), request.query).matches.length;
  const columnCount = request.columns.length;
  const scopeSlug = request.references ? '_selected' : VIEW_FILE_SLUG[request.query.view];
  const isXlsx = request.format === 'xlsx';
  const bytes = Math.max(1, rowCount) * Math.max(1, columnCount) * (isXlsx ? 11 : 17) + (isXlsx ? 6000 : 200);
  return {
    fileName: `vela-bookings_${RANGE_FILE_SLUG[request.query.range]}${scopeSlug}.${request.format}`,
    summary: `${rowCount.toLocaleString('en-US')} ${rowCount === 1 ? 'booking' : 'bookings'} × ${columnCount} columns`,
    sizeLabel:
      bytes >= 1_000_000
        ? `${(bytes / 1_000_000).toFixed(1)} MB`
        : `${Math.max(1, Math.round(bytes / 1000))} KB`,
  };
}

export function previewBookingExport(request: BookingExportRequest): Promise<PreparedExport> {
  return mockRequest(() => describeExport(request), 80);
}

export function prepareBookingExport(request: BookingExportRequest): Promise<PreparedExport> {
  if (request.columns.length === 0) {
    return Promise.reject(new ApiError('no_columns', 'Choose at least one column to export.'));
  }
  return mockRequest(() => describeExport(request), 1200);
}

/** Holds seats and sends the payment link (or raises an invoice). */
export function createManualBooking(input: ManualBookingInput): Promise<ConsoleBooking> {
  return mockRequest(() => {
    const taken = new Set(ledger().map((booking) => booking.reference));
    const reference =
      MANUAL_BOOKING_REFERENCES.find((candidate) => !taken.has(candidate)) ??
      `VL${manualBookings.length + 1}NEW`;
    const booking: ConsoleBooking = {
      reference,
      leadTraveler: `${input.firstName} ${input.lastName}`.replace(/\s+/g, ' ').trim(),
      email: input.email,
      route: `${input.from} ${input.tripType === 'return' ? '⇄' : '→'} ${input.to}`,
      airline: input.airline,
      departureDate: input.departDate,
      travelerCount: input.travelerCount,
      channel: 'Agent',
      total: input.total,
      payment: input.paymentMethod === 'invoice' ? 'Invoiced' : 'Pending',
      status: 'Awaiting payment',
      createdAt: `${LEDGER_TODAY}T00:59`,
      market: 'PH',
      isAssignedToMe: false,
      manual: { fare: input.fare, phone: input.phone, note: input.note },
    };
    manualBookings = [booking, ...manualBookings];
    return booking;
  }, 700);
}

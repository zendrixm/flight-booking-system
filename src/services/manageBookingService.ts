import { formatDayMonth } from '@/lib/date';
import {
  CHANGE_OPTIONS,
  MANAGED_BOOKINGS,
  SOLD_OUT_FLIGHTS,
  VL7Q2K_REFUND_ROWS,
} from '@/mocks/managedBookings';
import { SAVED_TRAVELERS } from '@/mocks/savedTravelers';
import { ACCOUNT_TRIPS, GUEST_TRIPS } from '@/mocks/trips';
import type {
  ManagedBooking,
  ManagedTraveler,
  RefundMethod,
  SegmentKey,
  TripContact,
} from '@/types/managedBooking';
import type { Trip } from '@/types/trip';

import { ApiError, mockRequest } from './mockApi';

export { CHANGE_OPTIONS, SOLD_OUT_FLIGHTS };

/** Vela travel credit adds 10% to refunds taken as credit. */
export const TRAVEL_CREDIT_BONUS = 0.1;
export const CHANGE_FEE_PER_TRAVELER = 2500;
/** Each extra 23 kg bag added after booking, per flight. */
export const EXTRA_BAG_PRICE_PER_FLIGHT = 1200;

const bookings = new Map<string, ManagedBooking>(
  MANAGED_BOOKINGS.map((booking) => [booking.reference, structuredClone(booking)]),
);

/** Bookings without a hand-written fixture get a simple one built from the trip and the account holder. */
function fromTrip(trip: Trip): ManagedBooking {
  const holder = SAVED_TRAVELERS[0];
  const [day, month, year] = [
    holder.passportExpiry.slice(8, 10),
    holder.passportExpiry.slice(5, 7),
    holder.passportExpiry.slice(0, 4),
  ];
  const traveler: ManagedTraveler = {
    id: 'andrea',
    title: holder.title,
    firstNames: holder.firstNames,
    lastName: holder.lastName,
    dateOfBirth: holder.dateOfBirth,
    passportNumber: holder.passportNumber,
    passportExpiry: `${day}/${month}/${year}`,
    passportNationality: 'PH',
    seats: { outbound: '14C', inbound: '14C' },
    checkedBags: 1,
    assistanceRequests: [],
    pendingNameCorrection: null,
  };
  const { outbound } = trip;
  return {
    reference: trip.reference,
    status: trip.status === 'cancelled' ? 'cancelled' : 'confirmed',
    city: trip.city,
    airlineName: trip.airlineName,
    fareName: trip.fareDescription.split(' ')[0],
    cabin: 'Economy',
    flights: [
      {
        segment: 'outbound',
        date: trip.departDate,
        flightNumber: outbound.flightNumber,
        departureTime: outbound.departure.time,
        arrivalTime: outbound.arrival.time,
        from: outbound.departure.airportCode,
        to: outbound.arrival.airportCode,
        fromTerminal: outbound.departure.terminal,
        toTerminal: outbound.arrival.terminal,
        aircraft: 'A321neo',
        durationMinutes: outbound.durationMinutes,
      },
    ],
    travelers: [traveler],
    contact: {
      email: 'andrea.reyes@example.com',
      mobile: '917 482 4567',
      alternateMobile: '',
      textUpdates: true,
      emailUpdates: true,
    },
    payments: [
      {
        date: trip.departDate,
        label: `${trip.receipt.bookedAt.split(',')[0]} · Card ending ${trip.receipt.cardLast4}`,
        amount: trip.receipt.lines.reduce((sum, line) => sum + line.amount, 0),
      },
    ],
    receiptNumber: trip.receipt.number,
    bookedAt: trip.receipt.bookedAt,
    receiptLines: trip.receipt.lines,
    cardLast4: trip.receipt.cardLast4,
    hasProtection: false,
    checkInReminder: null,
    refund: null,
  };
}

function requireBooking(reference: string): ManagedBooking {
  const existing = bookings.get(reference);
  if (existing) return existing;
  const trip = [...ACCOUNT_TRIPS, ...GUEST_TRIPS].find((candidate) => candidate.reference === reference);
  if (!trip) throw new ApiError('not_found', `No booking with reference ${reference}.`);
  const created = fromTrip(trip);
  bookings.set(reference, created);
  return created;
}

function update(
  reference: string,
  change: (booking: ManagedBooking) => ManagedBooking,
): Promise<ManagedBooking> {
  return mockRequest(() => {
    const next = change(requireBooking(reference));
    bookings.set(reference, next);
    return next;
  });
}

function updateTraveler(
  booking: ManagedBooking,
  travelerId: string,
  patch: Partial<ManagedTraveler>,
): ManagedBooking {
  return {
    ...booking,
    travelers: booking.travelers.map((traveler) =>
      traveler.id === travelerId ? { ...traveler, ...patch } : traveler,
    ),
  };
}

function addPayment(
  booking: ManagedBooking,
  label: string,
  amount: number,
  receiptLabel: string,
  detail: string,
): ManagedBooking {
  if (amount <= 0) return booking;
  return {
    ...booking,
    payments: [...booking.payments, { date: '2026-10-09', label: `Today · ${label}`, amount }],
    receiptLines: [...booking.receiptLines, { label: receiptLabel, detail, amount }],
  };
}

export function getManagedBooking(reference: string): Promise<ManagedBooking> {
  return mockRequest(() => requireBooking(reference));
}

export interface FlightChange {
  segment: SegmentKey;
  date: string;
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
}

export function changeFlights(
  reference: string,
  changes: FlightChange[],
  amount: number,
): Promise<ManagedBooking> {
  return update(reference, (booking) => {
    const first = changes[0];
    const changed = {
      ...booking,
      flights: booking.flights.map((flight) => {
        const change = changes.find((candidate) => candidate.segment === flight.segment);
        return change ? { ...flight, ...change, changedOn: '2026-10-09' } : flight;
      }),
    };
    return addPayment(
      changed,
      'Flight change',
      amount,
      `Flight change · ${first ? formatDayMonth(first.date) : 'today'}`,
      `Change fee ₱${(CHANGE_FEE_PER_TRAVELER * booking.travelers.length).toLocaleString('en-US')} + fare difference · card ending ${booking.cardLast4}`,
    );
  });
}

export function saveSeats(
  reference: string,
  seats: Record<string, Record<SegmentKey, string>>,
  amount: number,
): Promise<ManagedBooking> {
  return update(reference, (booking) =>
    addPayment(
      {
        ...booking,
        travelers: booking.travelers.map((traveler) => ({
          ...traveler,
          seats: seats[traveler.id] ?? traveler.seats,
        })),
      },
      'Seat change',
      amount,
      'Seat change · today',
      `Paid seats · card ending ${booking.cardLast4}`,
    ),
  );
}

export function addBags(
  reference: string,
  extraBags: Record<string, number>,
  pricePerBag: number,
): Promise<ManagedBooking> {
  return update(reference, (booking) => {
    const total = Object.values(extraBags).reduce((sum, count) => sum + count, 0);
    return addPayment(
      {
        ...booking,
        travelers: booking.travelers.map((traveler) => ({
          ...traveler,
          checkedBags: traveler.checkedBags + (extraBags[traveler.id] ?? 0),
        })),
      },
      'Extra baggage',
      total * pricePerBag,
      'Extra baggage · added today',
      `${total} × 23 kg on both flights`,
    );
  });
}

export function requestAssistance(
  reference: string,
  travelerId: string,
  requests: string[],
): Promise<ManagedBooking> {
  return update(reference, (booking) =>
    updateTraveler(booking, travelerId, { assistanceRequests: requests }),
  );
}

export function requestNameCorrection(
  reference: string,
  travelerId: string,
  newName: string,
): Promise<ManagedBooking> {
  return update(reference, (booking) =>
    updateTraveler(booking, travelerId, { pendingNameCorrection: newName }),
  );
}

export function updatePassport(
  reference: string,
  travelerId: string,
  passport: { passportNumber: string; passportExpiry: string; passportNationality: string },
): Promise<ManagedBooking> {
  return update(reference, (booking) => updateTraveler(booking, travelerId, passport));
}

export function updateContact(reference: string, contact: TripContact): Promise<ManagedBooking> {
  return update(reference, (booking) => ({ ...booking, contact }));
}

export function setCheckInReminder(
  reference: string,
  channels: { email: boolean; sms: boolean },
): Promise<ManagedBooking> {
  return update(reference, (booking) => ({ ...booking, checkInReminder: channels }));
}

export function refundRowsFor(
  reference: string,
): ReadonlyArray<{ item: string; paid: number; refund: number }> {
  return reference === 'VL7Q2K' ? VL7Q2K_REFUND_ROWS : [];
}

/** The refund for each method: credit includes the bonus. */
export function refundAmounts(reference: string): Record<RefundMethod, number> {
  const cash = refundRowsFor(reference).reduce((sum, row) => sum + row.refund, 0);
  return { card: cash, credit: Math.round(cash * (1 + TRAVEL_CREDIT_BONUS)) };
}

export function cancelBooking(reference: string, method: RefundMethod): Promise<ManagedBooking> {
  return update(reference, (booking) => ({
    ...booking,
    status: 'cancelled',
    refund: { method, amount: refundAmounts(reference)[method] },
    payments: [
      ...booking.payments,
      { date: '2026-10-09', label: 'Today · Refund pending', amount: -refundAmounts(reference)[method] },
    ],
  }));
}

export interface InvoiceRequest {
  company: string;
  tin: string;
  address: string;
  email: string;
}

export function requestInvoice(reference: string, request: InvoiceRequest): Promise<InvoiceRequest> {
  return mockRequest(() => {
    requireBooking(reference);
    return request;
  });
}

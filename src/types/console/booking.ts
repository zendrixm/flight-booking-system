import type { IsoDate } from '@/lib/date';

export type MarketCode = 'PH' | 'SG' | 'JP';
export type AirlineCode = 'MR' | 'PQ' | 'HC' | 'SJ' | 'KS';
export type BookingChannel = 'Web' | 'App' | 'Agent';
export type PaymentState = 'Captured' | 'Authorized' | 'Declined' | 'Refunded' | 'Pending' | 'Invoiced';
export type ConsoleBookingStatus =
  | 'Ticketed'
  | 'Ticketing'
  | 'Payment failed'
  | 'Checked in'
  | 'Schedule change'
  | 'Refund requested'
  | 'Cancelled'
  | 'Flown'
  | 'Awaiting payment';
export type FareName = 'Saver' | 'Classic' | 'Flex';

/** A booking as the console lists it. */
export interface ConsoleBooking {
  reference: string;
  leadTraveler: string;
  email: string;
  /** "MNL ⇄ HND" for a return trip, "MNL → SIN" for one-way. */
  route: string;
  airline: AirlineCode;
  departureDate: IsoDate;
  travelerCount: number;
  channel: BookingChannel;
  total: number;
  payment: PaymentState;
  status: ConsoleBookingStatus;
  /** Local Manila time, "2026-10-09T00:41". */
  createdAt: string;
  market: MarketCode;
  isAssignedToMe: boolean;
  /** Set on bookings an agent made in the console. */
  manual?: { fare: FareName; phone: string; note: string };
}

export type BookingView = 'all' | 'needsAction' | 'ticketing' | 'refundRequested' | 'cancelled';
export type CreatedRange = 'today' | 'yesterday' | 'week' | 'month';
export type TripType = 'return' | 'oneway';

export interface BookingFilters {
  market?: MarketCode;
  payment?: PaymentState;
  airline?: AirlineCode;
  tripType?: TripType;
  assignedToMe?: boolean;
}

export interface BookingListQuery {
  view: BookingView;
  range: CreatedRange;
  channel: BookingChannel | 'all';
  filters: BookingFilters;
  /** Reference, traveler name or email. */
  search: string;
  page: number;
  pageSize: number;
}

export interface BookingListResult {
  rows: ConsoleBooking[];
  /** Matches in the current view, across all pages. */
  total: number;
  /** Bookings in the range that pass search and filters, before the view is applied. */
  inRange: number;
  viewCounts: Record<BookingView, number>;
  rangeCounts: Record<CreatedRange, number>;
  /** Whether widening the range to 30 days would find anything (for the empty state). */
  hasMatchesInLast30Days: boolean;
}

export type BookingExportColumn =
  | 'Reference'
  | 'Created'
  | 'Lead traveler'
  | 'Email'
  | 'Itinerary'
  | 'Departure'
  | 'Pax'
  | 'Channel'
  | 'Total'
  | 'Payment'
  | 'Status';

export interface BookingExportRequest {
  query: BookingListQuery;
  /** Export only these bookings instead of the whole view. */
  references?: string[];
  columns: BookingExportColumn[];
  format: 'csv' | 'xlsx';
}

export interface ManualBookingInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  from: string;
  to: string;
  tripType: TripType;
  departDate: IsoDate;
  returnDate: IsoDate | null;
  airline: AirlineCode;
  fare: FareName;
  travelerCount: number;
  total: number;
  paymentMethod: 'link' | 'invoice';
  note: string;
}

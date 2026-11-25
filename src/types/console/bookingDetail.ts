import type { IsoDate } from '@/lib/date';

import type { ConsoleBooking, FareName } from './booking';
import type { StatusLabel } from './dashboard';

export type RefundType = 'taxes' | 'custom' | 'full';
export type ActivityTone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger';

export interface SegmentDetail {
  flightNumber: string;
  date: IsoDate;
  /** "08:40" */
  departureTime: string;
  /** "13:55", or "00:20 +1" the next day. */
  arrivalTime: string;
  /** "MNL T1" */
  from: string;
  to: string;
  /** "MNL–HND", used in coupon rows. */
  routeCode: string;
  /** "A321neo · Economy (K)", or a note such as "Was 06:10 · …". */
  detail: string;
  status: StatusLabel;
}

export interface TravelerDetail {
  /** "REYES / ANDREA LIM MS", as on the airline record. */
  recordName: string;
  /** "Andrea Lim Reyes" */
  displayName: string;
  /** "Adult · DOB 24 Jun 1991" */
  summary: string;
  ticketNumber: string | null;
  seats: string;
  bags: string;
  document: { label: string; isValid: boolean };
}

export interface MoneyLine {
  label: string;
  /** Negative for discounts and refunds. */
  amount: number;
}

export interface LedgerEntry {
  when: string;
  event: string;
  reference: string;
  method: string;
  /** Negative for refunds. */
  amount: number;
  result: StatusLabel;
}

export interface CouponDetail {
  traveler: string;
  ticketNumber: string;
  issuedLabel: string;
  coupon: number;
  /** "MR 431 · MNL–HND · 12 Nov" */
  flight: string;
  fareBasis: string;
  status: StatusLabel;
}

export interface ActivityEvent {
  title: string;
  body: string;
  when: string;
  tone: ActivityTone;
}

export interface InternalNote {
  author: string;
  when: string;
  text: string;
}

export interface RefundOption {
  type: RefundType;
  label: string;
  description: string;
  amount: number;
  /** Over the agent's limit or outside fare rules: Finance approves before money moves. */
  requiresFinance: boolean;
}

export const REFUND_REASONS = [
  'Customer request — voluntary',
  'Schedule change by airline',
  'Medical — Vela Protect claim',
  'Duplicate booking',
] as const;
export type RefundReason = (typeof REFUND_REASONS)[number];

export const REISSUE_REASONS = [
  'Name correction',
  'Schedule change accepted',
  'Date change requested',
  'Coupon unreadable at check-in',
] as const;
export type ReissueReason = (typeof REISSUE_REASONS)[number];

/** How many days later a date change moves the same flights, and the fare difference per traveler. */
export const DATE_CHANGE_OPTIONS = [
  { days: 1, label: 'Same flights, 1 day later', fareDifference: 0 },
  { days: 2, label: 'Same flights, 2 days later', fareDifference: 1200 },
  { days: 7, label: 'Same flights, 1 week later', fareDifference: 3450 },
] as const;

export const CHANGE_FEE_PER_TRAVELER = 2500;
export const AGENT_REFUND_LIMIT = 50_000;

export interface BookingDetail {
  booking: ConsoleBooking;
  /** Header chip, e.g. "Ticketed" or "Refund pending approval". */
  status: StatusLabel;
  payment: StatusLabel;
  /** "Created Fri 9 Oct 2026, 00:41 PHT · Web · Market PH · Meridian Air record MR-4KQ8ZT" */
  createdSummary: string;
  fare: FareName;
  /** "Classic fare, non-refundable" */
  fareLabel: string;
  /** "card ending 4821", or "the customer" for console bookings. */
  refundDestination: string;
  /** "Card ending 4821 · Andrea Lim Reyes" */
  refundToLabel: string;
  account: { customerId: string | null; label: string };
  /** Masked until revealed, e.g. "+•• ••• ••• 4567". */
  maskedPhone: string;
  segments: SegmentDetail[];
  travelers: TravelerDetail[];
  moneyLines: MoneyLine[];
  /** "Captured", "Due", "Invoiced"… */
  moneyTotalLabel: string;
  moneyNote: string;
  ledger: LedgerEntry[];
  risk: Array<{ label: string; value: string; isWarning?: boolean }>;
  coupons: CouponDetail[];
  ticketsSummary: string;
  noTickets: { title: string; body: string };
  activity: ActivityEvent[];
  notes: InternalNote[];
  refundOptions: RefundOption[];
  defaultRefundReason: RefundReason;
  defaultReissueReason: ReissueReason;
  paymentLink: { holdUntil: string; smsTo: string; message: string };
  actions: {
    canResend: boolean;
    showReissue: boolean;
    canReissue: boolean;
    showRetryTicketing: boolean;
    showPaymentLink: boolean;
    paymentLinkLabel: string;
    isPaymentLinkSent: boolean;
    canRefund: boolean;
    refundLabel: string;
  };
}

export interface ResendItineraryRequest {
  toLeadTraveler: boolean;
  copyToMe: boolean;
  attachments: Array<'itinerary' | 'e-tickets' | 'receipt'>;
}

export interface ReissueRequest {
  travelerIndexes: number[];
  reason: ReissueReason;
  /** Corrected names by traveler index, for a name correction. */
  correctedNames: Record<number, string>;
  /** For a date change. */
  dayShift: number;
}

export interface RefundRequest {
  type: RefundType;
  reason: RefundReason;
  note: string;
  notifyCustomer: boolean;
}

/** What a mutation changed, plus the message for the toast. */
export interface BookingActionResult {
  detail: BookingDetail;
  message: string;
}

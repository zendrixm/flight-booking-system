import type { StatusTone } from '@/components/ui';

export type CustomerTier = 'Member' | 'Silver' | 'Gold' | 'Platinum';
export type CustomerStatus = 'active' | 'flagged' | 'suspended';
export type CustomerSegment = 'all' | 'gold' | 'new' | 'flagged';

/** A row in the customer list. Contact details are masked. */
export interface CustomerSummary {
  /** URL-safe handle, e.g. "andrea". */
  id: string;
  fullName: string;
  initials: string;
  /** "an••••@example.com" */
  maskedEmail: string;
  /** "VL-0042187" */
  memberNumber: string;
  tier: CustomerTier;
  trips: number;
  lifetimeValue: number;
  creditBalance: number;
  status: CustomerStatus;
}

export interface CustomerBookingLink {
  reference: string;
  destination: string;
  /** "Sat 10 Oct · 1 traveler" */
  summary: string;
  status: { label: string; tone: StatusTone };
}

export interface TravelCreditEntry {
  title: string;
  /** "Issued 14 Aug 2026 · expires 14 Aug 2027" */
  detail: string;
  amount: number;
}

export interface CustomerNote {
  author: string;
  when: string;
  text: string;
}

export interface CustomerDetail extends CustomerSummary {
  firstName: string;
  /** "Mar 2023" */
  memberSince: string;
  tierProgress: { trips: number; tripsForNextTier: number; nextTier: CustomerTier };
  /** Why the account is flagged or suspended. */
  statusNote?: string;
  /** Email and phone with the middle hidden. */
  maskedContact: string;
  bookings: CustomerBookingLink[];
  pastTrips: Array<{ destination: string; summary: string }>;
  credits: TravelCreditEntry[];
  notes: CustomerNote[];
  /** "00:58" once a reset link was sent this session. */
  passwordResetSentAt?: string;
  /** Upcoming bookings that stay ticketed if the account is suspended. */
  upcomingBookingCount: number;
}

export interface CustomerListQuery {
  segment: CustomerSegment;
  search: string;
}

export interface CustomerList {
  customers: CustomerSummary[];
  /** Accounts in each segment across the whole customer base. */
  segmentTotals: Record<CustomerSegment, number>;
  joinedThisWeek: number;
}

export interface CustomerActionResult {
  customer: CustomerDetail;
  message: string;
}

export const TRAVEL_CREDIT_REASONS = [
  'Goodwill — service recovery',
  'Flight disruption',
  'Refund as credit',
  'Price match',
] as const;
export type TravelCreditReason = (typeof TRAVEL_CREDIT_REASONS)[number];

export const SUSPENSION_REASONS = [
  'Suspected payment fraud',
  'Chargeback dispute',
  'Abuse toward staff',
  'Customer asked to close the account',
] as const;
export type SuspensionReason = (typeof SUSPENSION_REASONS)[number];

export interface TravelCreditRequest {
  amount: number;
  reason: TravelCreditReason;
  validForMonths: 6 | 12 | 24;
  message: string;
}

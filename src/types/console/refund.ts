import type { StatusTone } from '@/components/ui';

export type RefundRequestStatus = 'pending' | 'approved' | 'rejected';

/** One rule checked against the request: passed, failed, or worth knowing. */
export interface PolicyCheck {
  result: 'pass' | 'fail' | 'note';
  text: string;
}

export interface RefundOwner {
  initials: string;
  fullName: string;
  /** The signed-in staff member. */
  isYou: boolean;
}

export interface RefundDecision {
  status: Exclude<RefundRequestStatus, 'pending'>;
  /** Pesos refunded; the requested amount when rejected. */
  amount: number;
  /** Above the reviewer's limit, so Finance gives the second approval. */
  isWithFinance: boolean;
  /** Sent to the customer with the decision. */
  note: string;
  decidedBy: string;
  /** "Today 00:44", "Yesterday 21:40" */
  decidedAt: string;
  /** Made by the signed-in staff member this session, so it can still be taken back. */
  canUndo: boolean;
}

/** A customer's request for money back, with what the fare rules allow. */
export interface RefundRequest {
  bookingReference: string;
  customerName: string;
  /** Opens the customer's account, e.g. to offer travel credit instead. */
  customerId?: string;
  /** Whether the booking can be opened in the console. */
  hasBookingRecord: boolean;
  reason: string;
  /** "Classic, non-refundable" */
  fare: string;
  requestedAmount: number;
  /** What the fare rules allow; the starting refund amount. */
  eligibleAmount: number;
  policy: { label: string; tone: StatusTone };
  /** "7 Oct 22:10" */
  requestedAt: string;
  /** "50h", waiting time while pending. */
  age: string;
  /** Past the 48-hour service target. */
  isOverdue: boolean;
  owner: RefundOwner | null;
  message: string;
  checks: PolicyCheck[];
  status: RefundRequestStatus;
  decision?: RefundDecision;
}

export interface RefundMetrics {
  pendingCount: number;
  overdueCount: number;
  approvedTodayAmount: number;
  approvedTodayCount: number;
  paidOutThisWeek: number;
  medianHoursToDecision: number;
  /** Hours versus last week; negative is faster. */
  medianChangeHours: number;
}

export interface RefundQueue {
  /** Pending requests oldest first, then decisions newest first. */
  requests: RefundRequest[];
  metrics: RefundMetrics;
  /** Largest refund the signed-in reviewer can approve alone. */
  approvalLimit: number;
  /** Gives the second approval above the limit. */
  financeApprover: string;
}

export type RefundDecisionRequest =
  { decision: 'approve'; amount: number; note: string } | { decision: 'reject'; note: string };

export interface RefundQueueResult {
  queue: RefundQueue;
  message: string;
}

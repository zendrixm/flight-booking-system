import { firstNameOf, formatPeso, initialsOf } from '@/lib/format';
import {
  APPROVAL_LIMIT,
  DECISION_TIME,
  FINANCE_APPROVER,
  REFUND_BOOKINGS_IN_LEDGER,
  REFUND_CUSTOMER_IDS,
  REFUND_REQUEST_SEEDS,
  REFUND_REVIEWERS,
  REFUND_WEEK_FIGURES,
  type RefundRequestSeed,
} from '@/mocks/console/refunds';
import { DEMO_STAFF_MEMBER } from '@/mocks/console/staff';
import type {
  RefundDecision,
  RefundDecisionRequest,
  RefundOwner,
  RefundQueue,
  RefundQueueResult,
  RefundRequest,
} from '@/types/console/refund';

import { ApiError, mockRequest } from '../mockApi';

/** Decisions and assignments made this session, by booking reference. */
const decisions = new Map<string, RefundDecision>();
const owners = new Map<string, string>();

const YOUR_INITIALS = initialsOf(DEMO_STAFF_MEMBER.fullName);

function ownerFrom(initials: string | null): RefundOwner | null {
  if (!initials) return null;
  return { initials, fullName: REFUND_REVIEWERS[initials] ?? initials, isYou: initials === YOUR_INITIALS };
}

function seededDecision(seed: RefundRequestSeed): RefundDecision | undefined {
  if (!seed.seededDecision || seed.status === 'pending') return undefined;
  return {
    status: seed.status,
    amount: seed.requestedAmount,
    isWithFinance: false,
    note: '',
    decidedBy: REFUND_REVIEWERS[seed.seededDecision.by] ?? seed.seededDecision.by,
    decidedAt: seed.seededDecision.at,
    canUndo: false,
  };
}

function toRequest(seed: RefundRequestSeed): RefundRequest {
  const decision = decisions.get(seed.bookingReference) ?? seededDecision(seed);
  return {
    bookingReference: seed.bookingReference,
    customerName: seed.customerName,
    reason: seed.reason,
    fare: seed.fare,
    requestedAmount: seed.requestedAmount,
    eligibleAmount: seed.eligibleAmount,
    policy: seed.policy,
    requestedAt: seed.requestedAt,
    age: seed.age,
    isOverdue: seed.isOverdue,
    message: seed.message,
    checks: seed.checks,
    customerId: REFUND_CUSTOMER_IDS[seed.bookingReference],
    hasBookingRecord: REFUND_BOOKINGS_IN_LEDGER.has(seed.bookingReference),
    owner: ownerFrom(owners.get(seed.bookingReference) ?? seed.ownerInitials),
    status: decision?.status ?? 'pending',
    decision,
  };
}

function buildQueue(): RefundQueue {
  const all = REFUND_REQUEST_SEEDS.map(toRequest);
  const pendingRequests = all.filter((request) => request.status === 'pending');
  const decided = all.filter((request) => request.status !== 'pending');
  // This session's decisions come first: they are the newest.
  const newestFirst = [
    ...decided.filter((request) => request.decision?.canUndo),
    ...decided.filter((request) => !request.decision?.canUndo),
  ];
  const approved = decided.filter((request) => request.status === 'approved');

  return {
    requests: [...pendingRequests, ...newestFirst],
    metrics: {
      pendingCount: pendingRequests.length,
      overdueCount: pendingRequests.filter((request) => request.isOverdue).length,
      approvedTodayAmount: approved.reduce((sum, request) => sum + (request.decision?.amount ?? 0), 0),
      approvedTodayCount: approved.length,
      ...REFUND_WEEK_FIGURES,
    },
    approvalLimit: APPROVAL_LIMIT,
    financeApprover: FINANCE_APPROVER,
  };
}

function pendingSeed(reference: string): RefundRequestSeed {
  const seed = REFUND_REQUEST_SEEDS.find((candidate) => candidate.bookingReference === reference);
  if (!seed) throw new ApiError('not_found', `There’s no refund request for ${reference}.`);
  if (toRequest(seed).status !== 'pending') {
    throw new ApiError('already_decided', `${reference} already has a decision.`);
  }
  return seed;
}

export function getRefundQueue(): Promise<RefundQueue> {
  return mockRequest(buildQueue);
}

export function assignRefundToMe(reference: string): Promise<RefundQueueResult> {
  return mockRequest(() => {
    pendingSeed(reference);
    owners.set(reference, YOUR_INITIALS);
    return { queue: buildQueue(), message: `${reference} assigned to you` };
  });
}

/**
 * Approves (up to the requested amount) or rejects a pending request. Approvals above the
 * reviewer's limit go to Finance for a second approval. Rejections need a note for the customer.
 */
export function decideRefund(reference: string, request: RefundDecisionRequest): Promise<RefundQueueResult> {
  return mockRequest(() => {
    const seed = pendingSeed(reference);
    const note = request.note.trim();
    const firstName = firstNameOf(seed.customerName);

    if (request.decision === 'reject') {
      if (!note) {
        throw new ApiError(
          'note_required',
          'Add a short note so the customer knows why the request was rejected.',
        );
      }
      decisions.set(reference, decisionOf('rejected', seed.requestedAmount, false, note));
      owners.set(reference, YOUR_INITIALS);
      return { queue: buildQueue(), message: `${reference} rejected · ${firstName} emailed with your note` };
    }

    const { amount } = request;
    if (!Number.isInteger(amount) || amount <= 0) {
      throw new ApiError('invalid_amount', 'Enter an amount above ₱0, or reject the request instead.');
    }
    if (amount > seed.requestedAmount) {
      throw new ApiError(
        'invalid_amount',
        `A refund can’t be more than the ${formatPeso(seed.requestedAmount)} requested.`,
      );
    }
    const isWithFinance = amount > APPROVAL_LIMIT;
    decisions.set(reference, decisionOf('approved', amount, isWithFinance, note));
    owners.set(reference, YOUR_INITIALS);
    return {
      queue: buildQueue(),
      message: isWithFinance
        ? `${reference} sent to Finance · ${formatPeso(amount)}`
        : `${reference} approved · ${formatPeso(amount)} to the original payment`,
    };
  }, 500);
}

/** Takes back a decision made this session; the request returns to Pending review. */
export function undoRefundDecision(reference: string): Promise<RefundQueueResult> {
  return mockRequest(() => {
    if (!decisions.get(reference)?.canUndo) {
      throw new ApiError('not_undoable', `The decision on ${reference} can’t be undone here.`);
    }
    decisions.delete(reference);
    return { queue: buildQueue(), message: `Decision on ${reference} undone · back in Pending review` };
  });
}

function decisionOf(
  status: RefundDecision['status'],
  amount: number,
  isWithFinance: boolean,
  note: string,
): RefundDecision {
  return {
    status,
    amount,
    isWithFinance,
    note,
    decidedBy: DEMO_STAFF_MEMBER.fullName,
    decidedAt: DECISION_TIME,
    canUndo: true,
  };
}

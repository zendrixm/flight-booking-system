import type { StatusTone } from '@/components/ui';
import { firstNameOf, formatPeso, formatPesoShort } from '@/lib/format';
import type { RefundMetrics, RefundQueue, RefundRequest, RefundRequestStatus } from '@/types/console/refund';

import type { ConfirmDialogContent } from '../../shared/components/ConfirmDialog';

export const REFUND_TABS: ReadonlyArray<{ id: RefundRequestStatus; label: string }> = [
  { id: 'pending', label: 'Pending review' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
];

export function tabFromParam(value: string | null): RefundRequestStatus | null {
  return REFUND_TABS.find((tab) => tab.id === value)?.id ?? null;
}

/** Digits only, so "14,960" and "₱14960" both read as 14960. */
export function parseAmount(text: string): number {
  return Number(text.replace(/\D/g, '')) || 0;
}

/** Keeps what someone types to digits and thousands separators. */
export function sanitizeAmountInput(text: string): string {
  return text.replace(/[^\d,]/g, '');
}

export function amountError(request: RefundRequest, amount: number): string | null {
  if (amount <= 0) return 'Enter an amount above ₱0, or reject the request instead.';
  if (amount > request.requestedAmount) {
    return `A refund can’t be more than the ${formatPeso(request.requestedAmount)} requested.`;
  }
  return null;
}

export const NOTE_REQUIRED_MESSAGE = 'Add a short note so the customer knows why the request was rejected.';

export function approveButtonLabel(amount: number, approvalLimit: number): string {
  if (amount <= 0) return 'Approve';
  return amount > approvalLimit ? `Send to Finance · ${formatPeso(amount)}` : `Approve ${formatPeso(amount)}`;
}

export function decisionChip(request: RefundRequest): { label: string; tone: StatusTone } {
  const { decision } = request;
  if (!decision) return { label: 'Pending', tone: 'muted' };
  if (decision.status === 'rejected') return { label: 'Rejected', tone: 'danger' };
  return decision.isWithFinance
    ? { label: 'With Finance', tone: 'warning' }
    : { label: 'Approved', tone: 'success' };
}

/** The line in the review panel once a request has a decision. */
export function decisionSummary(request: RefundRequest): string {
  const { decision } = request;
  if (!decision) return '';
  const when = decision.decidedAt.toLowerCase();
  if (decision.status === 'rejected') {
    return decision.canUndo
      ? 'Rejected · customer emailed with your note and the fare rules'
      : `Rejected by ${decision.decidedBy} · ${when} · customer emailed with the fare rules`;
  }
  if (decision.canUndo) {
    return decision.isWithFinance
      ? 'Sent to Finance for second approval · customer notified'
      : `${formatPeso(decision.amount)} approved · refund queued to the original payment`;
  }
  return `Approved by ${decision.decidedBy} · ${when} · ${formatPeso(decision.amount)} queued to the original payment`;
}

/** Pending requests show how long they've waited; decided ones show when. */
export function waitLabel(request: RefundRequest): string {
  if (request.decision) return request.decision.decidedAt;
  return request.isOverdue ? `${request.age} · overdue` : request.age;
}

export function shownAmount(request: RefundRequest): number {
  return request.decision?.amount ?? request.requestedAmount;
}

/** The next request waiting in the queue after `current`. */
export function nextPendingRequest(
  requests: readonly RefundRequest[],
  current: RefundRequest,
): RefundRequest | undefined {
  return requests.find(
    (request) => request.status === 'pending' && request.bookingReference !== current.bookingReference,
  );
}

export interface MetricCard {
  label: string;
  value: string;
  note: string;
  noteTone: 'neutral' | 'success' | 'danger';
}

export function metricCards(metrics: RefundMetrics): MetricCard[] {
  const change = metrics.medianChangeHours;
  return [
    {
      label: 'Pending review',
      value: String(metrics.pendingCount),
      note: metrics.overdueCount
        ? `${metrics.overdueCount} past service target`
        : 'All within service target',
      noteTone: metrics.overdueCount ? 'danger' : 'success',
    },
    {
      label: 'Approved today',
      value: formatPeso(metrics.approvedTodayAmount),
      note: `${metrics.approvedTodayCount} ${metrics.approvedTodayCount === 1 ? 'request' : 'requests'}`,
      noteTone: 'neutral',
    },
    {
      label: 'Paid out this week',
      value: formatPesoShort(metrics.paidOutThisWeek),
      note: 'Settles in 5–10 business days',
      noteTone: 'neutral',
    },
    {
      label: 'Median time to decision',
      value: `${metrics.medianHoursToDecision}h`,
      note: `${change < 0 ? '−' : '+'}${Math.abs(change)}h vs last week`,
      noteTone: change <= 0 ? 'success' : 'danger',
    },
  ];
}

export type DecisionKind = 'approve' | 'reject';

export type DecisionConfirmContent = ConfirmDialogContent;

export function decisionConfirmContent(
  kind: DecisionKind,
  request: RefundRequest,
  amount: number,
  queue: Pick<RefundQueue, 'approvalLimit' | 'financeApprover'>,
): DecisionConfirmContent {
  const firstName = firstNameOf(request.customerName);
  const requested = formatPeso(request.requestedAmount);

  if (kind === 'reject') {
    return {
      role: 'alertdialog',
      title: `Reject ${firstName}’s refund request?`,
      subtitle: `${request.bookingReference} · ${requested} requested · ${request.reason}`,
      body: `${firstName} is emailed your note and the fare rules straight away. Nothing is refunded and the booking stays as it is.`,
      rows: [
        { label: 'Fare', value: request.fare },
        { label: 'Policy check', value: request.policy.label },
      ],
      cancelLabel: 'Cancel',
      confirmLabel: 'Reject request',
      isDestructive: true,
    };
  }

  const refund = formatPeso(amount);
  const needsFinance = amount > queue.approvalLimit;
  return {
    role: 'dialog',
    title: needsFinance ? `Send ${refund} to Finance?` : `Approve ${refund} refund?`,
    subtitle: `${request.bookingReference} · ${request.customerName} · ${request.reason}`,
    body: needsFinance
      ? `This is above your ${formatPeso(queue.approvalLimit)} approval limit, so ${queue.financeApprover} in Finance gives the second approval. ${firstName} is told the refund is being finalised.`
      : `${firstName} gets a decision email straight away and the money goes back to the original payment method.`,
    rows: [
      { label: 'Refund amount', value: `${refund} of ${requested} requested` },
      { label: 'Refunded to', value: 'Original payment method' },
      needsFinance
        ? { label: 'Second approval', value: `${queue.financeApprover} · Finance` }
        : { label: 'Settles', value: 'In 5–10 business days' },
    ],
    cancelLabel: 'Cancel',
    confirmLabel: needsFinance ? 'Send to Finance' : `Approve ${refund}`,
    isDestructive: false,
  };
}

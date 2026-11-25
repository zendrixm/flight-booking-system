import clsx from 'clsx';
import { useState, type Ref } from 'react';
import { Link } from 'react-router';

import { paths } from '@/app/paths';
import { Icon } from '@/components/icons';
import { Button, StatusChip, TextAreaField, TextField } from '@/components/ui';
import { firstNameOf, formatNumber, formatPeso } from '@/lib/format';
import type { PolicyCheck, RefundDecisionRequest, RefundQueue, RefundRequest } from '@/types/console/refund';

import {
  amountError,
  approveButtonLabel,
  decisionChip,
  decisionConfirmContent,
  decisionSummary,
  NOTE_REQUIRED_MESSAGE,
  parseAmount,
  sanitizeAmountInput,
  type DecisionKind,
} from '../lib/refundReview';
import { RefundDecisionDialog } from './RefundDecisionDialog';
import styles from './RefundReviewPanel.module.css';

interface RefundReviewPanelProps {
  id: string;
  ref?: Ref<HTMLElement>;
  request: RefundRequest;
  limits: Pick<RefundQueue, 'approvalLimit' | 'financeApprover'>;
  /** Offered once this request is decided, to keep working through the queue. */
  nextPending?: RefundRequest;
  isHighlighted: boolean;
  onHighlightEnd: () => void;
  onAssignToMe: () => Promise<void>;
  /** Resolves once the decision is saved; rejects with the reason it wasn't. */
  onDecide: (decision: RefundDecisionRequest) => Promise<void>;
  onUndo: () => Promise<void>;
  onReviewNext: (reference: string) => void;
}

const CHECK_ICONS: Record<PolicyCheck['result'], 'check' | 'close' | 'info'> = {
  pass: 'check',
  fail: 'close',
  note: 'info',
};
const CHECK_LABELS: Record<PolicyCheck['result'], string> = { pass: 'Passes', fail: 'Fails', note: 'Note' };

/**
 * One request in review: the customer's message, what the fare rules allow, and the decision.
 * Mount with a `key` per request so the amount and note start fresh for each.
 */
export function RefundReviewPanel({
  id,
  ref,
  request,
  limits,
  nextPending,
  isHighlighted,
  onHighlightEnd,
  onAssignToMe,
  onDecide,
  onUndo,
  onReviewNext,
}: RefundReviewPanelProps) {
  const [amountText, setAmountText] = useState(() => formatNumber(request.eligibleAmount));
  const [note, setNote] = useState('');
  const [triedAction, setTriedAction] = useState<DecisionKind | null>(null);
  const [confirmKind, setConfirmKind] = useState<DecisionKind | null>(null);
  const [busyAction, setBusyAction] = useState<'decide' | 'assign' | 'undo' | null>(null);

  const { decision, owner } = request;
  const isDecided = decision !== undefined;
  const amount = parseAmount(amountText);
  const amountProblem = amountError(request, amount);
  const isOverLimit = !isDecided && amount > limits.approvalLimit;
  const isNothingDue = !isDecided && request.eligibleAmount === 0 && amount === 0;
  const showAmountError = !isDecided && triedAction === 'approve' && amountProblem !== null;
  const showNoteError = !isDecided && triedAction === 'reject' && !note.trim();
  const chip = decisionChip(request);
  const firstName = firstNameOf(request.customerName);

  const requestDecision = (kind: DecisionKind) => {
    setTriedAction(kind);
    const isBlocked = kind === 'approve' ? amountProblem !== null : !note.trim();
    if (!isBlocked) setConfirmKind(kind);
  };

  const run = async (action: 'decide' | 'assign' | 'undo', task: () => Promise<void>) => {
    setBusyAction(action);
    try {
      await task();
    } finally {
      setBusyAction(null);
    }
  };

  const confirm = () =>
    run('decide', async () => {
      try {
        await onDecide(
          confirmKind === 'reject' ? { decision: 'reject', note } : { decision: 'approve', amount, note },
        );
        setTriedAction(null);
      } finally {
        setConfirmKind(null);
      }
    });

  return (
    <aside
      id={id}
      ref={ref}
      aria-label="Review panel"
      className={clsx(styles.panel, isHighlighted && styles.highlighted)}
      onAnimationEnd={onHighlightEnd}
    >
      <div className={styles.header}>
        <div className={styles.titleRow}>
          {request.hasBookingRecord ? (
            <Link to={paths.console.booking(request.bookingReference)} className={styles.reference}>
              {request.bookingReference}
              <Icon name="arrowUpRight" size={16} strokeWidth={1.8} />
              <span className="visually-hidden">(open booking)</span>
            </Link>
          ) : (
            <span className={styles.reference}>{request.bookingReference}</span>
          )}
          <StatusChip tone={chip.tone} hideDot size="compact">
            {chip.label}
          </StatusChip>
        </div>
        <span className={styles.meta}>
          {request.customerName} · {request.fare} · requested {request.requestedAt}
        </span>
        <span className={styles.ownerRow}>
          <span className={styles.ownerText}>
            Owner ·{' '}
            <strong>{owner ? `${owner.fullName}${owner.isYou ? ' (you)' : ''}` : 'Unassigned'}</strong>
          </span>
          {!isDecided && !owner?.isYou && (
            <Button
              variant="quiet"
              size="small"
              loading={busyAction === 'assign'}
              onClick={() => run('assign', onAssignToMe)}
            >
              Assign to me
            </Button>
          )}
        </span>
      </div>

      <div className={styles.body}>
        <section className={styles.block}>
          <h3 className={styles.caption}>Customer’s message</h3>
          <p className={styles.message}>{request.message}</p>
        </section>

        <section className={styles.block}>
          <h3 className={styles.caption}>Policy evaluation</h3>
          <ul className={styles.checks}>
            {request.checks.map((check) => (
              <li key={check.text} className={styles.check}>
                <Icon
                  name={CHECK_ICONS[check.result]}
                  size={16}
                  strokeWidth={2}
                  className={styles[check.result]}
                />
                <span className="visually-hidden">{CHECK_LABELS[check.result]}:</span>
                {check.text}
              </li>
            ))}
          </ul>
        </section>

        <TextField
          label="Amount to refund"
          required
          hint={`Eligible ${formatPeso(request.eligibleAmount)}`}
          prefix="₱"
          inputMode="numeric"
          autoComplete="off"
          inputClassName={styles.amountInput}
          value={isDecided ? formatNumber(decision.amount) : amountText}
          disabled={isDecided}
          error={showAmountError ? amountProblem : undefined}
          helpText={
            isOverLimit ? (
              `Above your ${formatPeso(limits.approvalLimit)} limit — this will be routed to Finance for a second approval.`
            ) : isNothingDue ? (
              <>
                Nothing is refundable under the fare rules. Reject the request, or{' '}
                <Link
                  to={
                    request.customerId ? paths.console.customer(request.customerId) : paths.console.customers
                  }
                >
                  offer travel credit
                </Link>{' '}
                from the customer’s account.
              </>
            ) : undefined
          }
          onChange={(event) => setAmountText(sanitizeAmountInput(event.target.value))}
        />

        <TextAreaField
          label="Note to customer"
          rows={2}
          placeholder="Included in the decision email · required to reject"
          value={isDecided ? decision.note : note}
          disabled={isDecided}
          error={showNoteError ? NOTE_REQUIRED_MESSAGE : undefined}
          onChange={(event) => setNote(event.target.value)}
        />

        {isDecided ? (
          <div role="status" className={styles.decision}>
            <span>{decisionSummary(request)}</span>
            {(decision.canUndo || nextPending) && (
              <span className={styles.decisionActions}>
                {decision.canUndo && (
                  <Button
                    variant="quiet"
                    size="small"
                    loading={busyAction === 'undo'}
                    onClick={() => run('undo', onUndo)}
                  >
                    Undo
                  </Button>
                )}
                {nextPending && (
                  <Button
                    variant="primary"
                    size="small"
                    onClick={() => onReviewNext(nextPending.bookingReference)}
                  >
                    Review next · {nextPending.bookingReference}
                  </Button>
                )}
              </span>
            )}
          </div>
        ) : (
          <div className={styles.actions}>
            <Button
              variant="primary"
              className={styles.approve}
              aria-haspopup="dialog"
              onClick={() => requestDecision('approve')}
            >
              {approveButtonLabel(amount, limits.approvalLimit)}
            </Button>
            <Button
              variant="destructiveQuiet"
              aria-haspopup="dialog"
              onClick={() => requestDecision('reject')}
            >
              Reject
            </Button>
          </div>
        )}
      </div>

      <RefundDecisionDialog
        content={confirmKind && decisionConfirmContent(confirmKind, request, amount, limits)}
        note={note.trim()}
        customerFirstName={firstName}
        isBusy={busyAction === 'decide'}
        onClose={() => setConfirmKind(null)}
        onConfirm={confirm}
      />
    </aside>
  );
}

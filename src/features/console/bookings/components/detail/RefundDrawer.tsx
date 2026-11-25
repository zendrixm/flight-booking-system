import clsx from 'clsx';
import { useState } from 'react';

import { Icon } from '@/components/icons';
import {
  Alert,
  Button,
  ChoiceCard,
  Dialog,
  Drawer,
  SelectField,
  Switch,
  TextAreaField,
} from '@/components/ui';
import { formatPeso } from '@/lib/format';
import { ApiError } from '@/services/mockApi';
import type { BookingDetail, RefundReason, RefundRequest, RefundType } from '@/types/console/bookingDetail';
import { AGENT_REFUND_LIMIT, REFUND_REASONS } from '@/types/console/bookingDetail';

import { financeNoteError, refundPlan } from '../../lib/bookingActions';
import styles from './RefundDrawer.module.css';

interface RefundDrawerProps {
  detail: BookingDetail;
  onClose: () => void;
  onSubmit: (request: RefundRequest) => Promise<void>;
}

const STEPS = ['Amount', 'Reason and review'] as const;

/** Two steps — what to refund, then why — and a confirmation before any money moves. */
export function RefundDrawer({ detail, onClose, onSubmit }: RefundDrawerProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [type, setType] = useState<RefundType>(detail.refundOptions[0].type);
  const [reason, setReason] = useState<RefundReason>(detail.defaultRefundReason);
  const [note, setNote] = useState('');
  const [notifyCustomer, setNotifyCustomer] = useState(true);
  const [hasTried, setHasTried] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string>();

  const option = detail.refundOptions.find((candidate) => candidate.type === type) ?? detail.refundOptions[0];
  const noteError = financeNoteError(option, note);
  const plan = refundPlan(detail, option, notifyCustomer);
  const amount = formatPeso(option.amount);

  const review = () => {
    if (noteError) {
      setHasTried(true);
      return;
    }
    setIsConfirmOpen(true);
  };

  const confirm = async () => {
    setIsBusy(true);
    setError(undefined);
    try {
      await onSubmit({ type: option.type, reason, note: note.trim(), notifyCustomer });
    } catch (caught) {
      setIsConfirmOpen(false);
      setError(caught instanceof ApiError ? caught.message : 'The refund didn’t go through. Try again.');
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <>
      <Drawer
        open
        onClose={onClose}
        title="Issue refund"
        description={`${detail.booking.reference} · ${detail.fareLabel}`}
        headerExtra={
          <ol className={styles.steps} aria-label="Refund steps">
            {STEPS.map((label, index) => {
              const number = index + 1;
              return (
                <li
                  key={label}
                  aria-current={number === step ? 'step' : undefined}
                  className={clsx(styles.step, number <= step && styles.stepReached)}
                >
                  <span className={styles.stepNumber} aria-hidden="true">
                    {number}
                  </span>
                  {label}
                </li>
              );
            })}
          </ol>
        }
        footer={
          <div className={styles.footer}>
            <span className={styles.total}>
              <span className={styles.totalLabel}>To {detail.refundDestination}</span>
              <strong className={styles.totalAmount}>{amount}</strong>
            </span>
            <span className={styles.footerActions}>
              {step === 1 ? (
                <>
                  <Button variant="quiet" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button variant="primary" onClick={() => setStep(2)}>
                    Continue
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="quiet" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button variant="primary" aria-haspopup="dialog" onClick={review}>
                    Review refund
                  </Button>
                </>
              )}
            </span>
          </div>
        }
      >
        <div className={styles.body}>
          {error && (
            <Alert tone="danger" role="alert">
              {error}
            </Alert>
          )}
          {step === 1 ? (
            <>
              <fieldset className={styles.field}>
                <legend className={styles.sectionLabel}>What to refund</legend>
                {detail.refundOptions.map((candidate) => (
                  <ChoiceCard
                    key={candidate.type}
                    name="refund-type"
                    title={candidate.label}
                    description={candidate.description}
                    meta={formatPeso(candidate.amount)}
                    checked={candidate.type === type}
                    onChange={() => setType(candidate.type)}
                  />
                ))}
              </fieldset>
              <div className={styles.field}>
                <span className={styles.label}>Refund to</span>
                <span className={styles.readOnly}>
                  {detail.refundToLabel}
                  <Icon name="lock" size={14} strokeWidth={1.8} />
                </span>
                <span className={styles.hint}>
                  Refunds always go back to the original payment · cards in 5–10 banking days
                </span>
              </div>
              <Alert tone={option.requiresFinance ? 'danger' : 'attention'} icon="shield">
                {option.requiresFinance
                  ? `Over your ${formatPeso(AGENT_REFUND_LIMIT)} limit or outside fare rules — Finance gives the second approval before money moves.`
                  : `Refunds above ${formatPeso(AGENT_REFUND_LIMIT)} or outside fare rules need Finance approval. This refund is within your limit.`}
              </Alert>
            </>
          ) : (
            <>
              <div className={styles.picked}>
                <span className={styles.pickedText}>
                  <span className={styles.pickedLabel}>{option.label}</span>
                  <span className={styles.hint}>{option.description}</span>
                </span>
                <strong className={styles.pickedAmount}>{amount}</strong>
                <Button variant="quiet" size="small" onClick={() => setStep(1)}>
                  Change
                </Button>
              </div>
              <SelectField
                label="Reason"
                required
                value={reason}
                options={REFUND_REASONS.map((value) => ({ value, label: value }))}
                onChange={(event) =>
                  setReason(REFUND_REASONS.find((value) => value === event.target.value) ?? reason)
                }
              />
              <TextAreaField
                label={option.requiresFinance ? 'Note for Finance' : 'Internal note'}
                required={option.requiresFinance}
                rows={4}
                placeholder={
                  option.requiresFinance
                    ? 'Why should the fare rules be overridden? Mention any documents.'
                    : 'Visible to staff only'
                }
                value={note}
                error={hasTried ? noteError : undefined}
                helpText={
                  option.requiresFinance
                    ? 'Finance sees this note with the request · required for an override'
                    : 'Saved to the booking’s activity'
                }
                onChange={(event) => setNote(event.target.value)}
              />
              <Switch
                label="Email the customer a refund confirmation"
                placement="end"
                checked={notifyCustomer}
                onChange={setNotifyCustomer}
              />
              <div className={styles.plan}>
                <span className={styles.label}>What happens next</span>
                <ul className={styles.planList}>
                  {plan.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </Drawer>

      <Dialog
        open={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        role="alertdialog"
        size="medium"
        title={
          option.requiresFinance
            ? `Send a ${amount} refund to Finance?`
            : `Refund ${amount} to ${detail.refundDestination}?`
        }
        description={`${detail.booking.reference} · ${detail.booking.leadTraveler} · ${reason}`}
        busy={isBusy}
        footer={
          <>
            <Button variant="quiet" onClick={() => setIsConfirmOpen(false)}>
              Go back
            </Button>
            <Button
              variant={option.requiresFinance ? 'primary' : 'destructive'}
              loading={isBusy}
              onClick={confirm}
            >
              {option.requiresFinance ? 'Send to Finance' : `Refund ${amount}`}
            </Button>
          </>
        }
      >
        <div className={styles.confirm}>
          <p>
            {option.requiresFinance
              ? 'Nothing is refunded yet. Finance gives the second approval before any money moves, and you’ll be told either way.'
              : 'The money is sent as soon as you confirm. This can’t be undone, and cancelled tickets can’t be reinstated.'}
          </p>
          <ul className={styles.planList}>
            {plan.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>
      </Dialog>
    </>
  );
}

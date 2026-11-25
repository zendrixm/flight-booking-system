import { useState } from 'react';

import { Button, Checkbox, Dialog, SelectField, TextAreaField, TextField } from '@/components/ui';
import { formatPeso } from '@/lib/format';
import {
  SUSPENSION_REASONS,
  TRAVEL_CREDIT_REASONS,
  type CustomerDetail,
  type SuspensionReason,
  type TravelCreditReason,
  type TravelCreditRequest,
} from '@/types/console/customer';

import { ConfirmDialog } from '../../shared/components/ConfirmDialog';
import { formatCreditBalance } from '../lib/customerPresentation';
import {
  creditAmountError,
  creditSummary,
  INITIAL_CREDIT_VALUES,
  toCreditRequest,
  VALIDITY_OPTIONS,
  type TravelCreditFormValues,
} from '../lib/travelCreditForm';
import styles from './CustomerActionDialogs.module.css';

interface PasswordResetDialogProps {
  customer: CustomerDetail;
  isBusy: boolean;
  onClose: () => void;
  onSend: (options: { alsoBySms: boolean }) => void;
}

/** Mount while open so the SMS choice starts unticked each time. */
export function PasswordResetDialog({ customer, isBusy, onClose, onSend }: PasswordResetDialogProps) {
  const [alsoBySms, setAlsoBySms] = useState(false);
  return (
    <Dialog
      open
      onClose={onClose}
      size="medium"
      title="Send a password reset link?"
      busy={isBusy}
      footer={
        <>
          <Button variant="quiet" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" loading={isBusy} onClick={() => onSend({ alsoBySms })}>
            Send link
          </Button>
        </>
      }
    >
      <div className={styles.body}>
        <p className={styles.message}>
          We’ll email a one-time link to <strong>{customer.maskedEmail}</strong>. It expires in 30 minutes.
          Once used, {customer.firstName} is signed out on every other device.
        </p>
        <Checkbox
          label="Also text the link to the mobile on file"
          checked={alsoBySms}
          onChange={(event) => setAlsoBySms(event.target.checked)}
        />
      </div>
    </Dialog>
  );
}

interface TravelCreditDialogProps {
  customer: CustomerDetail;
  isBusy: boolean;
  onClose: () => void;
  onIssue: (request: TravelCreditRequest) => void;
}

/** Mount while open so each credit starts from an empty form. */
export function TravelCreditDialog({ customer, isBusy, onClose, onIssue }: TravelCreditDialogProps) {
  const [values, setValues] = useState<TravelCreditFormValues>(INITIAL_CREDIT_VALUES);
  const [hasTried, setHasTried] = useState(false);
  const error = creditAmountError(values.amount);
  const summary = creditSummary(values, customer.creditBalance);
  const edit = (change: Partial<TravelCreditFormValues>) =>
    setValues((current) => ({ ...current, ...change }));

  const submit = () => {
    setHasTried(true);
    if (!error) onIssue(toCreditRequest(values));
  };

  return (
    <Dialog
      open
      onClose={onClose}
      size="medium"
      title="Issue travel credit"
      description={`${customer.fullName} · current balance ${formatCreditBalance(customer.creditBalance, '₱0')}`}
      busy={isBusy}
      footer={
        <>
          <Button variant="quiet" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" loading={isBusy} onClick={submit}>
            {summary.submitLabel}
          </Button>
        </>
      }
    >
      <form
        noValidate
        className={styles.form}
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <TextField
          label="Amount (₱)"
          required
          inputMode="numeric"
          placeholder="e.g. 1,500"
          autoComplete="off"
          value={values.amount}
          error={hasTried ? error : undefined}
          helpText="Up to ₱20,000 per credit. Larger amounts go to Finance."
          onChange={(event) => edit({ amount: event.target.value })}
        />
        <div className={styles.pair}>
          <SelectField
            label="Reason"
            required
            value={values.reason}
            options={TRAVEL_CREDIT_REASONS.map((reason) => ({ value: reason, label: reason }))}
            onChange={(event) => edit({ reason: event.target.value as TravelCreditReason })}
          />
          <SelectField
            label="Expires after"
            required
            value={String(values.validForMonths)}
            options={VALIDITY_OPTIONS.map((option) => ({ value: String(option.value), label: option.label }))}
            onChange={(event) =>
              edit({ validForMonths: Number(event.target.value) as TravelCreditFormValues['validForMonths'] })
            }
          />
        </div>
        <TextAreaField
          label="Message to the customer"
          hint="Included in the email"
          rows={2}
          value={values.message}
          onChange={(event) => edit({ message: event.target.value })}
        />
        <div className={styles.balance}>
          <span className={styles.balanceText}>
            <span>New balance</span>
            <span className={styles.balanceNote}>Expires {summary.expires}</span>
          </span>
          <strong className={styles.balanceValue}>{summary.newBalance}</strong>
        </div>
      </form>
    </Dialog>
  );
}

interface AccountStatusDialogProps {
  customer: CustomerDetail;
  isBusy: boolean;
  onClose: () => void;
  onSuspend: (reason: SuspensionReason) => void;
  onReinstate: () => void;
}

/** Suspends an active account or reinstates a suspended one, saying exactly what changes. */
export function AccountStatusDialog({
  customer,
  isBusy,
  onClose,
  onSuspend,
  onReinstate,
}: AccountStatusDialogProps) {
  const [reason, setReason] = useState<SuspensionReason>(SUSPENSION_REASONS[0]);
  const isSuspending = customer.status !== 'suspended';
  const upcoming = customer.upcomingBookingCount;
  const points = isSuspending
    ? [
        upcoming
          ? `${upcoming} upcoming ${upcoming === 1 ? 'booking stays' : 'bookings stay'} ticketed and can still be flown`
          : 'No upcoming bookings are affected',
        'Price alerts and marketing emails stop',
        customer.creditBalance
          ? `${formatPeso(customer.creditBalance)} travel credit is frozen, not removed`
          : 'Travel credit can’t be issued while suspended',
      ]
    : [
        'Notes and the suspension history stay on the account',
        'Travel credit and price alerts are switched back on',
        'Reinstating is logged with your name',
      ];

  return (
    <ConfirmDialog
      isBusy={isBusy}
      onClose={onClose}
      onConfirm={() => (isSuspending ? onSuspend(reason) : onReinstate())}
      content={{
        role: isSuspending ? 'alertdialog' : 'dialog',
        title: `${isSuspending ? 'Suspend' : 'Reinstate'} ${customer.fullName}?`,
        subtitle: `${customer.memberNumber} · ${customer.tier} · ${customer.trips} trips`,
        body: isSuspending
          ? `${customer.firstName} is signed out on every device straight away and can’t sign in or book until someone reinstates the account.`
          : `${customer.firstName} can sign in and book again straight away. We’ll email them to say the account is active.`,
        cancelLabel: isSuspending ? 'Keep active' : 'Cancel',
        confirmLabel: isSuspending ? 'Suspend account' : 'Reinstate account',
        isDestructive: isSuspending,
      }}
    >
      <ul className={styles.points}>
        {points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
      {isSuspending && (
        <SelectField
          label="Reason · saved to the audit log"
          required
          value={reason}
          options={SUSPENSION_REASONS.map((option) => ({ value: option, label: option }))}
          onChange={(event) => setReason(event.target.value as SuspensionReason)}
        />
      )}
    </ConfirmDialog>
  );
}

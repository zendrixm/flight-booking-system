import { useState } from 'react';
import { Link } from 'react-router';

import { paths } from '@/app/paths';
import { Icon } from '@/components/icons';
import { Alert, Button, Dialog, LinkButton, Spinner, TextField } from '@/components/ui';
import { digitsOnly } from '@/lib/validation';
import type { PaymentMethodKind } from '@/types/payment';

import type { PaymentFlowState } from '../../hooks/usePaymentFlow';
import styles from './PaymentFlowDialogs.module.css';
import { ProgressSteps } from './ProgressSteps';

interface PaymentFlowDialogsProps {
  state: PaymentFlowState;
  method: PaymentMethodKind;
  /** "₱39,862" */
  totalLabel: string;
  /** "Card ending 4821", "GCash", "BPI online banking". */
  payVia: string;
  /** "GCash" or "BPI". */
  providerName: string;
  cardLast4: string;
  email: string;
  /** Minutes left on the fare hold, shown when a payment is declined. */
  holdMinutesLeft: number;
  onVerify: (code: string) => void;
  onResendCode: () => void;
  onCancel: () => void;
  onRetry: () => void;
  onUseAnotherMethod: () => void;
  onConfirmExternal: () => void;
  onReopenWallet: () => void;
}

const CHALLENGE_DATE_LABEL = '9 Oct 2026, 00:41';

function lowerFirst(text: string) {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

/** Every dialog of the "Pay" moment: processing, bank verification, hand-offs, decline and approval. */
export function PaymentFlowDialogs(props: PaymentFlowDialogsProps) {
  const { state } = props;
  switch (state.step) {
    case 'idle':
      return null;
    case 'processing':
      return <ProcessingDialog {...props} phase={state.phase} />;
    case 'challenge':
      return <ChallengeDialog {...props} state={state} />;
    case 'wallet':
      return <WalletDialog {...props} />;
    case 'bank':
      return <BankDialog {...props} />;
    case 'declined':
      return <DeclinedDialog {...props} reason={state.reason} />;
    case 'approved':
      return <ApprovedDialog {...props} reference={state.reference} />;
  }
}

function ProcessingDialog({
  method,
  totalLabel,
  payVia,
  providerName,
  phase,
}: PaymentFlowDialogsProps & { phase: 'authorizing' | 'confirming' }) {
  const authorizingLabel =
    method === 'wallet'
      ? `Connecting to ${providerName}`
      : method === 'bank'
        ? 'Creating your payment hold'
        : 'Contacting your bank';
  const isConfirming = phase === 'confirming';

  return (
    <Dialog
      open
      onClose={() => undefined}
      dismissible={false}
      busy
      size="small"
      iconSlot={<Spinner size={24} />}
      title={isConfirming ? 'Confirming your booking' : 'Processing your payment'}
      description={`${totalLabel} · ${payVia}`}
    >
      <ProgressSteps
        steps={[
          { label: 'Booking details checked', status: 'done' },
          {
            label: isConfirming ? 'Payment approved' : authorizingLabel,
            status: isConfirming ? 'done' : 'current',
          },
          { label: 'Issuing e-tickets', status: isConfirming ? 'current' : 'upcoming' },
        ]}
      />
      <p className={styles.note}>
        <Icon name="clock" size={14} strokeWidth={1.8} />
        Please keep this page open — it usually takes under 30 seconds.
      </p>
    </Dialog>
  );
}

function ChallengeDialog({
  state,
  totalLabel,
  payVia,
  cardLast4,
  onVerify,
  onResendCode,
  onCancel,
}: PaymentFlowDialogsProps & { state: Extract<PaymentFlowState, { step: 'challenge' }> }) {
  const [code, setCode] = useState('');
  const isComplete = /^\d{6}$/.test(code);

  return (
    <Dialog
      open
      onClose={onCancel}
      dismissible={false}
      size="medium"
      title="Confirm it’s you"
      description={
        <>
          Your bank sent a 6-digit code to <strong>{state.maskedPhone}</strong>. Enter it to approve this
          payment.
        </>
      }
      footer={
        <>
          <Button variant="quiet" onClick={onCancel}>
            Cancel payment
          </Button>
          <Button
            variant="primary"
            disabled={!isComplete}
            loading={state.isVerifying}
            onClick={() => {
              onVerify(code);
              setCode('');
            }}
          >
            Verify and pay
          </Button>
        </>
      }
    >
      <span className={styles.secureBadge}>
        <Icon name="lock" size={14} strokeWidth={1.8} />
        Secure verification · {payVia}
      </span>
      <dl className={styles.meta}>
        {[
          { label: 'Merchant', value: 'Vela Travel, Inc.' },
          { label: 'Amount', value: `${totalLabel}.00` },
          { label: 'Card', value: `•••• ${cardLast4}` },
          { label: 'Date', value: CHALLENGE_DATE_LABEL },
        ].map((item) => (
          <div key={item.label} className={styles.metaItem}>
            <dt>{item.label}</dt>
            <dd>{item.value}</dd>
          </div>
        ))}
      </dl>
      <TextField
        label="One-time code"
        required
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        placeholder="••••••"
        inputClassName={styles.codeInput}
        value={code}
        error={
          state.hasError
            ? `That code doesn’t match. You have ${state.attemptsLeft} ${state.attemptsLeft === 1 ? 'attempt' : 'attempts'} left.`
            : undefined
        }
        onChange={(event) => setCode(digitsOnly(event.target.value).slice(0, 6))}
      />
      <div className={styles.codeFooter}>
        <span>Code expires in 4:52</span>
        {state.wasResent ? (
          <span role="status" className={styles.resent}>
            New code sent
          </span>
        ) : (
          <Button variant="ghost" size="small" className={styles.textButton} onClick={onResendCode}>
            Resend code
          </Button>
        )}
      </div>
      <p className={styles.fineprint}>
        This check is run by your card issuer to protect you from fraud. Vela never sees or stores your code.
      </p>
    </Dialog>
  );
}

function WalletDialog({
  totalLabel,
  providerName,
  onCancel,
  onConfirmExternal,
  onReopenWallet,
}: PaymentFlowDialogsProps) {
  return (
    <Dialog
      open
      onClose={onCancel}
      dismissible={false}
      size="medium"
      title={`Approve the payment in ${providerName}`}
      footer={
        <>
          <Button variant="quiet" onClick={onReopenWallet}>
            Open {providerName} again
          </Button>
          <Button variant="primary" onClick={onConfirmExternal}>
            I’ve approved it
          </Button>
        </>
      }
    >
      <p className={styles.body}>
        We’ve opened {providerName} in a new tab. Log in, check the amount and approve the payment to Vela
        Travel, Inc. — then come back to this page.
      </p>
      <div className={styles.request}>
        <span className={styles.monogram} aria-hidden="true">
          {providerName.slice(0, 1)}
        </span>
        <span className={styles.requestText}>
          <span className={styles.requestAmount}>{totalLabel}</span>
          <span className={styles.requestMeta}>To Vela Travel, Inc. · request expires in 9:41</span>
        </span>
        <Spinner size={20} />
      </div>
      <p role="status" className={styles.waiting}>
        Waiting for you to approve in {providerName}…
      </p>
      <Button variant="ghost" size="small" className={styles.cancelLink} onClick={onCancel}>
        Cancel payment
      </Button>
    </Dialog>
  );
}

function BankDialog({ totalLabel, providerName, onCancel, onConfirmExternal }: PaymentFlowDialogsProps) {
  return (
    <Dialog
      open
      onClose={onCancel}
      size="medium"
      title={`Continue to ${providerName} to pay`}
      description="Booking held · seats and fare kept for 3 hours"
      footer={
        <>
          <Button variant="quiet" onClick={onCancel}>
            Choose another bank
          </Button>
          <Button variant="primary" iconEnd="arrowUpRight" onClick={onConfirmExternal}>
            Continue to {providerName}
          </Button>
        </>
      }
    >
      <p className={styles.body}>
        Log in to {providerName} online banking and approve the payment. We’ll confirm your booking and email
        your e-tickets as soon as it arrives.
      </p>
      <dl className={styles.meta}>
        {[
          { label: 'Amount', value: `${totalLabel}.00` },
          { label: 'Pay to', value: 'Vela Travel, Inc.' },
          { label: 'Reference', value: 'VLP-7Q2K-0918' },
          { label: 'Hold ends', value: '9 Oct, 03:41' },
        ].map((item) => (
          <div key={item.label} className={styles.metaItem}>
            <dt>{item.label}</dt>
            <dd>{item.value}</dd>
          </div>
        ))}
      </dl>
      <Alert tone="attention" icon="clock">
        If we don’t receive payment by <strong>03:41</strong>, the hold ends and your seats are released. The
        fare isn’t guaranteed until it’s paid.
      </Alert>
    </Dialog>
  );
}

function DeclinedDialog({
  reason,
  totalLabel,
  payVia,
  holdMinutesLeft,
  onCancel,
  onRetry,
  onUseAnotherMethod,
}: PaymentFlowDialogsProps & { reason: 'card' | 'challenge' }) {
  const message =
    reason === 'challenge'
      ? `We couldn’t verify the payment of ${totalLabel} — the code was entered incorrectly too many times, so your bank stopped it.`
      : `Your bank declined the payment of ${totalLabel} on ${lowerFirst(payVia)}.`;

  return (
    <Dialog
      open
      onClose={onCancel}
      role="alertdialog"
      size="medium"
      icon="creditCardOff"
      iconTone="danger"
      title="Payment declined"
      description={`${message} You haven’t been charged.`}
      footer={
        <>
          <Button variant="quiet" onClick={onUseAnotherMethod}>
            Use another way to pay
          </Button>
          <Button variant="primary" iconStart="refresh" onClick={onRetry}>
            Try again
          </Button>
        </>
      }
    >
      <div className={styles.reasons}>
        <h3 className={styles.reasonsTitle}>Common reasons</h3>
        <ul className={styles.reasonsList}>
          <li>Online or overseas payments are switched off for this card</li>
          <li>The amount is over the card’s daily limit</li>
          <li>The card is locked, or was recently replaced</li>
        </ul>
        <p className={styles.reasonsNote}>Your bank’s app can usually fix these in a minute.</p>
      </div>
      <Alert tone="attention" icon="clock">
        We’re still holding your seats and this fare for <strong>{holdMinutesLeft} minutes</strong>.
      </Alert>
      <p className={styles.fineprint}>
        Still stuck? <Link to={`${paths.help}#chat`}>Chat with a travel specialist</Link>
      </p>
    </Dialog>
  );
}

function ApprovedDialog({
  totalLabel,
  payVia,
  email,
  reference,
}: PaymentFlowDialogsProps & { reference: string }) {
  return (
    <Dialog
      open
      onClose={() => undefined}
      dismissible={false}
      size="small"
      icon="check"
      iconTone="successSolid"
      title="Payment approved"
      description={`${totalLabel} paid with ${lowerFirst(payVia)}`}
    >
      <ProgressSteps
        steps={[
          { label: 'Payment approved', status: 'done' },
          { label: `Booking ${reference} confirmed`, status: 'done' },
          { label: 'Issuing e-tickets', status: 'current' },
        ]}
      />
      <LinkButton to={paths.bookingConfirmed} variant="primary" size="large" fullWidth iconEnd="arrowRight">
        View your booking
      </LinkButton>
      <p className={styles.fineprint}>E-tickets are on their way to {email}</p>
    </Dialog>
  );
}

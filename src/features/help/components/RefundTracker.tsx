import clsx from 'clsx';
import { useState } from 'react';

import { Icon } from '@/components/icons';
import { Alert, Button, StatusChip, TextField } from '@/components/ui';
import { formatPeso } from '@/lib/format';
import { trackRefund } from '@/services/helpService';
import type { RefundStatus } from '@/types/help';

import { sanitizeReference } from '../lib/supportForms';
import { useHelpSupport } from '../state/helpSupportContext';
import styles from './RefundTracker.module.css';

type LookupState =
  | { kind: 'idle' }
  | { kind: 'checking' }
  | { kind: 'found'; refund: RefundStatus }
  | { kind: 'notFound'; reference: string };

/** Look up a refund with the booking reference and last name; no account needed. */
export function RefundTracker() {
  const { openChat, openMessage } = useHelpSupport();
  const [reference, setReference] = useState('');
  const [lastName, setLastName] = useState('');
  const [lookup, setLookup] = useState<LookupState>({ kind: 'idle' });
  const canTrack = reference.length === 6 && lastName.trim().length > 0 && lookup.kind !== 'checking';

  const track = async () => {
    if (!canTrack) return;
    setLookup({ kind: 'checking' });
    const refund = await trackRefund(reference, lastName);
    setLookup(refund ? { kind: 'found', refund } : { kind: 'notFound', reference });
  };

  return (
    <section id="refund" aria-labelledby="refund-title" className={styles.section}>
      <form
        className={styles.form}
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void track();
        }}
      >
        <h2 id="refund-title" className={styles.title}>
          Track a refund
        </h2>
        <p className={styles.lead}>
          No account needed. Use the booking reference from your confirmation email.
        </p>
        <TextField
          label="Booking reference"
          required
          autoComplete="off"
          inputClassName={styles.reference}
          value={reference}
          onChange={(event) => {
            setReference(sanitizeReference(event.target.value));
            setLookup({ kind: 'idle' });
          }}
        />
        <TextField
          label="Last name"
          required
          autoComplete="family-name"
          placeholder="As on the booking"
          value={lastName}
          onChange={(event) => {
            setLastName(event.target.value);
            setLookup({ kind: 'idle' });
          }}
        />
        <Button
          type="submit"
          variant="primary"
          size="large"
          fullWidth
          disabled={!canTrack}
          loading={lookup.kind === 'checking'}
        >
          {lookup.kind === 'checking' ? 'Checking…' : 'Track refund'}
        </Button>
      </form>

      <div className={styles.result} aria-live="polite">
        {lookup.kind === 'idle' && (
          <span className={styles.muted}>Enter your booking details to see where your refund is.</span>
        )}
        {lookup.kind === 'checking' && (
          <span role="status" className={styles.checking}>
            <span className={styles.pulse} aria-hidden="true" />
            Looking up {reference}…
          </span>
        )}
        {lookup.kind === 'found' && <RefundTimeline refund={lookup.refund} />}
        {lookup.kind === 'notFound' && (
          <>
            <Alert tone="danger" role="alert">
              <strong>We couldn’t find a refund for {lookup.reference}.</strong> Check the reference and last
              name match your confirmation email. Refund requests can take up to an hour to appear.
            </Alert>
            <div className={styles.stillStuck}>
              <span className={styles.muted}>Still can’t see it?</span>
              <Button variant="quiet" size="small" onClick={openChat}>
                Ask in chat
              </Button>
              <Button
                variant="quiet"
                size="small"
                onClick={() => openMessage({ topic: 'refund', bookingReference: lookup.reference })}
              >
                Send us the details
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function RefundTimeline({ refund }: { refund: RefundStatus }) {
  return (
    <div className={styles.timeline}>
      <div className={styles.summary}>
        <span className={styles.summaryText}>
          <span className={styles.muted}>
            {refund.reference} · {refund.summary} · checked just now
          </span>
          <span className={styles.amount}>{formatPeso(refund.amount)}</span>
        </span>
        <StatusChip tone="warning">{refund.statusLabel}</StatusChip>
      </div>
      <ol className={styles.steps}>
        {refund.steps.map((step, index) => {
          const isCurrent = !step.isDone && (index === 0 || refund.steps[index - 1].isDone);
          return (
            <li key={step.title} className={styles.step}>
              <span className={styles.track} aria-hidden="true">
                <span
                  className={clsx(styles.dot, step.isDone && styles.dotDone, isCurrent && styles.dotCurrent)}
                >
                  {step.isDone && <Icon name="check" size={12} strokeWidth={3} />}
                </span>
                {index < refund.steps.length - 1 && <span className={styles.line} />}
              </span>
              <span className={styles.stepText}>
                <span className={styles.stepTitle}>
                  {step.title}
                  <span className="visually-hidden">
                    {step.isDone ? ' — done' : isCurrent ? ' — next' : ''}
                  </span>
                </span>
                <span className={styles.muted}>{step.detail}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

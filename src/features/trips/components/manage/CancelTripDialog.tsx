import { useState } from 'react';
import { Link } from 'react-router';

import { paths } from '@/app/paths';
import { Alert, Button, ChoiceCard, Dialog } from '@/components/ui';
import { formatPeso, joinWithAnd } from '@/lib/format';
import { refundAmounts, refundRowsFor } from '@/services/manageBookingService';
import type { ManagedBooking, RefundMethod } from '@/types/managedBooking';

import styles from './ManageDialogs.module.css';

interface CancelTripDialogProps {
  booking: ManagedBooking;
  isSaving: boolean;
  onClose: () => void;
  onConfirm: (method: RefundMethod) => void;
}

/** Two steps: see the refund and choose where it goes, then confirm the (irreversible) cancellation. */
export function CancelTripDialog({ booking, isSaving, onClose, onConfirm }: CancelTripDialogProps) {
  const [step, setStep] = useState<'refund' | 'confirm'>('refund');
  const [method, setMethod] = useState<RefundMethod>('card');
  const rows = refundRowsFor(booking.reference);
  const amounts = refundAmounts(booking.reference);
  const names = joinWithAnd(booking.travelers.map((traveler) => traveler.firstNames.split(' ')[0]));
  const flights = joinWithAnd(booking.flights.map((flight) => flight.flightNumber));
  const seats = joinWithAnd(booking.travelers.map((traveler) => traveler.seats.outbound));

  if (step === 'confirm') {
    return (
      <Dialog
        open
        onClose={onClose}
        role="alertdialog"
        size="small"
        icon="alertTriangle"
        iconTone="danger"
        title={`Cancel your ${booking.city} trip?`}
        description={`${flights} will be cancelled for ${names}, and seats ${seats} released. This can’t be undone.`}
        footer={
          <>
            <Button variant="quiet" onClick={onClose}>
              Keep my trip
            </Button>
            <Button variant="destructive" loading={isSaving} onClick={() => onConfirm(method)}>
              Yes, cancel trip
            </Button>
          </>
        }
      >
        <div className={styles.refundSummary}>
          <span className={styles.refundSummaryText}>
            <strong>
              {method === 'card'
                ? `Refund to card ending ${booking.cardLast4}`
                : 'Refund as Vela travel credit'}
            </strong>
            <span>{method === 'card' ? 'In 7–14 business days' : 'Instantly, valid 12 months'}</span>
          </span>
          <span className={styles.refundAmount}>{formatPeso(amounts[method])}</span>
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog
      open
      onClose={onClose}
      size="large"
      title={
        <span className={styles.titleStack}>
          <span className={styles.currentLabel}>Cancel trip · step 1 of 2</span>
          <span>Your refund</span>
        </span>
      }
      description={`Both flights and all travelers will be cancelled. Your ${booking.fareName} fare is non-refundable, but taxes and unused add-ons are returned.`}
      footer={
        <>
          <Button variant="quiet" onClick={onClose}>
            Keep my trip
          </Button>
          <Button variant="destructive" onClick={() => setStep('confirm')}>
            Continue
          </Button>
        </>
      }
    >
      <table className={styles.refundTable}>
        <thead>
          <tr>
            <th scope="col">Item</th>
            <th scope="col">Paid</th>
            <th scope="col">Refund</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.item}>
              <td>{row.item}</td>
              <td className={styles.paid}>{formatPeso(row.paid)}</td>
              <td className={row.refund ? styles.refunded : styles.notRefunded}>
                {row.refund ? formatPeso(row.refund) : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <fieldset className={styles.group}>
        <legend className="visually-hidden">Refund method</legend>
        <ChoiceCard
          name="refund-method"
          title={`Refund to card ending ${booking.cardLast4}`}
          description="7–14 business days"
          meta={formatPeso(amounts.card)}
          checked={method === 'card'}
          onChange={() => setMethod('card')}
        />
        <ChoiceCard
          name="refund-method"
          title="Vela travel credit"
          description="Instant, +10% bonus, valid 12 months"
          meta={formatPeso(amounts.credit)}
          checked={method === 'credit'}
          onChange={() => setMethod('credit')}
        />
      </fieldset>
      {booking.hasProtection && (
        <Alert tone="attention" icon="shield">
          Cancelling because of illness or another covered reason? Vela Protect can refund the full fare —{' '}
          <Link to={`${paths.help}#message`}>start a claim</Link> instead.
        </Alert>
      )}
    </Dialog>
  );
}

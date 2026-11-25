import { Link } from 'react-router';

import { paths } from '@/app/paths';
import { Icon } from '@/components/icons';
import { Button, Dialog, StatusChip } from '@/components/ui';
import { formatPeso } from '@/lib/format';
import type { Trip } from '@/types/trip';

import { pastTripDateRange } from '../lib/tripDates';
import styles from './RefundDetailsDialog.module.css';

interface RefundDetailsDialogProps {
  trip: Trip;
  onClose: () => void;
  onDownload: () => void;
  onBookAgain: () => void;
}

export function RefundDetailsDialog({ trip, onClose, onDownload, onBookAgain }: RefundDetailsDialogProps) {
  const cancellation = trip.cancellation;
  if (!cancellation) return null;

  return (
    <Dialog
      open
      onClose={onClose}
      size="large"
      title={
        <span className={styles.titleStack}>
          <StatusChip tone="success" size="compact">
            Refunded
          </StatusChip>
          <span>Refund · {trip.city}</span>
        </span>
      }
      description={`${pastTripDateRange(trip)} · ${trip.originCode} ⇄ ${trip.destinationCode} · ${trip.airlineName} ${trip.flightNumbers} · Ref ${trip.reference}`}
      footer={
        <>
          <Button variant="quiet" iconStart="download" onClick={onDownload}>
            Refund receipt
          </Button>
          <Button variant="primary" onClick={onBookAgain}>
            Book {trip.city} again
          </Button>
        </>
      }
    >
      <ol aria-label="Refund progress" className={styles.steps}>
        {cancellation.steps.map((step) => (
          <li key={step.label} className={styles.step}>
            <span className={styles.dot} aria-hidden="true">
              <Icon name="check" size={12} strokeWidth={3} />
            </span>
            <span className={styles.stepText}>
              <span className={styles.stepLabel}>{step.label}</span>
              <span className={styles.stepDetail}>{step.detail}</span>
            </span>
          </li>
        ))}
      </ol>
      <div className={styles.lines}>
        {cancellation.lines.map((line) => (
          <div key={line.label} className={styles.line}>
            <span className={styles.lineText}>
              <span className={styles.lineLabel}>{line.label}</span>
              <span className={styles.lineDetail}>{line.detail}</span>
            </span>
            <span className={line.amount < 0 ? styles.fee : styles.amount}>{formatPeso(line.amount)}</span>
          </div>
        ))}
        <div className={styles.total}>
          <span>Refunded to card •••• {trip.receipt.cardLast4}</span>
          <span className={styles.totalAmount}>{formatPeso(cancellation.refundAmount)}</span>
        </div>
      </div>
      <p className={styles.note}>
        Refunds usually show on your statement 5–10 banking days after we issue them. Still missing?{' '}
        <Link to={`${paths.help}#message`}>Send us a message</Link>
      </p>
    </Dialog>
  );
}

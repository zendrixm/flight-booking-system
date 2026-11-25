import { Button } from '@/components/ui';
import { formatDayLabel, formatDayMonth } from '@/lib/date';
import { formatPeso, pluralize } from '@/lib/format';
import type { Trip } from '@/types/trip';

import { tripDateRange } from '../lib/tripDates';
import styles from './CancelledTripCard.module.css';

interface CancelledTripCardProps {
  trip: Trip;
  onViewRefund: () => void;
  onBookAgain: () => void;
}

export function CancelledTripCard({ trip, onViewRefund, onBookAgain }: CancelledTripCardProps) {
  const cancellation = trip.cancellation;
  if (!cancellation) return null;
  const year = trip.departDate.slice(0, 4);

  return (
    <article className={styles.card} aria-label={`${trip.city}, cancelled`}>
      <div className={styles.summary}>
        <span className={styles.text}>
          <span className={styles.city}>{trip.city}</span>
          <span className={styles.meta}>
            {tripDateRange(trip)} {year} · {trip.originCode} ⇄ {trip.destinationCode} ·{' '}
            {pluralize(trip.travelerCount, 'traveler')} · Ref {trip.reference}
          </span>
        </span>
        <span className={styles.status}>
          <span className={styles.chip}>Cancelled by you</span>
          <span className={styles.refund}>
            {formatPeso(cancellation.refundAmount)} refunded to card ending {trip.receipt.cardLast4} on{' '}
            {formatDayMonth(cancellation.refundedOn)}
          </span>
        </span>
      </div>
      <div className={styles.footer}>
        <span className={styles.footerNote}>
          Cancelled {formatDayLabel(cancellation.cancelledOn)} {year} · {formatPeso(cancellation.airlineFee)}{' '}
          cancellation fee kept by the airline
        </span>
        <span className={styles.actions}>
          <Button variant="ghost" iconStart="receipt" onClick={onViewRefund}>
            Refund details
          </Button>
          <Button variant="quiet" aria-label={`Book ${trip.city} again`} onClick={onBookAgain}>
            Book again
          </Button>
        </span>
      </div>
    </article>
  );
}

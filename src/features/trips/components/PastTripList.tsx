import { Button } from '@/components/ui';
import { MONTHS_SHORT, parseIsoDate } from '@/lib/date';
import { pluralize } from '@/lib/format';
import type { Trip } from '@/types/trip';

import { pastTripDateRange } from '../lib/tripDates';
import styles from './PastTripList.module.css';

interface PastTripListProps {
  trips: readonly Trip[];
  onViewReceipt: (trip: Trip) => void;
  onBookAgain: (trip: Trip) => void;
}

export function PastTripList({ trips, onViewReceipt, onBookAgain }: PastTripListProps) {
  return (
    <ul className={styles.list}>
      {trips.map((trip) => {
        const date = parseIsoDate(trip.departDate);
        return (
          <li key={trip.reference} className={styles.row}>
            <span className={styles.dateTile} aria-hidden="true">
              <span className={styles.month}>{MONTHS_SHORT[date.getUTCMonth()].toUpperCase()}</span>
              <span className={styles.day}>{String(date.getUTCDate()).padStart(2, '0')}</span>
            </span>
            <span className={styles.text}>
              <span className={styles.city}>{trip.city}</span>
              <span className={styles.meta}>
                {pastTripDateRange(trip)} · {trip.originCode} ⇄ {trip.destinationCode} ·{' '}
                {pluralize(trip.travelerCount, 'traveler')}
              </span>
            </span>
            <span className={styles.actions}>
              <Button
                variant="ghost"
                iconStart="receipt"
                aria-label={`Receipt for ${trip.city}, ${trip.reference}`}
                onClick={() => onViewReceipt(trip)}
              >
                Receipt
              </Button>
              <Button
                variant="quiet"
                aria-label={`Book ${trip.city} again`}
                onClick={() => onBookAgain(trip)}
              >
                Book again
              </Button>
            </span>
          </li>
        );
      })}
    </ul>
  );
}

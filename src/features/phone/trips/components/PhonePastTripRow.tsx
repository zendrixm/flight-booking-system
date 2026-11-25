import { Button } from '@/components/ui';
import { pastTripDateRange } from '@/features/trips/lib/tripDates';
import { MONTHS_SHORT, parseIsoDate } from '@/lib/date';
import { pluralize } from '@/lib/format';
import type { Trip } from '@/types/trip';

import styles from './PhonePastTripRow.module.css';

interface PhonePastTripRowProps {
  trip: Trip;
  onBookAgain: (trip: Trip) => void;
}

/** A finished trip with a calendar tile and "Book again". */
export function PhonePastTripRow({ trip, onBookAgain }: PhonePastTripRowProps) {
  const departure = parseIsoDate(trip.departDate);
  const day = String(departure.getUTCDate()).padStart(2, '0');

  return (
    <li className={styles.row}>
      <span className={styles.dateTile} aria-hidden="true">
        <span className={styles.month}>{MONTHS_SHORT[departure.getUTCMonth()].toUpperCase()}</span>
        <span className={styles.day}>{day}</span>
      </span>
      <span className={styles.text}>
        <span className={styles.city}>{trip.city}</span>
        <span className={styles.meta}>
          {pastTripDateRange(trip)} · {trip.airlineName} · {pluralize(trip.travelerCount, 'traveler')}
        </span>
      </span>
      <Button
        variant="quiet"
        size="small"
        aria-label={`Book ${trip.city} again`}
        onClick={() => onBookAgain(trip)}
      >
        Book again
      </Button>
    </li>
  );
}

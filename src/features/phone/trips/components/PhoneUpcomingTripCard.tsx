import clsx from 'clsx';

import { paths } from '@/app/paths';
import { Icon } from '@/components/icons';
import { LinkButton } from '@/components/ui';
import { DEMO_TODAY } from '@/config/demo';
import { CHECK_IN_OPENS_DAYS_BEFORE, isCheckInOpen, tripDateRange } from '@/features/trips/lib/tripDates';
import { addDays, formatDayLabel } from '@/lib/date';
import { pluralize } from '@/lib/format';
import type { Trip } from '@/types/trip';

import { relativeDayLabel } from '../../shared/lib/phoneDates';
import type { PhoneTrip } from '../../shared/lib/phoneTrips';
import styles from './PhoneUpcomingTripCard.module.css';

/** "MR 518 · MNL 07:15 → SIN 10:50 · 1 traveler" */
function flightSummary(trip: Trip): string {
  const { outbound } = trip;
  return [
    outbound.flightNumber,
    `${outbound.departure.airportCode} ${outbound.departure.time} → ${outbound.arrival.airportCode} ${outbound.arrival.time}`,
    pluralize(trip.travelerCount, 'traveler'),
  ].join(' · ');
}

/**
 * An upcoming trip. Once check-in opens it turns Midnight and leads with the boarding pass
 * (or with checking in, if that's still to do).
 */
export function PhoneUpcomingTripCard({ phoneTrip }: { phoneTrip: PhoneTrip }) {
  const { trip, boardingPass } = phoneTrip;

  if (!isCheckInOpen(trip, DEMO_TODAY)) {
    return (
      <article className={styles.card} aria-label={trip.city}>
        <div className={styles.topRow}>
          <span className={styles.eyebrow}>{tripDateRange(trip)}</span>
          <span className={styles.reference}>{trip.reference}</span>
        </div>
        <span className={styles.heading}>
          <span className={styles.city}>{trip.city}</span>
          <span className={styles.summary}>{flightSummary(trip)}</span>
        </span>
        <span className={styles.notice}>
          <Icon name="clock" size={16} />
          <span>
            Check-in opens {formatDayLabel(addDays(trip.departDate, -CHECK_IN_OPENS_DAYS_BEFORE))} at{' '}
            {trip.outbound.departure.time}
          </span>
        </span>
        <LinkButton to={paths.trip(trip.reference)} variant="quiet" fullWidth>
          Manage booking
        </LinkButton>
      </article>
    );
  }

  const isCheckedIn = Boolean(boardingPass?.isCheckedIn);
  return (
    <article className={clsx(styles.card, styles.featured)} aria-label={trip.city}>
      <div className={styles.topRow}>
        <span className={clsx(styles.eyebrow, styles.eyebrowBrass)}>
          {relativeDayLabel(trip.departDate, DEMO_TODAY)} · {formatDayLabel(trip.departDate)}
        </span>
        <span className={styles.statusChip}>
          {isCheckedIn && <Icon name="check" size={12} strokeWidth={3} />}
          {isCheckedIn ? 'Checked in' : 'Check-in open'}
        </span>
      </div>
      <span className={styles.heading}>
        <span className={styles.city}>{trip.city}</span>
        <span className={styles.summary}>{flightSummary(trip)}</span>
      </span>
      <div className={styles.actions}>
        {isCheckedIn ? (
          <LinkButton to={paths.phone.boardingPass(trip.reference)} variant="accent" fullWidth>
            Boarding pass
          </LinkButton>
        ) : (
          <LinkButton to={paths.boardingPass(trip.reference)} variant="accent" fullWidth>
            Check in
          </LinkButton>
        )}
        <LinkButton to={paths.trip(trip.reference)} variant="inverseQuiet" fullWidth>
          Manage
        </LinkButton>
      </div>
    </article>
  );
}

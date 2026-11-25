import clsx from 'clsx';

import { paths } from '@/app/paths';
import { Icon } from '@/components/icons';
import { Button, LinkButton, StatusChip } from '@/components/ui';
import { DEMO_TODAY } from '@/config/demo';
import { formatDuration, pluralize } from '@/lib/format';
import type { Trip } from '@/types/trip';

import { checkInOpensLabel, departureCountdown, isCheckInOpen, tripDateRange } from '../lib/tripDates';
import styles from './UpcomingTripCard.module.css';

interface UpcomingTripCardProps {
  trip: Trip;
  /** Marks a booking that was just added by reference. */
  isNew?: boolean;
}

/** An upcoming trip. When check-in is open it becomes the Midnight "next trip" card with a Check in button. */
export function UpcomingTripCard({ trip, isNew = false }: UpcomingTripCardProps) {
  const checkInOpen = isCheckInOpen(trip, DEMO_TODAY);
  const { outbound } = trip;

  return (
    <article
      className={clsx(styles.card, checkInOpen && styles.featured, isNew && styles.isNew)}
      aria-label={`${trip.city}${isNew ? ', added just now' : ''}`}
    >
      {checkInOpen && (
        <svg className={styles.art} width="420" height="240" viewBox="0 0 420 240" aria-hidden="true">
          <path
            d="M20 220 C 140 40, 300 40, 400 90"
            fill="none"
            stroke="var(--color-brass)"
            strokeWidth="1.5"
            strokeDasharray="2 8"
            strokeLinecap="round"
          />
          <circle cx="400" cy="90" r="5" fill="var(--color-brass)" />
        </svg>
      )}
      <div className={styles.details}>
        <div className={styles.chips}>
          {isNew && <span className={styles.newChip}>Added just now</span>}
          {checkInOpen ? (
            <span className={styles.checkInChip}>Check-in open</span>
          ) : (
            <StatusChip tone="success" hideDot>
              <Icon name="check" size={12} strokeWidth={3} />
              Confirmed
            </StatusChip>
          )}
          <span className={styles.countdown}>{departureCountdown(trip.departDate, DEMO_TODAY)}</span>
        </div>
        <div className={styles.heading}>
          <h3 className={styles.city}>{trip.city}</h3>
          <span className={styles.meta}>
            {tripDateRange(trip)} · {pluralize(trip.travelerCount, 'traveler')} · Ref {trip.reference}
          </span>
        </div>
        <div className={styles.times}>
          <div className={styles.endpoint}>
            <span className={styles.time}>{outbound.departure.time}</span>
            <span className={styles.airport}>
              {outbound.departure.airportCode} {outbound.departure.terminal}
            </span>
          </div>
          <span className={styles.line} aria-hidden="true" />
          <div className={styles.endpoint}>
            <span className={styles.time}>{outbound.arrival.time}</span>
            <span className={styles.airport}>
              {outbound.arrival.airportCode} {outbound.arrival.terminal}
            </span>
          </div>
          <span className={styles.airport}>
            {outbound.flightNumber} · {formatDuration(outbound.durationMinutes)}
          </span>
        </div>
      </div>
      <div className={styles.actions}>
        {checkInOpen ? (
          <LinkButton
            to={paths.boardingPass(trip.reference)}
            variant="inverse"
            size="large"
            iconStart="ticket"
          >
            Check in
          </LinkButton>
        ) : (
          <>
            <span className={styles.opens}>
              <Icon name="clock" size={16} />
              Check-in opens {checkInOpensLabel(trip)}
            </span>
            <Button variant="primary" size="large" disabled>
              Check in
            </Button>
          </>
        )}
        <LinkButton
          to={paths.trip(trip.reference)}
          variant={checkInOpen ? 'inverseQuiet' : 'quiet'}
          size="large"
        >
          Manage booking
        </LinkButton>
      </div>
    </article>
  );
}

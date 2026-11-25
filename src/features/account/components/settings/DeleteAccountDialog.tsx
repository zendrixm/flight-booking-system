import { paths } from '@/app/paths';
import { Button, Dialog, LinkButton } from '@/components/ui';
import { formatDayLabel, formatDayMonth } from '@/lib/date';
import { formatPeso, pluralize } from '@/lib/format';
import type { Trip } from '@/types/trip';

import styles from './SettingsDialogs.module.css';

interface DeleteAccountDialogProps {
  upcomingTrips: Trip[];
  travelCredit: number;
  onClose: () => void;
}

function tripLine(trip: Trip): string {
  const dates = trip.returnDate
    ? `${formatDayLabel(trip.departDate)} – ${formatDayLabel(trip.returnDate)}`
    : formatDayLabel(trip.departDate);
  return `${dates} · ${trip.reference} · ${pluralize(trip.travelerCount, 'traveler')}`;
}

/**
 * Accounts with upcoming trips can't be deleted, because the boarding passes and airline updates
 * live in the account. This explains why and points to the trips instead.
 */
export function DeleteAccountDialog({ upcomingTrips, travelCredit, onClose }: DeleteAccountDialogProps) {
  const lastTrip = upcomingTrips.reduce<Trip | undefined>(
    (latest, trip) =>
      !latest || (trip.returnDate ?? trip.departDate) > (latest.returnDate ?? latest.departDate)
        ? trip
        : latest,
    undefined,
  );

  return (
    <Dialog
      open
      onClose={onClose}
      role="alertdialog"
      size="medium"
      icon="ban"
      iconTone="danger"
      title="You can’t delete your account yet"
      description={`You have ${pluralize(upcomingTrips.length, 'upcoming trip')}. Deleting your account now would remove your boarding passes and the trip updates the airline sends you.`}
      footer={
        <div className={styles.splitFooter}>
          <Button variant="destructive" disabled>
            Delete permanently
          </Button>
          <span className={styles.footerButtons}>
            <LinkButton to={paths.trips} variant="quiet">
              View my trips
            </LinkButton>
            <Button variant="primary" onClick={onClose}>
              Keep my account
            </Button>
          </span>
        </div>
      }
    >
      <ul className={styles.trips}>
        {upcomingTrips.map((trip) => (
          <li key={trip.reference} className={styles.trip}>
            <span className={styles.tripText}>
              <span className={styles.tripCity}>{trip.city}</span>
              <span className={styles.tripMeta}>{tripLine(trip)}</span>
            </span>
            <LinkButton to={paths.trip(trip.reference)} variant="ghost" size="small">
              Manage
            </LinkButton>
          </li>
        ))}
      </ul>
      {lastTrip && (
        <p className={styles.note}>
          Once you’re back from {lastTrip.city} on{' '}
          {formatDayMonth(lastTrip.returnDate ?? lastTrip.departDate)} — or if you cancel{' '}
          {upcomingTrips.length > 1 ? 'these trips' : 'this trip'} — you can delete your account here. Your{' '}
          {formatPeso(travelCredit)} travel credit is lost when you do.
        </p>
      )}
    </Dialog>
  );
}

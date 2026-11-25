import { Link } from 'react-router';

import { paths } from '@/app/paths';
import { DEMO_TODAY } from '@/config/demo';

import { relativeDayLabel } from '../../shared/lib/phoneDates';
import type { PhoneTrip } from '../../shared/lib/phoneTrips';
import styles from './NextTripCard.module.css';

/** The soonest trip open for check-in: straight to the boarding pass, or to check in first. */
export function NextTripCard({ nextTrip }: { nextTrip: PhoneTrip }) {
  const { trip, boardingPass } = nextTrip;
  const isCheckedIn = Boolean(boardingPass?.isCheckedIn);
  const details = [
    relativeDayLabel(trip.departDate, DEMO_TODAY),
    trip.outbound.flightNumber,
    trip.outbound.departure.time,
    boardingPass ? `Gate ${boardingPass.gate}` : null,
  ].filter(Boolean);

  return (
    <Link
      to={isCheckedIn ? paths.phone.boardingPass(trip.reference) : paths.boardingPass(trip.reference)}
      className={styles.card}
    >
      <span className={styles.text}>
        <span className={styles.city}>{trip.city}</span>
        <span className={styles.details}>{details.join(' · ')}</span>
      </span>
      <span className={styles.action}>{isCheckedIn ? 'Pass' : 'Check in'}</span>
    </Link>
  );
}

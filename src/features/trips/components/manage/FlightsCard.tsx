import { formatDayLabel } from '@/lib/date';
import { formatDuration } from '@/lib/format';
import type { ManagedBooking } from '@/types/managedBooking';

import styles from './BookingSections.module.css';

export function FlightsCard({ booking }: { booking: ManagedBooking }) {
  return (
    <section className={`${styles.card} ${styles.flush}`} aria-labelledby="manage-flights-title">
      <h2 id="manage-flights-title" className={styles.flushTitle}>
        Flights
      </h2>
      {booking.flights.map((flight) => (
        <div key={flight.segment} className={styles.flight}>
          <span className={styles.flightWhen}>
            <span className={styles.kind}>{flight.segment === 'outbound' ? 'Depart' : 'Return'}</span>
            <span className={styles.date}>{formatDayLabel(flight.date)}</span>
            {flight.changedOn && <span className={styles.changed}>Changed today</span>}
          </span>
          <span className={styles.flightTimes}>
            <span className={styles.endpoint}>
              <span className={styles.time}>{flight.departureTime}</span>
              <span className={styles.airport}>
                {flight.from} · {flight.fromTerminal}
              </span>
            </span>
            <span className={styles.line} aria-hidden="true" />
            <span className={styles.endpointEnd}>
              <span className={styles.time}>{flight.arrivalTime}</span>
              <span className={styles.airport}>
                {flight.to} · {flight.toTerminal}
              </span>
            </span>
          </span>
          <span className={styles.flightMeta}>
            {booking.airlineName} {flight.flightNumber} ·{' '}
            {flight.changedOn ? 'new e-ticket' : flight.aircraft} · Nonstop{' '}
            {formatDuration(flight.durationMinutes)}
          </span>
        </div>
      ))}
    </section>
  );
}

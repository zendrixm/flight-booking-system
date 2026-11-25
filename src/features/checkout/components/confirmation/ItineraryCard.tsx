import { Icon } from '@/components/icons';
import { formatDuration } from '@/lib/format';

import type { ConfirmedLeg } from '../../lib/confirmation';
import styles from './ItineraryCard.module.css';

export function ItineraryCard({ legs }: { legs: readonly ConfirmedLeg[] }) {
  return (
    <section className={styles.card} aria-labelledby="itinerary-title">
      <h2 id="itinerary-title" className={styles.title}>
        Itinerary
      </h2>
      {legs.map(({ kind, dateLabel, flightLabel, leg, fromLabel, toLabel, chips }) => (
        <div key={leg.flightNumber} className={styles.leg}>
          <div className={styles.legHeader}>
            <span className={styles.kind}>
              {kind} · {dateLabel}
            </span>
            <span className={styles.flight}>{flightLabel}</span>
          </div>
          <div className={styles.route}>
            <div className={styles.endpoint}>
              <span className={styles.code}>{leg.from}</span>
              <span className={styles.time}>{leg.departureTime}</span>
              <span className={styles.place}>{fromLabel}</span>
            </div>
            <div className={styles.path}>
              <span className={styles.duration}>{formatDuration(leg.durationMinutes)}</span>
              <span className={styles.line}>
                <Icon name="plane" size={20} className={styles.plane} />
              </span>
              <span className={styles.stops}>{leg.stops ? `${leg.stops} stop · ${leg.via}` : 'Nonstop'}</span>
            </div>
            <div className={styles.endpointEnd}>
              <span className={styles.code}>{leg.to}</span>
              <span className={styles.time}>{leg.arrivalTime}</span>
              <span className={styles.place}>{toLabel}</span>
            </div>
          </div>
          <ul className={styles.chips}>
            {chips.map((chip) => (
              <li key={chip} className={styles.chip}>
                {chip}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

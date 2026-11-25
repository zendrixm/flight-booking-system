import { formatDuration } from '@/lib/format';

import styles from './LegTimeline.module.css';

interface LegTimelineProps {
  departureTime: string;
  departureAirport: string;
  arrivalTime: string;
  arrivalAirport: string;
  durationMinutes: number;
  stops: number;
  via?: string;
  arrivesNextDay?: boolean;
}

/** "08:40 MNL ── 4h 15m · Nonstop ── 13:55 HND" */
export function LegTimeline({
  departureTime,
  departureAirport,
  arrivalTime,
  arrivalAirport,
  durationMinutes,
  stops,
  via,
  arrivesNextDay,
}: LegTimelineProps) {
  const stopLabel = stops === 0 ? 'Nonstop' : `${stops} stop${stops > 1 ? 's' : ''}${via ? ` · ${via}` : ''}`;

  return (
    <div className={styles.timeline}>
      <div className={styles.endpoint}>
        <span className={styles.time}>{departureTime}</span>
        <span className={styles.airport}>{departureAirport}</span>
      </div>
      <div className={styles.route}>
        <span className={styles.duration}>{formatDuration(durationMinutes)}</span>
        <span className={styles.line}>{stops > 0 && <span className={styles.stopDot} />}</span>
        <span className={stops === 0 ? styles.nonstop : styles.stops}>{stopLabel}</span>
      </div>
      <div className={styles.endpointEnd}>
        <span className={styles.time}>
          {arrivalTime}
          {arrivesNextDay && (
            <sup className={styles.nextDay} aria-label="next day">
              +1
            </sup>
          )}
        </span>
        <span className={styles.airport}>{arrivalAirport}</span>
      </div>
    </div>
  );
}

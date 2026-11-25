import { useId } from 'react';
import { Link } from 'react-router';

import { paths } from '@/app/paths';
import { Button, Drawer, StatusChip } from '@/components/ui';
import { formatCompactDay, type IsoDate } from '@/lib/date';
import type { FlightOpsRecord } from '@/types/console/flightOps';

import { isStatusLocked, loadLabel } from '../lib/flightOpsPresentation';
import styles from './FlightDetailsDrawer.module.css';

interface FlightDetailsDrawerProps {
  /** Null keeps the drawer closed. */
  record: FlightOpsRecord | null;
  date: IsoDate;
  onClose: () => void;
  /** Closes the drawer and points at the status form. */
  onUpdateStatus: () => void;
}

/** Who is on the flight, which connections are at risk and what has happened so far. */
export function FlightDetailsDrawer({ record, date, onClose, onUpdateStatus }: FlightDetailsDrawerProps) {
  const headingId = useId();
  if (!record) return null;

  const { flight, airlineName, manifest, connections, timeline } = record;
  return (
    <Drawer
      open
      onClose={onClose}
      title={flight.flightNumber}
      description={`${airlineName} · ${flight.route} · ${formatCompactDay(date)}`}
      headerExtra={
        <StatusChip tone={flight.status.tone} hideDot size="compact" className={styles.status}>
          {flight.status.label}
        </StatusChip>
      }
      footer={
        <>
          <Button variant="quiet" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" disabled={isStatusLocked(flight)} onClick={onUpdateStatus}>
            Update status
          </Button>
        </>
      }
    >
      <section className={styles.section} aria-label="Flight facts">
        <dl className={styles.facts}>
          <div>
            <dt>Scheduled</dt>
            <dd>{flight.scheduledTime}</dd>
          </div>
          <div>
            <dt>Estimated</dt>
            <dd>{flight.estimatedTime}</dd>
          </div>
          <div>
            <dt>Gate</dt>
            <dd>{flight.gate}</dd>
          </div>
          <div>
            <dt>Load</dt>
            <dd>{loadLabel(flight)}</dd>
          </div>
        </dl>
        <span className={styles.aircraft}>{flight.aircraft}</span>
      </section>

      <section className={styles.section} aria-labelledby={`${headingId}-travelers`}>
        <div className={styles.sectionHeader}>
          <h3 id={`${headingId}-travelers`} className={styles.caption}>
            Vela travelers
          </h3>
          <span className={styles.sectionNote}>
            {flight.velaTravelers} on this flight · showing {manifest.length}
          </span>
        </div>
        <ul className={styles.manifest}>
          {manifest.map((entry) => (
            <li key={entry.bookingReference} className={styles.traveler}>
              <span className={styles.travelerText}>
                <span className={styles.travelerName}>{entry.travelerName}</span>
                <span className={styles.travelerSummary}>{entry.summary}</span>
              </span>
              {entry.hasBookingRecord ? (
                <Link to={paths.console.booking(entry.bookingReference)} className={styles.reference}>
                  {entry.bookingReference}
                </Link>
              ) : (
                <span className={styles.referenceText}>{entry.bookingReference}</span>
              )}
            </li>
          ))}
        </ul>
      </section>

      {connections.length > 0 && (
        <section className={styles.section} aria-labelledby={`${headingId}-connections`}>
          <h3 id={`${headingId}-connections`} className={styles.caption}>
            Connections at risk
          </h3>
          <ul className={styles.connections}>
            {connections.map((connection) => (
              <li key={connection.traveler} className={styles.connection}>
                <span aria-hidden="true" className={styles.connectionDot} />
                <span className={styles.travelerText}>
                  <strong>{connection.traveler}</strong>
                  <span className={styles.travelerSummary}>{connection.onwardFlight}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className={styles.section} aria-labelledby={`${headingId}-timeline`}>
        <h3 id={`${headingId}-timeline`} className={styles.caption}>
          Timeline
        </h3>
        <ol className={styles.timeline}>
          {timeline.map((entry, index) => (
            <li key={`${entry.time}-${entry.title}-${index}`} className={styles.event}>
              <span className={styles.eventTime}>{entry.time}</span>
              <span className={styles.travelerText}>
                <strong>{entry.title}</strong>
                <span className={styles.travelerSummary}>{entry.detail}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>
    </Drawer>
  );
}

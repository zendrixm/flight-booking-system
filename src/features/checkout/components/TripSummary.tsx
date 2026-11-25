import { Link } from 'react-router';

import { AIRLINES } from '@/data/airports';
import { formatDayLabel } from '@/lib/date';
import { formatDuration, formatPeso, travelerCountLabel } from '@/lib/format';
import { getFareFamily } from '@/services/flightsService';
import type { CheckoutSelection } from '@/types/checkout';
import type { FlightLeg, FlightOption } from '@/types/flight';

import { resultsUrlFor } from '../lib/checkoutSteps';
import type { TripPrice } from '../lib/pricing';
import { HoldTimer } from './HoldTimer';
import styles from './TripSummary.module.css';

interface TripSummaryProps {
  selection: CheckoutSelection;
  option: FlightOption;
  price: TripPrice;
  holdExpiresAt: number | null;
}

/** Sticky "Your trip" card beside every checkout step: flights, fare, running price and the fare hold. */
export function TripSummary({ selection, option, price, holdExpiresAt }: TripSummaryProps) {
  const airline = AIRLINES[option.airlineId];
  const fare = getFareFamily(selection.fareFamily);
  const legs: Array<{ kind: string; leg: FlightLeg }> = [
    { kind: 'Depart', leg: option.outbound },
    ...(selection.search.returnDate ? [{ kind: 'Return', leg: option.inbound }] : []),
  ];

  return (
    <aside className={styles.summary} aria-labelledby="trip-summary-title">
      <div className={styles.header}>
        <h2 id="trip-summary-title" className={styles.title}>
          Your trip
        </h2>
        <Link to={resultsUrlFor(selection.search)} className={styles.change}>
          Change flights
        </Link>
      </div>

      {holdExpiresAt && <HoldTimer expiresAt={holdExpiresAt} />}

      <div className={styles.legs}>
        {legs.map(({ kind, leg }) => (
          <div key={leg.flightNumber} className={styles.leg}>
            <span className={styles.legKind}>
              {kind} · {formatDayLabel(leg.date)}
            </span>
            <div className={styles.legTimes}>
              <span>
                {leg.departureTime} {leg.from}
              </span>
              <span className={styles.legLine} aria-hidden="true" />
              <span>
                {leg.arrivalTime} {leg.to}
              </span>
            </div>
            <span className={styles.legMeta}>
              {airline.name} {leg.flightNumber} · {leg.stops ? `${leg.stops} stop · ${leg.via}` : 'Nonstop'} ·{' '}
              {formatDuration(leg.durationMinutes)}
            </span>
          </div>
        ))}
      </div>

      {fare && (
        <div className={styles.fare}>
          <div className={styles.fareHeader}>
            <span className={styles.fareName}>
              {fare.name} fare · {selection.search.cabin}
            </span>
            <span className={styles.travelers}>{travelerCountLabel(selection.search)}</span>
          </div>
          <span className={styles.fareSummary}>{fare.summary}</span>
        </div>
      )}

      <dl className={styles.lines}>
        {price.lines.map((line) => (
          <div key={line.id} className={line.amount < 0 ? styles.discount : styles.line}>
            <dt>{line.label}</dt>
            <dd>{formatPeso(line.amount)}</dd>
          </div>
        ))}
      </dl>

      <div className={styles.total}>
        <div className={styles.totalLabel}>
          <span className={styles.totalTitle}>Total</span>
          <span className={styles.totalNote}>Taxes and fees included</span>
        </div>
        <span className={styles.totalAmount} aria-live="polite">
          {formatPeso(price.total)}
        </span>
      </div>
    </aside>
  );
}

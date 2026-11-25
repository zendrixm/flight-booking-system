import clsx from 'clsx';
import { Fragment } from 'react';

import { SEAT_COLUMNS, type Seat, type SeatRow } from '@/data/seatMap';
import { formatPeso } from '@/lib/format';

import styles from './SeatMap.module.css';

interface SeatOccupant {
  name: string;
  initials: string;
}

interface SeatMapProps {
  label: string;
  /** "MR 431 · MNL → HND · Airbus A321neo" */
  aircraftLabel: string;
  rows: readonly SeatRow[];
  /** Who sits where on this flight, keyed by seat code. */
  occupants: ReadonlyMap<string, SeatOccupant>;
  onSelectSeat: (seat: Seat) => void;
}

function seatLabel(seat: Seat, occupant: SeatOccupant | undefined): string {
  const status = seat.isOccupied ? 'occupied' : seat.price ? formatPeso(seat.price) : 'included';
  return `Seat ${seat.code}, ${seat.position}, ${status}${occupant ? `, selected for ${occupant.name}` : ''}`;
}

/** The cabin drawn nose-up. Seats are toggle buttons; taken seats are disabled. */
export function SeatMap({ label, aircraftLabel, rows, occupants, onSelectSeat }: SeatMapProps) {
  return (
    <section className={styles.cabin} aria-label={label}>
      <span className={styles.aircraft}>{aircraftLabel}</span>
      <span className={styles.direction}>Front of aircraft</span>
      <div className={styles.grid} aria-hidden="true">
        {SEAT_COLUMNS.map((column, index) => (
          <Fragment key={column}>
            {index === 3 && <span />}
            <span className={styles.columnLabel}>{column}</span>
          </Fragment>
        ))}
      </div>

      {rows.map((row, rowIndex) => {
        const previous = rows[rowIndex - 1];
        const startsExitRows = row.isExitRow && !previous?.isExitRow;
        const startsStandard =
          previous && previous.seats[0].zone !== 'standard' && row.seats[0].zone === 'standard';
        return (
          <Fragment key={row.number}>
            {startsExitRows && (
              <div className={styles.exitMarker} aria-hidden="true">
                <span>‹ EXIT</span>
                <span>Extra legroom</span>
                <span>EXIT ›</span>
              </div>
            )}
            {startsStandard && <div className={styles.zoneBreak} aria-hidden="true" />}
            <div className={styles.grid}>
              {row.seats.map((seat, index) => {
                const occupant = occupants.get(seat.code);
                return (
                  <Fragment key={seat.code}>
                    {index === 3 && (
                      <span className={styles.rowNumber} aria-hidden="true">
                        {row.number}
                      </span>
                    )}
                    <button
                      type="button"
                      className={clsx(styles.seat, styles[seat.zone], occupant && styles.selected)}
                      aria-label={seatLabel(seat, occupant)}
                      aria-pressed={Boolean(occupant)}
                      disabled={seat.isOccupied}
                      onClick={() => onSelectSeat(seat)}
                    >
                      {occupant?.initials}
                    </button>
                  </Fragment>
                );
              })}
            </div>
          </Fragment>
        );
      })}
      <span className={styles.rear}>Rear of aircraft</span>
    </section>
  );
}

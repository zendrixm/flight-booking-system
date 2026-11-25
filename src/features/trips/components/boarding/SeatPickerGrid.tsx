import clsx from 'clsx';
import { Fragment } from 'react';

import { positionOfColumn, SEAT_COLUMNS } from '@/data/seatMap';

import styles from './SeatPickerGrid.module.css';

interface SeatPickerGridProps {
  rows: readonly number[];
  freeSeats: readonly string[];
  value: string;
  onChange: (seat: string) => void;
  /** Legend text for the selected swatch. */
  selectedLabel?: string;
}

/** A compact cabin section for picking one free standard seat at check-in. */
export function SeatPickerGrid({
  rows,
  freeSeats,
  value,
  onChange,
  selectedLabel = 'Your seat',
}: SeatPickerGridProps) {
  return (
    <div className={styles.picker}>
      <div className={styles.row} aria-hidden="true">
        {SEAT_COLUMNS.map((column, index) => (
          <Fragment key={column}>
            {index === 3 && <span />}
            <span className={styles.columnLabel}>{column}</span>
          </Fragment>
        ))}
      </div>
      {rows.map((row) => (
        <div key={row} role="group" aria-label={`Row ${row}`} className={styles.row}>
          {SEAT_COLUMNS.map((column, index) => {
            const code = `${row}${column}`;
            const isFree = freeSeats.includes(code);
            const isSelected = code === value;
            return (
              <Fragment key={code}>
                {index === 3 && (
                  <span className={styles.rowNumber} aria-hidden="true">
                    {row}
                  </span>
                )}
                <button
                  type="button"
                  className={clsx(styles.seat, isSelected && styles.selected)}
                  aria-label={`${code}${isSelected ? ', selected' : isFree ? `, ${positionOfColumn(column).toLowerCase()}, free` : ', taken'}`}
                  aria-pressed={isSelected}
                  disabled={!isFree}
                  onClick={() => onChange(code)}
                >
                  {isFree ? code : ''}
                </button>
              </Fragment>
            );
          })}
        </div>
      ))}
      <div className={styles.legend} aria-hidden="true">
        <span className={styles.legendItem}>
          <span className={styles.swatchFree} />
          Free
        </span>
        <span className={styles.legendItem}>
          <span className={styles.swatchSelected} />
          {selectedLabel}
        </span>
        <span className={styles.legendItem}>
          <span className={styles.swatchTaken} />
          Taken
        </span>
      </div>
    </div>
  );
}

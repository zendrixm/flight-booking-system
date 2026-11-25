import { formatCompactDay, type IsoDate } from '@/lib/date';
import { formatPeso } from '@/lib/format';

import styles from './DateFareStrip.module.css';

interface DateFareStripProps {
  dateFares: ReadonlyArray<{ date: IsoDate; lowestFare: number }>;
  selectedDate: IsoDate;
  onSelectDate: (date: IsoDate) => void;
}

/** Lowest fare for nearby departure dates; picking one re-runs the search for that date. */
export function DateFareStrip({ dateFares, selectedDate, onSelectDate }: DateFareStripProps) {
  const lowest = Math.min(...dateFares.map((entry) => entry.lowestFare));

  return (
    <div role="group" aria-label="Departure date" className={styles.strip}>
      {dateFares.map(({ date, lowestFare }) => {
        const isSelected = date === selectedDate;
        const isLowest = lowestFare === lowest;
        return (
          <button
            key={date}
            type="button"
            aria-pressed={isSelected}
            className={styles.day}
            onClick={() => onSelectDate(date)}
          >
            <span className={styles.label}>{formatCompactDay(date)}</span>
            <span className={styles.price}>{formatPeso(lowestFare)}</span>
            <span className={isLowest ? styles.lowest : styles.note}>
              {isLowest ? 'Lowest' : isSelected ? 'Selected' : ''}
            </span>
          </button>
        );
      })}
    </div>
  );
}

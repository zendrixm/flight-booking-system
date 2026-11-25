import { useEffect, useRef } from 'react';

import { formatDayLabel, parseIsoDate, WEEKDAYS_SHORT, type IsoDate } from '@/lib/date';
import { formatPeso } from '@/lib/format';

import styles from './PhoneDateStrip.module.css';

interface PhoneDateStripProps {
  dateFares: ReadonlyArray<{ date: IsoDate; lowestFare: number }>;
  selectedDate: IsoDate;
  onSelect: (date: IsoDate) => void;
}

/** "Wed 11" */
function shortDay(date: IsoDate): string {
  const value = parseIsoDate(date);
  return `${WEEKDAYS_SHORT[value.getUTCDay()]} ${value.getUTCDate()}`;
}

/** Nearby departure dates with their lowest fare. Scrolls sideways; the chosen date stays in view. */
export function PhoneDateStrip({ dateFares, selectedDate, onSelect }: PhoneDateStripProps) {
  const selectedRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    selectedRef.current?.scrollIntoView({ block: 'nearest', inline: 'center' });
  }, [selectedDate]);

  return (
    <div className={styles.strip} role="group" aria-label="Departure date">
      {dateFares.map(({ date, lowestFare }) => {
        const isSelected = date === selectedDate;
        return (
          <button
            key={date}
            ref={isSelected ? selectedRef : undefined}
            type="button"
            aria-pressed={isSelected}
            aria-label={`${formatDayLabel(date)}, from ${formatPeso(lowestFare)}`}
            className={styles.date}
            onClick={() => onSelect(date)}
          >
            <span className={styles.day}>{shortDay(date)}</span>
            <span className={styles.fare}>{formatPeso(lowestFare)}</span>
          </button>
        );
      })}
    </div>
  );
}

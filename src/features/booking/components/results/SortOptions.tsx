import { useId } from 'react';

import { formatDuration, formatPeso } from '@/lib/format';
import type { FlightOption } from '@/types/flight';

import { lowestFareOf, topOptionFor, totalDurationOf, type SortOrder } from '../../lib/resultsFilters';
import styles from './SortOptions.module.css';

const SORT_LABELS: Record<SortOrder, string> = { best: 'Best', cheapest: 'Cheapest', fastest: 'Fastest' };

interface SortOptionsProps {
  options: readonly FlightOption[];
  value: SortOrder;
  onChange: (order: SortOrder) => void;
}

/** Best / Cheapest / Fastest, each previewing the price and duration of its top flight. */
export function SortOptions({ options, value, onChange }: SortOptionsProps) {
  const name = useId();

  return (
    <fieldset className={styles.group}>
      <legend className="visually-hidden">Sort flights</legend>
      {(Object.keys(SORT_LABELS) as SortOrder[]).map((order) => {
        const top = topOptionFor(options, order);
        return (
          <label key={order} className={styles.option}>
            <input
              type="radio"
              name={name}
              className="visually-hidden"
              checked={value === order}
              onChange={() => onChange(order)}
            />
            <span className={styles.label}>{SORT_LABELS[order]}</span>
            {top && (
              <span className={styles.meta}>
                {formatPeso(lowestFareOf(top))} · {formatDuration(totalDurationOf(top))}
              </span>
            )}
          </label>
        );
      })}
    </fieldset>
  );
}

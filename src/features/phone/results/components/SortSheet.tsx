import { useId } from 'react';

import { Sheet } from '@/components/ui';
import { SORT_ORDERS, type SortOrder } from '@/features/booking/lib/resultsFilters';

import { SORT_LABELS } from '../lib/phoneResults';
import styles from './SortSheet.module.css';

interface SortSheetProps {
  value: SortOrder;
  /** One line under each order, e.g. "From ₱12,940". */
  descriptions: Record<SortOrder, string>;
  onChange: (order: SortOrder) => void;
  onClose: () => void;
}

/** Best, Cheapest or Fastest. Choosing one closes the sheet. */
export function SortSheet({ value, descriptions, onChange, onClose }: SortSheetProps) {
  const name = useId();
  return (
    <Sheet open onClose={onClose} title="Sort by">
      <fieldset className={styles.options}>
        <legend className="visually-hidden">Sort by</legend>
        {SORT_ORDERS.map((order) => (
          <label key={order} className={styles.option}>
            <span className={styles.text}>
              <span className={styles.label}>{SORT_LABELS[order]}</span>
              <span className={styles.description}>{descriptions[order]}</span>
            </span>
            <input
              type="radio"
              name={name}
              value={order}
              checked={value === order}
              className={styles.radio}
              onChange={() => onChange(order)}
            />
          </label>
        ))}
      </fieldset>
    </Sheet>
  );
}

import { useId, useState } from 'react';

import { Icon } from '@/components/icons';
import { Popover } from '@/components/ui';
import { findAirport, PHILIPPINE_ORIGINS } from '@/data/airports';
import { formatPeso } from '@/lib/format';
import { getOriginDeals } from '@/services/flightsService';

import styles from './OriginPicker.module.css';

interface OriginPickerProps {
  value: string;
  onChange: (originCode: string) => void;
}

/** "Change origin" button with a popover listing Philippine airports and their Tokyo fare. */
export function OriginPicker({ value, onChange }: OriginPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const headingId = useId();

  return (
    <Popover
      open={isOpen}
      onOpenChange={setIsOpen}
      align="end"
      width={380}
      label="Show deals from"
      panelClassName={styles.panel}
      trigger={(triggerProps) => (
        <button type="button" className={styles.trigger} {...triggerProps}>
          <Icon name="mapPin" size={16} />
          Change origin
          <Icon name="chevronDown" size={16} strokeWidth={1.8} />
        </button>
      )}
    >
      <div className={styles.header}>
        <span id={headingId} className={styles.title}>
          Show deals from
        </span>
        <span className={styles.subtitle}>Airports in the Philippines</span>
      </div>
      <div role="radiogroup" aria-labelledby={headingId} className={styles.options}>
        {PHILIPPINE_ORIGINS.map((code) => {
          const airport = findAirport(code);
          if (!airport) return null;
          const isSelected = code === value;
          const tokyoFare = getOriginDeals(code)[0]?.price ?? 0;
          return (
            <button
              key={code}
              type="button"
              role="radio"
              aria-checked={isSelected}
              className={styles.option}
              onClick={() => {
                onChange(code);
                setIsOpen(false);
              }}
            >
              <span className={styles.code}>{code}</span>
              <span className={styles.place}>
                <span className={styles.city}>{airport.city}</span>
                <span className={styles.airportName}>{airport.name}</span>
              </span>
              <span className={styles.fare}>
                <span className={styles.fareLabel}>Tokyo from</span>
                <span className={styles.fareValue}>{formatPeso(tokyoFare)}</span>
              </span>
            </button>
          );
        })}
      </div>
    </Popover>
  );
}

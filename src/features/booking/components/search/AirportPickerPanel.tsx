import type { Airport } from '@/types/flight';

import styles from './AirportPickerPanel.module.css';

export interface AirportPickerItem {
  airport: Airport;
  /** Right-aligned note, e.g. "from ₱14,870". */
  note?: string;
}

interface AirportPickerPanelProps {
  id: string;
  title: string;
  subtitle: string;
  items: AirportPickerItem[];
  selectedCode: string | null;
  emptyMessage: string;
  onChoose: (code: string) => void;
}

/** List of airports under a From/To box: popular choices first, matches once the person types. */
export function AirportPickerPanel({
  id,
  title,
  subtitle,
  items,
  selectedCode,
  emptyMessage,
  onChoose,
}: AirportPickerPanelProps) {
  const headingId = `${id}-heading`;

  return (
    <div className={styles.panel}>
      <div className={styles.heading}>
        <span id={headingId} className={styles.title}>
          {title}
        </span>
        <span className={styles.subtitle}>{subtitle}</span>
      </div>
      {items.length > 0 ? (
        <ul id={id} role="listbox" aria-labelledby={headingId} className={styles.list}>
          {items.map(({ airport, note }) => (
            <li key={airport.code} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={airport.code === selectedCode}
                className={styles.option}
                onClick={() => onChoose(airport.code)}
              >
                <span className={styles.code}>{airport.code}</span>
                <span className={styles.place}>
                  <span className={styles.placeName}>
                    {airport.city === airport.country ? airport.city : `${airport.city}, ${airport.country}`}
                  </span>
                  <span className={styles.placeSub}>{airport.name}</span>
                </span>
                {note && <span className={styles.note}>{note}</span>}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>{emptyMessage}</p>
      )}
    </div>
  );
}

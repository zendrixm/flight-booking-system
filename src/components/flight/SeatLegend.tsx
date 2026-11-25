import clsx from 'clsx';

import { ZONE_PRICES } from '@/data/seatMap';
import { formatPeso } from '@/lib/format';

import styles from './SeatLegend.module.css';

const LEGEND = [
  { label: 'Standard', price: 'Included', swatch: styles.standard },
  { label: 'Front cabin · rows 10–13', price: formatPeso(ZONE_PRICES.front), swatch: styles.front },
  { label: 'Extra legroom · rows 14–15', price: formatPeso(ZONE_PRICES.legroom), swatch: styles.legroom },
  { label: 'Your selection', price: '', swatch: styles.selected },
  { label: 'Unavailable', price: '', swatch: styles.unavailable },
];

export function SeatLegend() {
  return (
    <div className={styles.legend}>
      <h2 className={styles.title}>Legend</h2>
      <ul className={styles.items}>
        {LEGEND.map(({ label, price, swatch }) => (
          <li key={label} className={styles.item}>
            <span aria-hidden="true" className={clsx(styles.swatch, swatch)} />
            <span className={styles.label}>{label}</span>
            <span className={styles.price}>{price}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

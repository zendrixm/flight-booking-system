import clsx from 'clsx';

import { AIRLINES } from '@/data/airports';
import type { AirlineId } from '@/types/flight';

import styles from './AirlineMark.module.css';

interface AirlineMarkProps {
  airlineId: AirlineId;
  /** `small` fits dense console tables. */
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

/** The airline's two-letter monogram tile. Decorative: the airline name is always shown beside it. */
export function AirlineMark({ airlineId, size = 'medium', className }: AirlineMarkProps) {
  const airline = AIRLINES[airlineId];
  return (
    <span
      aria-hidden="true"
      className={clsx(styles.mark, styles[size], airline.tileTone === 'dark' && styles.dark, className)}
    >
      {airline.monogram}
    </span>
  );
}

import clsx from 'clsx';

import { Icon, type IconName } from '@/components/icons';
import { Button } from '@/components/ui';
import { formatPeso } from '@/lib/format';
import type { FareFamily, FareInclusion } from '@/types/flight';

import styles from './FareFamilyCard.module.css';

const INCLUSION_ICON: Record<FareInclusion['kind'], IconName> = {
  included: 'check',
  fee: 'tag',
  excluded: 'close',
};

interface FareFamilyCardProps {
  fare: FareFamily;
  price: number;
  onChoose: () => void;
  /** Accessible context for the button, e.g. "Meridian Air MR 431". */
  flightLabel: string;
}

export function FareFamilyCard({ fare, price, onChoose, flightLabel }: FareFamilyCardProps) {
  return (
    <div className={clsx(styles.card, fare.isPopular && styles.popular)}>
      <div className={styles.header}>
        <div className={styles.heading}>
          <h4 className={styles.name}>{fare.name}</h4>
          <span className={styles.blurb}>{fare.blurb}</span>
        </div>
        {fare.isPopular && <span className={styles.popularTag}>Most chosen</span>}
      </div>
      <ul className={styles.inclusions}>
        {fare.inclusions.map((inclusion) => (
          <li key={inclusion.text} className={styles[inclusion.kind]}>
            <Icon
              name={INCLUSION_ICON[inclusion.kind]}
              size={16}
              strokeWidth={2}
              className={styles.inclusionIcon}
            />
            <span>
              {inclusion.kind === 'excluded' && <span className="visually-hidden">Not included: </span>}
              {inclusion.text}
            </span>
          </li>
        ))}
      </ul>
      <div className={styles.footer}>
        <div className={styles.price}>
          <span className={styles.amount}>{formatPeso(price)}</span>
          <span className={styles.per}>per traveler</span>
        </div>
        <Button
          variant={fare.isPopular ? 'primary' : 'secondary'}
          onClick={onChoose}
          aria-label={`Choose ${fare.name} on ${flightLabel}, ${formatPeso(price)} per traveler`}
        >
          Choose
        </Button>
      </div>
    </div>
  );
}

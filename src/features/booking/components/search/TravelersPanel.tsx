import clsx from 'clsx';
import { useId } from 'react';

import { Icon } from '@/components/icons';
import { Button, Stepper } from '@/components/ui';
import { MAX_TRAVELERS_PER_BOOKING } from '@/config/demo';
import { CABIN_CLASSES, type CabinClass } from '@/types/flight';

import { travelerLimits, type SearchFormState, type TravelerKind } from '../../lib/searchForm';
import fieldStyles from './SearchFields.module.css';
import styles from './TravelersPanel.module.css';

const TRAVELER_ROWS: ReadonlyArray<{
  kind: TravelerKind;
  label: string;
  singular: string;
  description: string;
}> = [
  { kind: 'adults', label: 'Adults', singular: 'adult', description: '12 years and over' },
  { kind: 'children', label: 'Children', singular: 'child', description: '2 to 11 years' },
  { kind: 'infants', label: 'Infants', singular: 'infant', description: 'Under 2, seated on lap' },
];

interface TravelersPanelProps {
  id: string;
  travelers: Pick<SearchFormState, TravelerKind | 'cabin'>;
  onChange: (kind: TravelerKind, delta: 1 | -1) => void;
  onCabinChange: (cabin: CabinClass) => void;
  onDone: () => void;
}

export function TravelersPanel({ id, travelers, onChange, onCabinChange, onDone }: TravelersPanelProps) {
  const cabinGroup = useId();

  return (
    <div
      id={id}
      role="dialog"
      aria-label="Travelers and cabin"
      className={clsx(fieldStyles.panel, styles.panel)}
    >
      {TRAVELER_ROWS.map((row) => {
        const limits = travelerLimits(travelers, row.kind);
        return (
          <div key={row.kind} className={styles.row}>
            <div className={styles.rowText}>
              <span className={styles.rowLabel}>{row.label}</span>
              <span className={styles.rowSub}>{row.description}</span>
            </div>
            <Stepper
              value={travelers[row.kind]}
              min={travelers[row.kind] - (limits.canDecrease ? 1 : 0)}
              max={travelers[row.kind] + (limits.canIncrease ? 1 : 0)}
              decrementLabel={`Remove one ${row.singular}`}
              incrementLabel={`Add one ${row.singular}`}
              onChange={(value) => onChange(row.kind, value > travelers[row.kind] ? 1 : -1)}
            />
          </div>
        );
      })}

      <span id={`${cabinGroup}-label`} className={styles.cabinLabel}>
        Cabin
      </span>
      <div role="radiogroup" aria-labelledby={`${cabinGroup}-label`} className={styles.cabins}>
        {CABIN_CLASSES.map((cabin) => (
          <label key={cabin} className={styles.cabin}>
            <input
              type="radio"
              name={cabinGroup}
              className={styles.cabinInput}
              checked={travelers.cabin === cabin}
              onChange={() => onCabinChange(cabin)}
            />
            <span className={styles.cabinOption}>
              {cabin}
              <Icon name="check" size={16} strokeWidth={2} className={styles.cabinCheck} />
            </span>
          </label>
        ))}
      </div>

      <div className={styles.footer}>
        <span>Up to {MAX_TRAVELERS_PER_BOOKING} travelers per booking</span>
        <Button onClick={onDone}>Done</Button>
      </div>
    </div>
  );
}

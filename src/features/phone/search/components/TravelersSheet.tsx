import { useId } from 'react';

import { Button, Sheet, Stepper, ToggleTile } from '@/components/ui';
import { MAX_TRAVELERS_PER_BOOKING } from '@/config/demo';
import {
  totalTravelers,
  travelerLimits,
  travelersLabel,
  type SearchFormState,
  type TravelerKind,
} from '@/features/booking/lib/searchForm';

import { PHONE_CABINS } from '../lib/searchSheets';
import { dispatchSearch } from '../state/phoneSearchStore';
import styles from './TravelersSheet.module.css';

const TRAVELER_ROWS: ReadonlyArray<{ kind: TravelerKind; label: string; description: string; noun: string }> =
  [
    { kind: 'adults', label: 'Adults', description: '12 years and over', noun: 'adults' },
    { kind: 'children', label: 'Children', description: '2 to 11 years', noun: 'children' },
    { kind: 'infants', label: 'Infants', description: 'Under 2, on an adult’s lap', noun: 'infants' },
  ];

/** Why a + button stopped working, if one did. */
function limitNote(search: SearchFormState): string | null {
  if (totalTravelers(search) >= MAX_TRAVELERS_PER_BOOKING) {
    return `You can book up to ${MAX_TRAVELERS_PER_BOOKING} travelers at once. For bigger groups, message us from Help.`;
  }
  if (search.infants > 0 && search.infants >= search.adults) {
    return 'Each infant travels on an adult’s lap, so you can add up to one infant per adult.';
  }
  return null;
}

interface TravelersSheetProps {
  search: SearchFormState;
  onClose: () => void;
}

export function TravelersSheet({ search, onClose }: TravelersSheetProps) {
  const cabinName = useId();
  const note = limitNote(search);

  return (
    <Sheet
      open
      onClose={onClose}
      title="Travelers and cabin"
      footer={
        <Button size="large" fullWidth onClick={onClose}>
          Done · {travelersLabel(search)}
        </Button>
      }
    >
      <div className={styles.rows}>
        {TRAVELER_ROWS.map((row) => {
          const value = search[row.kind];
          const limits = travelerLimits(search, row.kind);
          return (
            <div key={row.kind} className={styles.row}>
              <span className={styles.rowText}>
                <span className={styles.rowLabel}>{row.label}</span>
                <span className={styles.rowDescription}>{row.description}</span>
              </span>
              <Stepper
                value={value}
                min={limits.canDecrease ? value - 1 : value}
                max={limits.canIncrease ? value + 1 : value}
                decrementLabel={`Fewer ${row.noun}`}
                incrementLabel={`More ${row.noun}`}
                onChange={(next) =>
                  dispatchSearch({ type: 'changeTravelers', kind: row.kind, delta: next > value ? 1 : -1 })
                }
              />
            </div>
          );
        })}
      </div>
      {note && (
        <p role="status" className={styles.note}>
          {note}
        </p>
      )}

      <fieldset className={styles.cabins}>
        <legend className={styles.cabinsLegend}>Cabin</legend>
        <div className={styles.cabinOptions}>
          {PHONE_CABINS.map((cabin) => (
            <ToggleTile
              key={cabin}
              name={cabinName}
              value={cabin}
              label={cabin}
              checked={search.cabin === cabin}
              onChange={() => dispatchSearch({ type: 'setCabin', cabin })}
            />
          ))}
        </div>
      </fieldset>
    </Sheet>
  );
}

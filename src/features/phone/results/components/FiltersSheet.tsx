import clsx from 'clsx';
import { useId } from 'react';

import { Button, Checkbox, Sheet, ToggleTile } from '@/components/ui';
import { AIRLINES } from '@/data/airports';
import {
  DEFAULT_FILTERS,
  lowestPriceWhere,
  toggleValue,
  type ResultsFilters,
} from '@/features/booking/lib/resultsFilters';
import { formatPeso, pluralize } from '@/lib/format';
import type { AirlineId, FlightOption } from '@/types/flight';

import {
  activeFilterCount,
  isNonstopOnly,
  PHONE_DEPARTURE_WINDOWS,
  withNonstopOnly,
} from '../lib/phoneResults';
import styles from './FiltersSheet.module.css';

interface FiltersSheetProps {
  options: readonly FlightOption[];
  filters: ResultsFilters;
  /** How many flights the current filters leave, for the "Show" button. */
  matchCount: number;
  originCity: string;
  onChange: (filters: ResultsFilters) => void;
  onClose: () => void;
}

/** Stops, departure time and airlines. Results update as you go; the button closes the sheet. */
export function FiltersSheet({
  options,
  filters,
  matchCount,
  originCity,
  onChange,
  onClose,
}: FiltersSheetProps) {
  const stopsName = useId();
  const airlineIds = [...new Set(options.map((option) => option.airlineId))];
  const nonstopOnly = isNonstopOnly(filters);

  return (
    <Sheet
      open
      onClose={onClose}
      height="tall"
      title="Filters"
      headerAction={
        <Button
          variant="ghost"
          size="small"
          disabled={activeFilterCount(filters) === 0}
          onClick={() => onChange(DEFAULT_FILTERS)}
        >
          Reset
        </Button>
      }
      footer={
        <Button size="large" fullWidth onClick={onClose}>
          {matchCount ? `Show ${pluralize(matchCount, 'flight')}` : 'No flights — adjust filters'}
        </Button>
      }
    >
      <fieldset className={styles.group}>
        <legend className={styles.groupTitle}>Stops</legend>
        <div className={styles.pills}>
          {[
            { value: false, label: 'Any' },
            { value: true, label: 'Nonstop only' },
          ].map((choice) => (
            <ToggleTile
              key={choice.label}
              name={stopsName}
              label={choice.label}
              checked={nonstopOnly === choice.value}
              onChange={() => onChange(withNonstopOnly(filters, choice.value))}
            />
          ))}
        </div>
      </fieldset>

      <fieldset className={styles.group}>
        <legend className={styles.groupTitle}>Departure from {originCity}</legend>
        <div className={clsx(styles.pills, styles.threeUp)}>
          {PHONE_DEPARTURE_WINDOWS.map((window) => (
            <ToggleTile
              key={window.value}
              type="checkbox"
              label={window.label}
              detail={window.hours}
              checked={filters.departureWindows.includes(window.value)}
              onChange={() =>
                onChange({
                  ...filters,
                  departureWindows: toggleValue(filters.departureWindows, window.value),
                })
              }
            />
          ))}
        </div>
      </fieldset>

      <fieldset className={styles.group}>
        <legend className={styles.groupTitle}>Airlines</legend>
        <div className={styles.airlines}>
          {airlineIds.map((airlineId: AirlineId) => {
            const lowest = lowestPriceWhere(options, (option) => option.airlineId === airlineId);
            return (
              <Checkbox
                key={airlineId}
                label={AIRLINES[airlineId].name}
                meta={lowest === null ? undefined : `from ${formatPeso(lowest)}`}
                checked={filters.airlines.includes(airlineId)}
                onChange={() => onChange({ ...filters, airlines: toggleValue(filters.airlines, airlineId) })}
              />
            );
          })}
        </div>
      </fieldset>
    </Sheet>
  );
}

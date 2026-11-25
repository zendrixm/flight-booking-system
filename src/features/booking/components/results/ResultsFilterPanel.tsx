import clsx from 'clsx';
import { useRef } from 'react';

import { Icon, type IconName } from '@/components/icons';
import { Button, Checkbox, IconButton, Switch } from '@/components/ui';
import { AIRLINES } from '@/data/airports';
import { useBodyScrollLock, useEscapeKey, useFocusTrap, useMediaQuery } from '@/hooks';
import { formatPeso, pluralize } from '@/lib/format';
import type { AirlineId, DepartureWindow, FlightOption } from '@/types/flight';

import {
  DEFAULT_FILTERS,
  hasActiveFilters,
  lowestPriceWhere,
  PRICE_STEP,
  priceBoundsOf,
  toggleValue,
  type ResultsFilters,
} from '../../lib/resultsFilters';
import styles from './ResultsFilterPanel.module.css';

const PHONE_QUERY = '(max-width: 760px)';

const STOP_OPTIONS: ReadonlyArray<{ value: 0 | 1 | 2; label: string }> = [
  { value: 0, label: 'Nonstop' },
  { value: 1, label: '1 stop' },
  { value: 2, label: '2+ stops' },
];

const DEPARTURE_WINDOWS: ReadonlyArray<{
  value: DepartureWindow;
  label: string;
  range: string;
  icon: IconName;
}> = [
  { value: 'early', label: 'Early', range: '00–06', icon: 'moon' },
  { value: 'morning', label: 'Morning', range: '06–12', icon: 'sunrise' },
  { value: 'afternoon', label: 'Afternoon', range: '12–18', icon: 'sun' },
  { value: 'evening', label: 'Evening', range: '18–24', icon: 'sunset' },
];

const AIRLINE_ORDER: readonly AirlineId[] = ['meridian', 'crest', 'solenne', 'halcyon', 'kestrel'];

interface ResultsFilterPanelProps {
  id: string;
  options: readonly FlightOption[];
  filters: ResultsFilters;
  onChange: (filters: ResultsFilters) => void;
  originCity: string;
  matchCount: number;
  /** Phones show the panel as a full-screen sheet. */
  isSheetOpen: boolean;
  onCloseSheet: () => void;
}

/** Stops, price, departure time, airline and bag filters. A sidebar on desktop, a sheet on phones. */
export function ResultsFilterPanel({
  id,
  options,
  filters,
  onChange,
  originCity,
  matchCount,
  isSheetOpen,
  onCloseSheet,
}: ResultsFilterPanelProps) {
  const panelRef = useRef<HTMLElement>(null);
  const isPhone = useMediaQuery(PHONE_QUERY);
  const isSheet = isPhone && isSheetOpen;

  useBodyScrollLock(isSheet);
  useFocusTrap(panelRef, isSheet);
  useEscapeKey(onCloseSheet, isSheet);

  const { floor, cap } = priceBoundsOf(options);
  const maxPrice = filters.maxPrice ?? cap;
  const update = (patch: Partial<ResultsFilters>) => onChange({ ...filters, ...patch });
  const priceLabel = (price: number | null) => (price === null ? 'No flights' : formatPeso(price));

  return (
    <aside
      ref={panelRef}
      id={id}
      aria-label="Filters"
      className={clsx(styles.panel, isSheetOpen && styles.sheetOpen)}
      role={isSheet ? 'dialog' : undefined}
      aria-modal={isSheet || undefined}
    >
      <div className={styles.header}>
        <h2 className={styles.title}>Filters</h2>
        <div className={styles.headerActions}>
          <Button
            variant="ghost"
            size="small"
            className={styles.reset}
            disabled={!hasActiveFilters(filters)}
            onClick={() => onChange(DEFAULT_FILTERS)}
          >
            Reset all
          </Button>
          <IconButton
            icon="close"
            label="Close filters"
            variant="soft"
            className={styles.sheetOnly}
            onClick={onCloseSheet}
          />
        </div>
      </div>

      <fieldset className={styles.section}>
        <legend className={styles.sectionTitle}>Stops</legend>
        {STOP_OPTIONS.map(({ value, label }) => {
          const lowest = lowestPriceWhere(options, (option) => Math.min(option.outbound.stops, 2) === value);
          const isAvailable = lowest !== null;
          return (
            <Checkbox
              key={value}
              label={label}
              meta={isAvailable ? priceLabel(lowest) : 'None found'}
              disabled={!isAvailable}
              checked={isAvailable && filters.stops.includes(value)}
              onChange={() => update({ stops: toggleValue(filters.stops, value) })}
            />
          );
        })}
      </fieldset>

      <div className={styles.section}>
        <div className={styles.priceHeader}>
          <label htmlFor={`${id}-price`} className={styles.sectionTitle}>
            Max price
          </label>
          <span className={styles.priceValue}>
            {maxPrice >= cap ? 'Any price' : `Up to ${formatPeso(maxPrice)}`}
          </span>
        </div>
        <input
          id={`${id}-price`}
          type="range"
          className={styles.range}
          min={floor}
          max={cap}
          step={PRICE_STEP}
          value={maxPrice}
          aria-valuetext={maxPrice >= cap ? 'Any price' : `Up to ${formatPeso(maxPrice)} per traveler`}
          onChange={(event) => {
            const value = Number(event.target.value);
            update({ maxPrice: value >= cap ? null : value });
          }}
        />
        <div className={styles.rangeLabels} aria-hidden="true">
          <span>{formatPeso(floor)}</span>
          <span>{formatPeso(cap)}</span>
        </div>
      </div>

      <fieldset className={styles.section}>
        <legend className={styles.sectionTitle}>Departure from {originCity}</legend>
        <div className={styles.windowGrid}>
          {DEPARTURE_WINDOWS.map(({ value, label, range, icon }) => {
            const isAvailable = options.some((option) => option.departureWindow === value);
            return (
              <label
                key={value}
                className={styles.windowTile}
                title={isAvailable ? undefined : 'No departures in this window'}
              >
                <input
                  type="checkbox"
                  className="visually-hidden"
                  disabled={!isAvailable}
                  checked={filters.departureWindows.includes(value)}
                  onChange={() => update({ departureWindows: toggleValue(filters.departureWindows, value) })}
                />
                <Icon name={icon} size={18} />
                <span className={styles.windowLabel}>{label}</span>
                <span className={styles.windowRange}>{range}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset className={styles.section}>
        <legend className={styles.sectionTitle}>Airlines</legend>
        {AIRLINE_ORDER.map((airlineId) => (
          <Checkbox
            key={airlineId}
            label={AIRLINES[airlineId].name}
            meta={priceLabel(lowestPriceWhere(options, (option) => option.airlineId === airlineId))}
            checked={filters.airlines.includes(airlineId)}
            onChange={() => update({ airlines: toggleValue(filters.airlines, airlineId) })}
          />
        ))}
      </fieldset>

      <div className={styles.section}>
        <Switch
          placement="end"
          label="Checked bag included"
          description="Show fares with 23 kg included"
          checked={filters.checkedBagOnly}
          onChange={(checkedBagOnly) => update({ checkedBagOnly })}
        />
      </div>

      <div className={styles.sheetBar}>
        <Button variant="primary" size="large" fullWidth onClick={onCloseSheet}>
          {matchCount ? `Show ${pluralize(matchCount, 'flight')}` : 'No flights match'}
        </Button>
      </div>
    </aside>
  );
}

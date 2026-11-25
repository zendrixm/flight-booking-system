import { Button, IconButton, SegmentedControl } from '@/components/ui';
import {
  getSearchErrors,
  travelerLimits,
  travelersLabel,
  type SearchFormState,
} from '@/features/booking/lib/searchForm';
import { formatDayLabel } from '@/lib/date';

import { TRIP_TYPE_OPTIONS, type SearchSheet } from '../lib/searchSheets';
import { dispatchSearch } from '../state/phoneSearchStore';
import { MultiCityLegs } from './MultiCityLegs';
import { PickerButton } from './PickerButton';
import styles from './SearchCard.module.css';

interface SearchCardProps {
  search: SearchFormState;
  onOpenSheet: (sheet: SearchSheet) => void;
  onSearch: () => void;
}

/** The phone search form: trip type, airports, dates, travelers and the search button. */
export function SearchCard({ search, onOpenSheet, onSearch }: SearchCardProps) {
  const isOneWay = search.tripType === 'oneway';
  const errors = search.hasTriedSearch ? getSearchErrors(search) : [];
  const adultLimits = travelerLimits(search, 'adults');

  return (
    <form
      noValidate
      aria-label="Search flights"
      className={styles.card}
      onSubmit={(event) => {
        event.preventDefault();
        onSearch();
      }}
    >
      <SegmentedControl
        label="Trip type"
        appearance="soft"
        fullWidth
        options={TRIP_TYPE_OPTIONS}
        value={search.tripType}
        onChange={(tripType) => dispatchSearch({ type: 'setTripType', tripType })}
      />

      {search.tripType === 'multi' ? (
        <MultiCityLegs search={search} />
      ) : (
        <>
          <div className={styles.route}>
            <PickerButton
              label="From"
              size="large"
              className={styles.place}
              onClick={() => onOpenSheet('from')}
            >
              <PlaceValue city={search.from.query} code={search.from.code} />
            </PickerButton>
            <span className={styles.routeDivider} aria-hidden="true" />
            <PickerButton label="To" size="large" className={styles.place} onClick={() => onOpenSheet('to')}>
              <PlaceValue city={search.to.query} code={search.to.code} />
            </PickerButton>
            <IconButton
              icon="arrowsSwap"
              label="Swap origin and destination"
              variant="outline"
              className={styles.swap}
              onClick={() => dispatchSearch({ type: 'swapPlaces' })}
            />
          </div>
          <div className={styles.dates}>
            <PickerButton label="Depart" onClick={() => onOpenSheet('depart')}>
              {formatDayLabel(search.departDate)}
            </PickerButton>
            <PickerButton label="Return" isMuted={isOneWay} onClick={() => onOpenSheet('return')}>
              {isOneWay ? 'One way' : search.returnDate ? formatDayLabel(search.returnDate) : 'Add return'}
            </PickerButton>
          </div>
        </>
      )}

      <div className={styles.travelers}>
        <PickerButton
          label="Travelers"
          className={styles.travelersPicker}
          onClick={() => onOpenSheet('travelers')}
        >
          {travelersLabel(search)}
        </PickerButton>
        <span className={styles.quickAdults}>
          <IconButton
            icon="minus"
            label="Remove an adult"
            variant="outline"
            disabled={!adultLimits.canDecrease}
            onClick={() => dispatchSearch({ type: 'changeTravelers', kind: 'adults', delta: -1 })}
          />
          <IconButton
            icon="plus"
            label="Add an adult"
            variant="outline"
            disabled={!adultLimits.canIncrease}
            onClick={() => dispatchSearch({ type: 'changeTravelers', kind: 'adults', delta: 1 })}
          />
        </span>
      </div>

      {errors.length > 0 && (
        <ul role="alert" className={styles.errors}>
          {errors.map((error) => (
            <li key={`${error.field}-${error.message}`}>{error.message}</li>
          ))}
        </ul>
      )}

      <Button type="submit" size="large" fullWidth iconStart="search" className={styles.submit}>
        Search flights
      </Button>
    </form>
  );
}

function PlaceValue({ city, code }: { city: string; code: string | null }) {
  return (
    <>
      {city || 'Choose an airport'} {code && <span className={styles.code}>{code}</span>}
    </>
  );
}

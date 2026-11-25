import { Icon } from '@/components/icons';
import { IconButton } from '@/components/ui';
import { MAX_EXTRA_LEGS, type PlaceInput, type SearchFormState } from '@/features/booking/lib/searchForm';
import { formatDayLabel } from '@/lib/date';

import { dispatchSearch } from '../state/phoneSearchStore';
import styles from './MultiCityLegs.module.css';

/** The first two flights are the minimum for a multi-city trip, so only later ones can be removed. */
const REQUIRED_FLIGHTS = 2;

function placeLabel(place: PlaceInput): string {
  return place.code ? `${place.query} ${place.code}` : place.query;
}

/** Multi-city flights as a numbered list, with "Add another flight" up to four. */
export function MultiCityLegs({ search }: { search: SearchFormState }) {
  const legs = [{ from: search.from, to: search.to, date: search.departDate }, ...search.extraLegs];
  const isFull = search.extraLegs.length >= MAX_EXTRA_LEGS;

  return (
    <>
      <ol className={styles.legs} aria-label="Flights">
        {legs.map((leg, index) => (
          <li key={index} className={styles.leg}>
            <span className={styles.number} aria-hidden="true">
              {index + 1}
            </span>
            <span className={styles.text}>
              <span className={styles.route}>
                <span className="visually-hidden">Flight {index + 1}: </span>
                {placeLabel(leg.from)} → {placeLabel(leg.to)}
              </span>
              <span className={styles.date}>{formatDayLabel(leg.date)}</span>
            </span>
            {index >= REQUIRED_FLIGHTS && (
              <IconButton
                icon="close"
                label={`Remove flight ${index + 1}`}
                iconSize={16}
                onClick={() => dispatchSearch({ type: 'removeLeg', index: index - 1 })}
              />
            )}
          </li>
        ))}
      </ol>
      <button
        type="button"
        className={styles.addLeg}
        disabled={isFull}
        onClick={() => dispatchSearch({ type: 'addLeg' })}
      >
        <Icon name="plus" size={16} />
        {isFull ? 'Up to 4 flights' : 'Add another flight'}
      </button>
    </>
  );
}

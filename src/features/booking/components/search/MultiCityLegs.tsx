import clsx from 'clsx';
import { Fragment } from 'react';

import { Icon } from '@/components/icons';
import { findAirport } from '@/data/airports';
import { formatDayLabel, type IsoDate } from '@/lib/date';

import { MAX_EXTRA_LEGS, type MultiCityLeg, type PlaceInput } from '../../lib/searchForm';
import { DateCell, dateSubLabel } from './DateFields';
import styles from './MultiCityLegs.module.css';
import fieldStyles from './SearchFields.module.css';

interface MultiCityLegsProps {
  legs: MultiCityLeg[];
  flexibleDates: boolean;
  activeLegIndex: number | null;
  calendarId: string;
  onTypePlace: (index: number, field: 'from' | 'to', query: string) => void;
  onOpenDate: (index: number) => void;
  onRemove: (index: number) => void;
  onAdd: () => void;
}

function placeHint(place: PlaceInput) {
  const airport = place.code ? findAirport(place.code) : undefined;
  return airport ? `${airport.code} · ${airport.name}` : '— · Keep typing a city or airport code';
}

/** Flights 2–4 of a multi-city search. Each is priced one way. */
export function MultiCityLegs({
  legs,
  flexibleDates,
  activeLegIndex,
  calendarId,
  onTypePlace,
  onOpenDate,
  onRemove,
  onAdd,
}: MultiCityLegsProps) {
  const isFull = legs.length >= MAX_EXTRA_LEGS;
  const flightCount = legs.length + 1;

  return (
    <div className={styles.legs}>
      {legs.map((leg, index) => {
        const flightNumber = index + 2;
        const date: IsoDate = leg.date;
        return (
          <div key={index} role="group" aria-label={`Flight ${flightNumber}`} className={styles.leg}>
            <div className={clsx(fieldStyles.box, styles.places)}>
              {(['from', 'to'] as const).map((field, fieldIndex) => (
                <Fragment key={field}>
                  {fieldIndex === 1 && <span aria-hidden="true" className={fieldStyles.divider} />}
                  <label className={fieldStyles.cell}>
                    <span className={fieldStyles.eyebrow}>
                      {field === 'from' ? `Flight ${flightNumber} · From` : 'To'}
                    </span>
                    <input
                      className={fieldStyles.value}
                      value={leg[field].query}
                      aria-label={`Flight ${flightNumber} ${field}`}
                      onChange={(event) => onTypePlace(index, field, event.target.value)}
                    />
                    <span className={fieldStyles.sub}>{placeHint(leg[field])}</span>
                  </label>
                </Fragment>
              ))}
            </div>
            <div className={styles.dateGroup}>
              <div className={clsx(fieldStyles.box, styles.dateBox)}>
                <DateCell
                  label="Depart"
                  value={formatDayLabel(date)}
                  sub={dateSubLabel(date, flexibleDates)}
                  active={activeLegIndex === index}
                  controls={calendarId}
                  ariaLabel={`Flight ${flightNumber} date, ${formatDayLabel(date)}`}
                  onClick={() => onOpenDate(index)}
                />
              </div>
              <button
                type="button"
                className={styles.remove}
                aria-label={`Remove flight ${flightNumber}`}
                disabled={legs.length <= 1}
                onClick={() => onRemove(index)}
              >
                <Icon name="close" strokeWidth={1.8} />
              </button>
            </div>
          </div>
        );
      })}
      <div className={styles.addRow}>
        <button type="button" className={styles.add} disabled={isFull} onClick={onAdd}>
          <Icon name="plus" strokeWidth={1.8} />
          Add flight
        </button>
        <span>
          {isFull
            ? 'That’s the maximum of 4 flights per booking.'
            : `${flightCount} of up to 4 flights. Each flight is priced one way.`}
        </span>
      </div>
    </div>
  );
}

import clsx from 'clsx';
import { useId } from 'react';

import { Icon } from '@/components/icons';
import { findAirport, PHILIPPINE_ORIGINS, POPULAR_DESTINATIONS, searchAirports } from '@/data/airports';
import { formatPeso } from '@/lib/format';
import { getOriginDeals } from '@/services/flightsService';

import type { PlaceInput } from '../../lib/searchForm';
import { AirportPickerPanel, type AirportPickerItem } from './AirportPickerPanel';
import styles from './PlaceFields.module.css';
import fieldStyles from './SearchFields.module.css';

type PlaceField = 'from' | 'to';

interface PlaceFieldsProps {
  from: PlaceInput;
  to: PlaceInput;
  fromLabel: string;
  invalid: boolean;
  invalidField: { from: boolean; to: boolean };
  openPicker: PlaceField | null;
  onOpenPicker: (field: PlaceField) => void;
  onType: (field: PlaceField, query: string) => void;
  onChoose: (field: PlaceField, code: string) => void;
  onSwap: () => void;
}

const UNRECOGNISED_HINT = 'Keep typing a city or airport code';

function describe(place: PlaceInput) {
  const airport = place.code ? findAirport(place.code) : undefined;
  return airport ? `${airport.code} · ${airport.name}` : `— · ${UNRECOGNISED_HINT}`;
}

/** From and To boxes with the swap button and their airport pickers. */
export function PlaceFields({
  from,
  to,
  fromLabel,
  invalid,
  invalidField,
  openPicker,
  onOpenPicker,
  onType,
  onChoose,
  onSwap,
}: PlaceFieldsProps) {
  const pickerId = useId();
  const deals = getOriginDeals(from.code ?? 'MNL');

  function pickerContent(field: PlaceField) {
    const place = field === 'from' ? from : to;
    const query = place.query.trim();
    const currentCity = place.code ? (findAirport(place.code)?.city ?? '') : '';
    const isBrowsing = !query || query.toLowerCase() === currentCity.toLowerCase();
    const codes = field === 'from' ? PHILIPPINE_ORIGINS : POPULAR_DESTINATIONS;
    const airports = isBrowsing
      ? codes.map((code) => findAirport(code)).filter((airport) => airport !== undefined)
      : searchAirports(query);

    const items: AirportPickerItem[] = airports.map((airport) => {
      const deal = field === 'to' ? deals.find((entry) => entry.destination === airport.code) : undefined;
      return { airport, note: deal ? `from ${formatPeso(deal.price)}` : undefined };
    });

    const originCity = from.code ? findAirport(from.code)?.city : 'Manila';
    return (
      <AirportPickerPanel
        id={`${pickerId}-${field}`}
        title={
          isBrowsing
            ? field === 'from'
              ? 'Airports in the Philippines'
              : `Popular from ${originCity ?? 'Manila'}`
            : `Airports matching “${query}”`
        }
        subtitle={
          isBrowsing
            ? field === 'from'
              ? 'Or type any city or airport code'
              : 'Lowest round-trip fares per traveler, taxes included'
            : `${items.length} ${items.length === 1 ? 'airport' : 'airports'}`
        }
        items={items}
        selectedCode={place.code}
        emptyMessage={`No airports match “${query}”. Try a city name or a 3-letter code like HND.`}
        onChoose={(code) => onChoose(field, code)}
      />
    );
  }

  function renderCell(field: PlaceField, place: PlaceInput) {
    const isFrom = field === 'from';
    return (
      <label className={clsx(fieldStyles.cell, isFrom ? styles.fromCell : styles.toCell)}>
        <span className={fieldStyles.eyebrow}>{isFrom ? fromLabel : 'To'}</span>
        <input
          className={fieldStyles.value}
          value={place.query}
          autoComplete="off"
          aria-label={isFrom ? 'From city or airport' : 'To city or airport'}
          aria-haspopup="listbox"
          aria-expanded={openPicker === field}
          aria-controls={openPicker === field ? `${pickerId}-${field}` : undefined}
          aria-invalid={invalidField[field] || undefined}
          onFocus={() => onOpenPicker(field)}
          onClick={() => onOpenPicker(field)}
          onChange={(event) => onType(field, event.target.value)}
        />
        <span className={fieldStyles.sub}>{describe(place)}</span>
      </label>
    );
  }

  return (
    <div className={clsx(fieldStyles.box, styles.places, invalid && fieldStyles.boxInvalid)}>
      {renderCell('from', from)}
      <span aria-hidden="true" className={fieldStyles.divider} />
      {renderCell('to', to)}
      <button type="button" className={styles.swap} aria-label="Swap origin and destination" onClick={onSwap}>
        <Icon name="arrowsSwap" />
      </button>
      {openPicker && (
        <div className={clsx(fieldStyles.panel, openPicker === 'from' ? styles.pickerFrom : styles.pickerTo)}>
          {pickerContent(openPicker)}
        </div>
      )}
    </div>
  );
}

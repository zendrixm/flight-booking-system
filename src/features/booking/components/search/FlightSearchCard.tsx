import clsx from 'clsx';
import { useCallback, useId, useReducer, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import { paths } from '@/app/paths';
import { Icon } from '@/components/icons';
import { Alert, Checkbox, SegmentedControl, type SegmentedOption } from '@/components/ui';
import { useEscapeKey, useOnClickOutside } from '@/hooks';
import { formatDayLabel, type IsoDate } from '@/lib/date';
import { searchToQueryString } from '@/lib/flightSearchUrl';
import { estimateCalendarFare } from '@/services/flightsService';
import type { TripType } from '@/types/flight';

import {
  EARLIEST_DEPARTURE,
  getSearchErrors,
  INITIAL_SEARCH_FORM,
  toSearchParams,
  travelersLabel,
  type SearchFormState,
} from '../../lib/searchForm';
import { nextCalendarTarget, searchFormReducer, type CalendarTarget } from '../../lib/searchFormReducer';
import { DateCell, dateSubLabel } from './DateFields';
import { calendarPageFor, FareCalendarPanel } from './FareCalendarPanel';
import styles from './FlightSearchCard.module.css';
import { MultiCityLegs } from './MultiCityLegs';
import { PlaceFields } from './PlaceFields';
import fieldStyles from './SearchFields.module.css';
import { TravelersPanel } from './TravelersPanel';

const TRIP_TYPES: ReadonlyArray<SegmentedOption<TripType>> = [
  { value: 'round', label: 'Round trip' },
  { value: 'oneway', label: 'One way' },
  { value: 'multi', label: 'Multi-city' },
];

type OpenPanel = 'travelers' | 'from' | 'to' | 'calendar' | null;

interface FlightSearchCardProps {
  initialState?: SearchFormState;
}

/** The home-page search: trip type, travelers, airports with pickers, fare calendar and multi-city legs. */
export function FlightSearchCard({ initialState = INITIAL_SEARCH_FORM }: FlightSearchCardProps) {
  const navigate = useNavigate();
  const [form, dispatch] = useReducer(searchFormReducer, initialState);
  const [openPanel, setOpenPanel] = useState<OpenPanel>(null);
  const [calendarTarget, setCalendarTarget] = useState<CalendarTarget>({ kind: 'depart' });
  const [calendarPage, setCalendarPage] = useState(1);
  const cardRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  const closePanels = useCallback(() => setOpenPanel(null), []);
  useOnClickOutside([cardRef], closePanels, openPanel !== null);
  useEscapeKey(closePanels, openPanel !== null);

  const errors = getSearchErrors(form);
  const showErrors = form.hasTriedSearch && errors.length > 0;
  const hasError = (field: string) => form.hasTriedSearch && errors.some((error) => error.field === field);
  const isRound = form.tripType === 'round';
  const isMulti = form.tripType === 'multi';

  const legIndex = calendarTarget.kind === 'leg' ? calendarTarget.index : -1;
  const getFare = useCallback(
    (date: IsoDate) =>
      estimateCalendarFare(date, { legIndex: legIndex + 1, oneWay: !isRound || legIndex >= 0 }),
    [legIndex, isRound],
  );

  function openCalendar(target: CalendarTarget, focusDate: IsoDate, anchorDate: IsoDate) {
    const isSameTarget =
      openPanel === 'calendar' && JSON.stringify(target) === JSON.stringify(calendarTarget);
    setCalendarTarget(target);
    setCalendarPage(Math.max(calendarPageFor(anchorDate), calendarPageFor(focusDate) - 1));
    setOpenPanel(isSameTarget ? null : 'calendar');
  }

  function handlePickDate(date: IsoDate) {
    const next = nextCalendarTarget(form, calendarTarget, date);
    dispatch({ type: 'pickDate', target: calendarTarget, date });
    if (next) setCalendarTarget(next);
    else setOpenPanel(null);
  }

  function handleSearch() {
    setOpenPanel(null);
    if (errors.length > 0) {
      dispatch({ type: 'trySearch' });
      return;
    }
    navigate(`${paths.flights}?${searchToQueryString(toSearchParams(form))}`);
  }

  const calendarTitle =
    calendarTarget.kind === 'leg'
      ? `Choose the date for flight ${calendarTarget.index + 2}`
      : isRound && calendarTarget.kind === 'return'
        ? 'Choose your return'
        : isMulti
          ? 'Choose the date for flight 1'
          : 'Choose your departure';
  const earliestDate =
    calendarTarget.kind === 'leg'
      ? calendarTarget.index === 0
        ? form.departDate
        : form.extraLegs[calendarTarget.index - 1].date
      : EARLIEST_DEPARTURE;
  const selection =
    calendarTarget.kind === 'leg'
      ? { start: form.extraLegs[calendarTarget.index]?.date ?? null, end: null }
      : { start: form.departDate, end: isRound ? form.returnDate : null };

  return (
    <div ref={cardRef} className={styles.card}>
      <div className={styles.topRow}>
        <SegmentedControl
          label="Trip type"
          appearance="soft"
          options={TRIP_TYPES}
          value={form.tripType}
          onChange={(tripType) => {
            setOpenPanel(null);
            setCalendarTarget({ kind: 'depart' });
            dispatch({ type: 'setTripType', tripType });
          }}
        />
        <div className={styles.options}>
          <Checkbox
            label="Flexible dates ±3 days"
            className={styles.flexible}
            checked={form.flexibleDates}
            onChange={() => dispatch({ type: 'toggleFlexibleDates' })}
          />
          <button
            type="button"
            className={styles.travelersButton}
            aria-haspopup="dialog"
            aria-expanded={openPanel === 'travelers'}
            aria-controls={openPanel === 'travelers' ? `${panelId}-travelers` : undefined}
            onClick={() => setOpenPanel(openPanel === 'travelers' ? null : 'travelers')}
          >
            <Icon name="users" />
            {travelersLabel(form)}
            <Icon name="chevronDown" size={16} strokeWidth={1.8} />
          </button>
        </div>
        {openPanel === 'travelers' && (
          <TravelersPanel
            id={`${panelId}-travelers`}
            travelers={form}
            onChange={(kind, delta) => dispatch({ type: 'changeTravelers', kind, delta })}
            onCabinChange={(cabin) => dispatch({ type: 'setCabin', cabin })}
            onDone={closePanels}
          />
        )}
      </div>

      <div className={styles.fieldsArea}>
        <div className={styles.fieldsRow}>
          <PlaceFields
            from={form.from}
            to={form.to}
            fromLabel={isMulti ? 'Flight 1 · From' : 'From'}
            invalid={hasError('from') || hasError('to')}
            invalidField={{ from: hasError('from'), to: hasError('to') }}
            openPicker={openPanel === 'from' || openPanel === 'to' ? openPanel : null}
            onOpenPicker={(field) => setOpenPanel(field)}
            onType={(field, query) => {
              setOpenPanel(field);
              dispatch({ type: 'typePlace', field, query });
            }}
            onChoose={(field, code) => {
              setOpenPanel(null);
              dispatch({ type: 'choosePlace', field, code });
            }}
            onSwap={() => dispatch({ type: 'swapPlaces' })}
          />

          <div className={clsx(fieldStyles.box, styles.dates, hasError('return') && fieldStyles.boxInvalid)}>
            <DateCell
              label="Depart"
              value={formatDayLabel(form.departDate)}
              sub={dateSubLabel(form.departDate, form.flexibleDates)}
              active={openPanel === 'calendar' && calendarTarget.kind === 'depart'}
              controls={`${panelId}-calendar`}
              onClick={() => openCalendar({ kind: 'depart' }, form.departDate, form.departDate)}
            />
            {!isMulti && (
              <>
                <span aria-hidden="true" className={fieldStyles.divider} />
                <DateCell
                  label="Return"
                  value={
                    form.tripType === 'oneway'
                      ? 'One way'
                      : form.returnDate
                        ? formatDayLabel(form.returnDate)
                        : 'Add return'
                  }
                  sub={
                    form.tripType === 'oneway'
                      ? 'No return flight'
                      : form.returnDate
                        ? dateSubLabel(form.returnDate, form.flexibleDates)
                        : 'Choose a date'
                  }
                  active={openPanel === 'calendar' && calendarTarget.kind === 'return'}
                  disabled={form.tripType === 'oneway'}
                  controls={`${panelId}-calendar`}
                  onClick={() =>
                    openCalendar({ kind: 'return' }, form.returnDate ?? form.departDate, form.departDate)
                  }
                />
              </>
            )}
          </div>

          <button type="button" className={styles.searchButton} onClick={handleSearch}>
            <Icon name="search" size={20} strokeWidth={1.8} />
            Search flights
          </button>
        </div>

        {showErrors && (
          <Alert tone="danger" role="alert" title="Check your search">
            <ul className={styles.errorList}>
              {errors.map((error) => (
                <li key={error.message}>{error.message}</li>
              ))}
            </ul>
          </Alert>
        )}

        {isMulti && (
          <MultiCityLegs
            legs={form.extraLegs}
            flexibleDates={form.flexibleDates}
            activeLegIndex={
              openPanel === 'calendar' && calendarTarget.kind === 'leg' ? calendarTarget.index : null
            }
            calendarId={`${panelId}-calendar`}
            onTypePlace={(index, field, query) => dispatch({ type: 'typeLegPlace', index, field, query })}
            onOpenDate={(index) =>
              openCalendar(
                { kind: 'leg', index },
                form.extraLegs[index].date,
                index === 0 ? form.departDate : form.extraLegs[index - 1].date,
              )
            }
            onRemove={(index) => {
              setOpenPanel(null);
              dispatch({ type: 'removeLeg', index });
            }}
            onAdd={() => {
              setOpenPanel(null);
              dispatch({ type: 'addLeg' });
            }}
          />
        )}

        {openPanel === 'calendar' && (
          <FareCalendarPanel
            id={`${panelId}-calendar`}
            title={calendarTitle}
            subtitle={`${!isRound || legIndex >= 0 ? 'Lowest one-way fare' : 'Lowest round-trip fare'} per traveler, taxes included`}
            page={calendarPage}
            onPageChange={setCalendarPage}
            selectedStart={selection.start}
            selectedEnd={selection.end}
            earliestDate={earliestDate}
            getFare={getFare}
            onSelectDate={handlePickDate}
            onDone={closePanels}
          />
        )}
      </div>
    </div>
  );
}

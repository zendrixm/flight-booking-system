import { useState } from 'react';
import { useNavigate } from 'react-router';

import { paths } from '@/app/paths';
import { Icon } from '@/components/icons';
import { Button, ChoiceCard, Dialog, TextField } from '@/components/ui';
import { DEMO_TODAY } from '@/config/demo';
import { findAirport } from '@/data/airports';
import { useAsyncData } from '@/hooks';
import { addDays, daysBetween, formatDayLabel, yearsBetween, type IsoDate } from '@/lib/date';
import { searchToQueryString } from '@/lib/flightSearchUrl';
import { formatPeso, pluralize } from '@/lib/format';
import { getTodaysLowestFare } from '@/services/flightsService';
import type { SavedTraveler } from '@/types/traveler';
import type { Trip } from '@/types/trip';

import { tripMonthPhrase, tripNights } from '../lib/tripDates';
import styles from './BookAgainDialog.module.css';

/** Suggested departure for a repeat trip: the next Friday six weeks out keeps fares low. */
const SUGGESTED_DEPARTURE: IsoDate = '2026-11-20';

interface BookAgainDialogProps {
  trip: Trip;
  savedTravelers: readonly SavedTraveler[];
  onClose: () => void;
}

function travelerKind(traveler: SavedTraveler): string {
  const age = traveler.dateOfBirth ? yearsBetween(traveler.dateOfBirth, DEMO_TODAY) : null;
  const kind = age !== null && age < 12 ? `Child · ${age} years` : 'Adult';
  return traveler.isAccountHolder ? `${kind} · You` : kind;
}

/** Same route and travelers as a past trip, with new dates; continues to the search results. */
export function BookAgainDialog({ trip, savedTravelers, onClose }: BookAgainDialogProps) {
  const navigate = useNavigate();
  const fareToday = useAsyncData(`fare-today:${trip.destinationCode}`, () =>
    getTodaysLowestFare(trip.destinationCode),
  );
  const nights = Math.max(tripNights(trip), 1);
  const [departDate, setDepartDate] = useState<IsoDate>(SUGGESTED_DEPARTURE);
  const [returnDate, setReturnDate] = useState<IsoDate>(addDays(SUGGESTED_DEPARTURE, nights));
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(
    () => new Set(savedTravelers.slice(0, trip.travelerCount).map((traveler) => traveler.id)),
  );

  const returnError = returnDate < departDate ? 'Return must be on or after your departure.' : undefined;
  const travelersError = selectedIds.size === 0 ? 'Choose at least one traveler.' : undefined;
  const canSearch = !returnError && !travelersError && Boolean(departDate && returnDate);
  const tripNightsLabel = pluralize(daysBetween(departDate, returnDate), 'night');
  const origin = findAirport(trip.originCode);
  const destination = findAirport(trip.destinationCode);

  const toggle = (id: string) =>
    setSelectedIds((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const search = () => {
    const chosen = savedTravelers.filter((traveler) => selectedIds.has(traveler.id));
    const children = chosen.filter((traveler) => travelerKind(traveler).startsWith('Child')).length;
    const query = searchToQueryString({
      tripType: 'round',
      from: trip.originCode,
      to: trip.destinationCode,
      departDate,
      returnDate,
      adults: Math.max(chosen.length - children, 1),
      children,
      infants: 0,
      cabin: 'Economy',
    });
    navigate(`${paths.flights}?${query}`);
  };

  return (
    <Dialog
      open
      onClose={onClose}
      size="medium"
      title={`Book ${trip.city} again`}
      description={`Same route and travelers as ${tripMonthPhrase(trip, DEMO_TODAY)}. Pick new dates.`}
      footer={
        <>
          <Button variant="quiet" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" iconStart="search" disabled={!canSearch} onClick={search}>
            Search flights
          </Button>
        </>
      }
    >
      <div className={styles.route}>
        <Icon name="plane" size={20} />
        <span className={styles.routeText}>
          <span className={styles.routeName}>
            {origin?.city} ({trip.originCode}) ⇄ {destination?.city ?? trip.city} ({trip.destinationCode})
          </span>
          <span className={styles.routeMeta}>Round trip · Economy · last time {trip.fareDescription}</span>
        </span>
      </div>

      <div className={styles.dates}>
        <TextField
          label="Depart"
          type="date"
          required
          min={addDays(DEMO_TODAY, 1)}
          value={departDate}
          onChange={(event) => setDepartDate(event.target.value)}
        />
        <TextField
          label="Return"
          type="date"
          required
          min={addDays(DEMO_TODAY, 1)}
          value={returnDate}
          error={returnError}
          onChange={(event) => setReturnDate(event.target.value)}
        />
      </div>

      <fieldset
        className={styles.travelers}
        aria-describedby={travelersError ? 'book-again-travelers-error' : undefined}
      >
        <legend className={styles.legend}>Who’s going</legend>
        {savedTravelers.map((traveler) => (
          <ChoiceCard
            key={traveler.id}
            type="checkbox"
            title={`${traveler.firstNames} ${traveler.lastName}`}
            description={travelerKind(traveler)}
            checked={selectedIds.has(traveler.id)}
            onChange={() => toggle(traveler.id)}
          />
        ))}
        {travelersError && (
          <p id="book-again-travelers-error" role="alert" className={styles.error}>
            {travelersError}
          </p>
        )}
      </fieldset>

      <div className={styles.summary}>
        <span className={styles.summaryText}>
          {canSearch
            ? `${formatDayLabel(departDate)} – ${formatDayLabel(returnDate)} · ${tripNightsLabel} · ${pluralize(selectedIds.size, 'traveler')}`
            : 'Fix the highlighted fields to search'}
        </span>
        {fareToday.data && (
          <span className={styles.fare}>Fares today from {formatPeso(fareToday.data)} per traveler</span>
        )}
      </div>
    </Dialog>
  );
}

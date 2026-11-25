import { useState } from 'react';

import { Icon } from '@/components/icons';
import { Button, EmptyState, Sheet, TextField } from '@/components/ui';
import { findAirport, PHILIPPINE_ORIGINS, POPULAR_DESTINATIONS, searchAirports } from '@/data/airports';
import { pluralize } from '@/lib/format';
import type { Airport } from '@/types/flight';

import { readRecentSearches } from '../lib/recentSearches';
import { NEARBY_AIRPORTS } from '../lib/searchSheets';
import styles from './AirportSheet.module.css';

interface AirportGroup {
  title: string;
  airports: Airport[];
}

function airportsFor(codes: readonly string[]): Airport[] {
  return codes.map(findAirport).filter((airport): airport is Airport => Boolean(airport));
}

/** Suggestions before anything is typed: nearby airports for "From", recent and popular for "To". */
function suggestedGroups(field: 'from' | 'to'): AirportGroup[] {
  if (field === 'from') {
    const others = PHILIPPINE_ORIGINS.filter((code) => !NEARBY_AIRPORTS.some((nearby) => nearby === code));
    return [
      { title: 'Near you', airports: airportsFor(NEARBY_AIRPORTS) },
      { title: 'Other Philippine airports', airports: airportsFor(others) },
    ];
  }
  const recent = [...new Set(readRecentSearches().map((search) => search.to))];
  return [
    { title: 'Recent', airports: airportsFor(recent) },
    {
      title: 'Popular from Manila',
      airports: airportsFor(POPULAR_DESTINATIONS.filter((code) => !recent.includes(code))),
    },
  ].filter((group) => group.airports.length > 0);
}

interface AirportSheetProps {
  field: 'from' | 'to';
  selectedCode: string | null;
  onPick: (code: string) => void;
  onClose: () => void;
}

/** "Flying from" / "Flying to": search by city, airport or code, or pick a suggestion. */
export function AirportSheet({ field, selectedCode, onPick, onClose }: AirportSheetProps) {
  const [query, setQuery] = useState('');
  const trimmed = query.trim();
  const matches = trimmed ? searchAirports(trimmed) : [];
  const groups = trimmed
    ? matches.length
      ? [{ title: pluralize(matches.length, 'airport'), airports: matches }]
      : []
    : suggestedGroups(field);

  return (
    <Sheet
      open
      onClose={onClose}
      height="tall"
      title={field === 'from' ? 'Flying from' : 'Flying to'}
      headerExtra={
        <TextField
          label={field === 'from' ? 'Search departure city or airport' : 'Search destination city or airport'}
          labelHidden
          leadingIcon="search"
          placeholder="City or airport"
          autoComplete="off"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      }
    >
      {groups.map((group) => (
        <div key={group.title} className={styles.group} role="group" aria-label={group.title}>
          <span className={styles.groupTitle} aria-hidden="true">
            {group.title}
          </span>
          {group.airports.map((airport) => {
            const isSelected = airport.code === selectedCode;
            return (
              <button
                key={airport.code}
                type="button"
                aria-pressed={isSelected}
                className={styles.airport}
                onClick={() => onPick(airport.code)}
              >
                <span className={styles.planeTile} aria-hidden="true">
                  <Icon name="plane" size={18} strokeWidth={1.5} />
                </span>
                <span className={styles.names}>
                  <span className={styles.city}>{airport.city}</span>
                  <span className={styles.airportName}>{airport.name}</span>
                </span>
                <span className={styles.code}>{airport.code}</span>
                {isSelected && <Icon name="check" size={18} strokeWidth={2.4} className={styles.check} />}
              </button>
            );
          })}
        </div>
      ))}
      {trimmed && matches.length === 0 && (
        <EmptyState
          variant="plain"
          icon="searchX"
          title={`No airports match “${trimmed}”`}
          description="Check the spelling, or try a city name or a 3-letter airport code like HND."
          actions={
            <Button variant="quiet" size="small" onClick={() => setQuery('')}>
              Clear search
            </Button>
          }
        />
      )}
    </Sheet>
  );
}

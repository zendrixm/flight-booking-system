import type { Airline, AirlineId, Airport } from '@/types/flight';

export const AIRPORTS: readonly Airport[] = [
  { code: 'MNL', city: 'Manila', name: 'Ninoy Aquino International', country: 'Philippines' },
  { code: 'CRK', city: 'Clark', name: 'Clark International', country: 'Philippines' },
  { code: 'CEB', city: 'Cebu', name: 'Mactan–Cebu International', country: 'Philippines' },
  { code: 'DVO', city: 'Davao', name: 'Francisco Bangoy International', country: 'Philippines' },
  { code: 'ILO', city: 'Iloilo', name: 'Iloilo International', country: 'Philippines' },
  { code: 'HND', city: 'Tokyo', name: 'Haneda', country: 'Japan' },
  { code: 'ICN', city: 'Seoul', name: 'Incheon', country: 'South Korea' },
  { code: 'TPE', city: 'Taipei', name: 'Taoyuan', country: 'Taiwan' },
  { code: 'SIN', city: 'Singapore', name: 'Changi', country: 'Singapore' },
  { code: 'HKG', city: 'Hong Kong', name: 'Hong Kong International', country: 'Hong Kong' },
  { code: 'KIX', city: 'Osaka', name: 'Kansai', country: 'Japan' },
  { code: 'BKK', city: 'Bangkok', name: 'Suvarnabhumi', country: 'Thailand' },
];

/** Departure airports offered first in the "From" picker and the deals origin switcher. */
export const PHILIPPINE_ORIGINS = ['MNL', 'CRK', 'CEB', 'DVO', 'ILO'] as const;

/** Destinations suggested before the person types anything in "To". */
export const POPULAR_DESTINATIONS = ['HND', 'ICN', 'SIN', 'TPE', 'HKG', 'KIX', 'BKK'] as const;

export function findAirport(code: string): Airport | undefined {
  return AIRPORTS.find((airport) => airport.code === code);
}

/** Exact code or city prefix, e.g. "hnd" or "Tok" → Haneda. */
export function resolveAirport(query: string): Airport | undefined {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return undefined;
  return (
    AIRPORTS.find((airport) => airport.code.toLowerCase() === normalized) ??
    AIRPORTS.find((airport) => airport.city.toLowerCase().startsWith(normalized))
  );
}

/** Code, city or any word of the airport name starting with the query. */
export function searchAirports(query: string): Airport[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];
  return AIRPORTS.filter(
    (airport) =>
      airport.code.toLowerCase().startsWith(normalized) ||
      airport.city.toLowerCase().startsWith(normalized) ||
      airport.name
        .toLowerCase()
        .split(/[\s–-]+/)
        .some((word) => word.startsWith(normalized)),
  );
}

export const AIRLINES: Record<AirlineId, Airline> = {
  meridian: { id: 'meridian', name: 'Meridian Air', monogram: 'MR', tileTone: 'dark' },
  crest: { id: 'crest', name: 'Pacific Crest', monogram: 'PC', tileTone: 'light' },
  solenne: { id: 'solenne', name: 'Solenne', monogram: 'SO', tileTone: 'light' },
  halcyon: { id: 'halcyon', name: 'Halcyon', monogram: 'HC', tileTone: 'light' },
  kestrel: { id: 'kestrel', name: 'Kestrel Airways', monogram: 'KS', tileTone: 'light' },
};

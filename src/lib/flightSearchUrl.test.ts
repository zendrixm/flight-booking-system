import { describe, expect, it } from 'vitest';

import { DEFAULT_SEARCH, searchFromQuery, searchToQueryString } from './flightSearchUrl';

describe('flight search URLs', () => {
  it('round-trips a search through the query string', () => {
    const search = { ...DEFAULT_SEARCH, to: 'ICN', children: 1, cabin: 'Business' as const };
    expect(searchFromQuery(new URLSearchParams(searchToQueryString(search)))).toEqual(search);
  });

  it('drops the return date for one-way trips', () => {
    const query = new URLSearchParams('trip=oneway&from=mnl&to=sin&depart=2026-12-01&return=2026-12-08');
    expect(searchFromQuery(query)).toMatchObject({
      tripType: 'oneway',
      from: 'MNL',
      to: 'SIN',
      returnDate: null,
    });
  });

  it('falls back to the demo search for anything invalid', () => {
    const query = new URLSearchParams('depart=12/11/2026&adults=40&cabin=Luxury');
    expect(searchFromQuery(query)).toMatchObject({
      departDate: DEFAULT_SEARCH.departDate,
      adults: DEFAULT_SEARCH.adults,
      cabin: DEFAULT_SEARCH.cabin,
    });
  });
});

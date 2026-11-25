import { beforeEach, describe, expect, it } from 'vitest';

import { DEFAULT_SEARCH } from '@/lib/flightSearchUrl';

import { describeSearch, MAX_RECENT_SEARCHES, readRecentSearches, rememberSearch } from './recentSearches';

describe('recent searches', () => {
  beforeEach(() => {
    globalThis.localStorage?.clear();
  });

  it('starts with the demo searches', () => {
    expect(readRecentSearches().map((search) => search.to)).toEqual(['HND', 'ICN', 'TPE']);
  });

  it('moves a repeated search to the front without duplicating it', () => {
    const next = rememberSearch({
      ...DEFAULT_SEARCH,
      to: 'TPE',
      departDate: '2027-01-15',
      returnDate: '2027-01-19',
    });
    expect(next.map((search) => search.to)).toEqual(['TPE', 'HND', 'ICN']);
  });

  it('keeps the newest few', () => {
    const codes = ['SIN', 'HKG', 'KIX', 'BKK', 'CEB'];
    let list = readRecentSearches();
    for (const to of codes) list = rememberSearch({ ...DEFAULT_SEARCH, to });
    expect(list).toHaveLength(MAX_RECENT_SEARCHES);
    expect(list[0].to).toBe('CEB');
  });

  it('describes a search for its chip', () => {
    expect(describeSearch(DEFAULT_SEARCH)).toEqual({ route: 'MNL → HND', detail: '12–19 Nov · 2 adults' });
    expect(
      describeSearch({ ...DEFAULT_SEARCH, tripType: 'oneway', returnDate: null, adults: 1 }).detail,
    ).toBe('Thu, 12 Nov · 1 adult');
  });
});

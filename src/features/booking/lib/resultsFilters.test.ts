import { describe, expect, it } from 'vitest';

import { MANILA_TOKYO_OPTIONS } from '@/mocks/flightOffers';

import {
  applyFilters,
  DEFAULT_FILTERS,
  hasActiveFilters,
  lowestFareOf,
  lowestPriceWhere,
  priceBoundsOf,
  sortOptions,
  toggleValue,
  topOptionFor,
} from './resultsFilters';

const options = MANILA_TOKYO_OPTIONS;

describe('results filters', () => {
  it('shows everything by default, best first', () => {
    const visible = applyFilters(options, DEFAULT_FILTERS, 'best');
    expect(visible).toHaveLength(options.length);
    expect(visible.map((option) => option.rank)).toEqual(
      [...options.map((option) => option.rank)].sort((a, b) => a - b),
    );
    expect(hasActiveFilters(DEFAULT_FILTERS)).toBe(false);
  });

  it('filters nonstop morning flights on one airline', () => {
    const visible = applyFilters(
      options,
      { ...DEFAULT_FILTERS, stops: [0], departureWindows: ['morning'], airlines: ['meridian'] },
      'cheapest',
    );
    expect(visible.map((option) => option.id)).toEqual(['mr431']);
  });

  it('caps the price per traveler', () => {
    const visible = applyFilters(options, { ...DEFAULT_FILTERS, maxPrice: 14000 }, 'cheapest');
    expect(visible.every((option) => lowestFareOf(option) <= 14000)).toBe(true);
    expect(visible[0].id).toBe('sj205');
  });

  it('sorts by the cheapest fare and by total time', () => {
    expect(topOptionFor(options, 'cheapest')?.id).toBe('sj205');
    const fastest = sortOptions(options, 'fastest')[0];
    expect(fastest.outbound.stops).toBe(0);
  });

  it('rounds slider bounds outwards to the step', () => {
    expect(priceBoundsOf(options)).toEqual({ floor: 12750, cap: 18250 });
    expect(priceBoundsOf([])).toEqual({ floor: 0, cap: 0 });
  });

  it('finds the lowest price for an airline', () => {
    expect(lowestPriceWhere(options, (option) => option.airlineId === 'halcyon')).toBe(13480);
    expect(lowestPriceWhere(options, () => false)).toBeNull();
  });

  it('toggles a value in a list', () => {
    expect(toggleValue(['morning'], 'evening')).toEqual(['morning', 'evening']);
    expect(toggleValue(['morning', 'evening'], 'morning')).toEqual(['evening']);
  });
});

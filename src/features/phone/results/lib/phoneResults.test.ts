import { describe, expect, it } from 'vitest';

import { DEFAULT_FILTERS } from '@/features/booking/lib/resultsFilters';
import { MANILA_TOKYO_OPTIONS } from '@/mocks/flightOffers';

import { activeFilterCount, isNonstopOnly, resultTagOf, withNonstopOnly } from './phoneResults';

describe('phone results', () => {
  it('tags the top option for each sort, best first', () => {
    const tags = MANILA_TOKYO_OPTIONS.map(
      (option) => resultTagOf(option, MANILA_TOKYO_OPTIONS)?.label ?? null,
    );
    expect(tags.filter(Boolean)).toEqual(['Best', 'Cheapest', 'Fastest']);
    expect(resultTagOf(MANILA_TOKYO_OPTIONS[0], MANILA_TOKYO_OPTIONS)).toEqual({
      label: 'Best',
      tone: 'solid',
    });
  });

  it('switches nonstop-only on and off', () => {
    const nonstop = withNonstopOnly(DEFAULT_FILTERS, true);
    expect(isNonstopOnly(nonstop)).toBe(true);
    expect(isNonstopOnly(withNonstopOnly(nonstop, false))).toBe(false);
  });

  it('counts each filter the person turned on', () => {
    expect(activeFilterCount(DEFAULT_FILTERS)).toBe(0);
    const filters = {
      ...withNonstopOnly(DEFAULT_FILTERS, true),
      departureWindows: ['morning' as const],
      airlines: ['meridian' as const],
    };
    expect(activeFilterCount(filters)).toBe(3);
  });
});

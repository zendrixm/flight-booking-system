import { describe, expect, it } from 'vitest';

import { relativeDayLabel } from './phoneDates';

describe('relativeDayLabel', () => {
  it('says today and tomorrow, then the date', () => {
    expect(relativeDayLabel('2026-10-09', '2026-10-09')).toBe('Today');
    expect(relativeDayLabel('2026-10-10', '2026-10-09')).toBe('Tomorrow');
    expect(relativeDayLabel('2026-11-12', '2026-10-09')).toBe('Thu, 12 Nov');
  });
});

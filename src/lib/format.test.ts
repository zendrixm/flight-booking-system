import { describe, expect, it } from 'vitest';

import {
  formatDuration,
  formatPeso,
  formatPesoCompact,
  formatPesoShort,
  initialsOf,
  joinWithAnd,
  pluralize,
  travelerCountLabel,
} from './format';

describe('formatPeso', () => {
  it('groups thousands and rounds to whole pesos', () => {
    expect(formatPeso(39862)).toBe('₱39,862');
    expect(formatPeso(1234.6)).toBe('₱1,235');
  });

  it('uses a true minus sign for negative amounts', () => {
    expect(formatPeso(-1000)).toBe('−₱1,000');
  });
});

describe('compact peso formats', () => {
  it('shows calendar fares in thousands', () => {
    expect(formatPesoCompact(12940)).toBe('₱12.9k');
  });

  it('shortens dashboard totals', () => {
    expect(formatPesoShort(1_240_000)).toBe('₱1.24M');
    expect(formatPesoShort(2_000_000)).toBe('₱2M');
    expect(formatPesoShort(48_600)).toBe('₱49k');
    expect(formatPesoShort(9_500)).toBe('₱9,500');
  });
});

describe('formatDuration', () => {
  it.each([
    [255, '4h 15m'],
    [120, '2h'],
    [45, '45m'],
    [545, '9h 05m'],
  ])('formats %s minutes', (minutes, expected) => {
    expect(formatDuration(minutes)).toBe(expected);
  });
});

describe('words', () => {
  it('pluralizes with an optional irregular plural', () => {
    expect(pluralize(1, 'adult')).toBe('1 adult');
    expect(pluralize(2, 'adult')).toBe('2 adults');
    expect(pluralize(4, 'person', 'people')).toBe('4 people');
  });

  it('joins lists with a final "and"', () => {
    expect(joinWithAnd([])).toBe('');
    expect(joinWithAnd(['Spruce'])).toBe('Spruce');
    expect(joinWithAnd(['Midnight', 'Brass', 'Spruce'])).toBe('Midnight, Brass and Spruce');
  });

  it('takes initials from the first and last name', () => {
    expect(initialsOf('Andrea Lim Reyes')).toBe('AR');
    expect(initialsOf('  lea  ')).toBe('L');
    expect(initialsOf('')).toBe('');
  });

  it('describes a group of travelers', () => {
    expect(travelerCountLabel({ adults: 2, children: 1, infants: 0 })).toBe('2 adults, 1 child');
    expect(travelerCountLabel({ adults: 1, children: 0, infants: 2 })).toBe('1 adult, 2 infants');
  });
});

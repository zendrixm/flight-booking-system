import { describe, expect, it } from 'vitest';

import {
  addDays,
  addMonths,
  buildCalendarMonth,
  daysBetween,
  formatDayLabel,
  formatDayRange,
  isWeekend,
  shiftMonth,
  yearsBetween,
} from './date';

describe('date arithmetic', () => {
  it('adds days across month and year ends', () => {
    expect(addDays('2026-11-28', 5)).toBe('2026-12-03');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-11-12', -2)).toBe('2026-11-10');
  });

  it('counts whole days between dates', () => {
    expect(daysBetween('2026-11-12', '2026-11-19')).toBe(7);
    expect(daysBetween('2026-11-19', '2026-11-12')).toBe(-7);
  });

  it('adds months', () => {
    expect(addMonths('2026-10-09', 3)).toBe('2027-01-09');
  });

  it('counts full years, e.g. for passenger ages', () => {
    expect(yearsBetween('2014-11-13', '2026-11-12')).toBe(11);
    expect(yearsBetween('2014-11-12', '2026-11-12')).toBe(12);
  });

  it('shifts a month index across years', () => {
    expect(shiftMonth(2026, 11, 1)).toEqual({ year: 2027, monthIndex: 0 });
    expect(shiftMonth(2027, 0, -1)).toEqual({ year: 2026, monthIndex: 11 });
  });
});

describe('date labels', () => {
  it('formats a day', () => {
    expect(formatDayLabel('2026-11-12')).toBe('Thu, 12 Nov');
  });

  it('formats ranges within and across months', () => {
    expect(formatDayRange('2026-11-12', '2026-11-19')).toBe('12–19 Nov');
    expect(formatDayRange('2026-11-28', '2026-12-03')).toBe('28 Nov – 3 Dec');
  });

  it('knows weekends', () => {
    expect(isWeekend('2026-11-14')).toBe(true);
    expect(isWeekend('2026-11-12')).toBe(false);
  });
});

describe('buildCalendarMonth', () => {
  it('starts the grid on Sunday', () => {
    const november = buildCalendarMonth(2026, 10);
    expect(november.leadingBlanks).toBe(0);
    expect(november.days).toHaveLength(30);
    expect(buildCalendarMonth(2026, 11).leadingBlanks).toBe(2);
  });
});

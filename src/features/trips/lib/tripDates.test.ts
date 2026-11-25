import { describe, expect, it } from 'vitest';

import { ACCOUNT_TRIPS } from '@/mocks/trips';
import type { Trip } from '@/types/trip';

import {
  checkInOpensLabel,
  departureCountdown,
  isCheckInOpen,
  pastTripDateRange,
  tripDateRange,
  tripNights,
} from './tripDates';

const byReference = (reference: string) => ACCOUNT_TRIPS.find((trip) => trip.reference === reference) as Trip;
const tokyo = byReference('VL7Q2K');
const singapore = byReference('VL3MZ8');

describe('trip dates', () => {
  it('counts down to departure', () => {
    expect(departureCountdown('2026-10-09', '2026-10-09')).toBe('Departs today');
    expect(departureCountdown('2026-10-10', '2026-10-09')).toBe('Departs tomorrow');
    expect(departureCountdown('2026-11-12', '2026-10-09')).toBe('In 34 days');
  });

  it('opens check-in 48 hours before departure', () => {
    expect(isCheckInOpen(singapore, '2026-10-09')).toBe(true);
    expect(isCheckInOpen(tokyo, '2026-10-09')).toBe(false);
    expect(isCheckInOpen(tokyo, '2026-11-11')).toBe(true);
    expect(checkInOpensLabel(tokyo)).toBe('Tue, 10 Nov · 08:40');
  });

  it('formats trip ranges', () => {
    expect(tripDateRange(tokyo)).toBe('Thu, 12 Nov – Thu, 19 Nov');
    expect(tripNights(tokyo)).toBe(7);
    expect(pastTripDateRange({ ...tokyo, departDate: '2026-08-14', returnDate: '2026-08-17' })).toBe(
      '14 – 17 Aug 2026',
    );
    expect(pastTripDateRange({ ...tokyo, departDate: '2025-12-28', returnDate: '2026-01-02' })).toBe(
      '28 Dec 2025 – 2 Jan 2026',
    );
  });
});

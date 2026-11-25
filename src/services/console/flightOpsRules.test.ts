import { describe, expect, it } from 'vitest';

import type { FlightStatusDraft } from '@/types/console/flightOps';

import { delayLabel, departureTimeError, minutesAfter } from './flightOpsRules';

const delayed = (departureTime: string): FlightStatusDraft => ({
  status: 'delayed',
  departureTime,
  reason: 'weather',
});

describe('flight ops rules', () => {
  it('counts minutes past midnight', () => {
    expect(minutesAfter('23:30', '00:10')).toBe(40);
    expect(minutesAfter('08:40', '10:50')).toBe(130);
    expect(delayLabel('08:40', '10:50')).toBe('2h 10m');
  });

  it('accepts a later time within 12 hours', () => {
    expect(departureTimeError('08:40', delayed('10:50'))).toBeNull();
    expect(departureTimeError('08:40', { ...delayed(''), status: 'onTime' })).toBeNull();
  });

  it('explains what is wrong with a delayed time', () => {
    expect(departureTimeError('08:40', delayed('25:00'))).toBe('Enter the new departure time.');
    expect(departureTimeError('08:40', delayed('08:40'))).toMatch('That’s the scheduled time');
    expect(departureTimeError('08:40', delayed('21:00'))).toMatch('Delays over 12 hours');
  });
});

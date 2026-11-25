import { describe, expect, it } from 'vitest';

import { DEFAULT_SEARCH } from '@/lib/flightSearchUrl';

import {
  getTrackPricesErrors,
  INITIAL_TRACK_PRICES_FORM,
  priceAlertForSearch,
  sanitizeAmountInput,
  type TrackPricesForm,
} from './trackPricesForm';

const below: TrackPricesForm = { ...INITIAL_TRACK_PRICES_FORM, mode: 'below', targetInput: '11,500' };

describe('track prices form', () => {
  it('needs a target below today’s lowest fare', () => {
    expect(getTrackPricesErrors({ ...below, targetInput: '' }, 12940).target).toBe(
      'Enter a target price per traveler.',
    );
    expect(getTrackPricesErrors({ ...below, targetInput: '13,500' }, 12940).target).toBe(
      'Set a target below today’s lowest fare of ₱12,940.',
    );
    expect(getTrackPricesErrors({ ...below, targetInput: '900' }, 12940).target).toMatch(
      'lower than any fare',
    );
    expect(getTrackPricesErrors(below, 12940)).toEqual({});
  });

  it('needs at least one channel', () => {
    const errors = getTrackPricesErrors({ ...below, notifyByEmail: false, notifyByPush: false }, 12940);
    expect(errors.channels).toBe('Choose at least one way for us to reach you.');
  });

  it('keeps only digits and commas while typing', () => {
    expect(sanitizeAmountInput('₱11,5a00')).toBe('11,500');
  });

  it('builds the alert request for a search', () => {
    expect(priceAlertForSearch(DEFAULT_SEARCH, below)).toMatchObject({
      from: 'MNL',
      to: 'HND',
      datesLabel: '12–19 Nov',
      travelersLabel: '2 adults · Economy',
      mode: 'below',
      targetPrice: 11500,
    });
    expect(priceAlertForSearch(DEFAULT_SEARCH, { ...below, mode: 'drop' }).targetPrice).toBeNull();
  });
});

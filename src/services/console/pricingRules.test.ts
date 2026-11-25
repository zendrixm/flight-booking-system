import { describe, expect, it } from 'vitest';

import type { PromoCodeDraft } from '@/types/console/pricing';

import { discountLabel, promoCodeErrors, routeCities } from './pricingRules';

const draft: PromoCodeDraft = {
  code: 'AUTUMN8',
  discountType: 'percent',
  discountValue: 8,
  minimumSpend: 20000,
  routes: ['MNL–HND'],
  startDate: '2026-10-09',
  endDate: '2026-11-30',
};

describe('promo code rules', () => {
  it('accepts a valid code', () => {
    expect(promoCodeErrors(draft, ['WELCOME500'], true)).toEqual({});
  });

  it('checks the code only when it is new', () => {
    expect(promoCodeErrors({ ...draft, code: 'AB' }, [], true).code).toBe(
      'Use at least 3 letters or numbers',
    );
    expect(promoCodeErrors({ ...draft, code: 'AUTUMN-8' }, [], true).code).toMatch(
      'letters and numbers only',
    );
    expect(promoCodeErrors(draft, ['AUTUMN8'], true).code).toBe('AUTUMN8 already exists · pick another code');
    expect(promoCodeErrors(draft, ['AUTUMN8'], false).code).toBeUndefined();
  });

  it('keeps discounts in range for their type', () => {
    expect(promoCodeErrors({ ...draft, discountValue: 60 }, [], false).discountValue).toBe(
      'Use 1 to 50 percent.',
    );
    expect(
      promoCodeErrors({ ...draft, discountType: 'fixed', discountValue: 50 }, [], false).discountValue,
    ).toBe('Use ₱100 to ₱10,000.');
  });

  it('needs routes and an end after the start', () => {
    const errors = promoCodeErrors({ ...draft, routes: [], endDate: '2026-10-01' }, [], false);
    expect(errors).toMatchObject({ routes: 'Add at least one route the code applies to.' });
    expect(errors.endDate).toMatch('Ends before it starts');
    expect(promoCodeErrors({ ...draft, endDate: null }, [], false).endDate).toBeUndefined();
  });

  it('labels discounts and lists destination cities once', () => {
    expect(discountLabel('percent', 8)).toBe('8% off');
    expect(discountLabel('fixed', 1000)).toBe('₱1,000 off');
    const options = [
      { route: 'MNL–HND', destinationCity: 'Tokyo' },
      { route: 'MNL–NRT', destinationCity: 'Tokyo' },
      { route: 'MNL–ICN', destinationCity: 'Seoul' },
    ];
    expect(routeCities(['MNL–HND', 'MNL–NRT', 'MNL–ICN'], options as never)).toEqual(['Tokyo', 'Seoul']);
  });
});

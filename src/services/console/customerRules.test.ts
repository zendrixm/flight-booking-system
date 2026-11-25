import { describe, expect, it } from 'vitest';

import { creditExpiryDate, MAX_STAFF_CREDIT, travelCreditAmountError } from './customerRules';

describe('travel credit rules', () => {
  it('accepts whole pesos within the staff limit', () => {
    expect(travelCreditAmountError(1500)).toBeNull();
    expect(travelCreditAmountError(MAX_STAFF_CREDIT)).toBeNull();
  });

  it.each([
    [0, 'Enter an amount.'],
    [Number.NaN, 'Enter an amount.'],
    [1500.5, 'Use whole pesos, e.g. 1,500.'],
    [50, 'The smallest credit is ₱100.'],
    [25000, 'Over ₱20,000 needs Finance approval — issue up to ₱20,000 here.'],
  ])('rejects %s', (amount, message) => {
    expect(travelCreditAmountError(amount)).toBe(message);
  });

  it('dates the expiry from today', () => {
    expect(creditExpiryDate(12)).toBe('9 Oct 2027');
  });
});

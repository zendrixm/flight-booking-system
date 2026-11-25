import { describe, expect, it } from 'vitest';

import {
  creditAmountError,
  creditSummary,
  INITIAL_CREDIT_VALUES,
  parseCreditAmount,
  toCreditRequest,
} from './travelCreditForm';

describe('travel credit form', () => {
  it('reads amounts with thousands separators', () => {
    expect(parseCreditAmount('1,500')).toBe(1500);
    expect(parseCreditAmount('  ')).toBe(0);
    expect(Number.isNaN(parseCreditAmount('1.5k'))).toBe(true);
  });

  it('explains amounts it can’t issue', () => {
    expect(creditAmountError('1.5k')).toBe('Use numbers only, e.g. 1,500.');
    expect(creditAmountError('')).toBe('Enter an amount.');
    expect(creditAmountError('2,500')).toBeNull();
  });

  it('previews the new balance and the button label', () => {
    expect(creditSummary({ ...INITIAL_CREDIT_VALUES, amount: '2,500' }, 1000)).toEqual({
      newBalance: '₱3,500',
      expires: '9 Oct 2027',
      submitLabel: 'Issue ₱2,500',
    });
    expect(creditSummary(INITIAL_CREDIT_VALUES, 1000).submitLabel).toBe('Issue credit');
  });

  it('trims the message for the request', () => {
    expect(
      toCreditRequest({ ...INITIAL_CREDIT_VALUES, amount: '1,500', message: '  Sorry about the delay. ' }),
    ).toMatchObject({
      amount: 1500,
      message: 'Sorry about the delay.',
      validForMonths: 12,
    });
  });
});

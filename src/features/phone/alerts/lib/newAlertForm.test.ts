import { describe, expect, it } from 'vitest';

import { PRICE_ALERTS } from '@/mocks/priceAlerts';

import { INITIAL_NEW_ALERT_FORM, newAlertErrors, toNewPriceAlert } from './newAlertForm';

describe('new price alert form', () => {
  it('needs a destination that isn’t watched yet', () => {
    expect(newAlertErrors(INITIAL_NEW_ALERT_FORM, PRICE_ALERTS).to).toBe('Choose where you want to go.');
    expect(newAlertErrors({ ...INITIAL_NEW_ALERT_FORM, to: 'ICN' }, PRICE_ALERTS).to).toBe(
      'You’re already watching Manila → Seoul.',
    );
    expect(newAlertErrors({ ...INITIAL_NEW_ALERT_FORM, to: 'KIX' }, PRICE_ALERTS)).toEqual({});
  });

  it('accepts whole pesos only for the target', () => {
    const form = { ...INITIAL_NEW_ALERT_FORM, to: 'KIX' };
    expect(newAlertErrors({ ...form, targetInput: '9.5k' }, []).target).toBe(
      'Enter a whole amount in pesos, like 9,500.',
    );
    expect(newAlertErrors({ ...form, targetInput: '₱ 9,500' }, [])).toEqual({});
  });

  it('builds a target alert, or a drop alert without a target', () => {
    const form = { ...INITIAL_NEW_ALERT_FORM, to: 'KIX', targetInput: '12,000' };
    expect(toNewPriceAlert(form)).toMatchObject({
      from: 'MNL',
      to: 'KIX',
      mode: 'below',
      targetPrice: 12000,
      travelersLabel: '1 adult · Economy',
      channels: { push: true, email: true },
    });
    expect(toNewPriceAlert({ ...form, targetInput: '' })).toMatchObject({ mode: 'drop', targetPrice: null });
  });
});

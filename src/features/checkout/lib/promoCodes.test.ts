import { describe, expect, it } from 'vitest';

import { findPromoCode } from './promoCodes';

describe('promo codes', () => {
  it('matches codes regardless of case and spaces', () => {
    expect(findPromoCode(' vela1000 ')?.discount).toBe(1000);
    expect(findPromoCode('FREEFLIGHT')).toBeUndefined();
  });
});

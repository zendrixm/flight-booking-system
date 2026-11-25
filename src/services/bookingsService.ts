import { DEMO_CONFIRMED_CHECKOUT } from '@/mocks/confirmedCheckout';
import type { CheckoutState } from '@/types/checkout';

import { ApiError, mockRequest } from './mockApi';

/** The completed checkout behind a booking reference, as the confirmation page shows it. */
export function getConfirmedCheckout(reference: string): Promise<CheckoutState> {
  return mockRequest(() => {
    if (reference !== DEMO_CONFIRMED_CHECKOUT.confirmedReference) {
      throw new ApiError('not_found', `No booking with reference ${reference}.`);
    }
    return DEMO_CONFIRMED_CHECKOUT;
  });
}

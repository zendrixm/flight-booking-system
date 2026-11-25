import { useOutletContext } from 'react-router';

import type { CheckoutSelection, CheckoutState } from '@/types/checkout';

import type { TripPrice } from '../lib/pricing';

/** What `CheckoutLayout` hands to every step page. */
export interface CheckoutOutletContext {
  checkout: CheckoutState;
  selection: CheckoutSelection;
  price: TripPrice;
}

/** Read the checkout state inside a checkout step page. */
export function useCheckoutContext(): CheckoutOutletContext {
  return useOutletContext<CheckoutOutletContext>();
}

import { computeTripPrice } from '../lib/pricing';
import { useCheckout } from '../state/checkoutStore';
import { TripSummary } from './TripSummary';

/** The trip summary wired to the current checkout. Renders nothing before a flight is chosen. */
export function CheckoutTripSummary() {
  const checkout = useCheckout((state) => state);
  if (!checkout.selection) return null;
  return (
    <TripSummary
      selection={checkout.selection}
      option={checkout.selection.offer}
      price={computeTripPrice(checkout)}
      holdExpiresAt={checkout.holdExpiresAt}
    />
  );
}

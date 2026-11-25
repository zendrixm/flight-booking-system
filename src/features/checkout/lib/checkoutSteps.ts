import { paths } from '@/app/paths';
import { searchToQueryString } from '@/lib/flightSearchUrl';
import type { CheckoutStepId } from '@/types/checkout';
import type { FlightSearchParams } from '@/types/flight';

export interface CheckoutStep {
  id: CheckoutStepId;
  label: string;
  path: string;
}

export const CHECKOUT_STEPS: readonly CheckoutStep[] = [
  { id: 'flights', label: 'Flights', path: paths.flights },
  { id: 'travelers', label: 'Travelers', path: paths.checkout.travelers },
  { id: 'seats', label: 'Seats', path: paths.checkout.seats },
  { id: 'extras', label: 'Extras', path: paths.checkout.extras },
  { id: 'payment', label: 'Payment', path: paths.checkout.payment },
];

export const CHECKOUT_STEP_ORDER: readonly CheckoutStepId[] = CHECKOUT_STEPS.map((step) => step.id);

export function stepIndex(step: CheckoutStepId): number {
  return CHECKOUT_STEP_ORDER.indexOf(step);
}

/** Back to the results for the search being booked. */
export function resultsUrlFor(search: FlightSearchParams): string {
  return `${paths.flights}?${searchToQueryString(search)}`;
}

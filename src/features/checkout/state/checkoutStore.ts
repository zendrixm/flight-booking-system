import { createStore } from '@/lib/createStore';
import type {
  BagOptionId,
  CheckoutSelection,
  CheckoutState,
  CheckoutStepId,
  ExtrasSelection,
  SeatAssignments,
} from '@/types/checkout';
import type { ContactDetails, TravelerDetails } from '@/types/traveler';

import { AUTO_APPLIED_PROMO } from '../lib/promoCodes';

/** How long a fare is held once someone starts checking out. */
export const FARE_HOLD_MS = 20 * 60 * 1000;

const INITIAL_STATE: CheckoutState = {
  selection: null,
  holdExpiresAt: null,
  furthestStep: 'travelers',
  travelers: [],
  contact: null,
  saveTravelersToProfile: true,
  seats: { outbound: [], inbound: [] },
  extras: { bags: [], hasProtection: null, addOns: [] },
  promoCode: AUTO_APPLIED_PROMO,
  confirmedReference: null,
};

export const checkoutStore = createStore<CheckoutState>(INITIAL_STATE, { persistKey: 'vela.checkout' });

export const useCheckout = checkoutStore.useStore;

function update(patch: Partial<CheckoutState>) {
  checkoutStore.setState((state) => ({ ...state, ...patch }));
}

/** Starts a new checkout for the chosen flight and fare, holding the fare for 20 minutes. */
export function startCheckout(selection: CheckoutSelection, now = Date.now()): void {
  checkoutStore.setState({ ...INITIAL_STATE, selection, holdExpiresAt: now + FARE_HOLD_MS });
}

export function resetCheckout(): void {
  checkoutStore.setState(INITIAL_STATE);
}

export function reachStep(step: CheckoutStepId, order: readonly CheckoutStepId[]): void {
  const { furthestStep } = checkoutStore.getState();
  if (order.indexOf(step) > order.indexOf(furthestStep)) update({ furthestStep: step });
}

export function saveTravelers(
  travelers: TravelerDetails[],
  contact: ContactDetails,
  saveToProfile: boolean,
): void {
  const { seats, extras } = checkoutStore.getState();
  const resize = <Value>(values: Value[], fill: Value) =>
    travelers.map((_, index) => (index < values.length ? values[index] : fill));
  update({
    travelers,
    contact,
    saveTravelersToProfile: saveToProfile,
    seats: { outbound: resize(seats.outbound, null), inbound: resize(seats.inbound, null) },
    extras: { ...extras, bags: resize(extras.bags, 'included' as BagOptionId) },
  });
}

export function saveSeats(seats: SeatAssignments): void {
  update({ seats });
}

export function saveExtras(extras: ExtrasSelection): void {
  update({ extras });
}

export function setPromoCode(promoCode: string | null): void {
  update({ promoCode });
}

export function confirmCheckout(reference: string): void {
  update({ confirmedReference: reference, holdExpiresAt: null });
}

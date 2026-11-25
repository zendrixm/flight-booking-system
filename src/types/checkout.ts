import type { FareFamilyId, FlightOption, FlightSearchParams } from './flight';
import type { ContactDetails, TravelerDetails } from './traveler';

export type CheckoutStepId = 'flights' | 'travelers' | 'seats' | 'extras' | 'payment';

export type BagOptionId = 'included' | 'extra23' | 'extra32';

export type AddOnId = 'priority' | 'meal' | 'lounge';

export interface CheckoutSelection {
  search: FlightSearchParams;
  /** The flight as priced when it was chosen; the held fare doesn't change with later searches. */
  offer: FlightOption;
  fareFamily: FareFamilyId;
}

/** Seat codes per traveler, in traveler order; `null` means no seat chosen yet. */
export interface SeatAssignments {
  outbound: Array<string | null>;
  inbound: Array<string | null>;
}

export interface ExtrasSelection {
  bags: BagOptionId[];
  /** Travel protection must be an explicit choice, so it starts unanswered. */
  hasProtection: boolean | null;
  addOns: AddOnId[];
}

export interface CheckoutState {
  selection: CheckoutSelection | null;
  /** Epoch milliseconds when the held fare is released. */
  holdExpiresAt: number | null;
  /** The furthest step reached; earlier steps stay reachable from the header. */
  furthestStep: CheckoutStepId;
  travelers: TravelerDetails[];
  contact: ContactDetails | null;
  saveTravelersToProfile: boolean;
  seats: SeatAssignments;
  extras: ExtrasSelection;
  promoCode: string | null;
  /** Set once payment succeeds. */
  confirmedReference: string | null;
}

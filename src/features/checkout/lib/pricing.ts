import { seatPrice } from '@/data/seatMap';
import { travelerCountLabel } from '@/lib/format';
import type { CheckoutState } from '@/types/checkout';

import { ADD_ONS, bagOptionById, PROTECTION_PRICE_PER_TRAVELER } from './extrasCatalog';
import { findPromoCode } from './promoCodes';

export interface PriceLine {
  id: 'fare' | 'taxes' | 'seats' | 'bags' | 'protection' | 'addOns' | 'promo';
  label: string;
  amount: number;
}

export interface TripPrice {
  lines: PriceLine[];
  total: number;
}

/** Share of a fare that is taxes and carrier charges on the demo route. */
const TAX_SHARE = 6912 / 35372;

/** Splits a per-traveler fare into base fare and taxes, keeping the taxes a whole peso amount. */
export function splitFare(farePerTraveler: number): { base: number; taxes: number } {
  const taxes = Math.round(farePerTraveler * TAX_SHARE);
  return { base: farePerTraveler - taxes, taxes };
}

export function seatsTotal(seats: CheckoutState['seats']): number {
  return [...seats.outbound, ...seats.inbound].reduce((sum, code) => sum + (code ? seatPrice(code) : 0), 0);
}

export function chosenSeatCount(seats: CheckoutState['seats']): number {
  return [...seats.outbound, ...seats.inbound].filter(Boolean).length;
}

/** Every line of the price, in the order the trip summary and receipt show them. */
export function computeTripPrice(state: CheckoutState): TripPrice {
  if (!state.selection) return { lines: [], total: 0 };
  const { search, fareFamily, offer: option } = state.selection;
  const travelerCount = search.adults + search.children + search.infants;
  const { base, taxes } = splitFare(option.fares[fareFamily]);

  const lines: PriceLine[] = [
    {
      id: 'fare',
      label: `Fare · ${travelerCountLabel(search)}`,
      amount: base * travelerCount,
    },
    { id: 'taxes', label: 'Taxes and carrier fees', amount: taxes * travelerCount },
  ];

  const seats = seatsTotal(state.seats);
  if (seats) {
    lines.push({ id: 'seats', label: `Seats · ${chosenSeatCount(state.seats)} seats`, amount: seats });
  }

  const bags = state.extras.bags.reduce((sum, bag) => sum + bagOptionById(bag).price, 0);
  if (bags) lines.push({ id: 'bags', label: 'Extra baggage', amount: bags });

  if (state.extras.hasProtection) {
    lines.push({
      id: 'protection',
      label: 'Vela Protect',
      amount: PROTECTION_PRICE_PER_TRAVELER * travelerCount,
    });
  }

  const addOns = ADD_ONS.filter((addOn) => state.extras.addOns.includes(addOn.id)).reduce(
    (sum, addOn) => sum + addOn.price,
    0,
  );
  if (addOns) lines.push({ id: 'addOns', label: 'Comfort add-ons', amount: addOns });

  const promo = state.promoCode ? findPromoCode(state.promoCode) : undefined;
  if (promo && state.furthestStep === 'payment') {
    lines.push({ id: 'promo', label: `Promo ${promo.code}`, amount: -promo.discount });
  }

  return { lines, total: lines.reduce((sum, line) => sum + line.amount, 0) };
}

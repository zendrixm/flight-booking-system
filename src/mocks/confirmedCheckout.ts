import { SAVED_TRAVELERS } from '@/mocks/savedTravelers';
import type { CheckoutState } from '@/types/checkout';

import { MANILA_TOKYO_OPTIONS } from './flightOffers';

const [andrea, miguel] = SAVED_TRAVELERS;

/**
 * The completed checkout behind booking VL7Q2K. The confirmation page shows it when someone opens
 * the page directly instead of arriving from a payment, so the page always has a booking to show.
 */
export const DEMO_CONFIRMED_CHECKOUT: CheckoutState = {
  selection: {
    search: {
      tripType: 'round',
      from: 'MNL',
      to: 'HND',
      departDate: '2026-11-12',
      returnDate: '2026-11-19',
      adults: 2,
      children: 0,
      infants: 0,
      cabin: 'Economy',
    },
    offer: MANILA_TOKYO_OPTIONS[0],
    fareFamily: 'classic',
  },
  holdExpiresAt: null,
  furthestStep: 'payment',
  travelers: [andrea, miguel].map((saved) => ({
    title: saved.title,
    firstNames: saved.firstNames,
    lastName: saved.lastName,
    dateOfBirth: saved.dateOfBirth,
    nationality: saved.nationality,
    passportNumber: saved.passportNumber,
    passportExpiry: saved.passportExpiry,
    passportCountry: saved.passportCountry,
    loyaltyProgram: 'Meridian Miles',
    loyaltyNumber: saved.loyaltyNumber,
    assistance: saved.assistance,
  })),
  contact: {
    email: 'andrea.reyes@example.com',
    countryCode: 'PH +63',
    mobileNumber: '917 555 0123',
    wantsSmsUpdates: true,
  },
  saveTravelersToProfile: true,
  seats: { outbound: ['12A', '12B'], inbound: ['12A', '12B'] },
  extras: { bags: ['extra23', 'included'], hasProtection: true, addOns: [] },
  promoCode: 'VELA1000',
  confirmedReference: 'VL7Q2K',
};

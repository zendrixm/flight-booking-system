import { paths } from '@/app/paths';
import type { LegalDocument, LegalDocumentId } from '@/types/legal';

/**
 * The policies on /legal. Plain-language summaries first, then the full text that applies.
 * Kept as data so legal can update the copy without touching components.
 */
export const LEGAL_DOCUMENTS: Record<LegalDocumentId, LegalDocument> = {
  carriage: {
    id: 'carriage',
    label: 'Terms of carriage',
    title: 'Terms of carriage',
    updated: 'Last updated 1 September 2026 · applies to bookings made from that date',
    summary: [
      'Your contract of carriage is with the airline that operates your flight. Vela books it for you and stays your point of contact.',
      'If you booked at least 7 days before departure, you can cancel within 24 hours of purchase for a full refund on any fare.',
      'If the airline cancels your flight or moves it by more than 3 hours, you can pick another flight at no cost or get a full refund.',
    ],
    sections: [
      {
        id: 'who',
        title: 'Who you travel with',
        paragraphs: [
          'Vela Travel, Inc. ("Vela") sells flights as a booking agent. The airline that operates each flight — for example Meridian Air, Pacific Crest, Halcyon, Solenne or Kestrel Airways — carries you under its own conditions of carriage, which form part of your ticket.',
          'Where these terms and an airline’s conditions differ on something the airline controls, such as boarding, onboard service or denied boarding, the airline’s conditions apply. We show the operating airline on every itinerary and e-ticket.',
        ],
      },
      {
        id: 'fares',
        title: 'Fares and what they include',
        paragraphs: [
          'Every price shown is per traveler and already includes taxes, airport charges and carrier fees. The only extras are the ones you choose, such as bags, seats or insurance.',
          'Saver fares include a personal item only and cannot be changed or refunded. Classic fares include one 23 kg checked bag each way and can be changed for ₱2,500 per traveler plus any fare difference. Flex fares can be changed for free and refunded to travel credit.',
        ],
      },
      {
        id: 'changes',
        title: 'Changing or cancelling your trip',
        paragraphs: [
          'You can change or cancel online from Manage booking up to 3 hours before departure. We show the exact fee and refund before you confirm anything.',
          'Name corrections of up to 3 letters are free within 24 hours of booking. Changing a traveler to a different person is not possible on most fares.',
        ],
      },
      {
        id: 'disruption',
        title: 'Delays and cancellations by the airline',
        paragraphs: [
          'If your flight is cancelled, or its departure moves by more than 3 hours, we’ll contact you with options as soon as the airline tells us. You can accept the new flight, choose another one on the same route at no cost, or cancel for a full refund.',
          'For long delays, the airline is responsible for meals, refreshments and, if needed, accommodation. Passengers departing the Philippines are also protected by the Air Passenger Bill of Rights.',
        ],
      },
      {
        id: 'baggage',
        title: 'Baggage',
        paragraphs: [
          'Your allowance is shown on your itinerary and e-ticket. Bags added after booking are usually cheaper online than at the airport. Lost or damaged bags must be reported to the airline before you leave the arrivals hall.',
        ],
      },
      {
        id: 'documents',
        title: 'Passports, visas and check-in',
        paragraphs: [
          'Names on the booking must match each traveler’s passport. You’re responsible for having valid passports, visas and any health documents for every country on your route — we show the main requirements during booking, but the authorities have the final say.',
          'Online check-in opens 48 hours before departure and closes 60 minutes before for international flights. Airport check-in counters usually close 60 minutes before departure.',
        ],
      },
      {
        id: 'refunds',
        title: 'Refunds',
        paragraphs: [
          'Approved refunds go back to your original payment method within 7–14 business days, depending on your bank. If you prefer, you can take Vela travel credit instead: it arrives instantly and is worth 10% more.',
        ],
      },
      {
        id: 'liability',
        title: 'Our responsibility to you',
        paragraphs: [
          'We’re responsible for booking what you asked for, at the price we showed, and for passing your payments and requests to the airline promptly. We’re not responsible for the airline’s operation of the flight, but we’ll help you claim anything you’re owed.',
        ],
      },
    ],
    callToAction: {
      title: 'Need to change a trip?',
      body: 'Manage booking shows your options and the exact cost before you confirm.',
      label: 'Manage booking',
      to: paths.trips,
    },
  },
  terms: {
    id: 'terms',
    label: 'Terms of service',
    title: 'Terms of service',
    updated: 'Last updated 15 July 2026',
    summary: [
      'These terms cover using the Vela website, app and your account. Each flight is also covered by our terms of carriage.',
      'Prices are in Philippine pesos unless you choose another currency, and you pay the price shown at checkout.',
      'You can close your account at any time from Account settings.',
    ],
    sections: [
      {
        id: 'accept',
        title: 'Using Vela',
        paragraphs: [
          'By creating an account or making a booking you agree to these terms. You must be at least 18 to book, and you confirm you have permission to book for everyone on the reservation.',
        ],
      },
      {
        id: 'account',
        title: 'Your account',
        paragraphs: [
          'Keep your password private and turn on two-step verification. You’re responsible for bookings made from your account unless you tell us it has been used without your permission.',
          'You can update your details, saved travelers and payment methods at any time. Closing your account doesn’t cancel upcoming trips.',
        ],
      },
      {
        id: 'payment',
        title: 'Prices and payment',
        paragraphs: [
          'The price at checkout is the total you pay, including taxes and fees. When you add a card we may place a temporary ₱1 hold to confirm it with your bank; it disappears within a few days.',
          'If you pay in a currency other than pesos, your bank may charge a conversion fee. We show amounts in your chosen currency for reference only.',
        ],
      },
      {
        id: 'credit',
        title: 'Price alerts and travel credit',
        paragraphs: [
          'Price alerts tell you when fares change; they don’t reserve a seat or a price. Travel credit can be used on any Vela booking, can’t be exchanged for cash, and expires 12 months after it’s issued unless we say otherwise.',
        ],
      },
      {
        id: 'use',
        title: 'Fair use',
        paragraphs: [
          'Please don’t scrape our site, resell bookings, or make speculative reservations you don’t intend to use. We may cancel bookings or close accounts that break these rules, and we’ll refund anything you paid for flights you haven’t taken.',
        ],
      },
      {
        id: 'changes',
        title: 'Changes to these terms',
        paragraphs: [
          'If we make an important change, we’ll email you at least 30 days before it takes effect. The version in force when you book applies to that booking.',
        ],
      },
      {
        id: 'law',
        title: 'Governing law',
        paragraphs: [
          'These terms are governed by the laws of the Philippines. If we can’t settle a disagreement with you directly, it will be decided by the courts of Makati City, without affecting any rights you have under consumer protection law.',
        ],
      },
    ],
    callToAction: {
      title: 'Manage your account',
      body: 'Change your details, sign-in and preferences in one place.',
      label: 'Account settings',
      to: paths.account.settings,
    },
  },
  privacy: {
    id: 'privacy',
    label: 'Privacy notice',
    title: 'Privacy notice',
    updated:
      'Last updated 1 August 2026 · in line with the Data Privacy Act of 2012 (Republic Act No. 10173)',
    summary: [
      'We collect what we need to book and support your trips, and nothing we’d be uncomfortable explaining.',
      'Airlines and authorities receive the traveler details they legally require. We never sell your personal data.',
      'You can see, correct, download or delete your data from Account settings.',
    ],
    sections: [
      {
        id: 'collect',
        title: 'What we collect',
        paragraphs: [
          'Account details (name, email, mobile), traveler details (names, dates of birth, passport numbers), booking and payment records, and how you use our site, such as searches and price alerts. Card numbers are held by our payment provider; we only see the last four digits.',
        ],
      },
      {
        id: 'use',
        title: 'How we use it',
        paragraphs: [
          'To make and manage bookings, send trip updates, prevent fraud, answer your questions and improve our service. With your permission, we also use it to send deals and personalise what you see.',
        ],
      },
      {
        id: 'share',
        title: 'Who we share it with',
        paragraphs: [
          'The airlines you fly with, our payment provider, and government authorities that require advance passenger information. Service providers that help us run Vela, such as cloud hosting and customer support tools, only process data on our instructions.',
        ],
      },
      {
        id: 'keep',
        title: 'How long we keep it',
        paragraphs: [
          'We keep booking and payment records for as long as tax and aviation rules require — usually 10 years. Searches and alert history are deleted after 24 months, or straight away when you delete your account.',
        ],
      },
      {
        id: 'rights',
        title: 'Your rights',
        paragraphs: [
          'You can ask to access, correct, download or erase your personal data, or object to how we use it. Most requests take a few clicks in Account settings; for anything else, write to us. You can also complain to the National Privacy Commission.',
        ],
      },
      {
        id: 'security',
        title: 'How we protect it',
        paragraphs: [
          'Data is encrypted in transit and at rest, staff access is limited to people who need it for their job, and every access to customer records in our console is logged.',
        ],
      },
      {
        id: 'dpo',
        title: 'Our Data Protection Officer',
        paragraphs: [
          'You can reach our Data Protection Officer at privacy@vela.travel or by post at Vela Travel, Inc., 88 Rizal Avenue, Makati City 1200, Philippines.',
        ],
      },
    ],
    callToAction: {
      title: 'See or download your data',
      body: 'Request a copy, change what we email you, or delete your account.',
      label: 'Privacy settings',
      to: `${paths.account.settings}#privacy`,
    },
  },
  cookies: {
    id: 'cookies',
    label: 'Cookie policy',
    title: 'Cookie policy',
    updated: 'Last updated 1 August 2026',
    summary: [
      'Essential cookies keep you signed in and your booking safe — they’re always on.',
      'Everything else is your choice, and you can change it here at any time.',
      'We don’t use cookies to sell your data.',
    ],
    sections: [
      {
        id: 'what',
        title: 'What cookies are',
        paragraphs: [
          'Cookies are small files your browser stores so a site can remember things between pages and visits, like your currency or the flight you were looking at.',
        ],
      },
      {
        id: 'essential',
        title: 'Essential',
        paragraphs: [
          'Needed for sign-in, checkout, fraud protection and remembering your cookie choices. Without them the site can’t work, so they can’t be switched off.',
        ],
      },
      {
        id: 'analytics',
        title: 'Analytics',
        paragraphs: [
          'Tell us which pages are slow or confusing, using aggregated data. We don’t use them to identify you.',
        ],
      },
      {
        id: 'personal',
        title: 'Personalisation',
        paragraphs: ['Remember recent searches and suggest destinations based on trips you’ve taken.'],
      },
      {
        id: 'ads',
        title: 'Advertising',
        paragraphs: [
          'Let selected partners show you Vela fares on other sites. They’re off unless you turn them on.',
        ],
      },
      {
        id: 'manage',
        title: 'Managing cookies',
        paragraphs: [
          'Use the switches above, or clear cookies in your browser settings. If you clear them, we’ll ask for your choices again on your next visit.',
        ],
      },
    ],
    callToAction: {
      title: 'Prefer fewer emails too?',
      body: 'Choose which emails you get from Vela in Account settings.',
      label: 'Email preferences',
      to: `${paths.account.settings}#emails`,
    },
  },
};

/** Tab order on the page. Terms of carriage opens first. */
export const LEGAL_DOCUMENT_ORDER: readonly LegalDocumentId[] = ['carriage', 'terms', 'privacy', 'cookies'];

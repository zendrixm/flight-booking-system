import { AIRLINES, findAirport } from '@/data/airports';
import { addDays, formatDayLabel, formatLongDayLabel } from '@/lib/date';
import { formatPeso, joinWithAnd, pluralize } from '@/lib/format';
import type { CheckoutState } from '@/types/checkout';
import type { FlightLeg } from '@/types/flight';
import type { ReceiptLine } from '@/types/trip';

import { ADD_ONS, bagOptionById } from './extrasCatalog';
import { computeTripPrice, splitFare } from './pricing';

/** Demo values that a real booking API would return with the confirmation. */
const BOOKED_AT_LABEL = '9 Oct 2026, 00:41';
const AIRLINE_REFERENCE = 'MR-4KQ8ZT';
const RECEIPT_NUMBER = 'VR-2610-48127';
const TICKET_NUMBER_BASE = 2401938476;

export interface ConfirmedLeg {
  kind: 'Depart' | 'Return';
  dateLabel: string;
  flightLabel: string;
  leg: FlightLeg;
  fromLabel: string;
  toLabel: string;
  chips: string[];
}

export interface ConfirmedTraveler {
  name: string;
  firstName: string;
  initials: string;
  ticketNumber: string;
  seats: string[];
  bags: string;
  passportLabel: string;
}

export interface Confirmation {
  reference: string;
  airlineReference: string;
  bookedAt: string;
  email: string;
  destinationCity: string;
  destinationCountry: string;
  airlineName: string;
  legs: ConfirmedLeg[];
  travelers: ConfirmedTraveler[];
  total: number;
  paidWith: string;
  summaryLines: Array<{ label: string; amount: number }>;
  receiptNumber: string;
  receiptLines: ReceiptLine[];
  timeline: Array<{ when: string; title: string; body: string; status: 'done' | 'current' | 'upcoming' }>;
}

function airportLabel(code: string, terminal: string | undefined) {
  const airport = findAirport(code);
  const place = airport ? (airport.city === 'Tokyo' ? `Tokyo ${airport.name}` : airport.city) : code;
  return terminal ? `${place} · Terminal ${terminal.replace(/^T/, '')}` : place;
}

/** Turns a paid checkout into everything the confirmation page and its dialogs display. */
export function buildConfirmation(state: CheckoutState, email: string): Confirmation | null {
  const { selection, confirmedReference } = state;
  if (!selection || !confirmedReference) return null;

  const { offer, search, fareFamily } = selection;
  const airline = AIRLINES[offer.airlineId];
  const destination = findAirport(search.to);
  const fareName = fareFamily.charAt(0).toUpperCase() + fareFamily.slice(1);
  const travelerCount = state.travelers.length;
  const price = computeTripPrice(state);
  const { base } = splitFare(offer.fares[fareFamily]);

  const legs = [offer.outbound, ...(search.returnDate ? [offer.inbound] : [])];
  const extraBags = state.extras.bags.filter((bag) => bag !== 'included').length;
  const checkedBags = travelerCount + extraBags;
  const seatList = (segment: 'outbound' | 'inbound') => state.seats[segment].filter(Boolean) as string[];

  const travelers: ConfirmedTraveler[] = state.travelers.map((traveler, index) => {
    const bag = bagOptionById(state.extras.bags[index] ?? 'included');
    return {
      name: `${traveler.firstNames} ${traveler.lastName}`,
      firstName: traveler.firstNames.split(' ')[0],
      initials: `${traveler.firstNames[0] ?? ''}${traveler.lastName[0] ?? ''}`,
      ticketNumber: `618 ${TICKET_NUMBER_BASE + index}`,
      seats: [state.seats.outbound[index], state.seats.inbound[index]].map((code) => code ?? 'At check-in'),
      bags: `${bag.id === 'included' ? 1 : 2} × 23 kg`,
      passportLabel: `Passport ••••${traveler.passportNumber.slice(-4)} · expires ${traveler.passportExpiry.slice(0, 4)}`,
    };
  });

  const receiptLines: ReceiptLine[] = price.lines.map((line) => {
    switch (line.id) {
      case 'fare':
        return {
          label: `Fare · ${fareName}, ${search.cabin}`,
          detail: `${pluralize(travelerCount, 'adult')} × ${formatPeso(base)} · ${legs.map((leg) => leg.flightNumber).join(' and ')}`,
          amount: line.amount,
        };
      case 'taxes':
        return {
          label: line.label,
          detail: 'Government taxes, airport and carrier charges',
          amount: line.amount,
        };
      case 'seats':
        return {
          label: 'Seats',
          detail: `${joinWithAnd([...new Set([...seatList('outbound'), ...seatList('inbound')])])}`,
          amount: line.amount,
        };
      case 'bags':
        return {
          label: 'Extra baggage',
          detail: `${extraBags} × 23 kg on both flights`,
          amount: line.amount,
        };
      case 'protection':
        return {
          label: 'Vela Protect',
          detail: `Trip cover for ${pluralize(travelerCount, 'traveler')}`,
          amount: line.amount,
        };
      case 'addOns':
        return {
          label: 'Comfort add-ons',
          detail: joinWithAnd(
            ADD_ONS.filter((addOn) => state.extras.addOns.includes(addOn.id)).map((addOn) => addOn.label),
          ),
          amount: line.amount,
        };
      case 'promo':
        return { label: line.label, detail: 'Discount applied at checkout', amount: line.amount };
    }
  });

  const firstFlight = offer.outbound;
  const checkInOpens = addDays(firstFlight.date, -2);
  const [departHour, departMinute] = firstFlight.departureTime.split(':').map(Number);
  const arriveBy = `${String(departHour - 3).padStart(2, '0')}:${String(departMinute).padStart(2, '0')}`;

  return {
    reference: confirmedReference,
    airlineReference: AIRLINE_REFERENCE,
    bookedAt: BOOKED_AT_LABEL,
    email,
    destinationCity: destination?.city ?? search.to,
    destinationCountry: destination?.country ?? '',
    airlineName: airline.name,
    legs: legs.map((leg, index) => ({
      kind: index === 0 ? 'Depart' : 'Return',
      dateLabel: formatLongDayLabel(leg.date),
      flightLabel: `${airline.name} ${leg.flightNumber}${leg.aircraft ? ` · ${leg.aircraft}` : ''}`,
      leg,
      fromLabel: airportLabel(leg.from, leg.departureTerminal),
      toLabel: airportLabel(leg.to, leg.arrivalTerminal),
      chips: [
        `${fareName} · ${search.cabin}`,
        `Seats ${seatList(index === 0 ? 'outbound' : 'inbound').join(', ') || 'at check-in'}`,
        `${checkedBags} × 23 kg checked`,
      ],
    })),
    travelers,
    total: price.total,
    paidWith: `Card ending 4821 · ${BOOKED_AT_LABEL}`,
    summaryLines: price.lines.map((line) => ({
      label: line.label.replace(/ · \d+ seats$/, ''),
      amount: line.amount,
    })),
    receiptNumber: RECEIPT_NUMBER,
    receiptLines,
    timeline: [
      {
        when: 'Today',
        title: 'Booking confirmed and tickets issued',
        body: `E-tickets sent to ${email}.`,
        status: 'done',
      },
      {
        when: `${formatDayLabel(checkInOpens)} · ${firstFlight.departureTime}`,
        title: 'Online check-in opens',
        body: 'We’ll remind you. Boarding passes go straight to your phone.',
        status: 'current',
      },
      {
        when: `${formatDayLabel(firstFlight.date)} · ${arriveBy}`,
        title: `Arrive at ${airportLabel(firstFlight.from, firstFlight.departureTerminal).replace(' · ', ' ')}`,
        body: 'Bag drop closes 60 minutes before departure for international flights.',
        status: 'upcoming',
      },
      {
        when: `${formatDayLabel(firstFlight.date)} · ${firstFlight.departureTime}`,
        title: `Depart for ${destination?.city ?? search.to}`,
        body: 'Gate details appear in the app about 2 hours before.',
        status: 'upcoming',
      },
    ],
  };
}

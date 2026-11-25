import { DEMO_TODAY } from '@/config/demo';
import { AIRLINE_NAMES } from '@/data/airlineDesignators';
import { addDays, daysBetween, formatCompactDay, formatDayMonth, type IsoDate } from '@/lib/date';
import { formatPeso } from '@/lib/format';
import type {
  AirlineCode,
  ConsoleBooking,
  ConsoleBookingStatus,
  FareName,
  PaymentState,
} from '@/types/console/booking';
import type {
  ActivityEvent,
  ActivityTone,
  BookingDetail,
  CouponDetail,
  InternalNote,
  LedgerEntry,
  MoneyLine,
  RefundOption,
  RefundReason,
  RefundType,
  SegmentDetail,
  TravelerDetail,
} from '@/types/console/bookingDetail';
import { AGENT_REFUND_LIMIT } from '@/types/console/bookingDetail';
import type { StatusLabel } from '@/types/console/dashboard';

import { DEMO_STAFF_MEMBER } from './staff';

/**
 * Builds the booking detail the console shows from a ledger booking plus everything staff have
 * done to it this session (the "case"). Details the ledger doesn't store — flight times, seats,
 * e-ticket numbers — are derived from the reference with a stable hash, so they never change.
 */

export type CaseStatus = ConsoleBookingStatus | 'Refunded' | 'Partially refunded';
export type CasePayment = PaymentState | 'Partially refunded';

export interface BookingCase {
  status: CaseStatus;
  payment: CasePayment;
  refunded: RefundType | null;
  refundReason: RefundReason | null;
  pendingRefund: { type: RefundType; amount: number; reason: RefundReason } | null;
  /** Reissue reason by traveler index. */
  reissued: Record<number, string>;
  /** Corrected names by traveler index. */
  renamed: Record<number, string>;
  dayShift: number;
  /** Staff actions this session, newest first. */
  events: ActivityEvent[];
  notes: InternalNote[];
  isPaymentLinkSent: boolean;
}

export const STAFF_NAME = DEMO_STAFF_MEMBER.fullName;
export const NOW_LABEL = '9 Oct 00:58';

/* ---------- Reference data ---------- */

const TIME_ZONE_OFFSET: Record<string, number> = {
  MNL: 8,
  CEB: 8,
  HND: 9,
  NRT: 9,
  ICN: 9,
  SIN: 8,
  TPE: 8,
  BKK: 7,
  HKG: 8,
};
const FLIGHT_MINUTES: Record<string, number> = {
  'MNL-HND': 255,
  'MNL-NRT': 250,
  'CEB-NRT': 265,
  'CEB-HND': 265,
  'MNL-ICN': 235,
  'CEB-ICN': 250,
  'MNL-SIN': 215,
  'MNL-TPE': 125,
  'MNL-BKK': 205,
  'MNL-HKG': 125,
  'MNL-CEB': 85,
};
/** Real schedules for the flights other screens mention: [flight number, departure minute, arrival minute]. */
const SCHEDULES: Record<string, [string, number, number?]> = {
  'MR MNL-HND': ['MR 431', 520, 835],
  'MR HND-MNL': ['MR 432', 930, 1160],
  'MR MNL-SIN': ['MR 518', 435, 650],
  'PQ HND-MNL': ['PQ 117', 760],
  'PQ MNL-HND': ['PQ 122', 365],
  'SJ MNL-TPE': ['SJ 205', 615],
  'HC MNL-ICN': ['HC 902', 1370],
  'HC ICN-MNL': ['HC 911', 485],
  'KS MNL-NRT': ['KS 81', 75],
};
const TERMINALS: Record<string, (airline: AirlineCode) => string> = {
  MNL: (airline) => (airline === 'MR' ? 'T1' : 'T3'),
  HND: () => 'T3',
  NRT: () => 'T1',
  ICN: () => 'T1',
  SIN: () => 'T3',
  CEB: () => 'T2',
  TPE: () => 'T1',
  BKK: () => '',
  HKG: () => 'T1',
};
const AIRCRAFT: Record<AirlineCode, string> = {
  MR: 'A321neo',
  PQ: 'Boeing 737 MAX 8',
  HC: 'A330-300',
  SJ: 'A320neo',
  KS: 'Boeing 787-9',
};
const TICKET_STOCK: Record<AirlineCode, string> = { MR: '618', PQ: '297', HC: '180', SJ: '160', KS: '205' };
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const FEMALE_NAMES = new Set([
  'Andrea',
  'Hana',
  'Priya',
  'Mei',
  'Sophie',
  'Grace',
  'Lara',
  'Rina',
  'Marisol',
  'Tricia',
  'Bianca',
  'Celeste',
  'Maria',
  'Angela',
  'Kristine',
  'Patricia',
  'Camille',
  'Isabel',
  'Nicole',
  'Trisha',
  'Sofia',
  'Erika',
  'Hannah',
  'Aiko',
  'Wei',
  'Chloe',
  'Carmela',
  'Elena',
  'Ines',
  'Jasmine',
  'Monica',
  'Olivia',
  'Pia',
  'Samantha',
  'Yumi',
  'Zoe',
  'Ella',
  'Carmen',
  'Lucia',
  'Mia',
  'Ana',
]);
const COMPANION_MALE = ['Rafael', 'Tomas', 'Nico', 'Andres', 'Luis', 'Gabriel'];
const COMPANION_FEMALE = ['Ella', 'Carmen', 'Lucia', 'Mia', 'Ana', 'Bianca'];
/** Customer accounts for the travelers other console pages talk about: [handle, account label, mobile]. */
const KNOWN_CUSTOMERS: Record<string, [string, string, string]> = {
  'Andrea Lim Reyes': ['andrea', 'Andrea Reyes · Gold member', '+63 917 123 4567'],
  'Joseph Tan': ['joseph', 'Joseph Tan · Member', '+63 918 220 1043'],
  'Hana Watanabe': ['hana', 'Hana Watanabe · Platinum member', '+81 90 1234 5678'],
  'Carlo Mendoza': ['carlo', 'Carlo Mendoza · Silver member', '+63 917 555 0199'],
  'Priya Raman': ['priya', 'Priya Raman · Silver member', '+65 8123 4567'],
  'Marco Villanueva': ['marco', 'Marco Villanueva · Gold member', '+63 932 410 8820'],
  'Sophie Laurent': ['sophie', 'Sophie Laurent · Member', '+33 6 12 34 56 78'],
  'Lara Santos': ['lara', 'Lara Santos · Member', '+63 945 300 2210'],
};
/** When customers asked for a refund: [day offset from today, minute of the day]. */
const REFUND_REQUESTED_AT: Record<string, [number, number]> = {
  VL1FJS: [-2, 1330],
  VL8KQN: [-1, 570],
  VL3HBC: [-3, 842],
  VL6TQP: [-1, 1245],
  VL2WZX: [-4, 690],
  VL9KMN: [-1, 372],
};
export const SEEDED_NOTES: Record<string, InternalNote[]> = {
  VL7Q2K: [
    {
      author: 'Ramon Diaz',
      when: '9 Oct, 00:44',
      text: 'Customer asked about a visa letter for Miguel. Sent the template.',
    },
  ],
  VL4TRB: [
    {
      author: 'Ian Cruz',
      when: '9 Oct, 00:40',
      text: 'Meridian Air rejected the K-class fare twice. Seat is held — retry before 02:00 or rebook in M.',
    },
  ],
  VL8KQN: [
    {
      author: 'Ramon Diaz',
      when: '8 Oct, 09:41',
      text: 'Kestrel retimed the flight by 5 hours. Customer will miss the Narita connection and wants all four tickets refunded.',
    },
  ],
  VL1FJS: [
    {
      author: 'Bea Santos',
      when: '8 Oct, 10:02',
      text: 'Classic fare — only taxes are refundable. Offered travel credit as an alternative, waiting on the customer.',
    },
  ],
  VL2MPE: [
    {
      author: 'System',
      when: '9 Oct, 00:19',
      text: 'Issuer declined the card (code 51). Seats held for 24 hours.',
    },
  ],
};

const STATUS_TONE: Record<CaseStatus, StatusLabel['tone']> = {
  Ticketed: 'success',
  Ticketing: 'warning',
  'Payment failed': 'danger',
  'Checked in': 'muted',
  'Schedule change': 'warning',
  'Refund requested': 'warning',
  Cancelled: 'muted',
  Flown: 'muted',
  'Awaiting payment': 'warning',
  'Partially refunded': 'warning',
  Refunded: 'muted',
};
/** Statuses that mean e-tickets exist. */
export const ISSUED_STATUSES: readonly CaseStatus[] = [
  'Ticketed',
  'Checked in',
  'Schedule change',
  'Refund requested',
  'Flown',
  'Partially refunded',
];

/* ---------- Helpers ---------- */

/** FNV-1a: a small stable string hash. */
export function hashString(text: string): number {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

const clockTime = (minutes: number) => {
  const minuteOfDay = ((minutes % 1440) + 1440) % 1440;
  return `${String(Math.floor(minuteOfDay / 60)).padStart(2, '0')}:${String(minuteOfDay % 60).padStart(2, '0')}`;
};

/** Minutes since today began; negative before today. */
const minutesSinceToday = (date: IsoDate, minuteOfDay: number) =>
  daysBetween(DEMO_TODAY, date) * 1440 + minuteOfDay;
/** "8 Oct 09:41" for a moment counted from the start of today. */
const momentLabel = (minutes: number) =>
  `${formatDayMonth(addDays(DEMO_TODAY, Math.floor(minutes / 1440)))} ${clockTime(minutes)}`;
const createdMinute = (booking: ConsoleBooking) => {
  const [hours, minutes] = booking.createdAt.slice(11).split(':').map(Number);
  return hours * 60 + minutes;
};

export const event = (
  title: string,
  body: string,
  tone: ActivityTone = 'neutral',
  when = NOW_LABEL,
): ActivityEvent => ({ title, body, when, tone });

/* ---------- The parts that never change for a booking ---------- */

interface Person {
  first: string;
  last: string;
  title: string;
  type: string;
  dateOfBirth: string;
  ticket: string;
  seats: string;
  bags: string;
  document: string;
}

interface Segment {
  flightNumber: string;
  date: IsoDate;
  from: string;
  to: string;
  departure: string;
  arrival: string;
  detail: string;
  routeCode: string;
}

export interface BookingFacts {
  segments: Segment[];
  people: Person[];
  customer: [string, string, string] | undefined;
  cardLast4: string;
  record: string;
  moneyLines: MoneyLine[];
  fare: FareName;
  fareClass: string;
  refundAmounts: Record<RefundType, number>;
}

export function bookingFacts(booking: ConsoleBooking): BookingFacts {
  const hash = hashString(booking.reference);
  const [origin, destination] = booking.route.split(/ ⇄ | → /);
  const isReturn = booking.route.includes('⇄');
  const stayNights = booking.reference === 'VL7Q2K' ? 7 : booking.reference === 'VL3MZ8' ? 3 : 3 + (hash % 9);
  const fare: FareName =
    booking.manual?.fare ??
    (['VL7Q2K', 'VL1FJS', 'VL9KMN'].includes(booking.reference)
      ? 'Classic'
      : (['Saver', 'Classic', 'Classic', 'Flex'] as const)[hash % 4]);
  const fareClass = { Saver: 'Q', Classic: 'K', Flex: 'Y' }[fare];

  const segment = (from: string, to: string, date: IsoDate): Segment => {
    const key = `${booking.airline} ${from}-${to}`;
    const keyHash = hashString(key);
    const schedule = SCHEDULES[key];
    const duration = FLIGHT_MINUTES[`${from}-${to}`] ?? FLIGHT_MINUTES[`${to}-${from}`] ?? 180;
    const departure = schedule ? schedule[1] : 360 + (keyHash % 48) * 15;
    const arrival =
      schedule?.[2] ??
      departure + duration + ((TIME_ZONE_OFFSET[to] ?? 8) - (TIME_ZONE_OFFSET[from] ?? 8)) * 60;
    const withTerminal = (airport: string) => {
      const terminal = TERMINALS[airport]?.(booking.airline) ?? '';
      return terminal ? `${airport} ${terminal}` : airport;
    };
    return {
      flightNumber: schedule ? schedule[0] : `${booking.airline} ${300 + (keyHash % 600)}`,
      date,
      from: withTerminal(from),
      to: withTerminal(to),
      departure: clockTime(departure),
      arrival: `${clockTime(arrival)}${arrival >= 1440 ? ' +1' : ''}`,
      detail: `${AIRCRAFT[booking.airline]} · Economy (${fareClass})`,
      routeCode: `${from}–${to}`,
    };
  };

  const segments = [segment(origin, destination, booking.departureDate)];
  if (isReturn) segments.push(segment(destination, origin, addDays(booking.departureDate, stayNights)));

  const nameParts = booking.leadTraveler.split(' ');
  const hasTwoWordSurname = nameParts.length > 2 && ['Dela', 'Del'].includes(nameParts[nameParts.length - 2]);
  const surname = (hasTwoWordSurname ? nameParts.slice(-2) : nameParts.slice(-1)).join(' ');
  const given = (hasTwoWordSurname ? nameParts.slice(0, -2) : nameParts.slice(0, -1)).join(' ');
  const isFemale = FEMALE_NAMES.has(nameParts[0]);
  const dateOfBirth = (seed: number, year: number) => `${1 + (seed % 27)} ${MONTHS[seed % 12]} ${year}`;

  const people: Person[] = [
    {
      first: given,
      last: surname,
      title: isFemale ? 'MS' : 'MR',
      type: 'Adult',
      dateOfBirth: dateOfBirth(hash, 1976 + (hash % 20)),
      ticket: '',
      seats: '',
      bags: '',
      document: '',
    },
  ];
  for (let index = 1; index < booking.travelerCount; index += 1) {
    const personHash = hashString(booking.reference + index);
    const female = index === 1 ? !isFemale : personHash % 2 === 0;
    const isChild = index >= 2;
    people.push({
      first: (female ? COMPANION_FEMALE : COMPANION_MALE)[personHash % 6],
      last: surname,
      title: isChild ? (female ? 'MISS' : 'MSTR') : female ? 'MS' : 'MR',
      type: isChild ? `Child · ${5 + (personHash % 8)}` : 'Adult',
      dateOfBirth: dateOfBirth(personHash, isChild ? 2026 - 6 - (personHash % 8) : 1978 + (personHash % 18)),
      ticket: '',
      seats: '',
      bags: '',
      document: '',
    });
  }
  if (booking.reference === 'VL7Q2K') {
    people[0].dateOfBirth = '24 Jun 1991';
    people[1].first = 'Miguel';
    people[1].dateOfBirth = '11 Feb 1989';
  }

  const knownTickets: Record<string, string[]> = {
    VL7Q2K: ['618-2401938476', '618-2401938477'],
    VL3MZ8: ['618-2401870215'],
  };
  const seatRow = 8 + (hash % 30);
  people.forEach((person, index) => {
    person.ticket =
      knownTickets[booking.reference]?.[index] ??
      `${TICKET_STOCK[booking.airline]}-24${String(10_000_000 + (hashString(`${booking.reference}t${index}`) % 89_999_999)).slice(0, 8)}`;
    const seat = `${seatRow}${'ABCDEF'[index % 6]}`;
    person.seats = isReturn ? `${seat} · ${seat}` : seat;
    person.bags =
      booking.reference === 'VL7Q2K'
        ? index === 0
          ? '2 × 23 kg'
          : '1 × 23 kg'
        : fare === 'Saver'
          ? 'Cabin only'
          : fare === 'Flex'
            ? '2 × 23 kg'
            : '1 × 23 kg';
    person.document = booking.reference === 'VL7Q2K' && index === 1 ? 'Visa not verified' : 'Passport valid';
  });
  if (booking.reference === 'VL7Q2K') {
    people[0].seats = '12A · 12A';
    people[1].seats = '12B · 12B';
  }

  const isDemoCard = booking.reference === 'VL7Q2K' || booking.reference === 'VL3MZ8';
  const cardLast4 = isDemoCard ? '4821' : String(1000 + (hash % 9000));
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const record =
    booking.reference === 'VL7Q2K'
      ? 'MR-4KQ8ZT'
      : `${booking.airline}-${booking.reference.slice(2)}${letters[hash % 24]}${letters[(hash >>> 5) % 24]}`;

  const fareShare = Math.round((booking.total * 0.74) / 10) * 10;
  const taxShare = Math.round((booking.total * 0.19) / 10) * 10;
  const moneyLines: MoneyLine[] =
    booking.reference === 'VL7Q2K'
      ? [
          { label: 'Fare · 2 adults', amount: 28_460 },
          { label: 'Taxes and carrier fees', amount: 6_912 },
          { label: 'Seats', amount: 1_800 },
          { label: 'Extra baggage', amount: 2_400 },
          { label: 'Vela Protect', amount: 1_290 },
          { label: 'Promo VELA1000', amount: -1_000 },
        ]
      : [
          {
            label: `Fare · ${booking.travelerCount} ${booking.travelerCount === 1 ? 'traveler' : 'travelers'}`,
            amount: fareShare,
          },
          { label: 'Taxes and carrier fees', amount: taxShare },
          { label: 'Seats and bags', amount: booking.total - fareShare - taxShare },
        ];
  const refundableTaxes = booking.reference === 'VL7Q2K' ? 9_312 : booking.total - fareShare;

  return {
    segments,
    people,
    customer: KNOWN_CUSTOMERS[booking.leadTraveler],
    cardLast4,
    record,
    moneyLines,
    fare,
    fareClass,
    refundAmounts: {
      full: booking.total,
      taxes: refundableTaxes,
      custom: booking.reference === 'VL7Q2K' ? 4_656 : Math.round(refundableTaxes / booking.travelerCount),
    },
  };
}

export function initialCase(booking: ConsoleBooking): BookingCase {
  return {
    status: booking.status,
    payment: booking.payment,
    refunded: null,
    refundReason: null,
    pendingRefund: null,
    reissued: {},
    renamed: {},
    dayShift: 0,
    events: [],
    notes: [...(SEEDED_NOTES[booking.reference] ?? [])],
    isPaymentLinkSent: false,
  };
}

/** The e-ticket number after a reissue: same stock and series, new last three digits. */
export function reissuedTicket(ticket: string): string {
  return `${ticket.slice(0, -3)}${String((Number(ticket.slice(-3)) + 503) % 1000).padStart(3, '0')}`;
}

export function travelerName(facts: BookingFacts, bookingCase: BookingCase, index: number): string {
  const person = facts.people[index];
  return bookingCase.renamed[index] ?? `${person.first} ${person.last}`;
}

export function maskedPhone(booking: ConsoleBooking, facts: BookingFacts): string {
  return `+•• ••• ••• ${facts.customer ? facts.customer[2].slice(-4) : String(1000 + (hashString(`${booking.reference}p`) % 9000))}`;
}

export function fullPhone(booking: ConsoleBooking, facts: BookingFacts): string {
  return (
    facts.customer?.[2] ??
    `+63 917 ${String(100 + (hashString(booking.reference) % 900))} ${String(1000 + (hashString(`${booking.reference}p`) % 9000))}`
  );
}

export function paymentHoldUntil(booking: ConsoleBooking): string {
  return `${formatCompactDay(addDays(booking.createdAt.slice(0, 10) as IsoDate, 1))}, ${booking.createdAt.slice(11)}`;
}

/* ---------- The detail view ---------- */

export function buildBookingDetail(booking: ConsoleBooking, bookingCase: BookingCase): BookingDetail {
  const facts = bookingFacts(booking);
  const { status, payment, refunded, pendingRefund } = bookingCase;
  const isIssued = ISSUED_STATUSES.includes(status);
  const isCaptured = payment === 'Captured' || payment === 'Partially refunded';
  const created = minutesSinceToday(booking.createdAt.slice(0, 10) as IsoDate, createdMinute(booking));
  const at = (offset: number) => momentLabel(created + offset);
  const airline = AIRLINE_NAMES[booking.airline];
  const isManual = Boolean(booking.manual);
  const method = isManual
    ? payment === 'Invoiced'
      ? 'Corporate invoice'
      : 'Payment link'
    : `Card ending ${facts.cardLast4}`;
  const refundDestination = isManual ? 'the customer' : `card ending ${facts.cardLast4}`;
  const refundedAmount = refunded ? facts.refundAmounts[refunded] : 0;
  const ticketOf = (index: number) => {
    const ticket = facts.people[index].ticket;
    return bookingCase.reissued[index] ? reissuedTicket(ticket) : ticket;
  };
  const nameOf = (index: number) => travelerName(facts, bookingCase, index);
  const isReleased = (index: number) =>
    refunded === 'taxes' ||
    refunded === 'full' ||
    (refunded === 'custom' && index === facts.people.length - 1);

  const segments: SegmentDetail[] = facts.segments.map((segment, index) => {
    let label = 'On schedule';
    let tone: StatusLabel['tone'] = 'success';
    let detail = segment.detail;
    let departure = segment.departure;
    if (status === 'Cancelled' || status === 'Refunded' || refunded === 'taxes') {
      label = 'Cancelled';
      tone = 'muted';
    } else if (segment.date < DEMO_TODAY) {
      label = 'Flown';
      tone = 'muted';
    } else if (status === 'Schedule change' && index === 0) {
      label = 'Retimed +5h';
      tone = 'warning';
      detail = `Was 06:10 · ${segment.detail}`;
      departure = '11:10';
    } else if (!isIssued) {
      label = status === 'Ticketing' ? 'Seat held' : 'Not ticketed';
      tone = 'warning';
    }
    return {
      flightNumber: segment.flightNumber,
      date: addDays(segment.date, bookingCase.dayShift),
      departureTime: departure,
      arrivalTime: segment.arrival,
      from: segment.from,
      to: segment.to,
      routeCode: segment.routeCode,
      detail,
      status: { label, tone },
    };
  });

  const travelers: TravelerDetail[] = facts.people.map((person, index) => {
    const words = nameOf(index).split(' ');
    return {
      recordName: `${words[words.length - 1].toUpperCase()} / ${words.slice(0, -1).join(' ').toUpperCase()} ${person.title}`,
      displayName: nameOf(index),
      summary: `${person.type} · DOB ${person.dateOfBirth}`,
      ticketNumber: isIssued || refunded ? ticketOf(index) : null,
      seats:
        status === 'Payment failed' || status === 'Awaiting payment'
          ? '—'
          : isReleased(index)
            ? 'Released'
            : person.seats,
      bags: person.bags,
      document: { label: person.document, isValid: person.document === 'Passport valid' },
    };
  });

  const moneyLines = [...facts.moneyLines];
  if (status === 'Cancelled' && !refunded) {
    moneyLines.push({
      label: `Refunded ${formatDayMonth(booking.createdAt.slice(0, 10) as IsoDate)}`,
      amount: -booking.total,
    });
  }
  if (refunded) moneyLines.push({ label: 'Refunded 9 Oct', amount: -refundedAmount });

  const paymentLabels: Record<CasePayment, string> = {
    Captured: 'Paid in full',
    Authorized: 'Authorized · not captured',
    Declined: 'Payment declined',
    Refunded: 'Refunded',
    Pending: 'Awaiting payment',
    Invoiced: 'Invoiced · 30-day terms',
    'Partially refunded': `${formatPeso(refundedAmount)} refunded`,
  };
  const paymentTones: Record<CasePayment, StatusLabel['tone']> = {
    Captured: 'muted',
    Authorized: 'warning',
    Declined: 'danger',
    Refunded: 'muted',
    Pending: 'warning',
    Invoiced: 'muted',
    'Partially refunded': 'warning',
  };

  const riskScore = booking.reference === 'VL7Q2K' ? 12 : 6 + (hashString(`${booking.reference}risk`) % 20);

  const ledger: LedgerEntry[] = [];
  if (isManual) {
    ledger.push({
      when: at(0),
      event: payment === 'Invoiced' ? 'Invoice raised' : 'Payment link sent',
      reference: `To ${booking.email}`,
      method,
      amount: booking.total,
      result: { label: payment === 'Invoiced' ? 'Due in 30 days' : 'Awaiting customer', tone: 'warning' },
    });
  } else {
    const isDeclined = payment === 'Declined';
    ledger.push({
      when: at(0),
      event: 'Authorization',
      reference: `Auth code ${String(100000 + ((Number(facts.cardLast4) * 37) % 899999)).slice(0, 6)}`,
      method,
      amount: booking.total,
      result: {
        label: isDeclined ? 'Declined · code 51' : 'Approved',
        tone: isDeclined ? 'danger' : 'success',
      },
    });
    if (isDeclined) {
      ledger.push({
        when: at(1),
        event: 'Retry by customer',
        reference: '3-D Secure challenge abandoned',
        method,
        amount: booking.total,
        result: { label: 'Not completed', tone: 'muted' },
      });
    }
    if (payment === 'Authorized') {
      ledger.push({
        when: at(0),
        event: 'Capture',
        reference: 'Waits for tickets to be issued',
        method,
        amount: booking.total,
        result: { label: 'Pending', tone: 'warning' },
      });
    }
    if (payment === 'Captured' || payment === 'Refunded' || payment === 'Partially refunded') {
      const settlementDate = addDays(booking.createdAt.slice(0, 10) as IsoDate, 2);
      ledger.push({
        when: at(1),
        event: 'Capture',
        reference: `Settlement batch ${formatDayMonth(settlementDate)}`,
        method,
        amount: booking.total,
        result: { label: settlementDate <= DEMO_TODAY ? 'Settled' : 'Captured', tone: 'success' },
      });
    }
    if (status === 'Cancelled' && !refunded) {
      ledger.push({
        when: at(248),
        event: 'Refund',
        reference: 'Free cancellation within 24 hours',
        method,
        amount: -booking.total,
        result: { label: 'Refunded', tone: 'muted' },
      });
    }
  }
  if (refunded) {
    ledger.push({
      when: NOW_LABEL,
      event: 'Refund',
      reference: `${bookingCase.refundReason ?? 'Refund'} · ${STAFF_NAME}`,
      method,
      amount: -refundedAmount,
      result: { label: 'Processing · 5–10 days', tone: 'warning' },
    });
  }
  if (pendingRefund) {
    ledger.push({
      when: NOW_LABEL,
      event: 'Refund requested',
      reference: `${pendingRefund.reason} · sent to Finance by ${STAFF_NAME}`,
      method,
      amount: -pendingRefund.amount,
      result: { label: 'Waiting for Finance', tone: 'warning' },
    });
  }
  ledger.reverse();

  const coupons: CouponDetail[] = [];
  if (isIssued || refunded) {
    facts.people.forEach((_person, travelerIndex) =>
      facts.segments.forEach((segment, segmentIndex) => {
        let statusLabel: StatusLabel = { label: 'Open', tone: 'success' };
        if (segment.date < DEMO_TODAY) statusLabel = { label: 'Flown', tone: 'muted' };
        if (isReleased(travelerIndex)) statusLabel = { label: 'Refunded', tone: 'muted' };
        else if (status === 'Checked in' && segmentIndex === 0)
          statusLabel = { label: 'Checked in', tone: 'success' };
        else if (status === 'Refund requested')
          statusLabel = { label: 'Open · refund pending', tone: 'warning' };
        coupons.push({
          traveler: nameOf(travelerIndex),
          ticketNumber: ticketOf(travelerIndex),
          issuedLabel: bookingCase.reissued[travelerIndex]
            ? `Reissued 9 Oct · ${bookingCase.reissued[travelerIndex]}`
            : `Issued ${at(1).replace(/ \d\d:\d\d$/, '')}`,
          coupon: segmentIndex + 1,
          flight: `${segment.flightNumber} · ${segment.routeCode} · ${formatDayMonth(addDays(segment.date, bookingCase.dayShift))}`,
          fareBasis: `${facts.fareClass}${facts.fare === 'Saver' ? 'SVR' : facts.fare === 'Flex' ? 'FLX' : 'CLS'}PH`,
          status: statusLabel,
        });
      }),
    );
  }
  const reissuedCount = Object.keys(bookingCase.reissued).length;

  const activity = [...bookingCase.events, ...baseActivity(booking, facts)];

  const canResend = isIssued && refunded !== 'full' && refunded !== 'taxes' && status !== 'Flown';
  const canRefund = !refunded && !pendingRefund && isCaptured && status !== 'Cancelled' && status !== 'Flown';
  const canReissue = isIssued && !refunded && !pendingRefund && status !== 'Flown';
  const lastPerson = facts.people[facts.people.length - 1];
  const requiresFinance = (type: RefundType) =>
    facts.refundAmounts[type] > AGENT_REFUND_LIMIT || (type === 'full' && isIssued);
  const refundOptions: RefundOption[] = (
    isIssued
      ? [
          {
            type: 'taxes' as const,
            label: 'Taxes and unused add-ons',
            description: `Per fare rules · ${booking.travelerCount === 1 ? 'the traveler' : `all ${booking.travelerCount} travelers`}`,
          },
          ...(booking.travelerCount > 1
            ? [
                {
                  type: 'custom' as const,
                  label: 'One traveler only',
                  description: `${lastPerson.first} ${lastPerson.last} · taxes and bags`,
                },
              ]
            : []),
          {
            type: 'full' as const,
            label: 'Full refund (override)',
            description: 'Requires a reason and is reviewed by Finance',
          },
        ]
      : [
          {
            type: 'full' as const,
            label: 'Cancel and refund in full',
            description: 'Not ticketed yet · no airline penalty',
          },
        ]
  ).map((option) => ({
    ...option,
    amount: facts.refundAmounts[option.type],
    requiresFinance: requiresFinance(option.type),
  }));

  const firstName = booking.leadTraveler.split(' ')[0];
  const holdUntil = paymentHoldUntil(booking);

  return {
    booking,
    status: pendingRefund
      ? { label: 'Refund pending approval', tone: 'warning' }
      : refunded
        ? {
            label:
              refunded === 'full' ? 'Refunded' : refunded === 'taxes' ? 'Cancelled' : 'Partially refunded',
            tone: refunded === 'custom' ? 'warning' : 'muted',
          }
        : { label: status, tone: STATUS_TONE[status] },
    payment: { label: paymentLabels[payment], tone: paymentTones[payment] },
    createdSummary: `Created ${formatCompactDay(booking.createdAt.slice(0, 10) as IsoDate)} 2026, ${booking.createdAt.slice(11)} PHT · ${booking.channel} · Market ${booking.market} · ${airline} record ${facts.record}`,
    fare: facts.fare,
    fareLabel: `${facts.fare} fare${facts.fare === 'Flex' ? ', refundable' : ', non-refundable'}`,
    refundDestination,
    refundToLabel: isManual
      ? 'The customer’s bank account · arranged by Finance'
      : `Card ending ${facts.cardLast4} · ${booking.leadTraveler}`,
    account: facts.customer
      ? { customerId: facts.customer[0], label: facts.customer[1] }
      : { customerId: null, label: `${booking.leadTraveler} · Member` },
    maskedPhone: maskedPhone(booking, facts),
    segments,
    travelers,
    moneyLines,
    moneyTotalLabel: (
      {
        Captured: 'Captured',
        Refunded: 'Captured, then refunded',
        'Partially refunded': 'Captured',
        Authorized: 'Authorized',
        Declined: 'Not captured',
        Pending: 'Due',
        Invoiced: 'Invoiced',
      } as const
    )[payment],
    moneyNote: isManual
      ? `Created by ${STAFF_NAME} on the Agent channel · ${facts.fare} fare`
      : `${method} · ${payment === 'Declined' ? 'issuer declined (code 51) · seats held 24 hours' : `3-D Secure passed · risk score ${riskScore}/100 (low)`}`,
    ledger,
    risk: [
      { label: 'Method', value: method },
      { label: 'Card holder', value: isManual ? '—' : booking.leadTraveler },
      {
        label: '3-D Secure',
        value: isManual ? '—' : payment === 'Declined' ? 'Challenge abandoned' : 'Passed',
        isWarning: payment === 'Declined',
      },
      { label: 'Risk score', value: isManual ? 'Not scored yet' : `${riskScore}/100 · low` },
      {
        label: 'Billing country',
        value: booking.market === 'SG' ? 'Singapore' : booking.market === 'JP' ? 'Japan' : 'Philippines',
      },
    ],
    coupons,
    ticketsSummary: coupons.length
      ? `${facts.people.length} ${facts.people.length === 1 ? 'e-ticket' : 'e-tickets'} · ${airline} stock ${TICKET_STOCK[booking.airline]}${reissuedCount ? ` · ${reissuedCount} reissued today` : ''}`
      : 'Nothing issued yet',
    noTickets:
      status === 'Ticketing'
        ? {
            title: 'Tickets not issued yet',
            body: `${airline} rejected the fare class on the last two attempts. Seats are held — use Retry ticketing above, or rebook in a higher class.`,
          }
        : status === 'Cancelled'
          ? {
              title: 'Tickets voided',
              body: 'The booking was cancelled within 24 hours, so the airline voided the tickets at no charge.',
            }
          : {
              title: 'No tickets until payment clears',
              body: 'The airline only issues e-tickets once the payment is captured. Send the customer a payment link to finish the booking.',
            },
    activity,
    notes: bookingCase.notes,
    refundOptions,
    defaultRefundReason:
      status === 'Schedule change' ? 'Schedule change by airline' : 'Customer request — voluntary',
    defaultReissueReason: booking.reference === 'VL8KQN' ? 'Schedule change accepted' : 'Name correction',
    paymentLink: {
      holdUntil,
      smsTo: maskedPhone(booking, facts),
      message: `Hi ${firstName}, the payment for your ${booking.route} booking ${booking.reference} didn’t go through. Pay ${formatPeso(booking.total)} by ${holdUntil} to keep your seats. [Pay now]`,
    },
    actions: {
      canResend,
      showReissue: isIssued || Boolean(refunded),
      canReissue,
      showRetryTicketing: status === 'Ticketing',
      showPaymentLink: status === 'Payment failed' || status === 'Awaiting payment',
      paymentLinkLabel: bookingCase.isPaymentLinkSent
        ? 'Payment link sent'
        : status === 'Awaiting payment'
          ? 'Resend payment link'
          : 'Send payment link',
      isPaymentLinkSent: bookingCase.isPaymentLinkSent,
      canRefund,
      refundLabel: pendingRefund
        ? 'Refund awaiting Finance'
        : refunded || status === 'Cancelled'
          ? 'Refunded'
          : 'Issue refund',
    },
  };
}

/** What happened to the booking before anyone opened it in the console. */
function baseActivity(booking: ConsoleBooking, facts: BookingFacts): ActivityEvent[] {
  if (booking.reference === 'VL7Q2K') {
    return [
      event('Internal note added', 'Ramon Diaz · visa letter template sent', 'neutral', '9 Oct 00:44'),
      event('Itinerary emailed', 'andrea.reyes@example.com · delivered', 'neutral', '9 Oct 00:42'),
      event('Tickets issued', '618-2401938476, 618-2401938477 · Meridian Air', 'success', '9 Oct 00:42'),
      event('Payment captured', '₱39,862 · card ending 4821 · 3-D Secure passed', 'success', '9 Oct 00:41'),
      event('Booking created', 'Record MR-4KQ8ZT held with Meridian Air', 'brand', '9 Oct 00:41'),
      event('Promo applied', 'VELA1000 · −₱1,000', 'warning', '9 Oct 00:40'),
      event('Checkout started', 'Customer on web · signed in · Manila, PH', 'neutral', '9 Oct 00:36'),
    ];
  }

  const airline = AIRLINE_NAMES[booking.airline];
  const created = minutesSinceToday(booking.createdAt.slice(0, 10) as IsoDate, createdMinute(booking));
  const timed: Array<ActivityEvent & { minute: number }> = [];
  const add = (title: string, body: string, minute: number, tone: ActivityTone) =>
    timed.push({ ...event(title, body, tone, momentLabel(minute)), minute });
  const total = formatPeso(booking.total);

  const channel =
    booking.channel === 'App' ? 'the app' : booking.channel === 'Agent' ? 'the phone with an agent' : 'web';
  const place = booking.market === 'PH' ? 'Manila, PH' : booking.market === 'SG' ? 'Singapore' : 'Tokyo, JP';
  add('Checkout started', `Customer on ${channel} · ${place}`, created - 5, 'neutral');
  add('Booking created', `Record ${facts.record} held with ${airline}`, created, 'brand');
  if (booking.manual) {
    add(
      booking.payment === 'Invoiced' ? 'Invoice raised' : 'Payment link sent',
      `${total} · ${booking.email} · ${STAFF_NAME}`,
      created,
      'warning',
    );
  } else if (booking.payment === 'Declined') {
    add('Payment declined', `${total} · card ending ${facts.cardLast4} · issuer code 51`, created, 'danger');
  } else if (booking.payment === 'Authorized') {
    add(
      'Payment authorized',
      `${total} · card ending ${facts.cardLast4} · capture waits for ticketing`,
      created,
      'warning',
    );
  } else {
    add(
      'Payment captured',
      `${total} · card ending ${facts.cardLast4} · 3-D Secure passed`,
      created + 1,
      'success',
    );
  }
  if (booking.status === 'Ticketing') {
    add('Ticketing failed', `${airline} rejected the fare class · retried 2×`, created + 2, 'danger');
  }
  if (ISSUED_STATUSES.includes(booking.status) || booking.status === 'Cancelled') {
    add(
      'Tickets issued',
      `${facts.people
        .map((person) => person.ticket)
        .slice(0, 3)
        .join(', ')} · ${airline}`,
      created + 2,
      'success',
    );
    add('Itinerary emailed', `${booking.email} · delivered`, created + 2, 'neutral');
  }
  if (booking.status === 'Checked in') {
    add(
      'Online check-in completed',
      `${facts.people.length} ${facts.people.length === 1 ? 'traveler' : 'travelers'} · boarding pass sent`,
      Math.max(created + 30, -1440 + 1395),
      'success',
    );
  }
  if (booking.status === 'Schedule change') {
    add(
      `Schedule change from ${airline}`,
      `${facts.segments[0].flightNumber} retimed from 06:10 to 11:10 · customer notified`,
      -2 * 1440 + 1210,
      'warning',
    );
  }
  const requestedAt = REFUND_REQUESTED_AT[booking.reference];
  if (booking.status === 'Refund requested' || requestedAt) {
    add(
      'Refund requested',
      `By the customer · ${total} · in the Refunds queue`,
      requestedAt ? requestedAt[0] * 1440 + requestedAt[1] : Math.min(created + 600, 50),
      'warning',
    );
  }
  if (booking.status === 'Cancelled') {
    add('Booking cancelled', 'Customer cancelled within 24 hours · no penalty', created + 246, 'neutral');
    add('Refund issued', `${total} to card ending ${facts.cardLast4}`, created + 248, 'neutral');
  }
  const firstNote = SEEDED_NOTES[booking.reference]?.[0];
  if (firstNote) {
    const match = /^(\d+) (\w+), (\d\d):(\d\d)$/.exec(firstNote.when);
    const minute = match
      ? daysBetween(
          DEMO_TODAY,
          `2026-${String(MONTHS.indexOf(match[2]) + 1).padStart(2, '0')}-${match[1].padStart(2, '0')}`,
        ) *
          1440 +
        Number(match[3]) * 60 +
        Number(match[4])
      : created + 3;
    add(
      'Internal note added',
      `${firstNote.author} · ${firstNote.text.slice(0, 60)}${firstNote.text.length > 60 ? '…' : ''}`,
      minute,
      'neutral',
    );
  }
  return timed.sort((a, b) => b.minute - a.minute).map(({ minute: _minute, ...item }) => item);
}

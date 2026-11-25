import type { ManagedBooking } from '@/types/managedBooking';

/** Booking VL7Q2K as Manage booking sees it: Andrea and Miguel to Tokyo, 12–19 Nov. */
export const MANAGED_BOOKINGS: readonly ManagedBooking[] = [
  {
    reference: 'VL7Q2K',
    status: 'confirmed',
    city: 'Tokyo',
    airlineName: 'Meridian Air',
    fareName: 'Classic',
    cabin: 'Economy',
    flights: [
      {
        segment: 'outbound',
        date: '2026-11-12',
        flightNumber: 'MR 431',
        departureTime: '08:40',
        arrivalTime: '13:55',
        from: 'MNL',
        to: 'HND',
        fromTerminal: 'T1',
        toTerminal: 'T3',
        aircraft: 'A321neo',
        durationMinutes: 255,
      },
      {
        segment: 'inbound',
        date: '2026-11-19',
        flightNumber: 'MR 432',
        departureTime: '15:30',
        arrivalTime: '19:20',
        from: 'HND',
        to: 'MNL',
        fromTerminal: 'T3',
        toTerminal: 'T1',
        aircraft: 'A321neo',
        durationMinutes: 290,
      },
    ],
    travelers: [
      {
        id: 'andrea',
        title: 'Ms',
        firstNames: 'Andrea Lim',
        lastName: 'Reyes',
        dateOfBirth: '1991-06-24',
        passportNumber: 'P4401207A',
        passportExpiry: '14/08/2031',
        passportNationality: 'PH',
        seats: { outbound: '12A', inbound: '12A' },
        checkedBags: 2,
        assistanceRequests: [],
        pendingNameCorrection: null,
      },
      {
        id: 'miguel',
        title: 'Mr',
        firstNames: 'Miguel',
        lastName: 'Reyes',
        dateOfBirth: '1989-02-11',
        passportNumber: 'P2210987C',
        passportExpiry: '03/02/2033',
        passportNationality: 'PH',
        seats: { outbound: '12B', inbound: '12B' },
        checkedBags: 1,
        assistanceRequests: [],
        pendingNameCorrection: null,
      },
    ],
    contact: {
      email: 'andrea.reyes@example.com',
      mobile: '917 482 4567',
      alternateMobile: '',
      textUpdates: true,
      emailUpdates: true,
    },
    payments: [{ date: '2026-10-09', label: '9 Oct · Card ending 4821', amount: 39862 }],
    receiptNumber: 'VR-2610-48127',
    bookedAt: '9 Oct 2026, 00:41',
    receiptLines: [
      { label: 'Fare · Classic, Economy', detail: '2 adults × ₱14,230 · MR 431 and MR 432', amount: 28460 },
      {
        label: 'Taxes and carrier fees',
        detail: 'Government taxes, airport and carrier charges',
        amount: 6912,
      },
      { label: 'Seats', detail: '12A and 12B on both flights', amount: 1800 },
      { label: 'Extra baggage', detail: '1 × 23 kg on both flights', amount: 2400 },
      { label: 'Vela Protect', detail: 'Trip cover for 2 travelers', amount: 1290 },
      { label: 'Promo VELA1000', detail: 'Discount applied at checkout', amount: -1000 },
    ],
    cardLast4: '4821',
    hasProtection: true,
    checkInReminder: null,
    refund: null,
  },
];

/** What each line of VL7Q2K returns if the trip is cancelled (the Classic fare itself is non-refundable). */
export const VL7Q2K_REFUND_ROWS: ReadonlyArray<{ item: string; paid: number; refund: number }> = [
  { item: 'Classic fare × 2', paid: 28460, refund: 0 },
  { item: 'Taxes and carrier fees', paid: 6912, refund: 6912 },
  { item: 'Seats', paid: 1800, refund: 0 },
  { item: 'Extra baggage', paid: 2400, refund: 2400 },
  { item: 'Vela Protect', paid: 1290, refund: 0 },
];

export interface ChangeDayOption {
  date: string;
  /** Lowest fare difference per traveler that day; `null` for the booked date. */
  baseDifference: number | null;
}

export interface ChangeFlightOption {
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  arrivesNextDay: boolean;
  /** Added to the day's base difference (can be negative, never below zero in total). */
  adjustment: number;
  note: string;
}

/** Dates and Meridian Air flights offered when changing VL7Q2K. */
export const CHANGE_OPTIONS: Record<
  'outbound' | 'inbound',
  { days: ChangeDayOption[]; flights: ChangeFlightOption[] }
> = {
  outbound: {
    days: [
      { date: '2026-11-10', baseDifference: 1960 },
      { date: '2026-11-11', baseDifference: 820 },
      { date: '2026-11-12', baseDifference: null },
      { date: '2026-11-13', baseDifference: 1240 },
      { date: '2026-11-14', baseDifference: 2860 },
      { date: '2026-11-15', baseDifference: 3410 },
      { date: '2026-11-16', baseDifference: 640 },
    ],
    flights: [
      {
        flightNumber: 'MR 439',
        departureTime: '06:00',
        arrivalTime: '11:15',
        arrivesNextDay: false,
        adjustment: 400,
        note: 'A320 · seats 12A and 12B taken',
      },
      {
        flightNumber: 'MR 431',
        departureTime: '08:40',
        arrivalTime: '13:55',
        arrivesNextDay: false,
        adjustment: 0,
        note: 'A321neo · same time as your flight now',
      },
      {
        flightNumber: 'MR 435',
        departureTime: '13:10',
        arrivalTime: '18:25',
        arrivesNextDay: false,
        adjustment: -760,
        note: 'A321neo · arrives early evening',
      },
      {
        flightNumber: 'MR 437',
        departureTime: '21:50',
        arrivalTime: '03:05',
        arrivesNextDay: true,
        adjustment: -920,
        note: 'A330 · overnight, arrives next day',
      },
    ],
  },
  inbound: {
    days: [
      { date: '2026-11-16', baseDifference: 2600 },
      { date: '2026-11-17', baseDifference: 1480 },
      { date: '2026-11-18', baseDifference: 520 },
      { date: '2026-11-19', baseDifference: null },
      { date: '2026-11-20', baseDifference: 2140 },
      { date: '2026-11-21', baseDifference: 3060 },
      { date: '2026-11-22', baseDifference: 980 },
    ],
    flights: [
      {
        flightNumber: 'MR 434',
        departureTime: '09:10',
        arrivalTime: '13:00',
        arrivesNextDay: false,
        adjustment: -300,
        note: 'A321neo · morning departure',
      },
      {
        flightNumber: 'MR 432',
        departureTime: '15:30',
        arrivalTime: '19:20',
        arrivesNextDay: false,
        adjustment: 0,
        note: 'A321neo · same time as your flight now',
      },
      {
        flightNumber: 'MR 436',
        departureTime: '20:45',
        arrivalTime: '00:35',
        arrivesNextDay: true,
        adjustment: -500,
        note: 'A330 · late evening',
      },
    ],
  },
};

/** Flights with no seats left for the party on a given date. */
export const SOLD_OUT_FLIGHTS: ReadonlyArray<{ date: string; flightNumber: string }> = [
  { date: '2026-11-13', flightNumber: 'MR 439' },
];

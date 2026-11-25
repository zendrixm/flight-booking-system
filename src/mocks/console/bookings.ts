import { DEMO_TODAY } from '@/config/demo';
import { addDays, type IsoDate } from '@/lib/date';
import type {
  AirlineCode,
  BookingChannel,
  ConsoleBooking,
  ConsoleBookingStatus,
  MarketCode,
  PaymentState,
} from '@/types/console/booking';

/**
 * The console's booking ledger: 30 days of bookings up to Fri 9 Oct 2026, 00:58 Manila time.
 * A few dozen hand-written bookings carry the stories told elsewhere in the demo; the rest are
 * generated from a fixed seed, so every load produces exactly the same list.
 */

export const LEDGER_TODAY: IsoDate = DEMO_TODAY;
/** Day 0 of the ledger is 10 Sep; day 29 is today. */
const LEDGER_DAYS = 30;
const dateOfDay = (day: number): IsoDate => addDays(LEDGER_TODAY, day - (LEDGER_DAYS - 1));

type HandWrittenBooking = [
  reference: string,
  leadTraveler: string,
  email: string,
  route: string,
  airline: AirlineCode,
  departureDate: IsoDate,
  travelerCount: number,
  channel: BookingChannel,
  total: number,
  payment: PaymentState,
  status: ConsoleBookingStatus,
  createdDay: number,
  createdTime: string,
];

const HAND_WRITTEN: readonly HandWrittenBooking[] = [
  [
    'VL7Q2K',
    'Andrea Lim Reyes',
    'andrea.reyes@example.com',
    'MNL ⇄ HND',
    'MR',
    '2026-11-12',
    2,
    'Web',
    39862,
    'Captured',
    'Ticketed',
    29,
    '00:41',
  ],
  [
    'VL5WEN',
    'Rina Soriano',
    'rina.soriano@example.com',
    'MNL → TPE',
    'SJ',
    '2026-10-21',
    1,
    'App',
    4380,
    'Captured',
    'Ticketing',
    29,
    '00:52',
  ],
  [
    'VL8BGT',
    'Jared Uy',
    'jared.uy@example.com',
    'MNL ⇄ HND',
    'PQ',
    '2026-11-26',
    2,
    'Web',
    31240,
    'Captured',
    'Ticketing',
    29,
    '00:45',
  ],
  [
    'VL4TRB',
    'Joseph Tan',
    'joseph.tan@example.com',
    'MNL → SIN',
    'MR',
    '2026-10-14',
    1,
    'App',
    8960,
    'Captured',
    'Ticketing',
    29,
    '00:33',
  ],
  [
    'VL9XCA',
    'Hana Watanabe',
    'hana.w@example.com',
    'NRT ⇄ CEB',
    'KS',
    '2026-12-03',
    3,
    'Web',
    44110,
    'Captured',
    'Ticketed',
    29,
    '00:27',
  ],
  [
    'VL2MPE',
    'Carlo Mendoza',
    'carlo.m@example.com',
    'MNL ⇄ ICN',
    'HC',
    '2026-12-22',
    2,
    'Web',
    23480,
    'Declined',
    'Payment failed',
    29,
    '00:19',
  ],
  [
    'VL6HWD',
    'Priya Raman',
    'priya.raman@example.com',
    'MNL → BKK',
    'PQ',
    '2026-10-30',
    1,
    'App',
    6240,
    'Captured',
    'Ticketed',
    29,
    '00:08',
  ],
  [
    'VL5DRA',
    'Daniel Cruz',
    'daniel.cruz@example.com',
    'MNL → HND',
    'MR',
    '2026-11-12',
    1,
    'Web',
    15986,
    'Authorized',
    'Ticketing',
    28,
    '23:52',
  ],
  [
    'VL3MZ8',
    'Andrea Lim Reyes',
    'andrea.reyes@example.com',
    'MNL ⇄ SIN',
    'MR',
    '2026-10-10',
    1,
    'App',
    17920,
    'Captured',
    'Checked in',
    28,
    '21:15',
  ],
  [
    'VL6TQP',
    'Ken Aquino',
    'ken.aquino@example.com',
    'MNL ⇄ TPE',
    'SJ',
    '2026-11-20',
    1,
    'Web',
    9870,
    'Captured',
    'Refund requested',
    28,
    '20:31',
  ],
  [
    'VL0PLW',
    'Mei Lin Ong',
    'meilin.ong@example.com',
    'SIN → MNL',
    'MR',
    '2026-11-02',
    2,
    'App',
    16480,
    'Refunded',
    'Cancelled',
    28,
    '19:02',
  ],
  [
    'VL8TJU',
    'Marisol Chua',
    'marisol.chua@example.com',
    'MNL ⇄ TPE',
    'SJ',
    '2026-12-05',
    1,
    'App',
    7480,
    'Captured',
    'Refund requested',
    28,
    '16:20',
  ],
  [
    'VL9GHE',
    'Tricia Manalo',
    'tricia.manalo@example.com',
    'MNL → BKK',
    'PQ',
    '2026-11-14',
    1,
    'App',
    6980,
    'Captured',
    'Refund requested',
    27,
    '13:48',
  ],
  [
    'VL7RDM',
    'Jun Pascual',
    'jun.pascual@example.com',
    'MNL → ICN',
    'HC',
    '2026-10-28',
    1,
    'Web',
    9420,
    'Captured',
    'Refund requested',
    27,
    '09:05',
  ],
  [
    'VL3WQD',
    'Hiro Tanaka',
    'hiro.tanaka@example.com',
    'MNL ⇄ NRT',
    'KS',
    '2026-11-23',
    2,
    'Web',
    33560,
    'Captured',
    'Refund requested',
    26,
    '19:40',
  ],
  [
    'VL1FJS',
    'Sophie Laurent',
    'sophie.l@example.com',
    'MNL ⇄ TPE',
    'SJ',
    '2026-11-07',
    2,
    'Web',
    14960,
    'Captured',
    'Refund requested',
    25,
    '14:12',
  ],
  [
    'VL6PLS',
    'Noel Villareal',
    'noel.villareal@example.com',
    'CEB ⇄ ICN',
    'HC',
    '2026-11-03',
    2,
    'Agent',
    26700,
    'Captured',
    'Refund requested',
    25,
    '10:22',
  ],
  [
    'VL8KQN',
    'Marco Villanueva',
    'marco.v@example.com',
    'CEB → NRT',
    'KS',
    '2026-11-18',
    4,
    'Agent',
    71560,
    'Captured',
    'Schedule change',
    24,
    '16:40',
  ],
  [
    'VL4CNE',
    'Bianca Ramos',
    'bianca.ramos@example.com',
    'MNL ⇄ SIN',
    'MR',
    '2026-10-24',
    2,
    'Web',
    29880,
    'Captured',
    'Refund requested',
    24,
    '11:02',
  ],
  [
    'VL9KMN',
    'Arjun Patel',
    'arjun.patel@example.com',
    'MNL ⇄ SIN',
    'MR',
    '2026-10-08',
    1,
    'Web',
    22640,
    'Captured',
    'Refund requested',
    23,
    '18:05',
  ],
  [
    'VL2KAF',
    'Celeste Ocampo',
    'celeste.ocampo@example.com',
    'MNL ⇄ HND',
    'MR',
    '2026-12-18',
    3,
    'Web',
    52310,
    'Captured',
    'Refund requested',
    23,
    '12:30',
  ],
  [
    'VL3HBC',
    'Grace Lim',
    'grace.lim@example.com',
    'MNL ⇄ HND',
    'PQ',
    '2026-10-16',
    2,
    'Web',
    32400,
    'Captured',
    'Refund requested',
    23,
    '09:20',
  ],
  [
    'VL2WZX',
    'Lara Santos',
    'lara.santos@example.com',
    'MNL ⇄ BKK',
    'PQ',
    '2026-10-04',
    2,
    'App',
    18200,
    'Captured',
    'Refund requested',
    23,
    '07:40',
  ],
];

/** Bookings created per day in the Philippines market, 10 Sep … 9 Oct (matches the dashboard). */
const BOOKINGS_PER_DAY = [
  185, 179, 190, 168, 176, 194, 188, 181, 175, 183, 197, 186, 178, 169, 182, 158, 164, 171, 149, 152, 180,
  192, 176, 168, 183, 190, 205, 214, 197, 11,
];

type WeightedRoute = [
  route: string,
  airline: AirlineCode,
  typicalFare: number,
  weight: number,
  market?: MarketCode,
];

const PH_ROUTES: readonly WeightedRoute[] = [
  ['MNL ⇄ HND', 'MR', 15900, 9],
  ['MNL → HND', 'PQ', 8400, 5],
  ['MNL ⇄ NRT', 'KS', 16400, 4],
  ['CEB → NRT', 'KS', 9800, 4],
  ['MNL ⇄ SIN', 'MR', 15800, 7],
  ['MNL → SIN', 'MR', 8960, 5],
  ['MNL ⇄ ICN', 'HC', 11700, 8],
  ['CEB ⇄ ICN', 'HC', 12900, 3],
  ['MNL ⇄ TPE', 'SJ', 7480, 6],
  ['MNL → TPE', 'SJ', 4380, 3],
  ['MNL → BKK', 'PQ', 6240, 4],
  ['MNL ⇄ BKK', 'PQ', 11800, 3],
  ['MNL ⇄ HKG', 'PQ', 8900, 3],
];

const OTHER_MARKET_ROUTES: readonly WeightedRoute[] = [
  ['SIN → MNL', 'MR', 8240, 3, 'SG'],
  ['SIN ⇄ MNL', 'MR', 15200, 3, 'SG'],
  ['NRT → MNL', 'KS', 9100, 2, 'JP'],
  ['HND ⇄ MNL', 'PQ', 16900, 2, 'JP'],
];

const FIRST_NAMES = [
  'Maria',
  'Jose',
  'Angela',
  'Kristine',
  'Mark',
  'Patricia',
  'John',
  'Camille',
  'Rafael',
  'Isabel',
  'Luis',
  'Nicole',
  'Gabriel',
  'Trisha',
  'Enzo',
  'Joaquin',
  'Sofia',
  'Erika',
  'Hannah',
  'Kevin',
  'Aiko',
  'Wei Ling',
  'Liam',
  'Chloe',
  'Antonio',
  'Carmela',
  'Diego',
  'Elena',
  'Francis',
  'Hiroshi',
  'Ines',
  'Jasmine',
  'Karl',
  'Lorenzo',
  'Monica',
  'Nathan',
  'Olivia',
  'Pia',
  'Ricardo',
  'Samantha',
  'Vince',
  'Yumi',
  'Zoe',
];
const LAST_NAMES = [
  'Santos',
  'Bautista',
  'Garcia',
  'Torres',
  'Flores',
  'Gonzales',
  'Ramos',
  'Castillo',
  'Del Rosario',
  'Domingo',
  'Lim',
  'Tan',
  'Go',
  'Sy',
  'Ong',
  'Chua',
  'Dela Cruz',
  'Pascual',
  'Salazar',
  'Manalo',
  'Ocampo',
  'Soriano',
  'Yamamoto',
  'Kim',
  'Wong',
  'Lee',
  'Aguilar',
  'Mercado',
  'Rivera',
  'Valdez',
  'Herrera',
  'Lopez',
  'Fernandez',
  'Sison',
  'Tolentino',
  'Javier',
  'Uy',
  'Co',
];

/** Mulberry32: a tiny deterministic random number generator. */
function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const minutesToTime = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

const createdAtOf = (day: number, minutes: number) => `${dateOfDay(day)}T${minutesToTime(minutes)}`;

function generateLedger(): ConsoleBooking[] {
  const random = seededRandom(20261009);
  const pick = <T>(items: readonly T[]) => items[Math.floor(random() * items.length)];
  const pickWeighted = (routes: readonly WeightedRoute[]) => {
    let remaining = random() * routes.reduce((sum, route) => sum + route[3], 0);
    for (const route of routes) {
      remaining -= route[3];
      if (remaining < 0) return route;
    }
    return routes[routes.length - 1];
  };

  const usedReferences = new Set([...HAND_WRITTEN.map((booking) => booking[0]), 'VL6TQ1']);
  const DIGITS = '0123456789';
  const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const nextReference = () => {
    let reference: string;
    do {
      reference = `VL${DIGITS[Math.floor(random() * 10)]}${LETTERS[Math.floor(random() * LETTERS.length)]}${
        LETTERS[Math.floor(random() * LETTERS.length)]
      }${LETTERS[Math.floor(random() * LETTERS.length)]}`;
    } while (usedReferences.has(reference));
    usedReferences.add(reference);
    return reference;
  };

  const ledger: Array<ConsoleBooking & { sortKey: number }> = HAND_WRITTEN.map(
    ([
      reference,
      leadTraveler,
      email,
      route,
      airline,
      departureDate,
      travelerCount,
      channel,
      total,
      payment,
      status,
      day,
      time,
    ]) => {
      const [hours, minutes] = time.split(':').map(Number);
      return {
        reference,
        leadTraveler,
        email,
        route,
        airline,
        departureDate,
        travelerCount,
        channel,
        total,
        payment,
        status,
        createdAt: createdAtOf(day, hours * 60 + minutes),
        market: 'PH',
        isAssignedToMe: false,
        sortKey: day * 1440 + hours * 60 + minutes,
      };
    },
  );

  for (let day = 0; day < LEDGER_DAYS; day += 1) {
    const domesticCount =
      BOOKINGS_PER_DAY[day] - HAND_WRITTEN.filter((booking) => booking[11] === day).length;
    const foreignCount = Math.round(BOOKINGS_PER_DAY[day] * 0.06);
    for (let index = 0; index < domesticCount + foreignCount; index += 1) {
      const isForeign = index >= domesticCount;
      const [route, airline, typicalFare, , market = 'PH'] = isForeign
        ? pickWeighted(OTHER_MARKET_ROUTES)
        : pickWeighted(PH_ROUTES);
      const firstName = pick(FIRST_NAMES);
      const lastName = pick(LAST_NAMES);
      const partyRoll = random();
      const travelerCount = partyRoll < 0.5 ? 1 : partyRoll < 0.82 ? 2 : partyRoll < 0.93 ? 3 : 4;
      const channelRoll = random();
      const channel: BookingChannel = channelRoll < 0.55 ? 'Web' : channelRoll < 0.93 ? 'App' : 'Agent';
      const total = Math.round((typicalFare * travelerCount * (0.86 + random() * 0.32)) / 10) * 10;
      const departureDay = day + 2 + Math.floor(random() * 75);
      const isCancelled = random() < 0.025;
      const minutes = day === LEDGER_DAYS - 1 ? Math.floor(random() * 58) : Math.floor(random() * 1440);
      const status: ConsoleBookingStatus = isCancelled
        ? 'Cancelled'
        : departureDay < LEDGER_DAYS - 1
          ? 'Flown'
          : departureDay <= LEDGER_DAYS
            ? 'Checked in'
            : 'Ticketed';
      ledger.push({
        reference: nextReference(),
        leadTraveler: `${firstName} ${lastName}`,
        email: `${`${firstName}.${lastName}`.toLowerCase().replace(/\s+/g, '')}@example.com`,
        route,
        airline,
        departureDate: dateOfDay(departureDay),
        travelerCount,
        channel,
        total,
        payment: isCancelled ? 'Refunded' : 'Captured',
        status,
        createdAt: createdAtOf(day, minutes),
        market,
        isAssignedToMe: false,
        sortKey: day * 1440 + minutes,
      });
    }
  }

  return ledger.sort((a, b) => b.sortKey - a.sortKey).map(({ sortKey: _sortKey, ...booking }) => booking);
}

/** Newest first. */
export const CONSOLE_BOOKINGS: readonly ConsoleBooking[] = generateLedger();

/** References handed to the next manual bookings, in order. */
export const MANUAL_BOOKING_REFERENCES = ['VL4N8E', 'VL6QJR', 'VL2XTA', 'VL9PDC', 'VL5KMB', 'VL7FVH'];

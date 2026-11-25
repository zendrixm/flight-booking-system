import type { StatusTone } from '@/components/ui';
import type { IsoDate } from '@/lib/date';
import type { AirlineCode } from '@/types/console/booking';
import type {
  ConnectionAtRisk,
  DisruptionReason,
  FlightPhase,
  FlightTimelineEntry,
  ManifestEntry,
  OpsFlight,
} from '@/types/console/flightOps';

/** When the airline feeds last synced, and the time stamped on changes made in this demo. */
export const FEED_SYNCED_AT = '00:57';
export const OPS_ACTION_TIME = '00:59';

type FeedTone = 'good' | 'warn' | 'bad' | 'neutral' | 'solid';
type FeedPhase = 'departed' | 'ontime' | 'delayed' | 'cancelled';

const TONES: Record<FeedTone, StatusTone> = {
  good: 'success',
  warn: 'warning',
  bad: 'danger',
  neutral: 'muted',
  solid: 'solid',
};

const PHASES: Record<FeedPhase, FlightPhase> = {
  departed: 'departed',
  ontime: 'onTime',
  delayed: 'delayed',
  cancelled: 'cancelled',
};

/** One feed row, in the order the ops team reads it. */
function feedFlight(
  id: string,
  flightNumber: string,
  route: string,
  scheduledTime: string,
  estimateNote: string,
  gate: string,
  velaTravelers: number,
  loadPercent: number,
  statusLabel: string,
  tone: FeedTone,
  aircraft: string,
  phase: FeedPhase,
  estimatedTime = scheduledTime,
): OpsFlight {
  return {
    id,
    flightNumber,
    airline: id.slice(0, 2) as AirlineCode,
    route,
    aircraft,
    scheduledTime,
    estimatedTime,
    estimateNote,
    gate,
    velaTravelers,
    loadPercent,
    phase: PHASES[phase],
    status: { label: statusLabel, tone: TONES[tone] },
  };
}

export interface FeedDay {
  date: IsoDate;
  /** Seeds the generated manifests so every visit shows the same travelers. */
  seed: string;
  flights: readonly OpsFlight[];
}

/** Flights carrying Vela travelers, yesterday to two days out. */
export const FEED_DAYS: readonly FeedDay[] = [
  {
    date: '2026-10-08',
    seed: 'thu',
    flights: [
      feedFlight(
        'KS81',
        'KS 81',
        'MNL → NRT',
        '01:15',
        'Landed 06:20',
        '12',
        61,
        96,
        'Landed',
        'neutral',
        'Boeing 787-9',
        'departed',
        '01:21',
      ),
      feedFlight(
        'PQ122',
        'PQ 122',
        'MNL → HND',
        '06:05',
        'Landed 11:02',
        '104',
        35,
        84,
        'Landed',
        'neutral',
        'Boeing 737 MAX 8',
        'departed',
        '06:07',
      ),
      feedFlight(
        'MR518',
        'MR 518',
        'MNL → SIN',
        '07:15',
        'Landed 10:44',
        '9',
        39,
        90,
        'Landed',
        'neutral',
        'Airbus A321neo',
        'departed',
        '07:15',
      ),
      feedFlight(
        'HC911',
        'HC 911',
        'ICN → MNL',
        '08:05',
        'Landed 11:31 · 25 min late',
        '118',
        24,
        82,
        'Landed',
        'neutral',
        'Airbus A330-300',
        'departed',
        '08:30',
      ),
      feedFlight(
        'MR431',
        'MR 431',
        'MNL → HND',
        '08:40',
        'Landed 13:50',
        '7',
        44,
        91,
        'Landed',
        'neutral',
        'Airbus A321neo',
        'departed',
        '08:41',
      ),
      feedFlight(
        'SJ806',
        'SJ 806',
        'MNL → TPE',
        '10:40',
        'Landed 12:41',
        '5',
        41,
        77,
        'Landed',
        'neutral',
        'Airbus A320neo',
        'departed',
        '10:44',
      ),
      feedFlight(
        'PQ117',
        'PQ 117',
        'HND → MNL',
        '12:40',
        'Landed 16:05',
        '141',
        29,
        88,
        'Landed',
        'neutral',
        'Boeing 737 MAX 8',
        'departed',
        '12:52',
      ),
      feedFlight(
        'MR435',
        'MR 435',
        'MNL → HND',
        '17:45',
        'Landed 22:58',
        '9',
        50,
        85,
        'Landed',
        'neutral',
        'Airbus A330-900',
        'departed',
        '17:47',
      ),
      feedFlight(
        'HC902',
        'HC 902',
        'MNL → ICN',
        '22:50',
        'Departed 23:02',
        '—',
        18,
        81,
        'Departed',
        'neutral',
        'Airbus A330-300',
        'departed',
        '23:02',
      ),
    ],
  },
  {
    date: '2026-10-09',
    seed: 'fri',
    flights: [
      feedFlight(
        'HC902',
        'HC 902',
        'MNL → ICN',
        '22:50',
        'Departed 23:02',
        '—',
        18,
        81,
        'Departed',
        'neutral',
        'Airbus A330-300',
        'departed',
        '23:02',
      ),
      feedFlight(
        'KS81',
        'KS 81',
        'MNL → NRT',
        '01:15',
        'Boarding',
        '12',
        58,
        94,
        'Boarding',
        'solid',
        'Boeing 787-9',
        'ontime',
      ),
      feedFlight(
        'PQ122',
        'PQ 122',
        'MNL → HND',
        '06:05',
        'On time',
        '104',
        37,
        86,
        'On time',
        'good',
        'Boeing 737 MAX 8',
        'ontime',
      ),
      feedFlight(
        'HC911',
        'HC 911',
        'ICN → MNL',
        '08:05',
        'Gate 112 → 118',
        '118',
        22,
        79,
        'Gate change',
        'warn',
        'Airbus A330-300',
        'ontime',
      ),
      feedFlight(
        'MR431',
        'MR 431',
        'MNL → HND',
        '08:40',
        'On time',
        '7',
        46,
        88,
        'On time',
        'good',
        'Airbus A321neo',
        'ontime',
      ),
      feedFlight(
        'SJ205',
        'SJ 205',
        'MNL → TPE',
        '10:15',
        'On time',
        '5',
        29,
        72,
        'On time',
        'good',
        'Airbus A320neo',
        'ontime',
      ),
      feedFlight(
        'SJ806',
        'SJ 806',
        'MNL → TPE',
        '10:40',
        'Rebooked to SJ 808',
        '—',
        46,
        0,
        'Cancelled',
        'bad',
        'Airbus A320neo',
        'cancelled',
        '—',
      ),
      feedFlight(
        'PQ117',
        'PQ 117',
        'HND → MNL',
        '12:40',
        'Est. 14:50',
        '141',
        31,
        92,
        'Delayed 2h 10m',
        'warn',
        'Boeing 737 MAX 8',
        'delayed',
        '14:50',
      ),
      feedFlight(
        'MR435',
        'MR 435',
        'MNL → HND',
        '17:45',
        'Scheduled',
        '9',
        52,
        83,
        'Scheduled',
        'neutral',
        'Airbus A330-900',
        'ontime',
      ),
    ],
  },
  {
    date: '2026-10-10',
    seed: 'sat',
    flights: [
      feedFlight(
        'KS81',
        'KS 81',
        'MNL → NRT',
        '01:15',
        'Scheduled',
        '12',
        55,
        92,
        'Scheduled',
        'neutral',
        'Boeing 787-9',
        'ontime',
      ),
      feedFlight(
        'PQ122',
        'PQ 122',
        'MNL → HND',
        '06:05',
        'Scheduled',
        '—',
        33,
        80,
        'Scheduled',
        'neutral',
        'Boeing 737 MAX 8',
        'ontime',
      ),
      feedFlight(
        'MR518',
        'MR 518',
        'MNL → SIN',
        '07:15',
        'Check-in open',
        '9',
        41,
        89,
        'Scheduled',
        'neutral',
        'Airbus A321neo',
        'ontime',
      ),
      feedFlight(
        'HC911',
        'HC 911',
        'ICN → MNL',
        '08:05',
        'Scheduled',
        '—',
        20,
        74,
        'Scheduled',
        'neutral',
        'Airbus A330-300',
        'ontime',
      ),
      feedFlight(
        'MR431',
        'MR 431',
        'MNL → HND',
        '08:40',
        'Scheduled',
        '7',
        48,
        90,
        'Scheduled',
        'neutral',
        'Airbus A321neo',
        'ontime',
      ),
      feedFlight(
        'SJ808',
        'SJ 808',
        'MNL → TPE',
        '12:10',
        'Extra rebooking seats',
        '—',
        52,
        97,
        'Scheduled',
        'neutral',
        'Airbus A321neo',
        'ontime',
      ),
      feedFlight(
        'PQ117',
        'PQ 117',
        'HND → MNL',
        '12:40',
        'Aircraft swap · later ETA',
        '—',
        27,
        85,
        'Delayed 35m',
        'warn',
        'Boeing 737 MAX 8',
        'delayed',
        '13:15',
      ),
      feedFlight(
        'MR435',
        'MR 435',
        'MNL → HND',
        '17:45',
        'Scheduled',
        '—',
        49,
        81,
        'Scheduled',
        'neutral',
        'Airbus A330-900',
        'ontime',
      ),
    ],
  },
  {
    date: '2026-10-11',
    seed: 'sun',
    flights: [
      feedFlight(
        'KS81',
        'KS 81',
        'MNL → NRT',
        '01:15',
        'Scheduled',
        '—',
        51,
        88,
        'Scheduled',
        'neutral',
        'Boeing 787-9',
        'ontime',
      ),
      feedFlight(
        'PQ122',
        'PQ 122',
        'MNL → HND',
        '06:05',
        'Scheduled',
        '—',
        30,
        77,
        'Scheduled',
        'neutral',
        'Boeing 737 MAX 8',
        'ontime',
      ),
      feedFlight(
        'MR431',
        'MR 431',
        'MNL → HND',
        '08:40',
        'Scheduled',
        '—',
        43,
        86,
        'Scheduled',
        'neutral',
        'Airbus A321neo',
        'ontime',
      ),
      feedFlight(
        'SJ205',
        'SJ 205',
        'MNL → TPE',
        '10:15',
        'Scheduled',
        '—',
        26,
        70,
        'Scheduled',
        'neutral',
        'Airbus A320neo',
        'ontime',
      ),
      feedFlight(
        'HC902',
        'HC 902',
        'MNL → ICN',
        '22:50',
        'Scheduled',
        '—',
        21,
        76,
        'Scheduled',
        'neutral',
        'Airbus A330-300',
        'ontime',
      ),
    ],
  },
];

/** Keys feed facts to one flight on one day. */
export const flightKey = (date: IsoDate, flightId: string) => `${date}:${flightId}`;

/** Reason the airline gave for a disruption already in the feed. */
export const FEED_REASONS: Readonly<Record<string, DisruptionReason>> = {
  [flightKey('2026-10-09', 'SJ806')]: 'crewScheduling',
};

/** What the airline already did for travelers on flights it cancelled. */
export const FEED_CANCELLATIONS: Readonly<Record<string, { outcome: string; manifestNote: string }>> = {
  [flightKey('2026-10-09', 'SJ806')]: {
    outcome:
      '46 travelers rebooked on SJ 808 · Sat 10 Oct 12:10. Seats were protected automatically at 00:22.',
    manifestNote: 'rebooked on SJ 808',
  },
};

/** Bookings that exist in the console's booking ledger, so their references link. */
const BOOKINGS_IN_LEDGER = new Set(['VL3MZ8', 'VL9KMN']);

const KNOWN_TRAVELERS: Readonly<
  Record<string, ReadonlyArray<[name: string, reference: string, summary: string]>>
> = {
  [flightKey('2026-10-10', 'MR518')]: [['Andrea Lim Reyes', 'VL3MZ8', '1 traveler · checked in · seat 4A']],
  [flightKey('2026-10-08', 'MR518')]: [['Arjun Patel', 'VL9KMN', '1 traveler · no-show · refund requested']],
  [flightKey('2026-10-09', 'SJ806')]: [
    ['Hiroshi Yamamoto', 'VL5QWE', '2 travelers · rebooked on SJ 808 12:10'],
  ],
};

export const CONNECTIONS: Readonly<Record<string, readonly ConnectionAtRisk[]>> = {
  [flightKey('2026-10-09', 'PQ117')]: [
    {
      traveler: 'Kristine Ong · VL2RHM',
      onwardFlight: 'PQ 455 MNL → CEB 17:20 · now 1h 05m after arrival · rebooking offered on PQ 457 19:40',
    },
    {
      traveler: 'Diego Rivera · VL7XNA',
      onwardFlight: 'MR 518 MNL → SIN tomorrow 07:15 · overnight, no action needed',
    },
    {
      traveler: 'Aiko Tan +1 · VL4PZD',
      onwardFlight: 'SJ 207 MNL → TPE 18:30 · 1h 15m · within minimum connection',
    },
    {
      traveler: 'Luis Garcia · VL9BKW',
      onwardFlight: 'PQ 461 MNL → DVO 17:45 · 1h 30m · protected on PQ 463 20:10',
    },
  ],
};

const FIRST_NAMES = [
  'Maria',
  'Jose',
  'Kristine',
  'Mark',
  'Camille',
  'Rafael',
  'Isabel',
  'Luis',
  'Nicole',
  'Gabriel',
  'Trisha',
  'Joaquin',
  'Erika',
  'Kevin',
  'Aiko',
  'Liam',
  'Carmela',
  'Diego',
  'Elena',
  'Hiroshi',
];
const LAST_NAMES = [
  'Santos',
  'Bautista',
  'Garcia',
  'Torres',
  'Flores',
  'Ramos',
  'Castillo',
  'Domingo',
  'Lim',
  'Tan',
  'Go',
  'Ong',
  'Chua',
  'Pascual',
  'Manalo',
  'Ocampo',
  'Yamamoto',
  'Kim',
  'Rivera',
  'Javier',
];
const REFERENCE_LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const CABINS = ['economy', 'economy', 'premium economy', 'economy'];

/** FNV-1a: a small, stable hash so generated travelers don't change between visits. */
function hashOf(text: string): number {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

const MANIFEST_PREVIEW_SIZE = 5;

/**
 * Up to five bookings on the flight: the known ones first, then generated travelers.
 * `cancelledNote` describes what happened to travelers when the flight is cancelled.
 */
export function manifestFor(day: FeedDay, flight: OpsFlight, cancelledNote: string): ManifestEntry[] {
  const key = `${day.seed}:${flight.id}`;
  const manifest: ManifestEntry[] = (KNOWN_TRAVELERS[flightKey(day.date, flight.id)] ?? []).map(
    ([travelerName, bookingReference, summary]) => ({
      travelerName,
      bookingReference,
      summary,
      hasBookingRecord: BOOKINGS_IN_LEDGER.has(bookingReference),
    }),
  );
  const size = Math.min(MANIFEST_PREVIEW_SIZE, flight.velaTravelers);
  for (let index = 0; manifest.length < size; index += 1) {
    const hash = hashOf(key + index);
    const party = 1 + (hash % 3);
    const situation =
      flight.phase === 'departed'
        ? 'flown'
        : flight.phase === 'cancelled'
          ? cancelledNote
          : CABINS[hash % CABINS.length];
    manifest.push({
      travelerName: `${FIRST_NAMES[hash % FIRST_NAMES.length]} ${LAST_NAMES[(hash >>> 7) % LAST_NAMES.length]}${party > 1 ? ` +${party - 1}` : ''}`,
      bookingReference: `VL${hash % 10}${REFERENCE_LETTERS[(hash >>> 4) % 24]}${REFERENCE_LETTERS[(hash >>> 9) % 24]}${(hash >>> 14) % 10}`,
      summary: `${party} ${party === 1 ? 'traveler' : 'travelers'} · ${situation}`,
      hasBookingRecord: false,
    });
  }
  return manifest;
}

const entry = (time: string, title: string, detail: string): FlightTimelineEntry => ({ time, title, detail });

const FEED_TIMELINES: Readonly<Record<string, readonly FlightTimelineEntry[]>> = {
  [flightKey('2026-10-09', 'PQ117')]: [
    entry('00:12', 'Delay posted by Pacific Crest', 'Late inbound aircraft · new departure 14:50'),
    entry('00:14', '31 travelers notified', 'Text message, email and app'),
    entry('00:20', '4 connections flagged', 'Rebooking options included in the message'),
  ],
  [flightKey('2026-10-09', 'SJ806')]: [
    entry('00:20', 'Cancelled by Solenne', 'Crew scheduling'),
    entry('00:22', '46 travelers rebooked on SJ 808', 'Seats protected automatically'),
    entry('00:25', 'Travelers notified', 'Text message, email and app'),
  ],
  [flightKey('2026-10-09', 'HC911')]: [
    entry('00:12', 'Gate changed 112 → 118', 'From the Halcyon feed'),
    entry('00:12', 'Travelers notified', 'App notification'),
  ],
};

/** What the airline feed has logged for the flight, newest first. */
export function feedTimelineFor(day: FeedDay, flight: OpsFlight, airlineName: string): FlightTimelineEntry[] {
  const known = FEED_TIMELINES[flightKey(day.date, flight.id)];
  if (known) return [...known];

  if (flight.phase === 'departed') {
    const landed = /^Landed (\d\d:\d\d)(?: · (\d+ min) late)?/.exec(flight.estimateNote);
    if (!landed) return [entry(flight.estimatedTime, 'Departed', 'In the air · 12 min late off the gate')];
    const [, landedAt, lateBy] = landed;
    return [
      entry(landedAt, 'Landed', lateBy ? `Arrived ${lateBy} late` : 'Arrived on time'),
      entry(flight.estimatedTime, 'Departed', `Pushback from gate ${flight.gate}`),
    ];
  }
  if (flight.status.label === 'Boarding') {
    return [
      entry('00:35', 'Boarding started', `Gate ${flight.gate}`),
      entry('23:15', 'Check-in closed', `${flight.velaTravelers} Vela travelers checked in`),
    ];
  }
  return [
    entry(FEED_SYNCED_AT, 'Schedule confirmed', `From the ${airlineName} feed`),
    entry('', 'Check-in opens', '24 hours before departure · online and app'),
  ];
}

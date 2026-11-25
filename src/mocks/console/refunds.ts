import type { StatusTone } from '@/components/ui';
import type { PolicyCheck, RefundRequestStatus } from '@/types/console/refund';

/** Staff who review refunds, by initials. LN is the signed-in demo user. */
export const REFUND_REVIEWERS: Readonly<Record<string, string>> = {
  LN: 'Lea Navarro',
  RD: 'Ramon Diaz',
  BS: 'Bea Santos',
  IC: 'Ian Cruz',
};

export const APPROVAL_LIMIT = 50_000;
export const FINANCE_APPROVER = 'Bea Santos';
/** The time stamped on decisions made in this demo. */
export const DECISION_TIME = 'Today 00:58';

/** Bookings that exist in the console's booking ledger, so their references link. */
export const REFUND_BOOKINGS_IN_LEDGER = new Set([
  'VL1FJS',
  'VL8KQN',
  'VL3HBC',
  'VL6TQP',
  'VL2WZX',
  'VL9KMN',
  'VL4CNE',
  'VL7RDM',
  'VL2KAF',
  'VL6PLS',
  'VL9GHE',
  'VL3WQD',
]);

/** Customer accounts on the Customers page. */
export const REFUND_CUSTOMER_IDS: Readonly<Record<string, string>> = {
  VL1FJS: 'sophie',
  VL8KQN: 'marco',
  VL6TQP: 'ken',
  VL2WZX: 'lara',
};

type Verdict = 'Eligible' | 'Partial' | 'Outside policy' | 'Needs document';

const VERDICT_TONES: Record<Verdict, StatusTone> = {
  Eligible: 'success',
  Partial: 'warning',
  'Outside policy': 'danger',
  'Needs document': 'warning',
};

export interface RefundRequestSeed {
  bookingReference: string;
  customerName: string;
  reason: string;
  requestedAmount: number;
  eligibleAmount: number;
  policy: { label: Verdict; tone: StatusTone };
  fare: string;
  requestedAt: string;
  age: string;
  isOverdue: boolean;
  /** Initials, or null when nobody has picked it up. */
  ownerInitials: string | null;
  message: string;
  checks: PolicyCheck[];
  status: RefundRequestStatus;
  /** For requests decided before this session. */
  seededDecision?: { by: string; at: string };
}

const pass = (text: string): PolicyCheck => ({ result: 'pass', text });
const fail = (text: string): PolicyCheck => ({ result: 'fail', text });
const note = (text: string): PolicyCheck => ({ result: 'note', text });

function pending(
  bookingReference: string,
  customerName: string,
  reason: string,
  requestedAmount: number,
  eligibleAmount: number,
  verdict: Verdict,
  age: string,
  ownerInitials: string | null,
  fare: string,
  requestedAt: string,
  message: string,
  checks: PolicyCheck[],
): RefundRequestSeed {
  return {
    bookingReference,
    customerName,
    reason,
    requestedAmount,
    eligibleAmount,
    policy: { label: verdict, tone: VERDICT_TONES[verdict] },
    fare,
    requestedAt,
    age,
    isOverdue: Number.parseInt(age, 10) > 48,
    ownerInitials,
    message,
    checks,
    status: 'pending',
  };
}

/** Waiting for a decision, oldest first is how reviewers work through them. */
const PENDING: RefundRequestSeed[] = [
  pending(
    'VL1FJS',
    'Sophie Laurent',
    'Voluntary cancellation',
    14960,
    4120,
    'Partial',
    '50h',
    null,
    'Classic, non-refundable',
    '7 Oct 22:10',
    'Our plans changed and we can no longer travel to Taipei in November. Could we get a refund, or at least part of it?',
    [
      fail('Classic fare is non-refundable'),
      pass('Taxes and carrier fees refundable: ₱4,120'),
      note('Vela Protect not purchased'),
    ],
  ),
  pending(
    'VL8KQN',
    'Marco Villanueva',
    'Airline schedule change',
    71560,
    71560,
    'Eligible',
    '15h',
    'LN',
    'Flex',
    '8 Oct 09:30',
    'Departure moved by 5 hours and we will miss our connection in Narita. Please refund all four tickets.',
    [
      pass('Schedule change of more than 3 hours'),
      pass('Full refund allowed on any fare'),
      note('Over ₱50,000 — needs Finance approval'),
    ],
  ),
  pending(
    'VL3HBC',
    'Grace Lim',
    'Medical · Vela Protect',
    32400,
    32400,
    'Eligible',
    '59h',
    'RD',
    'Saver + Protect',
    '6 Oct 14:02',
    'I was admitted to hospital and cannot fly. Medical certificate attached.',
    [
      pass('Vela Protect active on booking'),
      pass('Medical certificate attached and legible'),
      pass('Claim filed before departure'),
    ],
  ),
  pending(
    'VL6TQP',
    'Ken Aquino',
    'Duplicate booking',
    9870,
    9870,
    'Eligible',
    '4h',
    null,
    'Saver',
    '8 Oct 20:45',
    'I accidentally booked the same flight twice. Please cancel VL6TQP and keep the other one.',
    [
      pass('Matching booking VL6TQ1 found, same traveler and flight'),
      pass('Requested within 24 hours of purchase'),
      note('Account flagged: 3 duplicate bookings in 30 days'),
    ],
  ),
  pending(
    'VL2WZX',
    'Lara Santos',
    'Voluntary cancellation',
    18200,
    0,
    'Outside policy',
    '85h',
    'RD',
    'Saver, non-refundable',
    '5 Oct 11:30',
    'I would like to cancel my trip to Bangkok.',
    [
      fail('Saver fare is non-refundable'),
      fail('Taxes already used — flight departed 4 Oct'),
      note('Offer travel credit as goodwill?'),
    ],
  ),
  pending(
    'VL9KMN',
    'Arjun Patel',
    'Missed flight',
    22640,
    5980,
    'Partial',
    '19h',
    'LN',
    'Classic, non-refundable',
    '8 Oct 06:12',
    'Traffic to the airport was terrible and I missed check-in. Can I get anything back?',
    [
      fail('No-show on the outbound flight'),
      pass('Unused return taxes refundable: ₱5,980'),
      note('No-show fee of ₱1,500 applies'),
    ],
  ),
  pending(
    'VL2KAF',
    'Celeste Ocampo',
    'Medical · Vela Protect',
    52310,
    52310,
    'Eligible',
    '40h',
    'RD',
    'Classic + Protect',
    '7 Oct 09:15',
    'My mother had surgery and we have to stay with her in December. Doctor’s letter attached for all three of us.',
    [
      pass('Vela Protect active for all 3 travelers'),
      pass('Doctor’s letter attached and legible'),
      note('Over ₱50,000 — needs Finance approval'),
    ],
  ),
  pending(
    'VL6PLS',
    'Noel Villareal',
    'Airline schedule change',
    26700,
    26700,
    'Eligible',
    '12h',
    null,
    'Classic',
    '8 Oct 13:05',
    'Halcyon moved our return by a whole day. That doesn’t work with school. Full refund please.',
    [pass('Return moved by 24 hours'), pass('Full refund allowed on any fare')],
  ),
  pending(
    'VL4CNE',
    'Bianca Ramos',
    'Visa not approved',
    29880,
    7460,
    'Partial',
    '13h',
    null,
    'Classic, non-refundable',
    '8 Oct 11:20',
    'My husband’s Singapore visa was refused. Can we get our money back for both tickets?',
    [
      fail('Visa refusal isn’t covered by the Classic fare'),
      pass('Taxes and carrier fees refundable: ₱7,460'),
      note('Refusal letter attached'),
    ],
  ),
  pending(
    'VL3WQD',
    'Hiro Tanaka',
    'Bereavement',
    33560,
    33560,
    'Needs document',
    '22h',
    'LN',
    'Classic',
    '8 Oct 02:50',
    'My father passed away and we need to fly to Osaka instead. Very sorry for the trouble.',
    [
      pass('Kestrel Airways bereavement waiver applies'),
      note('Death certificate requested — not yet uploaded'),
    ],
  ),
  pending(
    'VL9GHE',
    'Tricia Manalo',
    '24-hour cancellation',
    6980,
    6980,
    'Eligible',
    '28h',
    null,
    'Saver',
    '7 Oct 20:30',
    'I booked the wrong dates, sorry! Please cancel.',
    [pass('Cancelled within 24 hours of booking'), pass('Full refund, no fee')],
  ),
  pending(
    'VL7RDM',
    'Jun Pascual',
    'Voluntary cancellation',
    9420,
    2140,
    'Partial',
    '8h',
    null,
    'Saver, non-refundable',
    '8 Oct 16:40',
    'Work trip to Seoul got cancelled. Is any of the fare refundable?',
    [fail('Saver fare is non-refundable'), pass('Taxes and carrier fees refundable: ₱2,140')],
  ),
];

const CUSTOMER_MESSAGES: Readonly<Record<string, string>> = {
  'Duplicate booking': 'I booked this twice by mistake — please cancel one.',
  'Airline schedule change': 'The airline changed our flight time and it no longer works for us.',
  'Voluntary cancellation': 'We can’t travel anymore. Please refund what you can.',
  'Medical · Vela Protect': 'I’m unwell and my doctor says I shouldn’t fly. Certificate attached.',
  'Flight cancelled by airline': 'Our flight was cancelled and the new one doesn’t work.',
  '24-hour cancellation': 'Booked the wrong day, sorry — please cancel.',
  'Missed flight': 'I missed the flight. Is there anything you can refund?',
};

function decided(
  bookingReference: string,
  customerName: string,
  reason: string,
  amount: number,
  byInitials: string,
  at: string,
  status: 'approved' | 'rejected',
): RefundRequestSeed {
  const isApproved = status === 'approved';
  const verdict: Verdict = isApproved ? 'Eligible' : 'Outside policy';
  return {
    bookingReference,
    customerName,
    reason,
    requestedAmount: amount,
    eligibleAmount: amount,
    policy: { label: verdict, tone: VERDICT_TONES[verdict] },
    fare: isApproved ? 'Per fare rules' : 'Saver, non-refundable',
    requestedAt: 'earlier',
    age: at,
    isOverdue: false,
    ownerInitials: byInitials,
    message: CUSTOMER_MESSAGES[reason] ?? '',
    checks: isApproved
      ? [
          pass(
            reason === 'Voluntary cancellation'
              ? 'Taxes and carrier fees refundable'
              : 'Covered by fare rules',
          ),
          pass('Refunded to the original payment'),
        ]
      : [
          fail(
            reason === 'Missed flight' ? 'No-show on a non-refundable fare' : 'Saver fare is non-refundable',
          ),
          fail('Taxes already used'),
        ],
    status,
    seededDecision: { by: byInitials, at: at.includes(' ') ? at : `Today ${at}` },
  };
}

/** Decided before this session, newest first. */
const DECIDED: RefundRequestSeed[] = [
  decided('VL6KWE', 'Lianne Cortez', 'Flight cancelled by airline', 22960, 'LN', '00:44', 'approved'),
  decided('VL1MZA', 'Rico Dimaculangan', '24-hour cancellation', 9870, 'BS', '00:38', 'approved'),
  decided('VL7DGS', 'Teresa Lao', 'Airline schedule change', 27450, 'RD', '00:33', 'approved'),
  decided('VL4BYR', 'Benjie Santos', 'Voluntary cancellation', 6300, 'LN', '00:27', 'approved'),
  decided('VL2HQM', 'Paula Ferrer', 'Duplicate booking', 12480, 'RD', '00:21', 'approved'),
  decided('VL5TRX', 'Gerald Sy', 'Airline schedule change', 31200, 'LN', '00:16', 'approved'),
  decided('VL8NCF', 'Nina Bautista', 'Voluntary cancellation', 4120, 'BS', '00:09', 'approved'),
  decided('VL9QTE', 'Yuki Mori', 'Duplicate booking', 15300, 'BS', '00:05', 'approved'),
  decided('VL3JPB', 'Oscar Velasco', 'Medical · Vela Protect', 18640, 'RD', '00:02', 'approved'),
  decided('VL5LPD', 'Andre Lim', 'Voluntary cancellation', 11240, 'RD', 'Yesterday 21:40', 'rejected'),
  decided('VL0RKS', 'Celine Uy', 'Missed flight', 8760, 'LN', 'Yesterday 19:15', 'rejected'),
];

export const REFUND_REQUEST_SEEDS: readonly RefundRequestSeed[] = [...PENDING, ...DECIDED];

/** Week-level figures that don't move during the demo. */
export const REFUND_WEEK_FIGURES = {
  paidOutThisWeek: 1_240_000,
  medianHoursToDecision: 18,
  medianChangeHours: -4,
};

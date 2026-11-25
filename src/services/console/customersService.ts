import { DEMO_TODAY } from '@/config/demo';
import { formatDayMonth, formatShortDate } from '@/lib/date';
import { formatPeso, initialsOf } from '@/lib/format';
import { normalizeSpaces } from '@/lib/text';
import {
  CUSTOMER_BASE_TOTALS,
  CUSTOMER_BOOKINGS,
  CUSTOMER_SEEDS,
  type CustomerSeed,
} from '@/mocks/console/customers';
import { DEMO_STAFF_MEMBER } from '@/mocks/console/staff';
import type {
  CustomerActionResult,
  CustomerDetail,
  CustomerList,
  CustomerListQuery,
  CustomerNote,
  CustomerSegment,
  CustomerStatus,
  CustomerSummary,
  SuspensionReason,
  TravelCreditEntry,
  TravelCreditRequest,
} from '@/types/console/customer';

import { ApiError, mockRequest } from '../mockApi';
import { creditExpiryDate, travelCreditAmountError } from './customerRules';

/** The demo clock, for audit stamps. */
const ACTION_TIME = '00:58';
const STAFF = DEMO_STAFF_MEMBER.fullName;

/** What staff changed on each account this session. */
interface AccountChanges {
  status?: CustomerStatus;
  statusNote?: string;
  credits: TravelCreditEntry[];
  notes: CustomerNote[];
  passwordResetSentAt?: string;
}

const changes = new Map<string, AccountChanges>();

function changesFor(id: string): AccountChanges {
  let entry = changes.get(id);
  if (!entry) {
    entry = { credits: [], notes: [] };
    changes.set(id, entry);
  }
  return entry;
}

function currentStatus(seed: CustomerSeed): CustomerStatus {
  return changes.get(seed.id)?.status ?? seed.status;
}

function creditsOf(seed: CustomerSeed): TravelCreditEntry[] {
  return [...(changes.get(seed.id)?.credits ?? []), ...seed.credits];
}

function toSummary(seed: CustomerSeed): CustomerSummary {
  return {
    id: seed.id,
    fullName: seed.fullName,
    initials: initialsOf(seed.fullName),
    maskedEmail: seed.maskedEmail,
    memberNumber: seed.memberNumber,
    tier: seed.tier,
    trips: seed.trips,
    lifetimeValue: seed.lifetimeValue,
    creditBalance: creditsOf(seed).reduce((sum, credit) => sum + credit.amount, 0),
    status: currentStatus(seed),
  };
}

function toDetail(seed: CustomerSeed): CustomerDetail {
  const accountChanges = changes.get(seed.id);
  const status = currentStatus(seed);
  return {
    ...toSummary(seed),
    firstName: seed.fullName.split(' ')[0],
    memberSince: seed.memberSince,
    tierProgress: seed.tierProgress,
    statusNote: status === 'active' ? undefined : (accountChanges?.statusNote ?? seed.statusNote),
    maskedContact: `${seed.maskedEmail} · +•• ••• ••• ${seed.phoneLastFour}`,
    bookings: seed.bookingReferences.map((reference) => {
      const booking = CUSTOMER_BOOKINGS[reference];
      return {
        reference,
        destination: booking.destination,
        summary: booking.summary,
        status: { label: booking.status, tone: booking.tone },
      };
    }),
    pastTrips: seed.pastTrips,
    credits: creditsOf(seed),
    notes: [...seed.notes, ...(accountChanges?.notes ?? [])],
    passwordResetSentAt: accountChanges?.passwordResetSentAt,
    upcomingBookingCount: seed.bookingReferences.filter((reference) => !CUSTOMER_BOOKINGS[reference].isFlown)
      .length,
  };
}

const SEGMENT_FILTERS: Record<CustomerSegment, (seed: CustomerSeed) => boolean> = {
  all: () => true,
  gold: (seed) => seed.tier === 'Gold' || seed.tier === 'Platinum',
  new: (seed) => seed.isNewThisWeek,
  flagged: (seed) => currentStatus(seed) !== 'active',
};

function findSeed(id: string): CustomerSeed {
  const seed = CUSTOMER_SEEDS.find((candidate) => candidate.id === id);
  if (!seed) throw new ApiError('not_found', 'That customer account doesn’t exist.');
  return seed;
}

/** Applies a change to an account and returns the refreshed detail with a message. */
function change(
  id: string,
  apply: (seed: CustomerSeed, entry: AccountChanges) => string,
  latencyMs?: number,
) {
  return mockRequest<CustomerActionResult>(() => {
    const seed = findSeed(id);
    const message = apply(seed, changesFor(id));
    return { customer: toDetail(seed), message };
  }, latencyMs);
}

/** Recently active accounts in a segment, matched on name, member number, email or phone. */
export function listCustomers({ segment, search }: CustomerListQuery): Promise<CustomerList> {
  return mockRequest(() => {
    const term = normalizeSpaces(search).toLowerCase();
    const customers = CUSTOMER_SEEDS.filter(SEGMENT_FILTERS[segment])
      .filter(
        (seed) =>
          !term || `${seed.fullName} ${seed.memberNumber} ${seed.fullContact}`.toLowerCase().includes(term),
      )
      .map(toSummary);
    return {
      customers,
      segmentTotals: {
        ...CUSTOMER_BASE_TOTALS,
        flagged: CUSTOMER_SEEDS.filter(SEGMENT_FILTERS.flagged).length,
      },
      joinedThisWeek: CUSTOMER_BASE_TOTALS.new,
    };
  });
}

export function getCustomer(id: string): Promise<CustomerDetail | null> {
  return mockRequest(() => {
    const seed = CUSTOMER_SEEDS.find((candidate) => candidate.id === id);
    return seed ? toDetail(seed) : null;
  });
}

/** Shows the full email and phone. Every reveal is written to the audit trail. */
export function revealCustomerContact(id: string): Promise<{ contact: string; auditNote: string }> {
  return mockRequest(() => ({
    contact: findSeed(id).fullContact,
    auditNote: `Reveal logged to the audit trail · ${STAFF}, ${ACTION_TIME}`,
  }));
}

export function addCustomerNote(id: string, text: string): Promise<CustomerActionResult> {
  return change(id, (_seed, entry) => {
    const note = text.trim();
    if (!note) throw new ApiError('empty_note', 'Write a note first.');
    entry.notes.push({ author: STAFF, when: 'Just now', text: note });
    return 'Note saved';
  });
}

/** Emails a one-time link that expires in 30 minutes; optionally texts it too. */
export function sendPasswordReset(
  id: string,
  { alsoBySms }: { alsoBySms: boolean },
): Promise<CustomerActionResult> {
  return change(id, (seed, entry) => {
    if (currentStatus(seed) === 'suspended') {
      throw new ApiError('suspended', 'Reinstate the account before sending a reset link.');
    }
    entry.passwordResetSentAt = ACTION_TIME;
    return `Reset link sent to ${seed.maskedEmail}${alsoBySms ? ' and by text' : ''}`;
  });
}

export function issueTravelCredit(id: string, request: TravelCreditRequest): Promise<CustomerActionResult> {
  return change(id, (seed, entry) => {
    if (currentStatus(seed) === 'suspended') {
      throw new ApiError('suspended', 'Travel credit can’t be issued while the account is suspended.');
    }
    const amountError = travelCreditAmountError(request.amount);
    if (amountError) throw new ApiError('invalid_amount', amountError);
    const expires = creditExpiryDate(request.validForMonths);
    entry.credits.unshift({
      title: request.reason,
      detail: `Issued ${formatShortDate(DEMO_TODAY)} by ${STAFF} · expires ${expires}`,
      amount: request.amount,
    });
    return `${formatPeso(request.amount)} travel credit issued to ${seed.fullName} · expires ${expires}`;
  });
}

/** Signs the customer out everywhere and blocks sign-in and booking. Upcoming tickets stay valid. */
export function suspendCustomer(id: string, reason: SuspensionReason): Promise<CustomerActionResult> {
  return change(id, (seed, entry) => {
    entry.status = 'suspended';
    entry.statusNote = `Suspended ${formatDayMonth(DEMO_TODAY)} by ${STAFF} · ${reason}`;
    return `${seed.fullName} suspended · signed out on all devices`;
  });
}

export function reinstateCustomer(id: string): Promise<CustomerActionResult> {
  return change(id, (seed, entry) => {
    entry.status = 'active';
    entry.statusNote = undefined;
    return `${seed.fullName} reinstated · they can sign in and book again`;
  });
}

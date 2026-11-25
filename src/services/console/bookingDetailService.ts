import { AIRLINE_NAMES } from '@/data/airlineDesignators';
import { formatPeso } from '@/lib/format';
import { normalizeSpaces } from '@/lib/text';
import {
  bookingFacts,
  buildBookingDetail,
  event,
  fullPhone,
  initialCase,
  ISSUED_STATUSES,
  paymentHoldUntil,
  reissuedTicket,
  STAFF_NAME,
  travelerName,
  type BookingCase,
} from '@/mocks/console/bookingDetails';
import { DEMO_STAFF_MEMBER } from '@/mocks/console/staff';
import type { ConsoleBooking } from '@/types/console/booking';
import type {
  BookingActionResult,
  BookingDetail,
  RefundRequest,
  ReissueRequest,
  ResendItineraryRequest,
} from '@/types/console/bookingDetail';
import { DATE_CHANGE_OPTIONS } from '@/types/console/bookingDetail';

import { ApiError, mockRequest } from '../mockApi';
import { findConsoleBooking } from './bookingsService';

/** What staff have done to each booking this session. */
const cases = new Map<string, BookingCase>();

function caseFor(booking: ConsoleBooking): BookingCase {
  const existing = cases.get(booking.reference);
  if (existing) return existing;
  const created = initialCase(booking);
  cases.set(booking.reference, created);
  return created;
}

async function load(reference: string): Promise<{ booking: ConsoleBooking; bookingCase: BookingCase }> {
  const booking = await findConsoleBooking(reference);
  if (!booking) throw new ApiError('not_found', `Booking ${reference} wasn’t found.`);
  return { booking, bookingCase: caseFor(booking) };
}

/** Applies a change to the booking's case and returns the refreshed detail. */
async function update(
  reference: string,
  change: (
    booking: ConsoleBooking,
    bookingCase: BookingCase,
  ) => { patch: Partial<BookingCase>; message: string },
  latencyMs?: number,
): Promise<BookingActionResult> {
  const { booking, bookingCase } = await load(reference);
  return mockRequest(() => {
    const { patch, message } = change(booking, bookingCase);
    const next = { ...bookingCase, ...patch };
    cases.set(booking.reference, next);
    return { detail: buildBookingDetail(booking, next), message };
  }, latencyMs);
}

export async function getBookingDetail(reference: string): Promise<BookingDetail | null> {
  const booking = await findConsoleBooking(reference);
  return mockRequest(() => (booking ? buildBookingDetail(booking, caseFor(booking)) : null));
}

export function addBookingNote(reference: string, text: string): Promise<BookingActionResult> {
  return update(reference, (_booking, bookingCase) => ({
    patch: {
      notes: [...bookingCase.notes, { author: STAFF_NAME, when: 'Just now', text: text.trim() }],
      events: [
        event('Internal note added', `${STAFF_NAME} · ${text.trim().slice(0, 60)}`),
        ...bookingCase.events,
      ],
    },
    message: 'Note saved',
  }));
}

/** Shows the customer's full mobile number. Every reveal is written to the audit trail. */
export async function revealCustomerPhone(
  reference: string,
): Promise<{ phone: string; detail: BookingDetail }> {
  const result = await update(reference, (_booking, bookingCase) => ({
    patch: {
      events: [
        event('Personal data revealed', `Mobile number · ${STAFF_NAME} · logged to the audit trail`),
        ...bookingCase.events,
      ],
    },
    message: 'Access logged',
  }));
  return {
    phone: fullPhone(result.detail.booking, bookingFacts(result.detail.booking)),
    detail: result.detail,
  };
}

export function resendBookingItinerary(
  reference: string,
  request: ResendItineraryRequest,
): Promise<BookingActionResult> {
  return update(
    reference,
    (booking, bookingCase) => {
      const recipients = [
        request.toLeadTraveler ? booking.email : null,
        request.copyToMe ? DEMO_STAFF_MEMBER.email : null,
      ].filter((recipient): recipient is string => Boolean(recipient));
      if (recipients.length === 0) throw new ApiError('no_recipient', 'Choose at least one recipient.');
      const attachments = request.attachments.length ? ` · ${request.attachments.join(', ')}` : '';
      return {
        patch: {
          events: [
            event('Itinerary emailed', `${recipients.join(', ')}${attachments} · ${STAFF_NAME}`),
            ...bookingCase.events,
          ],
        },
        message: `Itinerary sent to ${recipients.join(' and ')}`,
      };
    },
    500,
  );
}

export function reissueTickets(reference: string, request: ReissueRequest): Promise<BookingActionResult> {
  return update(
    reference,
    (booking, bookingCase) => {
      const facts = bookingFacts(booking);
      const indexes = request.travelerIndexes.filter((index) => index < facts.people.length);
      if (indexes.length === 0) throw new ApiError('no_travelers', 'Choose at least one traveler.');
      const isNameCorrection = request.reason === 'Name correction';
      const isDateChange = request.reason === 'Date change requested';

      const reissued = { ...bookingCase.reissued };
      const renamed = { ...bookingCase.renamed };
      const changes: string[] = [];
      indexes.forEach((index) => {
        reissued[index] = request.reason.toLowerCase();
        if (isNameCorrection) {
          const corrected = normalizeSpaces(request.correctedNames[index] ?? '');
          changes.push(`${travelerName(facts, bookingCase, index)} → ${corrected}`);
          renamed[index] = corrected;
        }
      });
      const numbers = indexes.map((index) => reissuedTicket(facts.people[index].ticket));
      const shiftOption = DATE_CHANGE_OPTIONS.find((option) => option.days === request.dayShift);
      const what = isNameCorrection
        ? changes.join(', ')
        : isDateChange && shiftOption
          ? `moved ${shiftOption.label.split(', ')[1]}`
          : '';

      return {
        patch: {
          reissued,
          renamed,
          dayShift: bookingCase.dayShift + (isDateChange ? request.dayShift : 0),
          events: [
            event(
              'Tickets reissued',
              `${numbers.join(', ')} · ${request.reason}${what ? ` · ${what}` : ''} · ${STAFF_NAME}`,
              'success',
            ),
            ...bookingCase.events,
          ],
        },
        message: `${indexes.length} ${indexes.length === 1 ? 'ticket' : 'tickets'} reissued · ${numbers[0]}${
          numbers.length > 1 ? ` and ${numbers.length - 1} more` : ''
        }`,
      };
    },
    700,
  );
}

/** Asks the airline to issue the e-tickets again; in the demo it always succeeds. */
export function retryTicketing(reference: string): Promise<BookingActionResult> {
  return update(
    reference,
    (booking, bookingCase) => {
      const numbers = bookingFacts(booking).people.map((person) => person.ticket);
      return {
        patch: {
          status: 'Ticketed',
          payment: 'Captured',
          events: [
            event(
              'Tickets issued',
              `${numbers.join(', ')} · ${AIRLINE_NAMES[booking.airline]} · retried by ${STAFF_NAME}`,
              'success',
            ),
            ...bookingCase.events,
          ],
        },
        message: `Tickets issued · ${numbers[0]}${numbers.length > 1 ? ` and ${numbers.length - 1} more` : ''}`,
      };
    },
    1300,
  );
}

export function sendPaymentLink(
  reference: string,
  channels: { email: boolean; sms: boolean },
): Promise<BookingActionResult> {
  return update(
    reference,
    (booking, bookingCase) => {
      if (!channels.email && !channels.sms) {
        throw new ApiError('no_channel', 'Choose email, text message or both.');
      }
      const detail = buildBookingDetail(booking, bookingCase);
      const holdUntil = paymentHoldUntil(booking);
      const sentTo = [
        channels.email ? booking.email : null,
        channels.sms ? detail.paymentLink.smsTo : null,
      ].filter(Boolean);
      const via = [channels.email ? booking.email : null, channels.sms ? 'text message' : null].filter(
        Boolean,
      );
      return {
        patch: {
          isPaymentLinkSent: true,
          events: [
            event(
              'Payment link sent',
              `${formatPeso(booking.total)} · ${via.join(', ')} · expires ${holdUntil} · ${STAFF_NAME}`,
              'warning',
            ),
            ...bookingCase.events,
          ],
        },
        message: `Payment link sent to ${sentTo.join(' and ')} · expires ${holdUntil}`,
      };
    },
    500,
  );
}

/**
 * Refunds within the agent's limit and the fare rules go straight back to the customer. Anything
 * else is sent to Finance for a second approval, and no money moves until they approve.
 */
export function issueRefund(reference: string, request: RefundRequest): Promise<BookingActionResult> {
  return update(
    reference,
    (booking, bookingCase) => {
      const detail = buildBookingDetail(booking, bookingCase);
      const option = detail.refundOptions.find((candidate) => candidate.type === request.type);
      if (!option || !detail.actions.canRefund) {
        throw new ApiError('not_refundable', 'This booking can’t be refunded right now.');
      }
      const amount = formatPeso(option.amount);
      const destination = detail.refundDestination;

      if (option.requiresFinance) {
        return {
          patch: {
            pendingRefund: { type: option.type, amount: option.amount, reason: request.reason },
            events: [
              event(
                'Refund sent for approval',
                `${amount} to ${destination} · ${request.reason} · waiting for Finance · ${STAFF_NAME}`,
                'warning',
              ),
              ...bookingCase.events,
            ],
          },
          message: `${amount} refund sent to Finance · Bea Santos will review it`,
        };
      }

      const isFull = option.type === 'full';
      const cancelsAll = isFull || option.type === 'taxes';
      const isIssued = ISSUED_STATUSES.includes(bookingCase.status);
      const ticketsNote =
        cancelsAll && isIssued
          ? ` · ${booking.travelerCount === 1 ? 'ticket' : 'all tickets'} cancelled`
          : '';
      return {
        patch: {
          refunded: option.type,
          refundReason: request.reason,
          status: isFull ? 'Refunded' : option.type === 'taxes' ? 'Cancelled' : 'Partially refunded',
          payment: isFull ? 'Refunded' : 'Partially refunded',
          events: [
            event(
              'Refund issued',
              `${amount} to ${destination} · ${request.reason}${ticketsNote} · ${STAFF_NAME}`,
              'danger',
            ),
            ...bookingCase.events,
          ],
        },
        message: `${amount} refund issued${request.notifyCustomer ? ' · customer emailed' : ''}`,
      };
    },
    700,
  );
}

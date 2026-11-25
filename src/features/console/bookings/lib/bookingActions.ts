import { formatPeso } from '@/lib/format';
import { editDistance, normalizeSpaces } from '@/lib/text';
import type { BookingDetail, RefundOption } from '@/types/console/bookingDetail';

/** Airlines allow a name correction of up to three letters on the same ticket. */
export const MAX_NAME_CORRECTION_LETTERS = 3;
export const MIN_FINANCE_NOTE_LENGTH = 20;

export function nameCorrectionError(corrected: string, current: string): string | undefined {
  const name = normalizeSpaces(corrected);
  if (!name) return 'Enter the name as printed on the passport';
  const changed = editDistance(name, current);
  if (changed === 0) return 'This is the current spelling · correct it, or untick this traveler';
  if (changed > MAX_NAME_CORRECTION_LETTERS) {
    return `That changes ${changed} letters and only ${MAX_NAME_CORRECTION_LETTERS} are allowed · cancel and rebook for a different traveler`;
  }
  return undefined;
}

export function financeNoteError(option: RefundOption, note: string): string | undefined {
  if (!option.requiresFinance || note.trim().length >= MIN_FINANCE_NOTE_LENGTH) return undefined;
  return 'Explain the override in at least 20 characters · Finance can’t approve it without a reason';
}

/** The "What happens next" list for a refund, in the order things happen. */
export function refundPlan(detail: BookingDetail, option: RefundOption, notifyCustomer: boolean): string[] {
  const { booking, travelers, refundDestination } = detail;
  const amount = formatPeso(option.amount);
  const firstName = booking.leadTraveler.split(' ')[0];
  const isIssued = travelers.some((traveler) => traveler.ticketNumber);
  const points: string[] = [];

  if (!isIssued) {
    points.push('The booking is cancelled and the held seats are released · no airline penalty');
    points.push(`${amount} goes back to ${refundDestination} in 5–10 banking days`);
  } else if (option.requiresFinance) {
    points.push('Finance reviews the request, usually within 1 business day');
    points.push(
      `Tickets stay valid until Finance approves, then ${
        booking.travelerCount === 1 ? 'the ticket is' : `all ${booking.travelerCount} tickets are`
      } cancelled`,
    );
    points.push(`${amount} goes back to ${refundDestination} once approved`);
  } else if (option.type === 'custom') {
    const leaving = travelers[travelers.length - 1].displayName;
    const staying = travelers
      .slice(0, -1)
      .map((traveler) => traveler.displayName)
      .join(' and ');
    points.push(`${leaving}’s e-ticket is cancelled · ${staying} keeps flying`);
    points.push(`${amount} goes back to ${refundDestination} in 5–10 banking days`);
  } else {
    points.push(
      booking.travelerCount === 1
        ? 'The e-ticket is cancelled and the seat is released'
        : `${booking.travelerCount === 2 ? 'Both e-tickets are' : `All ${booking.travelerCount} e-tickets are`} cancelled and the seats are released`,
    );
    points.push(`${amount} goes back to ${refundDestination} in 5–10 banking days`);
    const kept = booking.total - option.amount;
    if (kept > 0) points.push(`The ${detail.fare} fare (${formatPeso(kept)}) isn’t refundable and is kept`);
  }

  points.push(
    notifyCustomer
      ? option.requiresFinance
        ? `${firstName} is emailed once Finance decides`
        : `${firstName} gets a refund confirmation by email`
      : 'The customer isn’t emailed · let them know yourself',
  );
  return points;
}

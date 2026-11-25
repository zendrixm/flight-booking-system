import { formatDuration } from '@/lib/format';
import type { FlightStatusDraft } from '@/types/console/flightOps';

/** Delays longer than this are entered as a cancellation with rebooking. */
export const MAX_DELAY_MINUTES = 12 * 60;

const CLOCK_TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/** Minutes from one clock time to a later one, wrapping past midnight: 23:30 → 00:10 is 40. */
export function minutesAfter(from: string, to: string): number {
  const difference = toMinutes(to) - toMinutes(from);
  return difference < 0 ? difference + 24 * 60 : difference;
}

/** "2h 10m" from the scheduled time to the new one. */
export function delayLabel(scheduledTime: string, departureTime: string): string {
  return formatDuration(minutesAfter(scheduledTime, departureTime));
}

/**
 * Why a delayed departure can't be saved, or null when it can. The same rule runs in the form
 * and on the server: the new time must be a real, later time no more than 12 hours out.
 */
export function departureTimeError(scheduledTime: string, draft: FlightStatusDraft): string | null {
  if (draft.status !== 'delayed') return null;
  const time = draft.departureTime;
  if (!CLOCK_TIME.test(time)) return 'Enter the new departure time.';
  if (time === scheduledTime) {
    return 'That’s the scheduled time. Pick a later time, or set the status to On time.';
  }
  if (minutesAfter(scheduledTime, time) > MAX_DELAY_MINUTES) {
    return `${time} would be ${delayLabel(scheduledTime, time)} after the scheduled ${scheduledTime}. Delays over 12 hours must be entered as a cancellation with rebooking.`;
  }
  return null;
}

import { joinWithAnd } from '@/lib/format';
import { digitsOnly, isValidBookingReference, isValidEmail } from '@/lib/validation';
import type { SupportTopic } from '@/types/help';

export const SUPPORT_TOPIC_LABELS: Record<SupportTopic, string> = {
  change: 'Change or cancel a booking',
  refund: 'Refund',
  receipt: 'Receipt or invoice',
  baggage: 'Baggage',
  checkin: 'Check-in or boarding',
  other: 'Something else',
};

export const MESSAGE_TOPICS: readonly SupportTopic[] = ['change', 'refund', 'receipt', 'baggage', 'other'];
export const CALLBACK_TOPICS: readonly SupportTopic[] = ['change', 'refund', 'baggage', 'checkin', 'other'];

export const MIN_MESSAGE_LENGTH = 20;
export const MAX_ATTACHMENTS = 3;
export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;
export const ACCEPTED_ATTACHMENTS = '.pdf,.jpg,.jpeg,.png';

/** Upper-cases and strips anything that can't be in a booking reference while typing. */
export function sanitizeReference(value: string): string {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 6);
}

export interface MessageForm {
  topic: SupportTopic | '';
  bookingReference: string;
  replyTo: string;
  body: string;
  attachments: File[];
}

export type MessageErrors = Partial<Record<'topic' | 'bookingReference' | 'replyTo' | 'body', string>>;

export function messageErrors(form: MessageForm): MessageErrors {
  const errors: MessageErrors = {};
  if (!form.topic) errors.topic = 'Choose a topic so the right team picks this up.';
  if (form.bookingReference && !isValidBookingReference(form.bookingReference)) {
    errors.bookingReference = 'Booking references have 6 letters and numbers, like VL7Q2K.';
  }
  if (!isValidEmail(form.replyTo.trim())) errors.replyTo = 'Enter a full email address so we can reply.';
  const length = form.body.trim().length;
  if (length < MIN_MESSAGE_LENGTH) {
    errors.body = `Tell us a bit more — at least ${MIN_MESSAGE_LENGTH} characters (${length} so far).`;
  }
  return errors;
}

/** "To send, add a topic and a reply email." or "Ready to send." */
export function messageHint(errors: MessageErrors): string {
  const missing = [
    errors.topic ? 'a topic' : null,
    errors.body ? `a message of at least ${MIN_MESSAGE_LENGTH} characters` : null,
    errors.replyTo ? 'a reply email' : null,
    errors.bookingReference ? 'a full booking reference (or leave it blank)' : null,
  ].filter((item): item is string => item !== null);
  return missing.length ? `To send, add ${joinWithAnd(missing)}.` : 'Ready to send.';
}

/** "248 KB", "1.9 MB" */
export function formatFileSize(bytes: number): string {
  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export interface CallbackForm {
  numberChoice: 'account' | 'other';
  otherNumber: string;
  topic: SupportTopic | '';
  bookingReference: string;
  timing: 'asap' | 'scheduled';
  slotId: string;
}

export type CallbackErrors = Partial<Record<'otherNumber' | 'topic' | 'slotId', string>>;

export function callbackErrors(form: CallbackForm): CallbackErrors {
  const errors: CallbackErrors = {};
  const isInternational =
    /^\+\d[\d\s]{8,}$/.test(form.otherNumber.trim()) && digitsOnly(form.otherNumber).length >= 10;
  if (form.numberChoice === 'other' && !isInternational) {
    errors.otherNumber = 'Enter a mobile number with the country code, like +63 917 555 0123.';
  }
  if (!form.topic) errors.topic = 'Choose a topic so the right specialist calls you.';
  if (form.timing === 'scheduled' && !form.slotId) {
    errors.slotId = 'Pick a time slot, or choose As soon as possible.';
  }
  return errors;
}

import { formatCompactDay, type IsoDate } from '@/lib/date';
import { joinWithAnd } from '@/lib/format';
import { delayLabel, departureTimeError } from '@/services/console/flightOpsRules';
import {
  DISRUPTION_REASONS,
  type FlightOpsRecord,
  type FlightStatusDraft,
  type FlightStatusUpdate,
  type NotificationChannel,
  type RebookingPlan,
} from '@/types/console/flightOps';

import { isStatusLocked, statusWithDeparture } from './flightOpsPresentation';

export const ALL_CHANNELS: readonly NotificationChannel[] = ['sms', 'email', 'push'];
export const DEFAULT_REBOOKING: RebookingPlan = 'nextDay';

/** Everything the status panel edits for one flight. */
export interface StatusFormValues {
  draft: FlightStatusDraft;
  channels: readonly NotificationChannel[];
  rebooking: RebookingPlan;
}

export function initialFormValues(record: FlightOpsRecord): StatusFormValues {
  return { draft: record.statusDraft, channels: ALL_CHANNELS, rebooking: DEFAULT_REBOOKING };
}

/** Saving would cancel a flight that is still operating, so travelers need a rebooking plan. */
export function isCancellation(record: FlightOpsRecord, draft: FlightStatusDraft): boolean {
  return (
    !isStatusLocked(record.flight) && draft.status === 'cancelled' && record.flight.phase !== 'cancelled'
  );
}

/** True while nothing in the form differs from the saved status. Channels don't count: they aren't saved. */
export function isPristine(record: FlightOpsRecord, values: StatusFormValues): boolean {
  const saved = record.statusDraft;
  const { draft } = values;
  const sameDraft =
    saved.status === draft.status &&
    saved.departureTime === draft.departureTime &&
    saved.reason === draft.reason;
  return sameDraft && (!isCancellation(record, draft) || values.rebooking === DEFAULT_REBOOKING);
}

export function departureError(record: FlightOpsRecord, draft: FlightStatusDraft): string | null {
  return isStatusLocked(record.flight) ? null : departureTimeError(record.flight.scheduledTime, draft);
}

export function toStatusUpdate(record: FlightOpsRecord, values: StatusFormValues): FlightStatusUpdate {
  return {
    ...values.draft,
    channels: [...values.channels],
    rebooking: isCancellation(record, values.draft) ? values.rebooking : undefined,
  };
}

export function saveButtonLabel(cancels: boolean, notifies: boolean): string {
  if (cancels) return notifies ? 'Cancel flight and notify' : 'Cancel flight without notifying';
  return notifies ? 'Save and notify' : 'Save without notifying';
}

/** The note under the notification channels about onward connections. */
export function connectionsNote(record: FlightOpsRecord, draft: FlightStatusDraft): string {
  const count = record.connections.length;
  if (!count) return 'No onward connections at risk.';
  return draft.status === 'cancelled'
    ? `${count} travelers have onward connections. Their onward flights are protected with the rebooking.`
    : `${count} travelers have onward connections within 3 hours of the new arrival. Rebooking options will be offered in the message.`;
}

const CHANNEL_PHRASES: Record<NotificationChannel, string> = {
  sms: 'text message',
  email: 'email',
  push: 'app notification',
};

/** "Text message, email and app notification" */
export function channelListLabel(channels: readonly NotificationChannel[]): string {
  const phrase = joinWithAnd(
    ALL_CHANNELS.filter((channel) => channels.includes(channel)).map((channel) => CHANNEL_PHRASES[channel]),
  );
  return phrase.charAt(0).toUpperCase() + phrase.slice(1);
}

export type ConfirmKind = 'save' | 'cancel' | 'discard';

export interface ConfirmContent {
  role: 'dialog' | 'alertdialog';
  title: string;
  body: string;
  rows: ReadonlyArray<{ label: string; value: string }>;
  backLabel: string;
  confirmLabel: string;
  isDestructive: boolean;
}

const reasonLabel = (draft: FlightStatusDraft) =>
  DISRUPTION_REASONS.find((reason) => reason.id === draft.reason)?.label ?? draft.reason;

function newStatusLabel(record: FlightOpsRecord, draft: FlightStatusDraft): string {
  const { scheduledTime } = record.flight;
  switch (draft.status) {
    case 'delayed':
      return `Delayed ${delayLabel(scheduledTime, draft.departureTime)} · departs ${draft.departureTime}`;
    case 'onTime':
      return `On time · departs ${scheduledTime}`;
    case 'cancelled':
      return 'Cancelled';
    case 'diverted':
      return 'Diverted';
  }
}

/** Copy for the confirmation that stands between the form and travelers' phones. */
export function confirmContent(
  kind: ConfirmKind,
  record: FlightOpsRecord,
  values: StatusFormValues,
  date: IsoDate,
): ConfirmContent {
  const { flight, airlineName, connections } = record;
  const { draft, channels } = values;
  const travelers = flight.velaTravelers;
  const notifies = channels.length > 0;
  const notifyRow = {
    label: 'Notify',
    value: notifies ? `${travelers} travelers · ${channelListLabel(channels)}` : 'Nobody — notifications off',
  };

  if (kind === 'discard') {
    return {
      role: 'alertdialog',
      title: 'Discard your changes?',
      body: `Your edits to ${flight.flightNumber} won’t be saved. The flight stays ${statusWithDeparture(flight)} and nobody is notified.`,
      rows: [],
      backLabel: 'Keep editing',
      confirmLabel: 'Discard changes',
      isDestructive: true,
    };
  }

  if (kind === 'cancel') {
    const plan =
      record.rebookingOptions.find((option) => option.plan === values.rebooking) ??
      record.rebookingOptions[0];
    return {
      role: 'alertdialog',
      title: `Cancel ${flight.flightNumber} on ${formatCompactDay(date)}?`,
      body: `${travelers} Vela travelers will be told the flight is cancelled. This can’t be undone from the console — if ${airlineName} reinstates the flight, the airline feed will update it.`,
      rows: [
        { label: 'Reason', value: reasonLabel(draft) },
        { label: 'Travelers', value: plan.outcome },
        notifyRow,
        ...(connections.length
          ? [
              {
                label: 'Connections',
                value: `${connections.length} onward flights protected with the rebooking`,
              },
            ]
          : []),
      ],
      backLabel: 'Keep flight',
      confirmLabel: notifies ? `Cancel flight and notify ${travelers}` : 'Cancel flight without notifying',
      isDestructive: true,
    };
  }

  const isDisruption = draft.status !== 'onTime';
  return {
    role: 'dialog',
    title: notifies ? `Save and notify ${travelers} travelers?` : 'Save without notifying anyone?',
    body: notifies
      ? `Travelers on ${flight.flightNumber} get the new status right away. Messages can’t be recalled once they’re sent.`
      : 'The status changes in the console and the Vela app, but nobody is messaged. Travelers see it only when they open their trip.',
    rows: [
      { label: 'New status', value: newStatusLabel(record, draft) },
      { label: 'Was', value: statusWithDeparture(flight) },
      ...(isDisruption ? [{ label: 'Reason', value: reasonLabel(draft) }] : []),
      notifyRow,
      ...(isDisruption && connections.length
        ? [{ label: 'Connections', value: `${connections.length} at risk · rebooking options included` }]
        : []),
    ],
    backLabel: 'Back to edit',
    confirmLabel: notifies ? `Save and notify ${travelers}` : 'Save without notifying',
    isDestructive: false,
  };
}

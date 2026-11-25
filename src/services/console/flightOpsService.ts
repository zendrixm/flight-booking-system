import { DEMO_TODAY } from '@/config/demo';
import { AIRLINE_NAMES } from '@/data/airlineDesignators';
import { formatCompactDay } from '@/lib/date';
import {
  CONNECTIONS,
  FEED_CANCELLATIONS,
  FEED_DAYS,
  FEED_REASONS,
  FEED_SYNCED_AT,
  feedTimelineFor,
  flightKey,
  manifestFor,
  OPS_ACTION_TIME,
  type FeedDay,
} from '@/mocks/console/flightOps';
import { DEMO_STAFF_MEMBER } from '@/mocks/console/staff';
import {
  DISRUPTION_REASONS,
  FLIGHT_STATUS_CHOICES,
  type FlightBoardRequest,
  type FlightOpsBoard,
  type FlightOpsRecord,
  type FlightStatusDraft,
  type FlightStatusResult,
  type FlightStatusUpdate,
  type FlightTimelineEntry,
  type NotificationChannel,
  type OpsFlight,
  type RebookingOption,
  type RebookingPlan,
} from '@/types/console/flightOps';

import { ApiError, mockRequest } from '../mockApi';
import { delayLabel, departureTimeError } from './flightOpsRules';

/** A status ops saved over the feed's, with what it did for travelers. */
interface StoredUpdate {
  draft: FlightStatusDraft;
  rebooking?: RebookingPlan;
}

/** Changes made in the console this session, keyed by `flightKey`. */
const updates = new Map<string, StoredUpdate>();
const loggedEvents = new Map<string, FlightTimelineEntry[]>();

const CHANNEL_WORDS: Record<NotificationChannel, string> = { sms: 'text', email: 'email', push: 'app' };
const CHANNEL_ORDER: readonly NotificationChannel[] = ['sms', 'email', 'push'];

/** The short note the board shows under a cancelled flight's times, per rebooking plan. */
interface RebookingPlanFacts extends RebookingOption {
  estimateNote: string;
  manifestNote: string;
}

const labelOf = <T extends string>(options: ReadonlyArray<{ id: T; label: string }>, id: T) =>
  options.find((option) => option.id === id)?.label ?? id;

function dayIndexOf(date: string | null | undefined): number {
  return FEED_DAYS.findIndex((day) => day.date === date);
}

/** Today first, then the days ahead, then yesterday: where ops most likely means. */
function locateDay(flightId: string): FeedDay | undefined {
  const todayIndex = Math.max(0, dayIndexOf(DEMO_TODAY));
  const searchOrder = [...FEED_DAYS.slice(todayIndex), ...FEED_DAYS.slice(0, todayIndex).reverse()];
  return searchOrder.find((day) => day.flights.some((flight) => flight.id === flightId.toUpperCase()));
}

function rebookingPlans(dayIndex: number, flight: OpsFlight): RebookingPlanFacts[] {
  const nextDay = FEED_DAYS[dayIndex + 1];
  const sameFlightNextDay = nextDay?.flights.find((candidate) => candidate.id === flight.id);
  const airline = AIRLINE_NAMES[flight.airline];
  const travelers = flight.velaTravelers;
  const nextFlight = sameFlightNextDay
    ? `${flight.flightNumber}, ${formatCompactDay(nextDay.date)} ${sameFlightNextDay.scheduledTime}`
    : `the next ${airline} flight`;

  return [
    {
      plan: 'nextDay',
      title: `Rebook on ${nextFlight}`,
      description: `${sameFlightNextDay ? 'Same flight, next day' : 'Ops picks the flight'} · ${travelers} seats held by ${airline} · no fare difference`,
      outcome: `${travelers} travelers rebooked on ${nextFlight}`,
      estimateNote: sameFlightNextDay ? `Rebooked to ${formatCompactDay(nextDay.date)}` : 'Rebooking offered',
      manifestNote: `rebooked on ${nextFlight}`,
    },
    {
      plan: 'travelerChoice',
      title: 'Let travelers choose',
      description: `Rebook on any ${airline} flight in the next 7 days, or take a full refund · link valid 24 hours`,
      outcome: `${travelers} travelers offered rebooking or a full refund`,
      estimateNote: 'Rebook or refund offered',
      manifestNote: 'rebooking offered',
    },
    {
      plan: 'fullRefund',
      title: 'Refund everyone in full',
      description: 'Back to the original payment method in 5–10 business days',
      outcome: `${travelers} travelers refunded in full`,
      estimateNote: 'Refunds issued',
      manifestNote: 'refunded in full',
    },
  ];
}

/** The feed's flight with the console's saved status laid over it. */
function applyUpdate(
  flight: OpsFlight,
  update: StoredUpdate | undefined,
  plan: RebookingPlanFacts | undefined,
): OpsFlight {
  if (!update) return flight;
  const { status, departureTime } = update.draft;
  switch (status) {
    case 'delayed':
      return {
        ...flight,
        phase: 'delayed',
        status: { label: `Delayed ${delayLabel(flight.scheduledTime, departureTime)}`, tone: 'warning' },
        estimateNote: `Est. ${departureTime}`,
        estimatedTime: departureTime,
      };
    case 'cancelled':
      return {
        ...flight,
        phase: 'cancelled',
        status: { label: 'Cancelled', tone: 'danger' },
        estimateNote:
          plan?.estimateNote ?? (flight.phase === 'cancelled' ? flight.estimateNote : 'Rebooking offered'),
        estimatedTime: '—',
        loadPercent: 0,
      };
    case 'diverted':
      return {
        ...flight,
        phase: 'delayed',
        status: { label: 'Diverted', tone: 'danger' },
        estimateNote: 'Diverting · ops notified',
        estimatedTime: '—',
      };
    case 'onTime':
      return {
        ...flight,
        phase: 'onTime',
        status: { label: 'On time', tone: 'success' },
        estimateNote: 'On time',
        estimatedTime: flight.scheduledTime,
      };
  }
}

/** Where the status form starts when nobody has edited the flight yet. */
function feedDraft(date: string, flight: OpsFlight): FlightStatusDraft {
  return {
    status: flight.phase === 'delayed' ? 'delayed' : flight.phase === 'cancelled' ? 'cancelled' : 'onTime',
    departureTime: flight.phase === 'delayed' ? flight.estimatedTime : flight.scheduledTime,
    reason: FEED_REASONS[flightKey(date, flight.id)] ?? 'lateInboundAircraft',
  };
}

function buildRecord(dayIndex: number, feedFlight: OpsFlight): FlightOpsRecord {
  const day = FEED_DAYS[dayIndex];
  const key = flightKey(day.date, feedFlight.id);
  const update = updates.get(key);
  const plans = rebookingPlans(dayIndex, feedFlight);
  const plan = plans.find((candidate) => candidate.plan === update?.rebooking);
  const flight = applyUpdate(feedFlight, update, plan);
  const airlineName = AIRLINE_NAMES[flight.airline];
  const feedCancellation = FEED_CANCELLATIONS[key];
  const isCancelled = flight.phase === 'cancelled';

  return {
    flight,
    airlineName,
    statusDraft: update?.draft ?? feedDraft(day.date, feedFlight),
    rebookingOptions: plans.map(({ plan: id, title, description, outcome }) => ({
      plan: id,
      title,
      description,
      outcome,
    })),
    cancellationOutcome: isCancelled ? (plan ? `${plan.outcome}.` : feedCancellation?.outcome) : undefined,
    manifest: manifestFor(
      day,
      flight,
      plan?.manifestNote ?? feedCancellation?.manifestNote ?? 'rebooking offered',
    ),
    connections: [...(CONNECTIONS[key] ?? [])],
    timeline: [...(loggedEvents.get(key) ?? []), ...feedTimelineFor(day, feedFlight, airlineName)],
  };
}

function buildBoard(dayIndex: number): FlightOpsBoard {
  const day = FEED_DAYS[dayIndex];
  return {
    date: day.date,
    availableDates: FEED_DAYS.map((feedDay) => feedDay.date),
    feedSyncedAt: FEED_SYNCED_AT,
    records: day.flights.map((flight) => buildRecord(dayIndex, flight)),
  };
}

/** The day's flights. Without a valid date, opens the day carrying `flightId`, or today. */
export function getFlightBoard({ date, flightId }: FlightBoardRequest = {}): Promise<FlightOpsBoard> {
  return mockRequest(() => {
    const requested = dayIndexOf(date);
    if (requested >= 0) return buildBoard(requested);
    const located = flightId ? locateDay(flightId) : undefined;
    const fallback = located ?? FEED_DAYS[Math.max(0, dayIndexOf(DEMO_TODAY))];
    return buildBoard(FEED_DAYS.indexOf(fallback));
  });
}

/**
 * Saves a status over the airline feed's and messages travelers on the chosen channels.
 * Departed flights are read-only; cancelling a flight that still operates needs a rebooking plan.
 */
export function updateFlightStatus(
  date: string,
  flightId: string,
  update: FlightStatusUpdate,
): Promise<FlightStatusResult> {
  return mockRequest(() => {
    const dayIndex = dayIndexOf(date);
    const feedFlight = FEED_DAYS[dayIndex]?.flights.find((flight) => flight.id === flightId);
    if (!feedFlight) throw new ApiError('not_found', `Flight ${flightId} isn’t in the feed for ${date}.`);

    const key = flightKey(date, flightId);
    const current = buildRecord(dayIndex, feedFlight).flight;
    if (current.phase === 'departed') {
      throw new ApiError(
        'flight_locked',
        `${current.flightNumber} has departed. Its status now comes from the airline feed.`,
      );
    }
    const timeError = departureTimeError(current.scheduledTime, update);
    if (timeError) throw new ApiError('invalid_departure_time', timeError);

    const isCancellation = update.status === 'cancelled' && current.phase !== 'cancelled';
    const plan = isCancellation
      ? rebookingPlans(dayIndex, feedFlight).find((option) => option.plan === update.rebooking)
      : undefined;
    if (isCancellation && !plan) {
      throw new ApiError('rebooking_required', 'Choose how to rebook travelers before cancelling.');
    }

    const draft: FlightStatusDraft = {
      status: update.status,
      departureTime: update.departureTime,
      reason: update.reason,
    };
    updates.set(key, { draft, rebooking: isCancellation ? plan?.plan : updates.get(key)?.rebooking });

    const channels = CHANNEL_ORDER.filter((channel) => update.channels.includes(channel));
    const travelers = current.velaTravelers;
    const notified = channels.length
      ? `${travelers} travelers notified · ${channels.map((channel) => CHANNEL_WORDS[channel]).join(', ')}`
      : 'No notifications sent';
    const reason = labelOf(DISRUPTION_REASONS, update.reason);
    const statusLabel = labelOf(FLIGHT_STATUS_CHOICES, update.status);
    const logged: FlightTimelineEntry =
      isCancellation && plan
        ? {
            time: OPS_ACTION_TIME,
            title: `Cancelled by ${DEMO_STAFF_MEMBER.fullName} · ${reason}`,
            detail: `${plan.outcome} · ${notified}`,
          }
        : {
            time: OPS_ACTION_TIME,
            title: `Status set to ${statusLabel}${update.status === 'delayed' ? ` · departs ${update.departureTime}` : ''} by ${DEMO_STAFF_MEMBER.fullName}`,
            detail: notified,
          };
    loggedEvents.set(key, [logged, ...(loggedEvents.get(key) ?? [])]);

    const whoHeard = channels.length ? `${travelers} travelers notified` : 'no travelers notified';
    const message = isCancellation
      ? `Flight cancelled · ${whoHeard} at ${OPS_ACTION_TIME}`
      : `Saved · ${capitalize(whoHeard)} at ${OPS_ACTION_TIME}`;
    return { board: buildBoard(dayIndex), message };
  }, 600);
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

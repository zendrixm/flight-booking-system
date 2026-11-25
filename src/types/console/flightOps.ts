import type { StatusTone } from '@/components/ui';
import type { IsoDate } from '@/lib/date';

import type { AirlineCode } from './booking';

/** Which status filter a flight falls under on Flight operations. */
export type FlightPhase = 'onTime' | 'delayed' | 'cancelled' | 'departed';

/** A flight carrying Vela travelers on one operating day, as the airline feeds report it. */
export interface OpsFlight {
  /** Flight number without the space, e.g. "PQ117". Unique within a day. */
  id: string;
  /** "PQ 117" */
  flightNumber: string;
  airline: AirlineCode;
  /** "HND → MNL" */
  route: string;
  aircraft: string;
  /** Scheduled departure, local to the departure airport: "12:40". */
  scheduledTime: string;
  /** Latest departure estimate, "14:50"; "—" when the flight won't operate. */
  estimatedTime: string;
  /** The feed's one-line note under the times, e.g. "Est. 14:50" or "Gate 112 → 118". */
  estimateNote: string;
  /** "—" until the airline assigns one. */
  gate: string;
  velaTravelers: number;
  /** Seat load, 0–100. 0 once cancelled. */
  loadPercent: number;
  phase: FlightPhase;
  status: { label: string; tone: StatusTone };
}

export type FlightStatusChoice = 'onTime' | 'delayed' | 'cancelled' | 'diverted';

export const FLIGHT_STATUS_CHOICES: ReadonlyArray<{ id: FlightStatusChoice; label: string }> = [
  { id: 'onTime', label: 'On time' },
  { id: 'delayed', label: 'Delayed' },
  { id: 'cancelled', label: 'Cancelled' },
  { id: 'diverted', label: 'Diverted' },
];

/** Reasons travelers see in the disruption message. */
export type DisruptionReason =
  'lateInboundAircraft' | 'weather' | 'airTrafficControl' | 'technicalInspection' | 'crewScheduling';

export const DISRUPTION_REASONS: ReadonlyArray<{ id: DisruptionReason; label: string }> = [
  { id: 'lateInboundAircraft', label: 'Late arrival of inbound aircraft' },
  { id: 'weather', label: 'Weather' },
  { id: 'airTrafficControl', label: 'Air traffic control' },
  { id: 'technicalInspection', label: 'Technical inspection' },
  { id: 'crewScheduling', label: 'Crew scheduling' },
];

export type NotificationChannel = 'sms' | 'email' | 'push';

export const NOTIFICATION_CHANNELS: ReadonlyArray<{ id: NotificationChannel; label: string }> = [
  { id: 'sms', label: 'Text message' },
  { id: 'email', label: 'Email' },
  { id: 'push', label: 'App notification' },
];

/** What happens to travelers when ops cancels a flight. */
export type RebookingPlan = 'nextDay' | 'travelerChoice' | 'fullRefund';

export interface RebookingOption {
  plan: RebookingPlan;
  title: string;
  description: string;
  /** Past-tense result for the timeline and confirmation, e.g. "46 travelers refunded in full". */
  outcome: string;
}

/** The status form's values: the last saved update, or what the feed reports. */
export interface FlightStatusDraft {
  status: FlightStatusChoice;
  /** "HH:MM"; only used when the status is Delayed. */
  departureTime: string;
  reason: DisruptionReason;
}

export interface FlightStatusUpdate extends FlightStatusDraft {
  channels: NotificationChannel[];
  /** Required when the update cancels a flight that is still operating. */
  rebooking?: RebookingPlan;
}

export interface ManifestEntry {
  travelerName: string;
  bookingReference: string;
  /** "2 travelers · rebooked on SJ 808 12:10" */
  summary: string;
  /** Whether the booking can be opened in the console. */
  hasBookingRecord: boolean;
}

export interface ConnectionAtRisk {
  /** "Kristine Ong · VL2RHM" */
  traveler: string;
  /** Onward flight and what's been done about it. */
  onwardFlight: string;
}

export interface FlightTimelineEntry {
  /** "00:14"; empty when the event is still to come. */
  time: string;
  title: string;
  detail: string;
}

/** Everything Flight operations shows and edits for one flight. */
export interface FlightOpsRecord {
  flight: OpsFlight;
  airlineName: string;
  statusDraft: FlightStatusDraft;
  rebookingOptions: RebookingOption[];
  /** What happened to travelers when the flight was cancelled; set once it is. */
  cancellationOutcome?: string;
  /** Up to five bookings on the flight. */
  manifest: ManifestEntry[];
  connections: ConnectionAtRisk[];
  /** Newest first. */
  timeline: FlightTimelineEntry[];
}

export interface FlightOpsBoard {
  date: IsoDate;
  /** Operating days the airline feeds cover, oldest first. */
  availableDates: IsoDate[];
  /** "00:57" */
  feedSyncedAt: string;
  records: FlightOpsRecord[];
}

export interface FlightBoardRequest {
  /** Operating day; today when missing or outside the feed window. */
  date?: string | null;
  /** When no date is given, opens the first day (from today on) that carries this flight. */
  flightId?: string | null;
}

export interface FlightStatusResult {
  board: FlightOpsBoard;
  message: string;
}

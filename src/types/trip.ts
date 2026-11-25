import type { IsoDate } from '@/lib/date';

/** Which tab of "My trips" a booking belongs to. */
export type TripStatus = 'upcoming' | 'past' | 'cancelled';

export interface FlightEndpoint {
  /** Local time, 24-hour "08:40". */
  time: string;
  airportCode: string;
  terminal: string;
}

/** The first flight of a trip, as shown on trip cards. */
export interface TripFlightSummary {
  flightNumber: string;
  departure: FlightEndpoint;
  arrival: FlightEndpoint;
  durationMinutes: number;
}

export interface ReceiptLine {
  label: string;
  detail: string;
  /** Pesos; negative for deductions such as fees kept by the airline. */
  amount: number;
}

export interface TripReceipt {
  number: string;
  /** Display timestamp, e.g. "2 Jul 2026, 21:08". */
  bookedAt: string;
  cardLast4: string;
  lines: ReceiptLine[];
}

export interface RefundStep {
  label: string;
  detail: string;
}

export interface TripCancellation {
  cancelledOn: IsoDate;
  refundedOn: IsoDate;
  refundAmount: number;
  airlineFee: number;
  steps: RefundStep[];
  lines: ReceiptLine[];
}

export interface Trip {
  reference: string;
  /** Destination city name, e.g. "Tokyo". */
  city: string;
  originCode: string;
  destinationCode: string;
  departDate: IsoDate;
  returnDate: IsoDate | null;
  travelerCount: number;
  /** Last names of everyone on the booking; used to look a booking up. */
  travelerLastNames: string[];
  airlineName: string;
  /** "PQ 2121 and PQ 2128". */
  flightNumbers: string;
  /** "Saver with Pacific Crest". */
  fareDescription: string;
  status: TripStatus;
  outbound: TripFlightSummary;
  receipt: TripReceipt;
  cancellation?: TripCancellation;
}

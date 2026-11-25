import type { IsoDate } from '@/lib/date';

import type { ReceiptLine } from './trip';

export type SegmentKey = 'outbound' | 'inbound';

export interface ManagedFlight {
  segment: SegmentKey;
  date: IsoDate;
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  from: string;
  to: string;
  fromTerminal: string;
  toTerminal: string;
  aircraft: string;
  durationMinutes: number;
  /** Set when the flight was changed after booking. */
  changedOn?: IsoDate;
}

export interface ManagedTraveler {
  id: string;
  title: 'Ms' | 'Mr' | 'Mx';
  firstNames: string;
  lastName: string;
  dateOfBirth: IsoDate;
  passportNumber: string;
  /** DD/MM/YYYY, as printed on the passport. */
  passportExpiry: string;
  passportNationality: string;
  seats: Record<SegmentKey, string>;
  /** Checked bags of 23 kg each way, including the one on the fare. */
  checkedBags: number;
  assistanceRequests: string[];
  pendingNameCorrection: string | null;
}

export interface TripContact {
  email: string;
  mobile: string;
  /** Someone else who should also get texts. */
  alternateMobile: string;
  textUpdates: boolean;
  emailUpdates: boolean;
}

export interface BookingPayment {
  date: IsoDate;
  label: string;
  amount: number;
}

export type RefundMethod = 'card' | 'credit';

export interface ManagedBooking {
  reference: string;
  status: 'confirmed' | 'cancelled';
  city: string;
  airlineName: string;
  fareName: string;
  cabin: string;
  flights: ManagedFlight[];
  travelers: ManagedTraveler[];
  contact: TripContact;
  payments: BookingPayment[];
  receiptNumber: string;
  bookedAt: string;
  receiptLines: ReceiptLine[];
  cardLast4: string;
  hasProtection: boolean;
  checkInReminder: { email: boolean; sms: boolean } | null;
  refund: { method: RefundMethod; amount: number } | null;
}

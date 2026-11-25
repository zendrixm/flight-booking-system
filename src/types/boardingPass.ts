import type { IsoDate } from '@/lib/date';

export interface EntryRequirement {
  isMet: boolean;
  title: string;
  detail: string;
}

export interface RestrictedItemGroup {
  title: string;
  tone: 'danger' | 'warning' | 'muted';
  summary: string;
  items: string[];
}

export interface BoardingPass {
  reference: string;
  airlineName: string;
  flightNumber: string;
  date: IsoDate;
  from: { code: string; city: string; terminal: string };
  to: { code: string; city: string; terminal: string };
  departureTime: string;
  /** Local time at the destination. */
  arrivalTime: string;
  boardingTime: string;
  gate: string;
  /** Online check-in and seat changes close at this time. */
  bagDropCloses: string;
  gateCloses: string;
  bagDropLocation: string;
  /** Where to check in at the airport when online check-in isn't possible. */
  counterCheckIn: { location: string; opensAt: string };
  cabin: string;
  status: 'On time' | 'Delayed';
  passenger: {
    /** As printed on the pass: "REYES / ANDREA LIM MS". */
    printedName: string;
    fullName: string;
    firstName: string;
    initials: string;
    passengerType: string;
    ticketNumber: string;
    /** e.g. "Philippine passport". */
    passportLabel: string;
    passportNumber: string;
    passportExpiryLabel: string;
    passportFields: Array<{ label: string; value: string }>;
  };
  seat: string;
  /** The seat given at check-in, before any change. */
  assignedSeat: string;
  /** Free seats near the traveler's own, offered at check-in. */
  freeSeats: string[];
  seatRows: number[];
  zone: string;
  sequence: string;
  checkedBags: string;
  isCheckedIn: boolean;
  checkedInLabel: string;
  isInWallet: boolean;
  entryRequirements: EntryRequirement[];
  restrictedItems: RestrictedItemGroup[];
}

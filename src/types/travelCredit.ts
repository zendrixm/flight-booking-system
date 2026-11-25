import type { IsoDate } from '@/lib/date';

/** Credit from one source; each lot expires on its own date. */
export interface CreditLot {
  id: string;
  label: string;
  detail: string;
  amount: number;
  expiresOn: IsoDate;
}

export interface CreditActivity {
  id: string;
  label: string;
  detail: string;
  /** Positive when credit was added, negative when it was used. */
  amount: number;
  date: IsoDate;
}

export interface TravelCredit {
  balance: number;
  /** Ordered by expiry, soonest first: checkout spends them in this order. */
  lots: CreditLot[];
  /** Newest first. */
  activity: CreditActivity[];
}

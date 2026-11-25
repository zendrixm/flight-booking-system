import type { IsoDate } from '@/lib/date';

export type FareFamilyId = 'saver' | 'classic' | 'flex';

export const BAGGAGE_ALLOWANCES = ['None', '1 × 23 kg', '2 × 23 kg'] as const;
export type BaggageAllowance = (typeof BAGGAGE_ALLOWANCES)[number];

/** What Vela controls on a fare family; booking classes and base fares come from the airline. */
export interface FareFamilyRules {
  checkedBaggage: BaggageAllowance;
  allowsChanges: boolean;
  /** Pesos per change; 0 for free changes. Ignored when changes aren't allowed. */
  changeFee: number;
  /** Vela's margin on the airline fare, 0–15%. */
  markupPercent: number;
  isRefundable: boolean;
}

export interface FareFamily {
  id: FareFamilyId;
  name: string;
  /** "38% of bookings" */
  bookingShare: string;
  /** "K · L · Q", from the airline's filing. */
  bookingClasses: string;
  baseFareFrom: number;
  rules: FareFamilyRules;
}

export interface PromoRoute {
  /** "MNL ⇄ ICN" */
  route: string;
  destinationCity: string;
}

export type PromoStatus = 'active' | 'scheduled' | 'paused' | 'expired';
export type DiscountType = 'percent' | 'fixed';

/** The parts of a promo code staff can set. */
export interface PromoCodeDraft {
  code: string;
  discountType: DiscountType;
  /** Percent (1–50) or pesos (100–10,000). */
  discountValue: number;
  minimumSpend: number;
  routes: string[];
  startDate: IsoDate;
  /** Null for codes that run until someone pauses them. */
  endDate: IsoDate | null;
}

export interface PromoCode extends PromoCodeDraft {
  /** "Min. spend ₱20,000 · one use per customer" */
  summary: string;
  redemptions: number;
  /** Null when uses are unlimited. */
  redemptionLimit: number | null;
  status: PromoStatus;
  /** Created or edited this session, so it stands out in the list. */
  isRecentlyChanged: boolean;
}

export interface PricingOverview {
  airlineName: string;
  marketName: string;
  fareFamilies: FareFamily[];
  /** "Published by Lea Navarro at 00:59 · live for new searches by 01:04", once published this session. */
  lastPublished: string | null;
  promoCodes: PromoCode[];
  /** Routes a promo code can apply to. */
  promoRoutes: PromoRoute[];
}

export interface PricingResult {
  pricing: PricingOverview;
  message: string;
}

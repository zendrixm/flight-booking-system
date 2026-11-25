import type {
  FareFamily,
  FareFamilyId,
  FareFamilyRules,
  PromoCode,
  PromoRoute,
} from '@/types/console/pricing';

export const PRICING_AIRLINE = 'Meridian Air';
export const PRICING_MARKET = 'Philippines';
/** The demo's clock for publishing: changes reach new searches five minutes later. */
export const PUBLISH_TIME = '00:59';
export const LIVE_BY_TIME = '01:04';
/** New codes get this many uses unless someone changes it later. */
export const DEFAULT_REDEMPTION_LIMIT = 1000;

/** Meridian Air routes from the Philippines a promo code can apply to. */
export const PROMO_ROUTE_OPTIONS: readonly PromoRoute[] = [
  { route: 'MNL ⇄ ICN', destinationCity: 'Seoul' },
  { route: 'CEB ⇄ ICN', destinationCity: 'Seoul' },
  { route: 'MNL ⇄ HND', destinationCity: 'Tokyo' },
  { route: 'MNL ⇄ NRT', destinationCity: 'Tokyo' },
  { route: 'MNL ⇄ SIN', destinationCity: 'Singapore' },
  { route: 'MNL ⇄ TPE', destinationCity: 'Taipei' },
  { route: 'MNL ⇄ BKK', destinationCity: 'Bangkok' },
  { route: 'MNL ⇄ HKG', destinationCity: 'Hong Kong' },
];

const ALL_ROUTES = PROMO_ROUTE_OPTIONS.map((option) => option.route);

export const LIVE_FARE_RULES: Readonly<Record<FareFamilyId, FareFamilyRules>> = {
  saver: {
    checkedBaggage: 'None',
    allowsChanges: false,
    changeFee: 0,
    markupPercent: 3.5,
    isRefundable: false,
  },
  classic: {
    checkedBaggage: '1 × 23 kg',
    allowsChanges: true,
    changeFee: 2500,
    markupPercent: 4,
    isRefundable: false,
  },
  flex: {
    checkedBaggage: '2 × 23 kg',
    allowsChanges: true,
    changeFee: 0,
    markupPercent: 5.5,
    isRefundable: true,
  },
};

/** Fare families as the airline files them; `rules` are filled from the live rules. */
export const FARE_FAMILY_FILINGS: ReadonlyArray<Omit<FareFamily, 'rules'>> = [
  {
    id: 'saver',
    name: 'Saver',
    bookingShare: '38% of bookings',
    bookingClasses: 'K · L · Q',
    baseFareFrom: 5480,
  },
  {
    id: 'classic',
    name: 'Classic',
    bookingShare: '49% of bookings',
    bookingClasses: 'M · H · B',
    baseFareFrom: 7115,
  },
  { id: 'flex', name: 'Flex', bookingShare: '13% of bookings', bookingClasses: 'Y · B', baseFareFrom: 10960 },
];

/** Promo codes as stored; status follows from the dates and whether someone paused the code. */
export type PromoSeed = Omit<PromoCode, 'status' | 'isRecentlyChanged'>;

export const PROMO_CODE_SEEDS: readonly PromoSeed[] = [
  {
    code: 'VELA1000',
    discountType: 'fixed',
    discountValue: 1000,
    minimumSpend: 20000,
    routes: ALL_ROUTES,
    startDate: '2026-10-01',
    endDate: '2026-12-31',
    redemptions: 1284,
    redemptionLimit: 5000,
    summary: 'Min. spend ₱20,000 · one use per customer',
  },
  {
    code: 'JAPANAUTUMN',
    discountType: 'percent',
    discountValue: 8,
    minimumSpend: 0,
    routes: ['MNL ⇄ HND', 'MNL ⇄ NRT'],
    startDate: '2026-09-15',
    endDate: '2026-11-30',
    redemptions: 412,
    redemptionLimit: 1000,
    summary: 'Manila to Japan · max ₱3,000',
  },
  {
    code: 'WELCOME',
    discountType: 'fixed',
    discountValue: 500,
    minimumSpend: 0,
    routes: ALL_ROUTES,
    startDate: '2026-01-05',
    endDate: null,
    redemptions: 3921,
    redemptionLimit: null,
    summary: 'First booking on Vela',
  },
  {
    code: 'HOLIDAY26',
    discountType: 'percent',
    discountValue: 10,
    minimumSpend: 0,
    routes: ALL_ROUTES,
    startDate: '2026-11-01',
    endDate: '2026-12-15',
    redemptions: 0,
    redemptionLimit: 2000,
    summary: 'Travel 15–31 Dec · max ₱4,000',
  },
  {
    code: 'SUMMERSEA',
    discountType: 'fixed',
    discountValue: 750,
    minimumSpend: 0,
    routes: [],
    startDate: '2026-04-01',
    endDate: '2026-05-31',
    redemptions: 2000,
    redemptionLimit: 2000,
    summary: 'Beach routes within PH',
  },
];

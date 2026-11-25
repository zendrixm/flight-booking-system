export interface PromoCode {
  code: string;
  discount: number;
  description: string;
}

/** Codes this demo accepts. A real API validates codes against the route, dates and customer. */
const PROMO_CODES: readonly PromoCode[] = [
  { code: 'VELA1000', discount: 1000, description: '₱1,000 off your booking' },
];

/** Member offer applied automatically when checkout starts. */
export const AUTO_APPLIED_PROMO = 'VELA1000';

export function findPromoCode(code: string): PromoCode | undefined {
  const normalized = code.trim().toUpperCase();
  return PROMO_CODES.find((promo) => promo.code === normalized);
}

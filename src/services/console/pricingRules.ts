import { formatPeso } from '@/lib/format';
import type { DiscountType, PromoCodeDraft, PromoRoute } from '@/types/console/pricing';

/**
 * Pricing rules shared by the forms and the server, so a value the form accepts is never
 * refused on save.
 */
export const MAX_CHANGE_FEE = 20_000;
export const MAX_MARKUP_PERCENT = 15;

export const PROMO_CODE_PATTERN = /^[A-Z0-9]{3,16}$/;
export const PERCENT_DISCOUNT_RANGE = { min: 1, max: 50 } as const;
export const FIXED_DISCOUNT_RANGE = { min: 100, max: 10_000 } as const;

export type PromoField = 'code' | 'discountValue' | 'routes' | 'endDate';

/** Problems with a promo code, by field. `existingCodes` is checked only for new codes. */
export function promoCodeErrors(
  draft: PromoCodeDraft,
  existingCodes: readonly string[],
  isNew: boolean,
): Partial<Record<PromoField, string>> {
  const errors: Partial<Record<PromoField, string>> = {};

  if (isNew) {
    if (draft.code.length < 3) errors.code = 'Use at least 3 letters or numbers';
    else if (!PROMO_CODE_PATTERN.test(draft.code))
      errors.code = 'Use letters and numbers only, up to 16 characters';
    else if (existingCodes.includes(draft.code))
      errors.code = `${draft.code} already exists · pick another code`;
  }

  const range = draft.discountType === 'percent' ? PERCENT_DISCOUNT_RANGE : FIXED_DISCOUNT_RANGE;
  if (!draft.discountValue) errors.discountValue = 'Enter a discount.';
  else if (draft.discountValue < range.min || draft.discountValue > range.max) {
    errors.discountValue =
      draft.discountType === 'percent'
        ? `Use ${range.min} to ${range.max} percent.`
        : `Use ${formatPeso(range.min)} to ${formatPeso(range.max)}.`;
  }

  if (draft.routes.length === 0) errors.routes = 'Add at least one route the code applies to.';
  if (draft.startDate && draft.endDate && draft.endDate < draft.startDate) {
    errors.endDate = 'Ends before it starts — pick a later date.';
  }
  return errors;
}

/** "8% off", "₱1,000 off" */
export function discountLabel(discountType: DiscountType, discountValue: number): string {
  return discountType === 'percent' ? `${discountValue}% off` : `${formatPeso(discountValue)} off`;
}

/** Destination cities of the chosen routes, in route order, without repeats. */
export function routeCities(routes: readonly string[], options: readonly PromoRoute[]): string[] {
  const cities = routes.map(
    (route) => options.find((option) => option.route === route)?.destinationCity ?? route,
  );
  return [...new Set(cities)];
}

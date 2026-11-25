import { DEMO_TODAY } from '@/config/demo';
import { addDays, addMonths, formatShortDate, makeIsoDate, parseIsoDate, type IsoDate } from '@/lib/date';
import { formatNumber, joinWithAnd } from '@/lib/format';
import {
  discountLabel,
  promoCodeErrors,
  routeCities,
  type PromoField,
} from '@/services/console/pricingRules';
import type { DiscountType, PromoCode, PromoCodeDraft, PromoRoute } from '@/types/console/pricing';

/** The promo drawer's fields as typed. */
export interface PromoFormValues {
  code: string;
  discountType: DiscountType;
  discountValue: string;
  minimumSpend: string;
  routes: string[];
  startDate: IsoDate;
  /** Empty for a code that runs until someone pauses it. */
  endDate: IsoDate;
}

/** Starting value when switching discount type, so the field never shows a nonsense amount. */
export const DEFAULT_DISCOUNT: Record<DiscountType, string> = { percent: '8', fixed: '1000' };

/** A new code starts on the 1st of next month and runs for three months. */
export function newPromoValues(): PromoFormValues {
  const today = parseIsoDate(DEMO_TODAY);
  const startDate = makeIsoDate(today.getUTCFullYear(), today.getUTCMonth() + 1, 1);
  return {
    code: '',
    discountType: 'percent',
    discountValue: DEFAULT_DISCOUNT.percent,
    minimumSpend: '15,000',
    routes: ['MNL ⇄ ICN', 'CEB ⇄ ICN'],
    startDate,
    endDate: addDays(addMonths(startDate, 3), -1),
  };
}

export function valuesFromPromo(promo: PromoCode): PromoFormValues {
  return {
    code: promo.code,
    discountType: promo.discountType,
    discountValue: String(promo.discountValue),
    minimumSpend: formatNumber(promo.minimumSpend),
    routes: [...promo.routes],
    startDate: promo.startDate,
    // Open-ended codes get an end date only if someone sets one.
    endDate: promo.endDate ?? '',
  };
}

/** Codes are upper-case letters and digits. */
export function normalizeCode(text: string): string {
  return text.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export const digitsOnly = (text: string) => text.replace(/\D/g, '');

export function toPromoDraft(values: PromoFormValues): PromoCodeDraft {
  return {
    code: values.code,
    discountType: values.discountType,
    discountValue: Number(values.discountValue) || 0,
    minimumSpend: Number(digitsOnly(values.minimumSpend)) || 0,
    routes: values.routes,
    startDate: values.startDate,
    endDate: values.endDate || null,
  };
}

export function promoFormErrors(
  values: PromoFormValues,
  existingCodes: readonly string[],
  isNew: boolean,
): Partial<Record<PromoField, string>> {
  return promoCodeErrors(toPromoDraft(values), existingCodes, isNew);
}

/** What customers see at checkout, e.g. "SEOULWINTER — 8% off your flights to Seoul". */
export function customerPreview(values: PromoFormValues, routeOptions: readonly PromoRoute[]) {
  const cities = joinWithAnd(routeCities(values.routes, routeOptions));
  const offer = discountLabel(values.discountType, Number(values.discountValue) || 0);
  const routeCount = values.routes.length;
  const dates = [values.startDate, values.endDate]
    .map((date) => (date ? formatShortDate(date) : 'ongoing'))
    .join(' – ');
  return {
    headline: `${values.code || 'YOURCODE'} — ${offer} ${cities ? `your flights to ${cities}` : 'your flights'}`,
    detail: `${routeCount ? `${routeCount} ${routeCount === 1 ? 'route' : 'routes'}` : 'No routes yet'} · bookings over ₱${values.minimumSpend || '0'} · ${dates}`,
  };
}

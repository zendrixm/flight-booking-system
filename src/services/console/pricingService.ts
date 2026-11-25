import { DEMO_TODAY } from '@/config/demo';
import { formatShortDate } from '@/lib/date';
import { formatPeso, joinWithAnd } from '@/lib/format';
import {
  DEFAULT_REDEMPTION_LIMIT,
  FARE_FAMILY_FILINGS,
  LIVE_BY_TIME,
  LIVE_FARE_RULES,
  PRICING_AIRLINE,
  PRICING_MARKET,
  PROMO_CODE_SEEDS,
  PROMO_ROUTE_OPTIONS,
  PUBLISH_TIME,
  type PromoSeed,
} from '@/mocks/console/pricing';
import { DEMO_STAFF_MEMBER } from '@/mocks/console/staff';
import type {
  FareFamilyId,
  FareFamilyRules,
  PricingOverview,
  PricingResult,
  PromoCode,
  PromoCodeDraft,
} from '@/types/console/pricing';

import { ApiError, mockRequest } from '../mockApi';
import {
  discountLabel,
  MAX_CHANGE_FEE,
  MAX_MARKUP_PERCENT,
  promoCodeErrors,
  routeCities,
} from './pricingRules';

/** Server-side state for the session. */
let liveRules: Record<FareFamilyId, FareFamilyRules> = structuredClone(LIVE_FARE_RULES);
let lastPublished: string | null = null;
const promoCodes: PromoSeed[] = structuredClone([...PROMO_CODE_SEEDS]);
const pausedCodes = new Set<string>();
const changedCodes = new Set<string>();

function statusOf(promo: PromoSeed): PromoCode['status'] {
  if (promo.endDate && promo.endDate < DEMO_TODAY) return 'expired';
  if (pausedCodes.has(promo.code)) return 'paused';
  return promo.startDate > DEMO_TODAY ? 'scheduled' : 'active';
}

function buildOverview(): PricingOverview {
  return {
    airlineName: PRICING_AIRLINE,
    marketName: PRICING_MARKET,
    fareFamilies: FARE_FAMILY_FILINGS.map((filing) => ({ ...filing, rules: liveRules[filing.id] })),
    lastPublished,
    promoCodes: promoCodes.map((promo) => ({
      ...promo,
      status: statusOf(promo),
      isRecentlyChanged: changedCodes.has(promo.code),
    })),
    promoRoutes: [...PROMO_ROUTE_OPTIONS],
  };
}

/** "Seoul routes", "Tokyo and Seoul routes", "All routes" or "5 routes". */
function routesSummary(routes: readonly string[]): string {
  if (routes.length >= PROMO_ROUTE_OPTIONS.length) return 'All routes';
  const cities = routeCities(routes, PROMO_ROUTE_OPTIONS);
  return cities.length <= 2 ? `${joinWithAnd(cities)} routes` : `${routes.length} routes`;
}

function summaryOf(draft: PromoCodeDraft): string {
  return draft.minimumSpend > 0
    ? `${routesSummary(draft.routes)} · min. spend ${formatPeso(draft.minimumSpend)}`
    : routesSummary(draft.routes);
}

function findPromo(code: string): PromoSeed {
  const promo = promoCodes.find((candidate) => candidate.code === code);
  if (!promo) throw new ApiError('not_found', `Promo code ${code} doesn’t exist.`);
  return promo;
}

function assertValidPromo(draft: PromoCodeDraft, isNew: boolean) {
  const errors = promoCodeErrors(
    draft,
    promoCodes.map((promo) => promo.code),
    isNew,
  );
  const [firstError] = Object.values(errors);
  if (firstError) throw new ApiError('invalid_promo', firstError);
}

export function getPricing(): Promise<PricingOverview> {
  return mockRequest(buildOverview);
}

/** Puts new fare family rules live. New searches use them within five minutes. */
export function publishFareRules(rules: Record<FareFamilyId, FareFamilyRules>): Promise<PricingResult> {
  return mockRequest(() => {
    for (const family of Object.values(rules)) {
      if (!Number.isInteger(family.changeFee) || family.changeFee < 0 || family.changeFee > MAX_CHANGE_FEE) {
        throw new ApiError(
          'invalid_rules',
          `Change fees must be whole pesos up to ${formatPeso(MAX_CHANGE_FEE)}.`,
        );
      }
      if (family.markupPercent < 0 || family.markupPercent > MAX_MARKUP_PERCENT) {
        throw new ApiError('invalid_rules', `Markup must be 0 to ${MAX_MARKUP_PERCENT}%.`);
      }
    }
    liveRules = structuredClone(rules);
    lastPublished = `Published by ${DEMO_STAFF_MEMBER.fullName} at ${PUBLISH_TIME} · live for new searches by ${LIVE_BY_TIME}`;
    return {
      pricing: buildOverview(),
      message: `Fare family changes published · live for new searches by ${LIVE_BY_TIME}`,
    };
  }, 600);
}

export function createPromoCode(draft: PromoCodeDraft): Promise<PricingResult> {
  return mockRequest(() => {
    assertValidPromo(draft, true);
    const promo: PromoSeed = {
      ...draft,
      summary: summaryOf(draft),
      redemptions: 0,
      redemptionLimit: DEFAULT_REDEMPTION_LIMIT,
    };
    promoCodes.push(promo);
    changedCodes.add(promo.code);
    const message =
      statusOf(promo) === 'scheduled'
        ? `${promo.code} scheduled · starts ${formatShortDate(promo.startDate)}`
        : `${promo.code} is live · customers can use it now`;
    return { pricing: buildOverview(), message };
  });
}

/** Changes apply to new bookings only; the code itself can't be renamed. */
export function updatePromoCode(code: string, draft: PromoCodeDraft): Promise<PricingResult> {
  return mockRequest(() => {
    const promo = findPromo(code);
    if (statusOf(promo) === 'expired') {
      throw new ApiError('promo_expired', `${code} has ended and can’t be edited.`);
    }
    assertValidPromo({ ...draft, code }, false);
    Object.assign(promo, { ...draft, code, summary: summaryOf(draft) });
    changedCodes.add(code);
    return {
      pricing: buildOverview(),
      message: `${code} updated · ${discountLabel(draft.discountType, draft.discountValue)} applies to new bookings`,
    };
  });
}

/** Pausing stops customers applying the code; bookings that already used it keep their discount. */
export function setPromoPaused(code: string, isPaused: boolean): Promise<PricingResult> {
  return mockRequest(() => {
    const promo = findPromo(code);
    if (statusOf(promo) === 'expired') throw new ApiError('promo_expired', `${code} has ended.`);
    if (isPaused) pausedCodes.add(code);
    else pausedCodes.delete(code);
    return {
      pricing: buildOverview(),
      message: isPaused
        ? `${code} paused · customers can’t apply it until you turn it back on`
        : `${code} active again`,
    };
  });
}

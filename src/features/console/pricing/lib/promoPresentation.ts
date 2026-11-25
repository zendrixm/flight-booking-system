import type { StatusTone } from '@/components/ui';
import { formatDayMonth } from '@/lib/date';
import { formatNumber } from '@/lib/format';
import { discountLabel } from '@/services/console/pricingRules';
import type { PromoCode, PromoStatus } from '@/types/console/pricing';

import type { ConfirmDialogContent } from '../../shared/components/ConfirmDialog';

const STATUS_CHIPS: Record<PromoStatus, { label: string; tone: StatusTone }> = {
  active: { label: 'Active', tone: 'success' },
  scheduled: { label: 'Scheduled', tone: 'warning' },
  paused: { label: 'Paused', tone: 'warning' },
  expired: { label: 'Expired', tone: 'muted' },
};

export const promoStatusChip = (status: PromoStatus) => STATUS_CHIPS[status];

export const promoOffer = (promo: PromoCode) => discountLabel(promo.discountType, promo.discountValue);

/** "1,284 of 5,000" or "3,921 · no limit" */
export function redemptionsLabel(promo: PromoCode): string {
  return promo.redemptionLimit
    ? `${formatNumber(promo.redemptions)} of ${formatNumber(promo.redemptionLimit)}`
    : `${formatNumber(promo.redemptions)} · no limit`;
}

/** Share of the limit used, 0–100; null when uses are unlimited. */
export function redemptionShare(promo: PromoCode): number | null {
  return promo.redemptionLimit
    ? Math.min(100, Math.round((promo.redemptions / promo.redemptionLimit) * 100))
    : null;
}

/** "1 Oct – 31 Dec", or "Ongoing" for codes without an end date. */
export function validityLabel(promo: PromoCode): string {
  return promo.endDate ? `${formatDayMonth(promo.startDate)} – ${formatDayMonth(promo.endDate)}` : 'Ongoing';
}

/** Expired codes are history: no switch, no edits. */
export const isPromoLocked = (promo: PromoCode) => promo.status === 'expired';

/** The switch is on while the code is live or waiting to start. */
export const isPromoSwitchedOn = (promo: PromoCode) =>
  promo.status === 'active' || promo.status === 'scheduled';

export function pauseConfirmContent(promo: PromoCode): ConfirmDialogContent {
  return {
    role: 'alertdialog',
    title: `Pause ${promo.code}?`,
    body:
      promo.status === 'scheduled'
        ? `${promo.code} won’t start on ${formatDayMonth(promo.startDate)} until you turn it back on.`
        : `Customers can’t apply ${promo.code} at checkout until you turn it back on. Bookings that already used it keep their discount.`,
    rows: [
      { label: 'Offer', value: promoOffer(promo) },
      {
        label: 'Redemptions',
        value: promo.redemptionLimit
          ? `${formatNumber(promo.redemptions)} of ${formatNumber(promo.redemptionLimit)}`
          : formatNumber(promo.redemptions),
      },
      {
        label: 'Valid',
        value: promo.endDate ? validityLabel(promo) : `${formatDayMonth(promo.startDate)} – ongoing`,
      },
    ],
    cancelLabel: 'Keep active',
    confirmLabel: 'Pause code',
    isDestructive: true,
  };
}

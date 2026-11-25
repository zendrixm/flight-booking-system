import type { IsoDate } from '@/lib/date';

/**
 * The demo data is pinned to one moment so every screen tells the same story:
 * it is Friday 9 October 2026, shortly after midnight in Manila.
 */
export const DEMO_TODAY: IsoDate = '2026-10-09';
export const DEMO_CLOCK_LABEL = 'Fri 9 Oct · 00:58 PHT';
export const DEMO_TODAY_PARTS = { year: 2026, month: 10 } as const;

/** Latest bookable date in the fare calendar. */
export const BOOKING_HORIZON: IsoDate = '2027-03-31';

export const MAX_TRAVELERS_PER_BOOKING = 9;

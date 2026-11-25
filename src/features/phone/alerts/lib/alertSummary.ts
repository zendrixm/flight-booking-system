import type { StatusTone } from '@/components/ui';
import { findAirport } from '@/data/airports';
import { formatDayMonth } from '@/lib/date';
import { DEFAULT_SEARCH, searchToQueryString } from '@/lib/flightSearchUrl';
import { formatPeso } from '@/lib/format';
import type { PriceAlert } from '@/types/priceAlert';

export type AlertStatus = 'paused' | 'new' | 'belowTarget' | 'watching';

export const ALERT_STATUSES: Record<AlertStatus, { label: string; tone: StatusTone }> = {
  belowTarget: { label: 'Below target', tone: 'success' },
  watching: { label: 'Watching', tone: 'muted' },
  new: { label: 'New', tone: 'brass' },
  paused: { label: 'Paused', tone: 'muted' },
};

/** The latest lowest fare, or null before the first check. */
export function currentFareOf(alert: PriceAlert): number | null {
  return alert.priceHistory.at(-1) ?? null;
}

export function alertStatusOf(alert: PriceAlert): AlertStatus {
  const fare = currentFareOf(alert);
  if (alert.isPaused) return 'paused';
  if (fare === null) return 'new';
  if (alert.targetPrice !== null && fare <= alert.targetPrice) return 'belowTarget';
  return 'watching';
}

/** "Manila → Seoul" */
export function alertRouteLabel(alert: Pick<PriceAlert, 'from' | 'to'>): string {
  return `${findAirport(alert.from)?.city ?? alert.from} → ${findAirport(alert.to)?.city ?? alert.to}`;
}

/** The line under the fare: how it compares with the target. */
export function alertTargetLine(alert: PriceAlert): string {
  const fare = currentFareOf(alert);
  const target = alert.targetPrice;
  if (fare === null) {
    return `${target !== null ? `Target ${formatPeso(target)} · ` : ''}first fare check within 6 hours`;
  }
  if (target === null) return 'No target · we’ll tell you about big drops';
  if (alert.isPaused) {
    return `Last seen ${formatDayMonth(alert.lastCheckedOn)} · target ${formatPeso(target)}`;
  }
  return fare <= target
    ? `${formatPeso(target - fare)} under your ${formatPeso(target)} target`
    : `${formatPeso(fare - target)} above your ${formatPeso(target)} target`;
}

/** "2 active · 1 paused · 1 below your target · checked every 6 hours" */
export function alertsSummary(alerts: readonly PriceAlert[]): string {
  const paused = alerts.filter((alert) => alert.isPaused).length;
  const belowTarget = alerts.filter((alert) => alertStatusOf(alert) === 'belowTarget').length;
  return [
    `${alerts.length - paused} active`,
    paused ? `${paused} paused` : null,
    belowTarget ? `${belowTarget} below your target` : null,
    'checked every 6 hours',
  ]
    .filter(Boolean)
    .join(' · ');
}

/** The search an alert watches, for "See flights". Flexible alerts use the demo dates. */
export function alertSearchQuery(alert: PriceAlert): string {
  return searchToQueryString({
    ...DEFAULT_SEARCH,
    from: alert.from,
    to: alert.to,
    ...(alert.departDate ? { departDate: alert.departDate, returnDate: alert.returnDate } : {}),
  });
}

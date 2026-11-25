import { formatPeso } from '@/lib/format';
import type { DashboardRange } from '@/types/console/dashboard';

export const DASHBOARD_RANGE_OPTIONS: ReadonlyArray<{ value: DashboardRange; label: string }> = [
  { value: 'today', label: 'Today' },
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: 'quarter', label: 'Quarter' },
];

/** "₱1.37M" from a million up, otherwise the full amount. */
export function formatGrossValue(amount: number, millionDecimals = 2): string {
  return amount >= 1_000_000 ? `₱${(amount / 1_000_000).toFixed(millionDecimals)}M` : formatPeso(amount);
}

/** "1 booking", "214 bookings" */
export function bookingsLabel(count: number): string {
  return `${count.toLocaleString('en-US')} ${count === 1 ? 'booking' : 'bookings'}`;
}

/** SVG path for a 72 × 24 sparkline of seven readings on a 0–12 scale. */
export function sparklinePath(values: readonly number[]): string {
  return values
    .map((value, index) => `${index ? 'L' : 'M'}${index * 12} ${(22 - value * 1.6).toFixed(1)}`)
    .join(' ');
}

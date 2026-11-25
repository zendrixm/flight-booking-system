/** Number, money and duration formatting shared by both apps. */

const pesoNumber = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

/** "₱39,862". Negative amounts use a true minus sign: "−₱1,000". */
export function formatPeso(amount: number): string {
  const formatted = `₱${pesoNumber.format(Math.abs(Math.round(amount)))}`;
  return amount < 0 ? `−${formatted}` : formatted;
}

/** "₱12.9k" — compact fares in calendars. */
export function formatPesoCompact(amount: number): string {
  return `₱${(amount / 1000).toFixed(1)}k`;
}

/** "₱1.24M" — dashboard totals. */
export function formatPesoShort(amount: number): string {
  if (amount >= 1_000_000) return `₱${(amount / 1_000_000).toFixed(2).replace(/\.?0+$/, '')}M`;
  if (amount >= 10_000) return `₱${Math.round(amount / 1000)}k`;
  return formatPeso(amount);
}

export function formatNumber(value: number): string {
  return pesoNumber.format(value);
}

/** 255 → "4h 15m"; 120 → "2h"; 45 → "45m". */
export function formatDuration(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${String(minutes).padStart(2, '0')}m`;
}

/** "1 adult", "2 adults" — `plural` defaults to adding "s". */
export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

/** Joins with commas and a final "and": ["a", "b", "c"] → "a, b and c". */
export function joinWithAnd(items: readonly string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

/** "Andrea Lim Reyes" → "AR" (first and last word). */
export function initialsOf(fullName: string): string {
  const words = fullName.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '';
  const first = words[0][0] ?? '';
  const last = words.length > 1 ? (words[words.length - 1][0] ?? '') : '';
  return `${first}${last}`.toUpperCase();
}

export interface TravelerCounts {
  adults: number;
  children: number;
  infants: number;
}

/** "2 adults, 1 child" */
export function travelerCountLabel(counts: TravelerCounts): string {
  const parts = [`${counts.adults} ${counts.adults === 1 ? 'adult' : 'adults'}`];
  if (counts.children) parts.push(`${counts.children} ${counts.children === 1 ? 'child' : 'children'}`);
  if (counts.infants) parts.push(`${counts.infants} ${counts.infants === 1 ? 'infant' : 'infants'}`);
  return parts.join(', ');
}

/** "Marco" from "Marco Villanueva" or from the first names "Maria Andrea". */
export function firstNameOf(names: string): string {
  return names.trim().split(/\s+/)[0] ?? '';
}

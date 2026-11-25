import type { StatusTone } from '@/components/ui';
import { formatPeso, formatPesoShort } from '@/lib/format';
import type { CustomerDetail, CustomerSegment, CustomerStatus } from '@/types/console/customer';

export const SEGMENTS: ReadonlyArray<{ id: CustomerSegment; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'gold', label: 'Gold and above' },
  { id: 'new', label: 'New this week' },
  { id: 'flagged', label: 'Flagged' },
];

export function segmentFromParam(value: string | null): CustomerSegment {
  return SEGMENTS.find((segment) => segment.id === value)?.id ?? 'all';
}

const STATUS_CHIPS: Record<CustomerStatus, { label: string; tone: StatusTone }> = {
  active: { label: 'Active', tone: 'success' },
  flagged: { label: 'Flagged', tone: 'warning' },
  suspended: { label: 'Suspended', tone: 'danger' },
};

export const customerStatusChip = (status: CustomerStatus) => STATUS_CHIPS[status];

/** Full pesos up to a million, then "₱1.18M" so the column stays narrow. */
export function formatLifetimeValue(amount: number): string {
  return amount >= 1_000_000 ? formatPesoShort(amount) : formatPeso(amount);
}

export function formatCreditBalance(amount: number, empty = '—'): string {
  return amount ? formatLifetimeValue(amount) : empty;
}

/** "3 trips to Platinum", or "Top tier". */
export function tierProgressLabel({ tierProgress }: Pick<CustomerDetail, 'tierProgress'>): string {
  const remaining = tierProgress.tripsForNextTier - tierProgress.trips;
  return remaining <= 0
    ? 'Top tier'
    : `${remaining} ${remaining === 1 ? 'trip' : 'trips'} to ${tierProgress.nextTier}`;
}

export function tierProgressPercent({ tierProgress }: Pick<CustomerDetail, 'tierProgress'>): number {
  return Math.min(100, Math.round((tierProgress.trips / tierProgress.tripsForNextTier) * 100));
}

/** Plain-language list footer, e.g. "Showing 9 of 82,410 · most recently active first". */
export function listFooter(shown: number, total: number, segmentLabel: string): string {
  return shown
    ? `Showing ${shown} of ${total.toLocaleString('en-US')} · most recently active first · search by name, email or member number to find anyone else`
    : `No matches in ${segmentLabel.toLowerCase()}`;
}

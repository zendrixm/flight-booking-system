import type { StatusTone } from '@/components/ui';
import { DEMO_TODAY } from '@/config/demo';
import { AIRLINE_NAMES } from '@/data/airlineDesignators';
import { addDays, formatDayMonth, type IsoDate } from '@/lib/date';
import type {
  AirlineCode,
  BookingChannel,
  BookingExportColumn,
  BookingFilters,
  BookingView,
  ConsoleBookingStatus,
  CreatedRange,
  MarketCode,
  PaymentState,
} from '@/types/console/booking';

export const VIEW_TABS: ReadonlyArray<{ id: BookingView; label: string; slug: string }> = [
  { id: 'all', label: 'All', slug: 'all' },
  { id: 'needsAction', label: 'Needs action', slug: 'needs-action' },
  { id: 'ticketing', label: 'Ticketing failed', slug: 'ticketing' },
  { id: 'refundRequested', label: 'Refund requested', slug: 'refund-requested' },
  { id: 'cancelled', label: 'Cancelled', slug: 'cancelled' },
];

export interface RangeOption {
  id: CreatedRange;
  label: string;
  /** "3 Oct – 9 Oct" */
  period: string;
  /** "created in the last 7 days" */
  phrase: string;
  /** Text on the range button. */
  buttonLabel: string;
}

export const RANGE_OPTIONS: readonly RangeOption[] = [
  { id: 'today', label: 'Today', period: 'Fri 9 Oct', phrase: 'created today', buttonLabel: 'Today · 9 Oct' },
  {
    id: 'yesterday',
    label: 'Yesterday',
    period: 'Thu 8 Oct',
    phrase: 'created yesterday',
    buttonLabel: 'Yesterday · 8 Oct',
  },
  {
    id: 'week',
    label: 'Last 7 days',
    period: '3 Oct – 9 Oct',
    phrase: 'created in the last 7 days',
    buttonLabel: '3 Oct – 9 Oct',
  },
  {
    id: 'month',
    label: 'Last 30 days',
    period: '10 Sep – 9 Oct',
    phrase: 'created in the last 30 days',
    buttonLabel: '10 Sep – 9 Oct',
  },
];

export const CHANNEL_OPTIONS: ReadonlyArray<{ value: BookingChannel | 'all'; label: string }> = [
  { value: 'all', label: 'All channels' },
  { value: 'Web', label: 'Web' },
  { value: 'App', label: 'App' },
  { value: 'Agent', label: 'Agent' },
];

export const MARKET_NAMES: Record<MarketCode, string> = { PH: 'Philippines', SG: 'Singapore', JP: 'Japan' };

type FilterKey = keyof BookingFilters;

export interface FilterGroup {
  key: FilterKey;
  label: string;
  options: ReadonlyArray<{ value: string; label: string }>;
}

export const FILTER_GROUPS: readonly FilterGroup[] = [
  {
    key: 'market',
    label: 'Market',
    options: Object.entries(MARKET_NAMES).map(([value, label]) => ({ value, label })),
  },
  {
    key: 'payment',
    label: 'Payment',
    options: (['Captured', 'Authorized', 'Declined', 'Refunded', 'Pending'] satisfies PaymentState[]).map(
      (value) => ({
        value,
        label: value,
      }),
    ),
  },
  {
    key: 'airline',
    label: 'Airline',
    options: Object.entries(AIRLINE_NAMES).map(([value, label]) => ({ value, label })),
  },
  {
    key: 'tripType',
    label: 'Trip type',
    options: [
      { value: 'return', label: 'Return' },
      { value: 'oneway', label: 'One-way' },
    ],
  },
  { key: 'assignedToMe', label: 'Owner', options: [{ value: 'true', label: 'Assigned to me' }] },
];

/** The filter's value as the option value string, for comparing with the chips. */
export function filterValueOf(filters: BookingFilters, key: FilterKey): string | undefined {
  const value = filters[key];
  return value === undefined || value === false ? undefined : String(value);
}

/** Sets or clears one filter from its option value. */
export function withFilter(
  filters: BookingFilters,
  key: FilterKey,
  value: string | undefined,
): BookingFilters {
  const next: BookingFilters = { ...filters };
  if (value === undefined) {
    delete next[key];
    return next;
  }
  if (key === 'assignedToMe') next.assignedToMe = true;
  else if (key === 'market') next.market = value as MarketCode;
  else if (key === 'payment') next.payment = value as PaymentState;
  else if (key === 'airline') next.airline = value as AirlineCode;
  else next.tripType = value === 'return' ? 'return' : 'oneway';
  return next;
}

/** "Payment: Captured", or just "Assigned to me". */
export function filterChipLabel(group: FilterGroup, value: string): string {
  const option = group.options.find((candidate) => candidate.value === value);
  return group.key === 'assignedToMe' ? 'Assigned to me' : `${group.label}: ${option?.label ?? value}`;
}

export const STATUS_TONE: Record<ConsoleBookingStatus, StatusTone> = {
  Ticketed: 'success',
  Ticketing: 'warning',
  'Payment failed': 'danger',
  'Checked in': 'muted',
  'Schedule change': 'warning',
  'Refund requested': 'warning',
  Cancelled: 'muted',
  Flown: 'muted',
  'Awaiting payment': 'warning',
};

export const PAYMENT_TONE: Record<PaymentState, StatusTone> = {
  Captured: 'success',
  Authorized: 'warning',
  Declined: 'danger',
  Refunded: 'muted',
  Pending: 'warning',
  Invoiced: 'muted',
};

export const EXPORT_COLUMNS: readonly BookingExportColumn[] = [
  'Reference',
  'Created',
  'Lead traveler',
  'Email',
  'Itinerary',
  'Departure',
  'Pax',
  'Channel',
  'Total',
  'Payment',
  'Status',
];

/** "Today, 00:41", "Yesterday, 23:52", "3 Oct, 09:20" */
export function formatCreated(createdAt: string, today: IsoDate = DEMO_TODAY): string {
  const [date, time] = createdAt.split('T') as [IsoDate, string];
  if (date === today) return `Today, ${time}`;
  if (date === addDays(today, -1)) return `Yesterday, ${time}`;
  return `${formatDayMonth(date)}, ${time}`;
}

export function bookingCountLabel(count: number): string {
  return `${count.toLocaleString('en-US')} ${count === 1 ? 'booking' : 'bookings'}`;
}

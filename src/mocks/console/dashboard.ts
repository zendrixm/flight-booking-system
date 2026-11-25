import type {
  DashboardActivity,
  DashboardKpi,
  DashboardOverview,
  DashboardRange,
  RouteShare,
} from '@/types/console/dashboard';

/** Bookings per day from 9 Sep to 8 Oct. */
const DAILY_LABELS = [
  '9 Sep',
  '10 Sep',
  '11 Sep',
  '12 Sep',
  '13 Sep',
  '14 Sep',
  '15 Sep',
  '16 Sep',
  '17 Sep',
  '18 Sep',
  '19 Sep',
  '20 Sep',
  '21 Sep',
  '22 Sep',
  '23 Sep',
  '24 Sep',
  '25 Sep',
  '26 Sep',
  '27 Sep',
  '28 Sep',
  '29 Sep',
  '30 Sep',
  '1 Oct',
  '2 Oct',
  '3 Oct',
  '4 Oct',
  '5 Oct',
  '6 Oct',
  '7 Oct',
  '8 Oct',
];
const DAILY_BOOKINGS = [
  172, 185, 179, 190, 168, 176, 194, 188, 181, 175, 183, 197, 186, 178, 169, 182, 158, 164, 171, 149, 152,
  180, 192, 176, 168, 183, 190, 205, 214, 197,
];

const TODAY_LABELS = ['00:00', '00:10', '00:20', '00:30', '00:40', '00:50'];
const TODAY_BOOKINGS = [1, 2, 3, 1, 2, 2];

/** Bookings over the last 7 days on the six busiest routes; other ranges scale from these. */
const WEEK_ROUTES: readonly RouteShare[] = [
  { route: 'MNL → HND', bookings: 212, grossValue: 9_100_000 },
  { route: 'MNL → SIN', bookings: 188, grossValue: 5_200_000 },
  { route: 'MNL → ICN', bookings: 164, grossValue: 5_600_000 },
  { route: 'MNL → TPE', bookings: 131, grossValue: 3_000_000 },
  { route: 'CEB → NRT', bookings: 96, grossValue: 3_900_000 },
  { route: 'MNL → BKK', bookings: 88, grossValue: 2_400_000 },
];
const WEEK_BOOKING_COUNT = 1333;

type KpiRow = [label: string, value: string, change: string, isImprovement: boolean, trend: number[]];

const KPI_ROWS: Record<DashboardRange, KpiRow[]> = {
  today: [
    ['Gross bookings value', '₱0.41M', '+2.1%', true, [3, 5, 4, 6, 5, 7, 8]],
    ['Bookings', '11', '+10.0%', true, [4, 5, 7, 6, 8, 9, 10]],
    ['Search-to-book', '3.10%', '−0.3 pt', false, [9, 9, 8, 8, 7, 6, 6]],
    ['Refund rate', '1.8%', '−0.4 pt', true, [8, 8, 7, 7, 6, 6, 5]],
    ['Avg. booking value', '₱37,270', '+1.2%', true, [6, 6, 7, 7, 7, 8, 8]],
  ],
  '7d': [
    ['Gross bookings value', '₱48.2M', '+8.4%', true, [4, 6, 5, 8, 7, 10, 12]],
    ['Bookings', '1,333', '+5.1%', true, [5, 7, 6, 7, 9, 10, 11]],
    ['Search-to-book', '3.42%', '−0.2 pt', false, [9, 8, 9, 7, 8, 7, 6]],
    ['Refund rate', '2.1%', '−0.3 pt', true, [8, 7, 7, 6, 6, 5, 5]],
    ['Avg. booking value', '₱36,160', '+3.1%', true, [5, 6, 6, 7, 8, 8, 9]],
  ],
  '30d': [
    ['Gross bookings value', '₱196.7M', '+6.2%', true, [6, 5, 7, 6, 8, 9, 10]],
    ['Bookings', '5,402', '+4.4%', true, [6, 7, 6, 8, 8, 9, 10]],
    ['Search-to-book', '3.38%', '+0.1 pt', true, [6, 7, 6, 7, 7, 8, 8]],
    ['Refund rate', '2.3%', '+0.2 pt', false, [5, 5, 6, 6, 7, 7, 8]],
    ['Avg. booking value', '₱36,410', '+1.7%', true, [6, 6, 7, 6, 7, 8, 8]],
  ],
  quarter: [
    ['Gross bookings value', '₱55.4M', '+7.9%', true, [5, 6, 6, 8, 9, 10, 11]],
    ['Bookings', '1,525', '+4.8%', true, [5, 6, 7, 7, 9, 10, 11]],
    ['Search-to-book', '3.40%', '−0.1 pt', false, [8, 8, 9, 8, 8, 7, 7]],
    ['Refund rate', '2.2%', '−0.1 pt', true, [7, 7, 7, 6, 6, 6, 5]],
    ['Avg. booking value', '₱36,310', '+2.9%', true, [6, 6, 7, 7, 8, 8, 9]],
  ],
};

interface RangeDefinition {
  chartTitle: string;
  chartSubtitle: string;
  periodLabel: string;
  interval: string;
  intervalColumn: 'Date' | 'Time';
  axisTicks: number[];
  labelEvery: number;
  labels: string[];
  bookings: number[];
  averageBookingValue: number;
  bookingCount: number;
}

export const DASHBOARD_RANGES: Record<DashboardRange, RangeDefinition> = {
  today: {
    chartTitle: 'Bookings so far today',
    chartSubtitle: 'Fri 9 Oct, 00:00 – 00:58 · 10-minute intervals, all channels',
    periodLabel: 'Fri 9 Oct, 00:00 – 00:58',
    interval: '10-minute interval',
    intervalColumn: 'Time',
    axisTicks: [4, 3, 2, 1, 0],
    labelEvery: 1,
    labels: TODAY_LABELS,
    bookings: TODAY_BOOKINGS,
    averageBookingValue: 37_270,
    bookingCount: 11,
  },
  '7d': {
    chartTitle: 'Bookings per day',
    chartSubtitle: '2 Oct – 8 Oct · completed bookings, all channels',
    periodLabel: 'Fri 2 Oct – Thu 8 Oct',
    interval: 'day',
    intervalColumn: 'Date',
    axisTicks: [240, 160, 80, 0],
    labelEvery: 1,
    labels: DAILY_LABELS.slice(23),
    bookings: DAILY_BOOKINGS.slice(23),
    averageBookingValue: 36_160,
    bookingCount: WEEK_BOOKING_COUNT,
  },
  '30d': {
    chartTitle: 'Bookings per day',
    chartSubtitle: '9 Sep – 8 Oct · completed bookings, all channels',
    periodLabel: 'Wed 9 Sep – Thu 8 Oct',
    interval: 'day',
    intervalColumn: 'Date',
    axisTicks: [240, 160, 80, 0],
    labelEvery: 5,
    labels: DAILY_LABELS,
    bookings: DAILY_BOOKINGS,
    averageBookingValue: 36_410,
    bookingCount: 5402,
  },
  quarter: {
    chartTitle: 'Bookings per day',
    chartSubtitle: '1 Oct – 8 Oct · quarter to date, all channels',
    periodLabel: 'Thu 1 Oct – Thu 8 Oct (Q4 to date)',
    interval: 'day',
    intervalColumn: 'Date',
    axisTicks: [240, 160, 80, 0],
    labelEvery: 1,
    labels: DAILY_LABELS.slice(22),
    bookings: DAILY_BOOKINGS.slice(22),
    averageBookingValue: 36_310,
    bookingCount: 1525,
  },
};

/** File-name slugs for exports. */
export const RANGE_FILE_SLUGS: Record<DashboardRange, string> = {
  today: '2026-10-09',
  '7d': '2026-10-02_to_2026-10-08',
  '30d': '2026-09-09_to_2026-10-08',
  quarter: '2026-Q4-to-date',
};

export const TOP_ROUTE_COUNT = WEEK_ROUTES.length;

function kpisFor(range: DashboardRange): DashboardKpi[] {
  return KPI_ROWS[range].map(([label, value, change, isImprovement, trend]) => ({
    label,
    value,
    change,
    isImprovement,
    trend,
  }));
}

/** Scales the weekly route shares to the range, rounding money to the nearest ₱100. */
function routesFor(bookingCount: number): RouteShare[] {
  const factor = bookingCount / WEEK_BOOKING_COUNT;
  return WEEK_ROUTES.map((route) => ({
    route: route.route,
    bookings: Math.max(1, Math.round(route.bookings * factor)),
    grossValue: Math.round((route.grossValue * factor) / 100) * 100,
  }));
}

export function buildDashboardOverview(range: DashboardRange): DashboardOverview {
  const definition = DASHBOARD_RANGES[range];
  return {
    range,
    chartTitle: definition.chartTitle,
    chartSubtitle: definition.chartSubtitle,
    periodLabel: definition.periodLabel,
    interval: definition.interval,
    intervalColumn: definition.intervalColumn,
    axisTicks: definition.axisTicks,
    labelEvery: definition.labelEvery,
    points: definition.labels.map((label, index) => ({
      label,
      longLabel: range === 'today' ? `${label} – ${definition.labels[index + 1] ?? '00:58'}` : label,
      bookings: definition.bookings[index],
      grossValue: definition.bookings[index] * definition.averageBookingValue,
    })),
    kpis: kpisFor(range),
    bookingCount: definition.bookingCount,
    topRoutes: routesFor(definition.bookingCount),
  };
}

export const DASHBOARD_ACTIVITY: DashboardActivity = {
  disruptions: [
    {
      flightId: 'SJ806',
      status: { label: 'Cancelled', tone: 'danger' },
      flight: 'SJ 806 · MNL → TPE · 10:40',
      detail: '46 Vela travelers · rebooking offered on SJ 808',
      actionLabel: 'Rebook',
    },
    {
      flightId: 'PQ117',
      status: { label: 'Delayed 2h 10m', tone: 'warning' },
      flight: 'PQ 117 · HND → MNL · 12:40',
      detail: '31 Vela travelers · new departure 14:50',
      actionLabel: 'Notify',
    },
    {
      flightId: 'HC911',
      status: { label: 'Gate change', tone: 'muted' },
      flight: 'HC 911 · ICN → MNL · 08:05',
      detail: 'Gate 112 → 118 · travelers notified 00:12',
      actionLabel: 'View',
    },
  ],
  queues: [
    {
      id: 'refunds',
      count: 12,
      label: 'Refund requests awaiting review',
      detail: '3 past the 48-hour service target',
      severity: 'critical',
    },
    {
      id: 'ticketing',
      count: 4,
      label: 'Ticketing failures',
      detail: 'Paid but not ticketed · oldest 38 min',
      severity: 'warning',
    },
    {
      id: 'disputes',
      count: 2,
      label: 'Payment disputes',
      detail: 'Evidence due 14 Oct',
      severity: 'neutral',
    },
  ],
  recentBookings: [
    {
      reference: 'VL7Q2K',
      leadTraveler: 'Andrea Lim Reyes',
      route: 'MNL ⇄ HND',
      createdLabel: '9 Oct, 00:41',
      total: 39_862,
      status: { label: 'Ticketed', tone: 'success' },
    },
    {
      reference: 'VL4TRB',
      leadTraveler: 'Joseph Tan',
      route: 'MNL → SIN',
      createdLabel: '9 Oct, 00:33',
      total: 8_960,
      status: { label: 'Ticketing', tone: 'warning' },
    },
    {
      reference: 'VL9XCA',
      leadTraveler: 'Hana Watanabe',
      route: 'NRT ⇄ CEB',
      createdLabel: '9 Oct, 00:27',
      total: 44_110,
      status: { label: 'Ticketed', tone: 'success' },
    },
    {
      reference: 'VL2MPE',
      leadTraveler: 'Carlo Mendoza',
      route: 'MNL ⇄ ICN',
      createdLabel: '9 Oct, 00:19',
      total: 23_480,
      status: { label: 'Payment failed', tone: 'danger' },
    },
    {
      reference: 'VL6HWD',
      leadTraveler: 'Priya Raman',
      route: 'MNL → BKK',
      createdLabel: '9 Oct, 00:08',
      total: 6_240,
      status: { label: 'Ticketed', tone: 'success' },
    },
  ],
};

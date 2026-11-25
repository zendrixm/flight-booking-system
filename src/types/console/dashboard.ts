import type { StatusTone } from '@/components/ui';

import type { PreparedExport } from './export';

export type DashboardRange = 'today' | '7d' | '30d' | 'quarter';

export interface StatusLabel {
  label: string;
  tone: StatusTone;
}

export interface DashboardKpi {
  label: string;
  value: string;
  /** "+8.4%", "−0.2 pt" against the previous period of the same length. */
  change: string;
  /** Whether the change is good news (a falling refund rate is). */
  isImprovement: boolean;
  /** Seven recent readings for the sparkline, oldest first. */
  trend: number[];
}

export interface BookingVolumePoint {
  /** "2 Oct" or "00:10" */
  label: string;
  /** Tooltip label when it differs, e.g. "00:10 – 00:20". */
  longLabel: string;
  bookings: number;
  grossValue: number;
}

export interface RouteShare {
  route: string;
  bookings: number;
  grossValue: number;
}

export interface DashboardOverview {
  range: DashboardRange;
  chartTitle: string;
  chartSubtitle: string;
  /** "Fri 2 Oct – Thu 8 Oct" */
  periodLabel: string;
  /** What one bar stands for: "day" or "10-minute interval". */
  interval: string;
  intervalColumn: 'Date' | 'Time';
  axisTicks: number[];
  /** Label every nth bar so 30 days stay readable. */
  labelEvery: number;
  points: BookingVolumePoint[];
  kpis: DashboardKpi[];
  bookingCount: number;
  topRoutes: RouteShare[];
}

export interface Disruption {
  flightId: string;
  status: StatusLabel;
  /** "SJ 806 · MNL → TPE · 10:40" */
  flight: string;
  detail: string;
  actionLabel: string;
}

export interface WorkQueue {
  id: 'refunds' | 'ticketing' | 'disputes';
  count: number;
  label: string;
  detail: string;
  severity: 'critical' | 'warning' | 'neutral';
}

export interface RecentBooking {
  reference: string;
  leadTraveler: string;
  route: string;
  createdLabel: string;
  total: number;
  status: StatusLabel;
}

export interface DashboardActivity {
  disruptions: Disruption[];
  queues: WorkQueue[];
  recentBookings: RecentBooking[];
}

export type ExportReport = 'overview' | 'bookings' | 'revenue';
export type ExportFormat = 'csv' | 'xlsx' | 'pdf';

export interface DashboardExportOptions {
  report: ExportReport;
  range: DashboardRange;
  format: ExportFormat;
}

/** What an export will contain, shown before it is prepared. */
export interface ExportPreview extends PreparedExport {
  periodLabel: string;
  bookingCount: number;
}

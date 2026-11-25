import {
  buildDashboardOverview,
  DASHBOARD_ACTIVITY,
  DASHBOARD_RANGES,
  RANGE_FILE_SLUGS,
  TOP_ROUTE_COUNT,
} from '@/mocks/console/dashboard';
import type {
  DashboardActivity,
  DashboardExportOptions,
  DashboardOverview,
  DashboardRange,
  ExportPreview,
} from '@/types/console/dashboard';
import type { PreparedExport } from '@/types/console/export';

import { mockRequest } from '../mockApi';

export function getDashboardOverview(range: DashboardRange): Promise<DashboardOverview> {
  return mockRequest(() => buildDashboardOverview(range));
}

export function getDashboardActivity(): Promise<DashboardActivity> {
  return mockRequest(() => DASHBOARD_ACTIVITY);
}

const formatCount = (count: number) => count.toLocaleString('en-US');

function formatSize(bytes: number): string {
  return bytes >= 1_000_000
    ? `${(bytes / 1_000_000).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1000))} KB`;
}

/** Describes the file an export will produce; the size is an estimate from the row count. */
function describeExport({ report, range, format }: DashboardExportOptions): PreparedExport {
  const definition = DASHBOARD_RANGES[range];
  const fileName = `vela-${report}_${RANGE_FILE_SLUGS[range]}.${format}`;
  let summary: string;
  let bytes: number;

  if (report === 'bookings') {
    summary = `${formatCount(definition.bookingCount)} bookings · ${definition.periodLabel}`;
    bytes = definition.bookingCount * 190;
  } else if (report === 'revenue') {
    const intervals = definition.bookings.length;
    const rows = intervals * TOP_ROUTE_COUNT;
    summary = `${formatCount(rows)} rows (${intervals} ${definition.interval}s × ${TOP_ROUTE_COUNT} routes) · ${definition.periodLabel}`;
    bytes = rows * 120;
  } else {
    summary = `5 KPIs, ${TOP_ROUTE_COUNT} routes, ${DASHBOARD_ACTIVITY.disruptions.length} disruptions · ${definition.periodLabel}`;
    bytes = 9200;
  }

  if (format === 'xlsx') bytes = Math.round(bytes * 0.55) + 6000;
  if (format === 'pdf') bytes = report === 'overview' ? 412_000 : Math.round(bytes * 1.8) + 180_000;
  return { fileName, summary, sizeLabel: formatSize(bytes) };
}

/** File name, contents and estimated size for the chosen options. */
export function previewDashboardExport(options: DashboardExportOptions): Promise<ExportPreview> {
  const definition = DASHBOARD_RANGES[options.range];
  return mockRequest(
    () => ({
      ...describeExport(options),
      periodLabel: definition.periodLabel,
      bookingCount: definition.bookingCount,
    }),
    100,
  );
}

/** Builds the export file on the server; it takes a moment for large ranges. */
export function prepareDashboardExport(options: DashboardExportOptions): Promise<PreparedExport> {
  return mockRequest(() => describeExport(options), 1400);
}

import { useRef, useState } from 'react';

import { Button, ChoiceCard, Dialog, SegmentedControl, useToast } from '@/components/ui';
import { useAsyncData } from '@/hooks';
import { prepareDashboardExport, previewDashboardExport } from '@/services/console/dashboardService';
import type {
  DashboardExportOptions,
  DashboardRange,
  ExportFormat,
  ExportReport,
} from '@/types/console/dashboard';
import type { PreparedExport } from '@/types/console/export';

import { ExportPreparing, ExportReady } from '../../shared/components/ExportStatus';
import { DASHBOARD_RANGE_OPTIONS } from '../lib/dashboardFormat';
import styles from './ExportDialog.module.css';

const REPORTS: ReadonlyArray<{ value: ExportReport; label: string; description: string }> = [
  {
    value: 'overview',
    label: 'Overview',
    description: 'KPIs, top routes, live disruptions and the queues shown on this page',
  },
  {
    value: 'bookings',
    label: 'Bookings',
    description: 'One row per booking: reference, traveler, route, channel, total and status',
  },
  {
    value: 'revenue',
    label: 'Revenue',
    description: 'GBV, Vela margin, promo cost and refunds by day and route',
  },
];

const FORMATS: ReadonlyArray<{ value: ExportFormat; label: string }> = [
  { value: 'csv', label: 'CSV' },
  { value: 'xlsx', label: 'XLSX' },
  { value: 'pdf', label: 'PDF' },
];

type ExportPhase = { name: 'form' } | { name: 'preparing' } | { name: 'ready'; file: PreparedExport };

interface ExportDialogProps {
  /** The dashboard's current range, used as the default. */
  initialRange: DashboardRange;
  onClose: () => void;
}

export function ExportDialog({ initialRange, onClose }: ExportDialogProps) {
  const toast = useToast();
  const [options, setOptions] = useState<DashboardExportOptions>({
    report: 'overview',
    range: initialRange,
    format: 'csv',
  });
  const [phase, setPhase] = useState<ExportPhase>({ name: 'form' });
  /** Bumped on cancel so a finished export that was cancelled is ignored. */
  const attempt = useRef(0);
  const preview = useAsyncData(`export-${options.report}-${options.range}-${options.format}`, () =>
    previewDashboardExport(options),
  ).data;
  const update = (patch: Partial<DashboardExportOptions>) =>
    setOptions((previous) => ({ ...previous, ...patch }));

  const prepare = async () => {
    const current = ++attempt.current;
    setPhase({ name: 'preparing' });
    const file = await prepareDashboardExport(options);
    if (attempt.current === current) setPhase({ name: 'ready', file });
  };

  const cancelPreparing = () => {
    attempt.current += 1;
    setPhase({ name: 'form' });
  };

  const download = (file: PreparedExport) => {
    toast.show({ tone: 'success', message: `Downloading ${file.fileName} · ${file.sizeLabel}` });
    onClose();
  };

  const footer =
    phase.name === 'form' ? (
      <>
        <Button variant="quiet" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={prepare}>
          Prepare export
        </Button>
      </>
    ) : phase.name === 'preparing' ? (
      <Button variant="quiet" onClick={cancelPreparing}>
        Cancel
      </Button>
    ) : (
      <>
        <Button variant="quiet" onClick={() => setPhase({ name: 'form' })}>
          Change options
        </Button>
        <Button variant="primary" iconStart="download" onClick={() => download(phase.file)}>
          Download
        </Button>
      </>
    );

  return (
    <Dialog
      open
      onClose={() => {
        attempt.current += 1;
        onClose();
      }}
      size="medium"
      title="Export dashboard data"
      description="All markets · amounts in PHP · times in PHT"
      footer={footer}
      busy={phase.name === 'preparing'}
    >
      {phase.name === 'form' && (
        <div className={styles.form}>
          <fieldset className={styles.field}>
            <legend className={styles.label}>Report</legend>
            <div className={styles.reports}>
              {REPORTS.map((report) => (
                <ChoiceCard
                  key={report.value}
                  name="export-report"
                  title={report.label}
                  description={report.description}
                  checked={options.report === report.value}
                  onChange={() => update({ report: report.value })}
                />
              ))}
            </div>
          </fieldset>
          <div className={styles.field}>
            <span className={styles.label} aria-hidden="true">
              Date range
            </span>
            <SegmentedControl<DashboardRange>
              label="Date range"
              appearance="soft"
              density="compact"
              fullWidth
              value={options.range}
              onChange={(range) => update({ range })}
              options={DASHBOARD_RANGE_OPTIONS}
            />
            <span className={styles.hint}>
              {preview
                ? `${preview.periodLabel} · ${preview.bookingCount.toLocaleString('en-US')} bookings`
                : '\u00a0'}
            </span>
          </div>
          <div className={styles.field}>
            <span className={styles.label} aria-hidden="true">
              Format
            </span>
            <SegmentedControl<ExportFormat>
              label="Format"
              appearance="soft"
              density="compact"
              fullWidth
              value={options.format}
              onChange={(format) => update({ format })}
              options={FORMATS}
            />
          </div>
        </div>
      )}

      {phase.name === 'preparing' && (
        <ExportPreparing fileName={preview?.fileName} summary={preview?.summary} />
      )}
      {phase.name === 'ready' && <ExportReady file={phase.file} />}
    </Dialog>
  );
}

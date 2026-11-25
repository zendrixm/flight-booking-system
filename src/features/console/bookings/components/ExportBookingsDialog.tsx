import clsx from 'clsx';
import { useRef, useState } from 'react';

import { Icon } from '@/components/icons';
import { Button, ChoiceCard, Dialog, SegmentedControl, useToast } from '@/components/ui';
import { useAsyncData } from '@/hooks';
import { prepareBookingExport, previewBookingExport } from '@/services/console/bookingsService';
import type { BookingExportColumn, BookingExportRequest, BookingListQuery } from '@/types/console/booking';
import type { PreparedExport } from '@/types/console/export';

import { ExportPreparing, ExportReady } from '../../shared/components/ExportStatus';
import { bookingCountLabel, EXPORT_COLUMNS } from '../lib/bookingPresentation';
import styles from './ExportBookingsDialog.module.css';

type ExportScope = 'view' | 'selected';
type ExportPhase = { name: 'form' } | { name: 'preparing' } | { name: 'ready'; file: PreparedExport };

interface ExportBookingsDialogProps {
  query: BookingListQuery;
  /** "Bookings · last 7 days · Philippines market" */
  context: string;
  viewTotal: number;
  /** "All · last 7 days · Payment: Captured" */
  viewDescription: string;
  selectedReferences: readonly string[];
  initialScope: ExportScope;
  onClose: () => void;
}

export function ExportBookingsDialog(props: ExportBookingsDialogProps) {
  const toast = useToast();
  const [scope, setScope] = useState<ExportScope>(
    props.selectedReferences.length ? props.initialScope : 'view',
  );
  const [columns, setColumns] = useState<ReadonlySet<BookingExportColumn>>(new Set(EXPORT_COLUMNS));
  const [format, setFormat] = useState<BookingExportRequest['format']>('csv');
  const [phase, setPhase] = useState<ExportPhase>({ name: 'form' });
  const attempt = useRef(0);

  const request: BookingExportRequest = {
    query: props.query,
    references: scope === 'selected' ? [...props.selectedReferences] : undefined,
    columns: EXPORT_COLUMNS.filter((column) => columns.has(column)),
    format,
  };
  const previewKey = `${scope}-${format}-${request.columns.join(',')}-${JSON.stringify(props.query)}`;
  const preview = useAsyncData(previewKey, () => previewBookingExport(request)).data;
  const hasNoColumns = columns.size === 0;
  const selectedCount = props.selectedReferences.length;

  const toggleColumn = (column: BookingExportColumn) =>
    setColumns((previous) => {
      const next = new Set(previous);
      if (next.has(column)) next.delete(column);
      else next.add(column);
      return next;
    });

  const prepare = async () => {
    if (hasNoColumns) return;
    const current = ++attempt.current;
    setPhase({ name: 'preparing' });
    const file = await prepareBookingExport(request);
    if (attempt.current === current) setPhase({ name: 'ready', file });
  };

  const close = () => {
    attempt.current += 1;
    props.onClose();
  };

  const footer =
    phase.name === 'form' ? (
      <>
        <Button variant="quiet" onClick={close}>
          Cancel
        </Button>
        <Button variant="primary" disabled={hasNoColumns} onClick={prepare}>
          Prepare export
        </Button>
      </>
    ) : phase.name === 'preparing' ? (
      <Button
        variant="quiet"
        onClick={() => {
          attempt.current += 1;
          setPhase({ name: 'form' });
        }}
      >
        Cancel
      </Button>
    ) : (
      <>
        <Button variant="quiet" onClick={() => setPhase({ name: 'form' })}>
          Change options
        </Button>
        <Button
          variant="primary"
          iconStart="download"
          onClick={() => {
            toast.show({
              tone: 'success',
              message: `Downloading ${phase.file.fileName} · ${phase.file.sizeLabel}`,
            });
            props.onClose();
          }}
        >
          Download
        </Button>
      </>
    );

  return (
    <Dialog
      open
      onClose={close}
      size="medium"
      title="Export bookings"
      description={props.context}
      footer={footer}
      busy={phase.name === 'preparing'}
    >
      {phase.name === 'form' && (
        <div className={styles.form}>
          <fieldset className={styles.field}>
            <legend className={styles.label}>Rows</legend>
            <ChoiceCard
              name="export-scope"
              title={`Current view · ${bookingCountLabel(props.viewTotal)}`}
              description={props.viewDescription}
              checked={scope === 'view'}
              onChange={() => setScope('view')}
            />
            <ChoiceCard
              name="export-scope"
              title={`Selected · ${bookingCountLabel(selectedCount)}`}
              description={
                selectedCount
                  ? `${props.selectedReferences.slice(0, 4).join(', ')}${selectedCount > 4 ? ` and ${selectedCount - 4} more` : ''}`
                  : 'Tick rows in the table to export only those'
              }
              checked={scope === 'selected'}
              disabled={selectedCount === 0}
              onChange={() => setScope('selected')}
            />
          </fieldset>

          <fieldset className={styles.field}>
            <legend className={styles.labelRow}>
              <span className={styles.label}>Columns</span>
              <span className={styles.count}>
                {columns.size} of {EXPORT_COLUMNS.length} selected
              </span>
            </legend>
            <div className={styles.columns}>
              {EXPORT_COLUMNS.map((column) => {
                const isOn = columns.has(column);
                return (
                  <button
                    key={column}
                    type="button"
                    role="checkbox"
                    aria-checked={isOn}
                    className={clsx(styles.column, isOn && styles.columnOn)}
                    onClick={() => toggleColumn(column)}
                  >
                    {isOn && <Icon name="check" size={14} strokeWidth={2.2} />}
                    {column}
                  </button>
                );
              })}
            </div>
            {hasNoColumns && (
              <span role="alert" className={styles.error}>
                Choose at least one column to export.
              </span>
            )}
          </fieldset>

          <div className={styles.field}>
            <span className={styles.label} aria-hidden="true">
              Format
            </span>
            <SegmentedControl
              label="Format"
              appearance="soft"
              density="compact"
              fullWidth
              value={format}
              onChange={setFormat}
              options={[
                { value: 'csv', label: 'CSV' },
                { value: 'xlsx', label: 'XLSX' },
              ]}
            />
          </div>
        </div>
      )}

      {phase.name === 'preparing' && (
        <ExportPreparing fileName={preview?.fileName} summary={preview?.summary} />
      )}
      {phase.name === 'ready' && <ExportReady file={phase.file} title="Export ready" />}
    </Dialog>
  );
}

import { useRef, useState } from 'react';

import { Button, Dialog, SegmentedControl } from '@/components/ui';
import { useAsyncData } from '@/hooks';
import { prepareAuditExport, previewAuditExport } from '@/services/console/teamService';
import type { AuditCategory, AuditExportFile, AuditExportRequest, AuditRange } from '@/types/console/team';

import { ExportPreparing, ExportReady } from '../../shared/components/ExportStatus';
import type { AuditFilter } from '../lib/teamPresentation';
import styles from './AuditExportDialog.module.css';

const RANGES: ReadonlyArray<{ value: AuditRange; label: string }> = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
];

const CATEGORIES: ReadonlyArray<{ value: AuditCategory; label: string }> = [
  { value: 'signin', label: 'Sign-ins' },
  { value: 'access', label: 'Role and permission changes' },
  { value: 'reveal', label: 'Personal data reveals' },
  { value: 'invite', label: 'Invitations' },
];

const FORMATS: ReadonlyArray<{ value: AuditExportRequest['format']; label: string }> = [
  { value: 'csv', label: 'CSV' },
  { value: 'json', label: 'JSON' },
];

type Phase = { name: 'form' } | { name: 'preparing' } | { name: 'ready'; file: AuditExportFile };

interface AuditExportDialogProps {
  /** The audit filter on screen; the export starts with just that kind of event. */
  initialFilter: AuditFilter;
  onClose: () => void;
  /** Called with the finished file when the person downloads it. */
  onDownload: (file: AuditExportFile) => void;
}

export function AuditExportDialog({ initialFilter, onClose, onDownload }: AuditExportDialogProps) {
  const [request, setRequest] = useState<AuditExportRequest>(() => ({
    range: '30',
    format: 'csv',
    categories: initialFilter === 'all' ? CATEGORIES.map((category) => category.value) : [initialFilter],
  }));
  const [phase, setPhase] = useState<Phase>({ name: 'form' });
  /** Bumped on cancel so an export that finishes after cancelling is ignored. */
  const attempt = useRef(0);
  const preview = useAsyncData(`audit-export-${JSON.stringify(request)}`, () =>
    previewAuditExport(request),
  ).data;
  const hasNoEvents = request.categories.length === 0;

  const update = (patch: Partial<AuditExportRequest>) => setRequest((current) => ({ ...current, ...patch }));
  const toggleCategory = (category: AuditCategory) =>
    update({
      categories: request.categories.includes(category)
        ? request.categories.filter((item) => item !== category)
        : CATEGORIES.map((item) => item.value).filter(
            (item) => item === category || request.categories.includes(item),
          ),
    });

  const prepare = async () => {
    if (hasNoEvents) return;
    const current = ++attempt.current;
    setPhase({ name: 'preparing' });
    const file = await prepareAuditExport(request);
    if (attempt.current === current) setPhase({ name: 'ready', file });
  };

  const close = () => {
    attempt.current += 1;
    onClose();
  };

  return (
    <Dialog
      open
      onClose={close}
      size="medium"
      title="Export audit log"
      description="Vela Philippines workspace · times in PHT · the export itself is logged"
      busy={phase.name === 'preparing'}
      footer={
        phase.name === 'form' ? (
          <>
            <Button variant="quiet" onClick={close}>
              Cancel
            </Button>
            <Button variant="primary" disabled={hasNoEvents} onClick={() => void prepare()}>
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
            <Button variant="primary" iconStart="download" onClick={() => onDownload(phase.file)}>
              Download
            </Button>
          </>
        )
      }
    >
      {phase.name === 'form' && (
        <div className={styles.form}>
          <div className={styles.field}>
            <span className={styles.label} aria-hidden="true">
              Date range
            </span>
            <SegmentedControl<AuditRange>
              label="Date range"
              appearance="soft"
              density="compact"
              fullWidth
              options={RANGES}
              value={request.range}
              onChange={(range) => update({ range })}
            />
            <span className={styles.hint}>{preview?.rangeSummary ?? ' '}</span>
          </div>
          <fieldset className={styles.field}>
            <legend className={styles.label}>Events</legend>
            <div className={styles.categories}>
              {CATEGORIES.map((category) => (
                <button
                  key={category.value}
                  type="button"
                  className={styles.category}
                  aria-pressed={request.categories.includes(category.value)}
                  onClick={() => toggleCategory(category.value)}
                >
                  {category.label}
                </button>
              ))}
            </div>
            {hasNoEvents && (
              <p role="alert" className={styles.error}>
                Choose at least one event type.
              </p>
            )}
          </fieldset>
          <div className={styles.field}>
            <span className={styles.label} aria-hidden="true">
              Format
            </span>
            <SegmentedControl<AuditExportRequest['format']>
              label="Format"
              appearance="soft"
              density="compact"
              className={styles.format}
              options={FORMATS}
              value={request.format}
              onChange={(format) => update({ format })}
            />
          </div>
        </div>
      )}
      {phase.name === 'preparing' && preview && (
        <ExportPreparing fileName={preview.file.fileName} summary={preview.file.summary} />
      )}
      {phase.name === 'ready' && <ExportReady file={phase.file} title="Export ready" />}
    </Dialog>
  );
}

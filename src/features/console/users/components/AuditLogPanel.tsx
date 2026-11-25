import clsx from 'clsx';
import { useId, useState } from 'react';

import { Button } from '@/components/ui';
import type { AuditEvent } from '@/types/console/team';

import { FilterChips } from '../../shared/components/FilterChips';
import {
  AUDIT_FILTERS,
  AUDIT_PREVIEW_COUNT,
  auditEmptyMessage,
  auditFilterLabel,
  auditFootnote,
  filterAudit,
  type AuditFilter,
} from '../lib/teamPresentation';
import { AuditEventList } from './AuditEventList';
import styles from './AuditLogPanel.module.css';

interface AuditLogPanelProps {
  events: readonly AuditEvent[];
  /** Opens the export, starting from the filter on screen. */
  onExport: (filter: AuditFilter) => void;
  className?: string;
}

/** The latest sign-ins, access changes, data reveals and invites, filterable by kind. */
export function AuditLogPanel({ events, onExport, className }: AuditLogPanelProps) {
  const headingId = useId();
  const [filter, setFilter] = useState<AuditFilter>('all');
  const matching = filterAudit(events, filter);
  const shown = matching.slice(0, AUDIT_PREVIEW_COUNT);

  return (
    <aside aria-labelledby={headingId} className={clsx(styles.panel, className)}>
      <div className={styles.header}>
        <h2 id={headingId} className={styles.title}>
          Audit log
        </h2>
        <Button
          variant="quiet"
          size="small"
          iconStart="download"
          aria-haspopup="dialog"
          onClick={() => onExport(filter)}
        >
          Export
        </Button>
      </div>
      <FilterChips
        label="Filter audit log"
        size="small"
        options={AUDIT_FILTERS.map((option) => ({
          value: option.id,
          label: auditFilterLabel(option, events),
        }))}
        value={filter}
        onChange={setFilter}
      />
      {shown.length > 0 ? (
        <AuditEventList events={shown} />
      ) : (
        <p className={styles.empty}>{auditEmptyMessage(filter)}</p>
      )}
      {shown.length > 0 && matching.length > shown.length && (
        <p className={styles.footnote}>{auditFootnote(shown.length, matching.length, filter)}</p>
      )}
    </aside>
  );
}

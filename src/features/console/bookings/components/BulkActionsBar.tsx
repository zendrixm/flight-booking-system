import styles from './BulkActionsBar.module.css';

interface BulkActionsBarProps {
  count: number;
  onResend: () => void;
  onAssignToMe: () => void;
  onExport: () => void;
  onClear: () => void;
}

/** Midnight bar that appears while rows are selected. */
export function BulkActionsBar({ count, onResend, onAssignToMe, onExport, onClear }: BulkActionsBarProps) {
  return (
    <div role="region" aria-label="Bulk actions" className={styles.bar}>
      <span className={styles.count} aria-live="polite">
        {count} {count === 1 ? 'booking' : 'bookings'} selected
      </span>
      <button type="button" className={styles.action} aria-haspopup="dialog" onClick={onResend}>
        Resend itinerary
      </button>
      <button type="button" className={styles.action} onClick={onAssignToMe}>
        Assign to me
      </button>
      <button type="button" className={styles.action} aria-haspopup="dialog" onClick={onExport}>
        Export
      </button>
      <span className={styles.spacer} />
      <button type="button" className={styles.clear} onClick={onClear}>
        Clear selection
      </button>
    </div>
  );
}

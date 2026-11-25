import { Button, Dialog } from '@/components/ui';

import type { ConfirmContent } from '../lib/flightStatusForm';
import styles from './FlightStatusConfirmDialog.module.css';

interface FlightStatusConfirmDialogProps {
  /** Null keeps the dialog closed. */
  content: ConfirmContent | null;
  /** "PQ 117 · HND → MNL · Fri 9 Oct · Delayed 2h 10m" */
  subtitle: string;
  isBusy: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/** The last stop before travelers are messaged, a flight is cancelled or edits are thrown away. */
export function FlightStatusConfirmDialog({
  content,
  subtitle,
  isBusy,
  onClose,
  onConfirm,
}: FlightStatusConfirmDialogProps) {
  return (
    <Dialog
      open={content !== null}
      onClose={onClose}
      role={content?.role}
      size="medium"
      title={content?.title}
      description={subtitle}
      busy={isBusy}
      dismissible={!isBusy}
      footer={
        content && (
          <>
            <Button variant="quiet" disabled={isBusy} onClick={onClose}>
              {content.backLabel}
            </Button>
            <Button
              variant={content.isDestructive ? 'destructive' : 'primary'}
              loading={isBusy}
              onClick={onConfirm}
            >
              {content.confirmLabel}
            </Button>
          </>
        )
      }
    >
      {content && (
        <div className={styles.body}>
          <p>{content.body}</p>
          {content.rows.length > 0 && (
            <dl className={styles.rows}>
              {content.rows.map((row) => (
                <div key={row.label} className={styles.row}>
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      )}
    </Dialog>
  );
}

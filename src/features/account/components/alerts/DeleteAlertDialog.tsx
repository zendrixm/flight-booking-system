import { Button, Dialog } from '@/components/ui';
import type { PriceAlert } from '@/types/priceAlert';

import { cityOf, targetLabel } from '../../lib/priceAlerts';
import styles from './DeleteAlertDialog.module.css';

interface DeleteAlertDialogProps {
  alert: PriceAlert;
  isDeleting: boolean;
  onClose: () => void;
  onDelete: () => void;
  onPauseInstead: () => void;
}

export function DeleteAlertDialog({
  alert,
  isDeleting,
  onClose,
  onDelete,
  onPauseInstead,
}: DeleteAlertDialogProps) {
  return (
    <Dialog
      open
      onClose={onClose}
      role="alertdialog"
      size="small"
      icon="trash"
      iconTone="danger"
      title={`Delete the ${cityOf(alert.to)} alert?`}
      description="We’ll stop checking fares on this route and delete its 30-day price history. This can’t be undone."
      footer={
        <>
          <Button variant="quiet" onClick={onClose}>
            Keep alert
          </Button>
          <Button variant="destructive" loading={isDeleting} onClick={onDelete}>
            Delete alert
          </Button>
        </>
      }
    >
      <div className={styles.summary}>
        <span className={styles.route}>
          {cityOf(alert.from)} → {cityOf(alert.to)} · {alert.from} ⇄ {alert.to}
        </span>
        <span className={styles.detail}>
          {alert.datesLabel} · {alert.travelersLabel}
        </span>
        <span className={styles.detail}>{targetLabel(alert)}</span>
      </div>
      {!alert.isPaused && (
        <p className={styles.pauseHint}>
          Just taking a break?{' '}
          <button type="button" className={styles.textButton} onClick={onPauseInstead}>
            Pause it instead
          </button>{' '}
          and keep the history.
        </p>
      )}
    </Dialog>
  );
}

import { ConfirmDialog } from '../../shared/components/ConfirmDialog';
import type { DecisionConfirmContent } from '../lib/refundReview';
import styles from './RefundDecisionDialog.module.css';

interface RefundDecisionDialogProps {
  /** Null keeps the dialog closed. */
  content: DecisionConfirmContent | null;
  /** The note the customer will receive, quoted back before sending. */
  note: string;
  customerFirstName: string;
  isBusy: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/** Restates the decision, the money and the customer's note before anything is sent. */
export function RefundDecisionDialog({
  content,
  note,
  customerFirstName,
  isBusy,
  onClose,
  onConfirm,
}: RefundDecisionDialogProps) {
  return (
    <ConfirmDialog content={content} isBusy={isBusy} onClose={onClose} onConfirm={onConfirm}>
      {note && (
        <figure className={styles.note}>
          <figcaption className={styles.noteLabel}>Your note to {customerFirstName}</figcaption>
          <blockquote className={styles.quote}>{note}</blockquote>
        </figure>
      )}
    </ConfirmDialog>
  );
}

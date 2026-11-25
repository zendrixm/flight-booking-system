import { Icon } from '@/components/icons';
import { Button, Dialog } from '@/components/ui';

import styles from './AboutDialogs.module.css';

interface SentDialogProps {
  message: string;
  onClose: () => void;
}

/** The thank-you step after an application or partnership enquiry. */
export function SentDialog({ message, onClose }: SentDialogProps) {
  return (
    <Dialog
      open
      onClose={onClose}
      size="large"
      title="Thank you"
      footer={
        <Button variant="primary" onClick={onClose}>
          Done
        </Button>
      }
    >
      <div role="status" className={styles.sent}>
        <span className={styles.sentIcon} aria-hidden="true">
          <Icon name="check" size={20} strokeWidth={2.2} />
        </span>
        <p className={styles.sentText}>{message}</p>
      </div>
    </Dialog>
  );
}

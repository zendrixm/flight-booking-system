import { Icon } from '@/components/icons';
import { Button, Dialog } from '@/components/ui';

import styles from './RemoveTravelerDialog.module.css';

interface RemoveTravelerDialogProps {
  fullName: string;
  firstName: string;
  initials: string;
  isRemoving: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function RemoveTravelerDialog({
  fullName,
  firstName,
  initials,
  isRemoving,
  onClose,
  onConfirm,
}: RemoveTravelerDialogProps) {
  return (
    <Dialog
      open
      onClose={onClose}
      role="alertdialog"
      size="small"
      iconSlot={
        <span className={styles.avatar} aria-hidden="true">
          {initials}
        </span>
      }
      title={`Remove ${fullName}?`}
      description="Their name, date of birth, passport and preferences will be deleted from your account. You’ll need to type them in again to book for them."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Keep {firstName}
          </Button>
          <Button variant="destructive" loading={isRemoving} onClick={onConfirm}>
            Remove traveler
          </Button>
        </>
      }
    >
      <ul className={styles.consequences}>
        <li>
          <Icon name="check" size={16} strokeWidth={2} className={styles.icon} />
          Trips already booked with {firstName} stay as they are.
        </li>
        <li>
          <Icon name="info" size={16} strokeWidth={1.8} className={styles.icon} />
          {firstName} won’t appear in the traveler list at checkout.
        </li>
      </ul>
    </Dialog>
  );
}

import { Icon, type IconName } from '@/components/icons';
import { Button, Dialog } from '@/components/ui';

import styles from './ConfirmActionDialog.module.css';

export interface ConfirmActionItem {
  icon: IconName;
  label: string;
  detail: string;
}

export interface ConfirmAction {
  title: string;
  body: string;
  icon: IconName;
  /** What the action affects, e.g. the card being removed or the devices being signed out. */
  items: ConfirmActionItem[];
  keepLabel: string;
  confirmLabel: string;
}

interface ConfirmActionDialogProps {
  action: ConfirmAction;
  isBusy: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/** Confirmation for account changes that remove or turn something off, showing exactly what's affected. */
export function ConfirmActionDialog({ action, isBusy, onClose, onConfirm }: ConfirmActionDialogProps) {
  return (
    <Dialog
      open
      onClose={onClose}
      role="alertdialog"
      size="small"
      icon={action.icon}
      iconTone="danger"
      title={action.title}
      description={action.body}
      footer={
        <>
          <Button variant="quiet" onClick={onClose}>
            {action.keepLabel}
          </Button>
          <Button variant="destructive" loading={isBusy} onClick={onConfirm}>
            {action.confirmLabel}
          </Button>
        </>
      }
    >
      <ul className={styles.items}>
        {action.items.map((item) => (
          <li key={`${item.label}-${item.detail}`} className={styles.item}>
            <span className={styles.itemIcon} aria-hidden="true">
              <Icon name={item.icon} size={18} strokeWidth={1.6} />
            </span>
            <span className={styles.itemText}>
              <span className={styles.itemLabel}>{item.label}</span>
              <span className={styles.itemDetail}>{item.detail}</span>
            </span>
          </li>
        ))}
      </ul>
    </Dialog>
  );
}

import { Button, Dialog } from '@/components/ui';

interface StopTrackingDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  /** "Manila → Tokyo, 12–19 Nov". */
  tripLabel: string;
}

export function StopTrackingDialog({
  open,
  onClose,
  onConfirm,
  isDeleting,
  tripLabel,
}: StopTrackingDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      role="alertdialog"
      size="small"
      icon="bellOff"
      iconTone="danger"
      title="Stop tracking this trip?"
      description={`We’ll delete your price alert for ${tripLabel}, and stop sending updates. You can start tracking again at any time.`}
      footer={
        <>
          <Button variant="quiet" onClick={onClose}>
            Keep tracking
          </Button>
          <Button variant="destructive" loading={isDeleting} onClick={onConfirm}>
            Stop tracking
          </Button>
        </>
      }
    />
  );
}

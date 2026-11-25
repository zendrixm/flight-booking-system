import { useState } from 'react';

import { WalletPassPreview } from '@/components/flight';
import { Button, Dialog, StatusChip, type StatusTone } from '@/components/ui';
import type { BoardingPass, RestrictedItemGroup } from '@/types/boardingPass';

import styles from './BoardingDialogs.module.css';
import { SeatPickerGrid } from './SeatPickerGrid';

export const RESTRICTED_TONE: Record<RestrictedItemGroup['tone'], StatusTone> = {
  danger: 'danger',
  warning: 'warning',
  muted: 'muted',
};

export function WalletDialog({
  pass,
  onClose,
  onDownload,
}: {
  pass: BoardingPass;
  onClose: () => void;
  onDownload: () => void;
}) {
  return (
    <Dialog
      open
      onClose={onClose}
      size="medium"
      icon="check"
      iconTone="success"
      title="Added to your phone’s wallet"
      description="It shows on your lock screen as boarding gets close, and updates by itself if the gate or time changes."
      footer={
        <>
          <Button variant="quiet" onClick={onDownload}>
            Also download PDF
          </Button>
          <Button variant="primary" onClick={onClose}>
            Done
          </Button>
        </>
      }
    >
      <WalletPassPreview pass={pass} className={styles.walletPass} />
    </Dialog>
  );
}

interface RestrictedItemsDialogProps {
  pass: BoardingPass;
  onClose: () => void;
  onConfirm: () => void;
}

export function RestrictedItemsDialog({ pass, onClose, onConfirm }: RestrictedItemsDialogProps) {
  return (
    <Dialog
      open
      onClose={onClose}
      size="large"
      title="Restricted items"
      description={`${pass.airlineName} ${pass.flightNumber} · ${pass.from.city} → ${pass.to.city}`}
      footer={
        <>
          <Button variant="quiet" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" onClick={onConfirm}>
            I’m not carrying these
          </Button>
        </>
      }
    >
      {pass.restrictedItems.map((group) => (
        <section key={group.title} className={styles.group}>
          <StatusChip tone={RESTRICTED_TONE[group.tone]} hideDot>
            {group.title}
          </StatusChip>
          <ul className={styles.items}>
            {group.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ))}
      <p className={styles.note}>
        Airport security in {pass.from.city} and {pass.to.city} may apply stricter rules. If you’re unsure
        about an item, leave it at home or ask us before you fly.
      </p>
    </Dialog>
  );
}

interface ChangeSeatDialogProps {
  pass: BoardingPass;
  isSaving: boolean;
  onClose: () => void;
  onSave: (seat: string) => void;
}

export function ChangeSeatDialog({ pass, isSaving, onClose, onSave }: ChangeSeatDialogProps) {
  const [seat, setSeat] = useState(pass.seat);
  const isSame = seat === pass.seat;

  return (
    <Dialog
      open
      onClose={onClose}
      size="medium"
      title="Change seat"
      description={`${pass.flightNumber} · ${pass.passenger.fullName} · now in ${pass.seat}`}
      footer={
        <>
          <Button variant="quiet" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" disabled={isSame} loading={isSaving} onClick={() => onSave(seat)}>
            {isSame ? 'Pick a new seat' : `Change to ${seat}`}
          </Button>
        </>
      }
    >
      <SeatPickerGrid
        rows={pass.seatRows}
        freeSeats={pass.freeSeats}
        value={seat}
        onChange={setSeat}
        selectedLabel="Selected"
      />
      <p className={styles.note}>
        Standard seats are free to change until {pass.bagDropCloses}. We’ll reissue your boarding pass and
        update it in your wallet.
      </p>
    </Dialog>
  );
}

interface UndoCheckInDialogProps {
  pass: BoardingPass;
  isSaving: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function UndoCheckInDialog({ pass, isSaving, onClose, onConfirm }: UndoCheckInDialogProps) {
  return (
    <Dialog
      open
      onClose={onClose}
      role="alertdialog"
      size="small"
      icon="undo"
      iconTone="danger"
      title="Undo check-in?"
      description={`${pass.passenger.firstName}’s boarding pass for ${pass.flightNumber} will be cancelled and removed from your phone’s wallet. You’ll need to check in again before ${pass.bagDropCloses} to fly, and seat ${pass.seat} may go to someone else.`}
      footer={
        <>
          <Button variant="quiet" onClick={onClose}>
            Keep my check-in
          </Button>
          <Button variant="destructive" loading={isSaving} onClick={onConfirm}>
            Undo check-in
          </Button>
        </>
      }
    />
  );
}

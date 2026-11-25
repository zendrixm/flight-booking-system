import { Barcode, boardingPassBarcode } from '@/components/flight';
import { Icon } from '@/components/icons';
import { Button, Sheet } from '@/components/ui';
import type { BoardingPass } from '@/types/boardingPass';

import styles from './WalletAddedSheet.module.css';

interface WalletAddedSheetProps {
  pass: BoardingPass;
  onClose: () => void;
}

/** Confirms the pass is in the phone's wallet and shows how it will look there. */
export function WalletAddedSheet({ pass, onClose }: WalletAddedSheetProps) {
  return (
    <Sheet
      open
      onClose={onClose}
      title="Added to your phone’s wallet"
      description="It appears on your lock screen near boarding time and updates if the gate changes."
      footer={
        <Button size="large" fullWidth onClick={onClose}>
          Done
        </Button>
      }
    >
      <span className={styles.check} aria-hidden="true">
        <Icon name="check" size={28} strokeWidth={2.4} />
      </span>
      <div className={styles.walletPass}>
        <Barcode value={boardingPassBarcode(pass)} cellSize={4} />
        <span className={styles.passText}>
          <span className={styles.airline}>
            {pass.airlineName} · {pass.flightNumber}
          </span>
          <span className={styles.route}>
            {pass.from.code} → {pass.to.code}
          </span>
          <span className={styles.details}>
            Boards {pass.boardingTime} · Gate {pass.gate} · {pass.seat}
          </span>
        </span>
      </div>
    </Sheet>
  );
}

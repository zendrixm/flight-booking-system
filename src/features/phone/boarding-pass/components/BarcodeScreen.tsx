import { useId, useRef } from 'react';
import { createPortal } from 'react-dom';

import { Barcode, boardingPassBarcode } from '@/components/flight';
import { Icon } from '@/components/icons';
import { Button, IconButton } from '@/components/ui';
import { useBodyScrollLock, useEscapeKey, useFocusTrap } from '@/hooks';
import type { BoardingPass } from '@/types/boardingPass';

import styles from './BarcodeScreen.module.css';

interface BarcodeScreenProps {
  pass: BoardingPass;
  onClose: () => void;
}

/**
 * The barcode full screen and large, for the scanner at the gate. The native app also turns the
 * screen brightness up; a web page can only ask the person to.
 */
export function BarcodeScreen({ pass, onClose }: BarcodeScreenProps) {
  const screenRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useFocusTrap(screenRef, true);
  useBodyScrollLock(true);
  useEscapeKey(onClose, true);

  return createPortal(
    <div
      ref={screenRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1}
      className={styles.screen}
    >
      <div className={styles.header}>
        <IconButton icon="close" label="Close" onClick={onClose} />
        <h2 id={titleId} className={styles.title}>
          Scan at the gate
        </h2>
        <span className={styles.headerSpacer} aria-hidden="true" />
      </div>
      <div className={styles.body}>
        <span className={styles.barcodeFrame}>
          <Barcode value={boardingPassBarcode(pass)} cellSize={13} label="Boarding pass barcode, enlarged" />
        </span>
        <span className={styles.passenger}>
          <span className={styles.name}>{pass.passenger.printedName}</span>
          <span className={styles.details}>
            {pass.flightNumber} · Seat {pass.seat} · {pass.zone} · Seq {pass.sequence}
          </span>
        </span>
        <span className={styles.brightness}>
          <Icon name="sun" size={16} />
          Turn your screen brightness up for scanning
        </span>
      </div>
      <div className={styles.footer}>
        <Button size="large" fullWidth onClick={onClose}>
          Done
        </Button>
      </div>
    </div>,
    document.body,
  );
}

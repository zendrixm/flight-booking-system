import clsx from 'clsx';

import { Icon, VelaMark } from '@/components/icons';
import { MONTHS_SHORT, parseIsoDate } from '@/lib/date';
import type { BoardingPass } from '@/types/boardingPass';

import { Barcode } from './Barcode';
import { boardingPassBarcode } from './boardingPassBarcode';
import styles from './WalletPassPreview.module.css';

interface WalletPassPreviewProps {
  pass: BoardingPass;
  className?: string;
}

/** How the pass looks once it's in the phone's wallet: smaller, four key fields and the barcode. */
export function WalletPassPreview({ pass, className }: WalletPassPreviewProps) {
  const date = parseIsoDate(pass.date);
  const fields = [
    { label: 'Boards', value: pass.boardingTime },
    { label: 'Gate', value: pass.gate },
    { label: 'Seat', value: pass.seat },
    { label: 'Departs', value: pass.departureTime },
  ];

  return (
    <article aria-label="Wallet pass" className={clsx(styles.pass, className)}>
      <div className={styles.top}>
        <div className={styles.brandRow}>
          <span className={styles.airline}>
            <VelaMark size={14} />
            {pass.airlineName}
          </span>
          <span className={styles.flight}>
            {pass.flightNumber} · {date.getUTCDate()} {MONTHS_SHORT[date.getUTCMonth()].toUpperCase()}
          </span>
        </div>
        <div className={styles.route}>
          <span className={styles.code}>{pass.from.code}</span>
          <Icon name="plane" size={20} strokeWidth={1.4} className={styles.plane} />
          <span className={styles.code}>{pass.to.code}</span>
        </div>
        <dl className={styles.fields}>
          {fields.map((field) => (
            <div key={field.label} className={styles.field}>
              <dt className={styles.fieldLabel}>{field.label}</dt>
              <dd className={styles.fieldValue}>{field.value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className={styles.bottom}>
        <Barcode value={boardingPassBarcode(pass)} cellSize={5} />
        <span className={styles.meta}>
          {pass.passenger.printedName} · {pass.zone}
        </span>
      </div>
    </article>
  );
}

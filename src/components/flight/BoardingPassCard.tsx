import clsx from 'clsx';

import { Icon, VelaMark } from '@/components/icons';
import { MONTHS_SHORT, parseIsoDate } from '@/lib/date';
import type { BoardingPass } from '@/types/boardingPass';

import { Barcode } from './Barcode';
import { boardingPassBarcode } from './boardingPassBarcode';
import styles from './BoardingPassCard.module.css';

interface BoardingPassCardProps {
  pass: BoardingPass;
  /** `compact` is the phone-app size. */
  size?: 'regular' | 'compact';
  className?: string;
}

function dateLabel(isoDate: string): string {
  const date = parseIsoDate(isoDate);
  return `${date.getUTCDate()} ${MONTHS_SHORT[date.getUTCMonth()].toUpperCase()}`;
}

/** The Midnight boarding pass: route, key details, a tear line and the barcode. */
export function BoardingPassCard({ pass, size = 'regular', className }: BoardingPassCardProps) {
  const fields = [
    { label: 'Passenger', value: pass.passenger.printedName, isWide: true },
    { label: 'Flight', value: pass.flightNumber, isLarge: true },
    { label: 'Date', value: dateLabel(pass.date), isLarge: true },
    { label: 'Seat', value: pass.seat, isLarge: true },
    { label: 'Boarding', value: pass.boardingTime },
    { label: 'Gate', value: pass.gate },
    { label: 'Class', value: pass.cabin },
  ];

  return (
    <article aria-label="Boarding pass" className={clsx(styles.pass, styles[size], className)}>
      <div className={styles.top}>
        <div className={styles.brandRow}>
          <span className={styles.airline}>
            <VelaMark size={16} />
            {pass.airlineName}
          </span>
          <span className={styles.kind}>Boarding pass</span>
        </div>
        <div className={styles.route}>
          <span className={styles.endpoint}>
            <span className={styles.code}>{pass.from.code}</span>
            <span className={styles.city}>{pass.from.city}</span>
          </span>
          <Icon name="plane" size={28} strokeWidth={1.4} className={styles.plane} />
          <span className={styles.endpointEnd}>
            <span className={styles.code}>{pass.to.code}</span>
            <span className={styles.city}>{pass.to.city}</span>
          </span>
        </div>
        <dl className={styles.fields}>
          {fields.map((field) => (
            <div key={field.label} className={clsx(styles.field, field.isWide && styles.wide)}>
              <dt className={styles.fieldLabel}>{field.label}</dt>
              <dd className={field.isLarge ? styles.largeValue : styles.value}>{field.value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className={styles.tear} aria-hidden="true">
        <span className={styles.notchStart} />
        <span className={styles.tearLine} />
        <span className={styles.notchEnd} />
      </div>
      <div className={styles.bottom}>
        <Barcode value={boardingPassBarcode(pass)} cellSize={size === 'compact' ? 4 : 5} />
        <div className={styles.meta}>
          <span className={styles.zone}>{pass.zone}</span>
          <span>
            Seq {pass.sequence} · E-ticket {pass.passenger.ticketNumber}
          </span>
          <span>Bag tag {pass.checkedBags}</span>
        </div>
      </div>
    </article>
  );
}

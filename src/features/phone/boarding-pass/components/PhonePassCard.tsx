import { Barcode, boardingPassBarcode } from '@/components/flight';
import { Icon, VelaMark } from '@/components/icons';
import { StatusChip } from '@/components/ui';
import { formatDayMonth } from '@/lib/date';
import type { BoardingPass } from '@/types/boardingPass';

import styles from './PhonePassCard.module.css';

interface PhonePassCardProps {
  pass: BoardingPass;
  onShowBarcode: () => void;
}

/** The boarding pass on the phone: Porcelain on Midnight, sized to be read and scanned at the gate. */
export function PhonePassCard({ pass, onShowBarcode }: PhonePassCardProps) {
  const fields = [
    { label: 'Gate', value: pass.gate },
    { label: 'Boards', value: pass.boardingTime },
    { label: 'Seat', value: pass.seat },
    { label: 'Date', value: formatDayMonth(pass.date) },
  ];

  return (
    <article className={styles.pass} aria-label={`Boarding pass, ${pass.from.city} to ${pass.to.city}`}>
      <div className={styles.top}>
        <div className={styles.brandRow}>
          <span className={styles.airline}>
            <VelaMark size={14} />
            {pass.airlineName} · {pass.flightNumber}
          </span>
          <StatusChip tone={pass.status === 'On time' ? 'success' : 'warning'} hideDot size="compact">
            {pass.status}
          </StatusChip>
        </div>
        <div className={styles.route}>
          <span className={styles.endpoint}>
            <span className={styles.code}>{pass.from.code}</span>
            <span className={styles.time}>
              {pass.departureTime} · T{pass.from.terminal}
            </span>
          </span>
          <Icon name="plane" size={28} strokeWidth={1.4} className={styles.plane} />
          <span className={styles.endpointEnd}>
            <span className={styles.code}>{pass.to.code}</span>
            <span className={styles.time}>
              {pass.arrivalTime} · T{pass.to.terminal}
            </span>
          </span>
        </div>
        <dl className={styles.fields}>
          {fields.map((field) => (
            <div key={field.label} className={styles.field}>
              <dt className={styles.fieldLabel}>{field.label}</dt>
              <dd className={styles.fieldValue}>{field.value}</dd>
            </div>
          ))}
        </dl>
        <span className={styles.passenger}>
          {pass.passenger.printedName} <span className={styles.zone}>· {pass.zone}</span>
        </span>
      </div>
      <div className={styles.tear} aria-hidden="true">
        <span className={styles.notchStart} />
        <span className={styles.tearLine} />
        <span className={styles.notchEnd} />
      </div>
      <div className={styles.bottom}>
        <button
          type="button"
          className={styles.barcodeButton}
          aria-label="Show barcode full screen"
          onClick={onShowBarcode}
        >
          <Barcode value={boardingPassBarcode(pass)} cellSize={9} />
        </button>
        <span className={styles.meta}>
          Seq {pass.sequence} · E-ticket {pass.passenger.ticketNumber}
        </span>
      </div>
    </article>
  );
}

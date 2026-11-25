import { Icon } from '@/components/icons';
import { positionOfColumn } from '@/data/seatMap';
import type { BoardingPass } from '@/types/boardingPass';

import styles from './CheckedInSummary.module.css';

interface CheckedInSummaryProps {
  pass: BoardingPass;
  onChangeSeat: () => void;
  onUndo: () => void;
}

/** What check-in confirmed, with the two things that can still change: the seat and the check-in itself. */
export function CheckedInSummary({ pass, onChangeSeat, onUndo }: CheckedInSummaryProps) {
  const { passenger } = pass;
  const checks = [
    {
      title: 'Travel documents confirmed',
      detail: `${passenger.passportLabel} ••••${passenger.passportNumber.slice(-4)}, valid until ${passenger.passportExpiryLabel}.`,
    },
    {
      title: 'Restricted items declaration accepted',
      detail: 'No lithium batteries over 160 Wh, flammables or weapons in your bags.',
    },
    {
      title: `Seat ${pass.seat} · ${positionOfColumn(pass.seat.slice(-1))}`,
      detail:
        pass.seat === pass.assignedSeat
          ? 'Included standard seat, assigned at check-in.'
          : 'Changed today · included standard seat.',
      action: { label: 'Change', ariaLabel: 'Change seat', onClick: onChangeSeat },
    },
    {
      title: `Bag drop by ${pass.bagDropCloses}`,
      detail: `${pass.checkedBags}. ${pass.bagDropLocation}`,
    },
  ];

  return (
    <>
      <ul className={styles.checks}>
        {checks.map((check) => (
          <li key={check.title} className={styles.check}>
            <span className={styles.tick} aria-hidden="true">
              <Icon name="check" size={14} strokeWidth={3} />
            </span>
            <span className={styles.text}>
              <span className={styles.title}>{check.title}</span>
              <span className={styles.detail}>{check.detail}</span>
            </span>
            {check.action && (
              <button
                type="button"
                className={styles.textButton}
                aria-haspopup="dialog"
                aria-label={check.action.ariaLabel}
                onClick={check.action.onClick}
              >
                {check.action.label}
              </button>
            )}
          </li>
        ))}
      </ul>
      <div className={styles.footer}>
        <span>
          Checked in {pass.checkedInLabel}. Gate closes at {pass.gateCloses}.
        </span>
        <button type="button" className={styles.textButton} aria-haspopup="dialog" onClick={onUndo}>
          Undo check-in
        </button>
      </div>
    </>
  );
}

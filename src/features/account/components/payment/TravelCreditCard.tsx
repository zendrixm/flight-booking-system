import { Button } from '@/components/ui';
import { formatShortDate } from '@/lib/date';
import { formatPeso } from '@/lib/format';
import type { TravelCredit } from '@/types/travelCredit';

import styles from './TravelCredit.module.css';

export function signedPeso(amount: number): string {
  return `${amount >= 0 ? '+' : '−'}${formatPeso(Math.abs(amount))}`;
}

interface TravelCreditCardProps {
  credit: TravelCredit;
  onShowDetails: () => void;
}

/** Balance, the next expiry and the latest movements, on a Midnight card. */
export function TravelCreditCard({ credit, onShowDetails }: TravelCreditCardProps) {
  const [nextLot] = credit.lots;
  return (
    <section aria-labelledby="credit-title" className={styles.card}>
      <h2 id="credit-title" className={styles.cardTitle}>
        Vela travel credit
      </h2>
      <span className={styles.balanceBlock}>
        <span className={styles.balance}>{formatPeso(credit.balance)}</span>
        <span className={styles.onDarkMuted}>
          Applied automatically at checkout{nextLot ? ` · expires ${formatShortDate(nextLot.expiresOn)}` : ''}
        </span>
      </span>
      <ul className={styles.ledger}>
        {credit.activity.map((entry) => (
          <li key={entry.id} className={styles.ledgerRow}>
            <span className={styles.ledgerText}>
              <span className={styles.ledgerLabel}>{entry.label}</span>
              <span className={styles.onDarkMuted}>
                {entry.detail} · {formatShortDate(entry.date)}
              </span>
            </span>
            <span className={entry.amount >= 0 ? styles.amountAdded : styles.amountUsed}>
              {signedPeso(entry.amount)}
            </span>
          </li>
        ))}
      </ul>
      <Button
        variant="inverseQuiet"
        size="small"
        iconEnd="chevronRight"
        aria-haspopup="dialog"
        className={styles.detailsButton}
        onClick={onShowDetails}
      >
        Credit details and expiry
      </Button>
    </section>
  );
}

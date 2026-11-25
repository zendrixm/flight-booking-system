import { Button, StatusChip } from '@/components/ui';
import { formatPeso } from '@/lib/format';

import type { Confirmation } from '../../lib/confirmation';
import styles from './PaymentSummaryCard.module.css';

interface PaymentSummaryCardProps {
  confirmation: Confirmation;
  onViewReceipt: () => void;
}

export function PaymentSummaryCard({ confirmation, onViewReceipt }: PaymentSummaryCardProps) {
  return (
    <section className={styles.card} aria-labelledby="payment-summary-title">
      <div className={styles.header}>
        <h2 id="payment-summary-title" className={styles.title}>
          Payment
        </h2>
        <StatusChip tone="success">Paid</StatusChip>
      </div>
      <div className={styles.total}>
        <span className={styles.amount}>{formatPeso(confirmation.total)}</span>
        <span className={styles.paidWith}>{confirmation.paidWith}</span>
      </div>
      <dl className={styles.lines}>
        {confirmation.summaryLines.map((line) => (
          <div key={line.label} className={line.amount < 0 ? styles.discount : styles.line}>
            <dt>{line.label}</dt>
            <dd>{formatPeso(line.amount)}</dd>
          </div>
        ))}
      </dl>
      <Button variant="quiet" iconStart="receipt" fullWidth onClick={onViewReceipt}>
        View receipt
      </Button>
    </section>
  );
}

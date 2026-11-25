import { Button } from '@/components/ui';
import { formatPeso } from '@/lib/format';
import type { ManagedBooking } from '@/types/managedBooking';

import styles from './BookingSections.module.css';

interface PaymentsCardProps {
  booking: ManagedBooking;
  onViewReceipt: () => void;
  onRequestInvoice: () => void;
}

export function PaymentsCard({ booking, onViewReceipt, onRequestInvoice }: PaymentsCardProps) {
  return (
    <section className={styles.card} aria-labelledby="manage-payments-title">
      <h2 id="manage-payments-title" className={styles.title}>
        Payments
      </h2>
      {booking.payments.map((payment) => (
        <div key={payment.label} className={payment.amount < 0 ? styles.refund : styles.payment}>
          <span>{payment.label}</span>
          <span>{formatPeso(payment.amount)}</span>
        </div>
      ))}
      <div className={styles.paymentLinks}>
        <Button variant="ghost" size="small" iconStart="receipt" onClick={onViewReceipt}>
          {booking.status === 'cancelled' ? 'Receipt and refund note' : 'View receipt'}
        </Button>
        <Button variant="ghost" size="small" iconStart="building" onClick={onRequestInvoice}>
          Official invoice
        </Button>
      </div>
    </section>
  );
}

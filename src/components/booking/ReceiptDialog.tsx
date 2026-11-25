import { Icon, VelaMark } from '@/components/icons';
import { Button, Dialog, StatusChip } from '@/components/ui';
import { formatPeso } from '@/lib/format';
import type { ReceiptLine } from '@/types/trip';

import styles from './ReceiptDialog.module.css';

export interface ReceiptMetaItem {
  label: string;
  value: string;
}

interface ReceiptDialogProps {
  open: boolean;
  onClose: () => void;
  /** "Tokyo" — the dialog title reads "Receipt · Tokyo". */
  city: string;
  /** Route, dates and flights in one line. */
  tripLine: string;
  meta: readonly ReceiptMetaItem[];
  lines: readonly ReceiptLine[];
  /** "Card •••• 4821 · charged 9 Oct 2026, 00:41" */
  paidWith: string;
  airlineName: string;
  /** Short confirmation after printing or downloading, e.g. "PDF downloaded". */
  statusMessage?: string;
  onPrint: () => void;
  onDownload: () => void;
}

/** An itemised receipt shared by the confirmation page, My trips and Manage booking. */
export function ReceiptDialog({
  open,
  onClose,
  city,
  tripLine,
  meta,
  lines,
  paidWith,
  airlineName,
  statusMessage,
  onPrint,
  onDownload,
}: ReceiptDialogProps) {
  const total = lines.reduce((sum, line) => sum + line.amount, 0);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="large"
      title={
        <span className={styles.titleStack}>
          <span className={styles.issuer}>
            <VelaMark size={14} />
            Vela Travel, Inc.
          </span>
          <span className={styles.title}>Receipt · {city}</span>
        </span>
      }
      description={tripLine}
      footer={
        <>
          {statusMessage && (
            <span role="status" className={styles.status}>
              <Icon name="check" size={14} strokeWidth={2.2} />
              {statusMessage}
            </span>
          )}
          <Button variant="quiet" iconStart="printer" onClick={onPrint}>
            Print
          </Button>
          <Button variant="primary" iconStart="download" onClick={onDownload}>
            Download PDF
          </Button>
        </>
      }
    >
      <dl className={styles.meta}>
        {meta.map((item) => (
          <div key={item.label} className={styles.metaItem}>
            <dt>{item.label}</dt>
            <dd>{item.value}</dd>
          </div>
        ))}
      </dl>

      <div className={styles.lines}>
        {lines.map((line) => (
          <div key={line.label} className={line.amount < 0 ? styles.discount : styles.line}>
            <span className={styles.lineText}>
              <span className={styles.lineLabel}>{line.label}</span>
              <span className={styles.lineDetail}>{line.detail}</span>
            </span>
            <span className={styles.amount}>{formatPeso(line.amount)}</span>
          </div>
        ))}
        <div className={styles.total}>
          <span>Total paid</span>
          <span className={styles.totalAmount}>{formatPeso(total)}</span>
        </div>
      </div>

      <div className={styles.payment}>
        <span className={styles.paymentText}>
          <Icon name="creditCard" size={18} />
          {paidWith}
        </span>
        <StatusChip tone="success" hideDot size="compact">
          Paid in full
        </StatusChip>
      </div>
      <p className={styles.note}>
        All amounts in Philippine pesos, taxes included. Vela Travel, Inc. issued these tickets on behalf of{' '}
        {airlineName}.
      </p>
    </Dialog>
  );
}

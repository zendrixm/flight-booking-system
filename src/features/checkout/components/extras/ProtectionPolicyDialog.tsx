import { Alert, Button, Dialog } from '@/components/ui';
import { formatPeso } from '@/lib/format';

import { PROTECTION_LIMITS, PROTECTION_PRICE_PER_TRAVELER } from '../../lib/extrasCatalog';
import styles from './ProtectionPolicyDialog.module.css';

const NOT_COVERED = [
  'Changing your mind or plans after booking',
  'Conditions you were already being treated for, unless declared and accepted',
  'Travel against government advice, or extreme sports',
] as const;

interface ProtectionPolicyDialogProps {
  open: boolean;
  onClose: () => void;
  /** "covers both flights, 12–19 Nov" */
  coverageLabel: string;
  hasProtection: boolean;
  totalPrice: number;
  onDownload: () => void;
  onKeep: () => void;
}

export function ProtectionPolicyDialog({
  open,
  onClose,
  coverageLabel,
  hasProtection,
  totalPrice,
  onDownload,
  onKeep,
}: ProtectionPolicyDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="large"
      title="Trip protection · policy summary"
      description={`${formatPeso(PROTECTION_PRICE_PER_TRAVELER)} per traveler · ${coverageLabel}`}
      footer={
        <>
          <Button variant="quiet" iconStart="download" onClick={onDownload}>
            Download full policy (PDF)
          </Button>
          <Button variant="primary" onClick={onKeep}>
            {hasProtection ? 'Keep protection' : `Add protection · ${formatPeso(totalPrice)}`}
          </Button>
        </>
      }
    >
      <dl className={styles.limits}>
        {PROTECTION_LIMITS.map(({ benefit, detail, limit }) => (
          <div key={benefit} className={styles.limit}>
            <dt className={styles.benefit}>
              <span className={styles.benefitName}>{benefit}</span>
              <span className={styles.benefitDetail}>{detail}</span>
            </dt>
            <dd className={styles.amount}>{limit}</dd>
          </div>
        ))}
      </dl>
      <div className={styles.notCovered}>
        <h3 className={styles.notCoveredTitle}>Not covered</h3>
        <ul className={styles.notCoveredList}>
          {NOT_COVERED.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
      <Alert tone="attention" icon="info">
        Your certificate arrives by email with your e-tickets. To claim, call the 24/7 assistance line on it
        or write to us from the Help centre — most claims are decided within 10 working days.
      </Alert>
    </Dialog>
  );
}

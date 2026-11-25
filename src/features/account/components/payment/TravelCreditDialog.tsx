import clsx from 'clsx';
import { Link } from 'react-router';

import { paths } from '@/app/paths';
import { Button, Dialog, LinkButton } from '@/components/ui';
import { formatShortDate } from '@/lib/date';
import { formatPeso } from '@/lib/format';
import type { TravelCredit } from '@/types/travelCredit';

import styles from './TravelCredit.module.css';
import { signedPeso } from './TravelCreditCard';

interface TravelCreditDialogProps {
  credit: TravelCredit;
  onClose: () => void;
}

export function TravelCreditDialog({ credit, onClose }: TravelCreditDialogProps) {
  const [nextLot] = credit.lots;
  return (
    <Dialog
      open
      onClose={onClose}
      size="large"
      title="Vela travel credit"
      description="Pays for flights, seats and bags for anyone you book for."
      footer={
        <div className={styles.dialogFooter}>
          <Link to={`${paths.legal('terms')}#credit`} className={styles.termsLink}>
            Credit terms
          </Link>
          <span className={styles.dialogButtons}>
            <Button variant="quiet" onClick={onClose}>
              Close
            </Button>
            <LinkButton to={paths.home} variant="primary">
              Use it — search flights
            </LinkButton>
          </span>
        </div>
      }
    >
      <div className={styles.summary}>
        <span className={styles.summaryBalance}>
          <span className={styles.summaryLabel}>Available now</span>
          <span className={styles.summaryAmount}>{formatPeso(credit.balance)}</span>
        </span>
        {nextLot && (
          <span className={styles.onDarkMuted}>
            Next expiry · {formatPeso(nextLot.amount)} on {formatShortDate(nextLot.expiresOn)}
          </span>
        )}
      </div>

      <section aria-labelledby="credit-lots-title" className={styles.dialogSection}>
        <h3 id="credit-lots-title" className={styles.sectionTitle}>
          When it expires
        </h3>
        <div className={styles.lots}>
          {credit.lots.map((lot, index) => (
            <div key={lot.id} className={clsx(styles.lot, index === 0 && styles.lotNext)}>
              <span className={styles.lotText}>
                <span className={styles.lotLabel}>{lot.label}</span>
                <span className={styles.lotDetail}>{lot.detail}</span>
              </span>
              <span className={styles.lotAmount}>
                <span className={styles.amount}>{formatPeso(lot.amount)}</span>
                <span className={index === 0 ? styles.expiryNext : styles.expiry}>
                  Expires {formatShortDate(lot.expiresOn)}
                </span>
              </span>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="credit-activity-title" className={styles.dialogSection}>
        <h3 id="credit-activity-title" className={styles.sectionTitle}>
          Activity
        </h3>
        <ul className={styles.activity}>
          {credit.activity.map((entry) => (
            <li key={entry.id} className={styles.activityRow}>
              <span className={styles.lotText}>
                <span className={styles.lotLabel}>{entry.label}</span>
                <span className={styles.lotDetail}>
                  {entry.detail} · {formatShortDate(entry.date)}
                </span>
              </span>
              <span className={entry.amount >= 0 ? styles.activityAdded : styles.activityUsed}>
                {signedPeso(entry.amount)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <ul className={styles.rules}>
        <li>We use the credit that expires first, automatically, at checkout.</li>
        <li>Credit can’t be exchanged for cash or moved to another account.</li>
      </ul>
    </Dialog>
  );
}

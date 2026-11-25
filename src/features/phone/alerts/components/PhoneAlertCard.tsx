import clsx from 'clsx';

import { paths } from '@/app/paths';
import { LinkButton, StatusChip } from '@/components/ui';
import { formatPeso } from '@/lib/format';
import type { PriceAlert } from '@/types/priceAlert';

import {
  ALERT_STATUSES,
  alertRouteLabel,
  alertSearchQuery,
  alertStatusOf,
  alertTargetLine,
  currentFareOf,
} from '../lib/alertSummary';
import styles from './PhoneAlertCard.module.css';

/** One watched route: today's lowest fare against the target, and a way to the flights. */
export function PhoneAlertCard({ alert }: { alert: PriceAlert }) {
  const status = alertStatusOf(alert);
  const fare = currentFareOf(alert);
  const route = alertRouteLabel(alert);

  return (
    <li
      className={clsx(
        styles.card,
        status === 'belowTarget' && styles.belowTarget,
        status === 'paused' && styles.paused,
      )}
    >
      <div className={styles.topRow}>
        <span className={styles.text}>
          <span className={styles.route}>{route}</span>
          <span className={styles.meta}>
            {alert.datesLabel} · {alert.travelersLabel}
          </span>
        </span>
        <StatusChip tone={ALERT_STATUSES[status].tone} hideDot size="compact">
          {ALERT_STATUSES[status].label}
        </StatusChip>
      </div>
      <div className={styles.bottomRow}>
        <span className={styles.text}>
          <span className={styles.fare}>{fare === null ? '—' : formatPeso(fare)}</span>
          <span className={styles.meta}>{alertTargetLine(alert)}</span>
        </span>
        <LinkButton
          to={paths.phone.results(alertSearchQuery(alert))}
          variant="quiet"
          size="small"
          aria-label={`See flights, ${route}`}
        >
          See flights
        </LinkButton>
      </div>
    </li>
  );
}

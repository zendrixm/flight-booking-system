import { Link } from 'react-router';

import { paths } from '@/app/paths';
import { searchToQueryString, DEFAULT_SEARCH } from '@/lib/flightSearchUrl';
import { formatPeso } from '@/lib/format';
import type { PriceAlert } from '@/types/priceAlert';

import styles from './PriceAlertsPreview.module.css';

/** Change in the lowest fare over the last few daily checks. */
function weeklyChange(alert: PriceAlert): number {
  const history = alert.priceHistory;
  if (history.length < 3) return 0;
  return history[history.length - 1] - history[history.length - 3];
}

export function PriceAlertsPreview({ alerts }: { alerts: readonly PriceAlert[] }) {
  if (alerts.length === 0) return null;

  return (
    <section className={styles.section} aria-labelledby="alerts-preview-title">
      <div className={styles.header}>
        <h2 id="alerts-preview-title" className={styles.title}>
          Price alerts
        </h2>
        <Link to={paths.account.priceAlerts} className={styles.manage}>
          Manage alerts
        </Link>
      </div>
      <div className={styles.grid}>
        {alerts.map((alert) => {
          const change = weeklyChange(alert);
          const latest = alert.priceHistory.at(-1);
          const resultsUrl = `${paths.flights}?${searchToQueryString({
            ...DEFAULT_SEARCH,
            from: alert.from,
            to: alert.to,
            ...(alert.departDate ? { departDate: alert.departDate, returnDate: alert.returnDate } : {}),
          })}`;
          return (
            <Link key={alert.id} to={resultsUrl} className={styles.card}>
              <span className={styles.route}>
                <span>
                  {alert.from} → {alert.to}
                </span>
                <span className={styles.dates}>{alert.datesLabel}</span>
              </span>
              <span className={styles.priceRow}>
                <span className={styles.price}>{latest ? formatPeso(latest) : '—'}</span>
                <span className={change < 0 ? styles.drop : styles.flat}>
                  {change < 0
                    ? `↓ ${formatPeso(-change)} this week`
                    : change > 0
                      ? `↑ ${formatPeso(change)} this week`
                      : 'No change'}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

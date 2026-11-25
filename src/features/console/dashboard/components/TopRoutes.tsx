import type { RouteShare } from '@/types/console/dashboard';

import { ConsolePanel } from '../../shared/components/ConsolePanel';
import { formatGrossValue } from '../lib/dashboardFormat';
import styles from './TopRoutes.module.css';

interface TopRoutesProps {
  routes: readonly RouteShare[];
  rangeLabel: string;
}

export function TopRoutes({ routes, rangeLabel }: TopRoutesProps) {
  const busiest = Math.max(...routes.map((route) => route.bookings), 1);
  return (
    <ConsolePanel
      title="Top routes"
      aside={`Share of bookings · ${rangeLabel.toLowerCase()}`}
      className={styles.panel}
    >
      <ol className={styles.list}>
        {routes.map((route) => (
          <li key={route.route} className={styles.route}>
            <span className={styles.row}>
              <span className={styles.name}>{route.route}</span>
              <span className={styles.figures}>
                <span className={styles.bookings}>
                  {route.bookings.toLocaleString('en-US')}
                  <span className="visually-hidden"> bookings,</span>
                </span>
                <span className={styles.value}>{formatGrossValue(route.grossValue, 1)}</span>
              </span>
            </span>
            <span className={styles.track} aria-hidden="true">
              <span className={styles.fill} style={{ width: `${(route.bookings / busiest) * 100}%` }} />
            </span>
          </li>
        ))}
      </ol>
    </ConsolePanel>
  );
}

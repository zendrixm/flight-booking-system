import clsx from 'clsx';

import { Icon } from '@/components/icons';
import type { DashboardKpi } from '@/types/console/dashboard';

import { sparklinePath } from '../lib/dashboardFormat';
import styles from './KpiCard.module.css';

export function KpiCard({ kpi }: { kpi: DashboardKpi }) {
  const isRise = kpi.change.startsWith('+');
  return (
    <div className={styles.card}>
      <span className={styles.label}>{kpi.label}</span>
      <span className={styles.value}>{kpi.value}</span>
      <span className={styles.footer}>
        <span className={clsx(styles.change, kpi.isImprovement ? styles.good : styles.bad)}>
          <Icon name={isRise ? 'arrowUp' : 'arrowDown'} size={12} strokeWidth={2.4} />
          {kpi.change}
          <span className={styles.comparison}>vs prior</span>
          <span className="visually-hidden">{kpi.isImprovement ? '(improving)' : '(worsening)'}</span>
        </span>
        <svg viewBox="0 0 72 24" preserveAspectRatio="none" className={styles.sparkline} aria-hidden="true">
          <path d={sparklinePath(kpi.trend)} />
        </svg>
      </span>
    </div>
  );
}

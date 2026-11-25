import clsx from 'clsx';

import type { RefundMetrics as RefundMetricsData } from '@/types/console/refund';

import { metricCards } from '../lib/refundReview';
import styles from './RefundMetrics.module.css';

export function RefundMetrics({ metrics }: { metrics: RefundMetricsData }) {
  return (
    <section aria-label="Refund metrics" className={styles.grid}>
      {metricCards(metrics).map((card) => (
        <div key={card.label} className={styles.card}>
          <span className={styles.label}>{card.label}</span>
          <span className={styles.value}>{card.value}</span>
          <span className={clsx(styles.note, styles[card.noteTone])}>{card.note}</span>
        </div>
      ))}
    </section>
  );
}

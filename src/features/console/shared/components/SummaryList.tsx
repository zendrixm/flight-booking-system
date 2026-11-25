import clsx from 'clsx';

import styles from './SummaryList.module.css';

export interface SummaryRow {
  label: string;
  value: string;
}

interface SummaryListProps {
  rows: readonly SummaryRow[];
  className?: string;
}

/** Label-and-value rows in a hairline box: what a confirmation is about to do. */
export function SummaryList({ rows, className }: SummaryListProps) {
  if (rows.length === 0) return null;
  return (
    <dl className={clsx(styles.list, className)}>
      {rows.map((row) => (
        <div key={row.label} className={styles.row}>
          <dt>{row.label}</dt>
          <dd>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

import clsx from 'clsx';
import type { CSSProperties, ReactNode, TableHTMLAttributes } from 'react';

import styles from './Table.module.css';

interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  children: ReactNode;
  /** Below this width the table scrolls sideways instead of squashing columns. */
  minWidth?: number;
  /** Keep the outer columns aligned with a card's padding. */
  inset?: boolean;
  wrapperClassName?: string;
}

/** A data table with the shared header, row divider and number styles. Use `scope` on header cells. */
export function Table({
  children,
  minWidth = 560,
  inset = true,
  className,
  wrapperClassName,
  ...tableProps
}: TableProps) {
  return (
    <div className={clsx(styles.scroller, wrapperClassName)}>
      <table
        className={clsx(styles.table, inset && styles.inset, className)}
        style={{ '--table-min-width': `${minWidth}px` } as CSSProperties}
        {...tableProps}
      >
        {children}
      </table>
    </div>
  );
}

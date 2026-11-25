import clsx from 'clsx';

import styles from './FilterChips.module.css';

export type FilterDotTone = 'neutral' | 'success' | 'warning' | 'danger';

export interface FilterChipOption<T extends string> {
  value: T;
  label: string;
  /** Shown after the label, e.g. how many rows the filter keeps. */
  count?: number;
  /** A coloured dot that echoes the status chips the filter matches. */
  dot?: FilterDotTone;
}

interface FilterChipsProps<T extends string> {
  /** Names the group for screen readers, e.g. "Filter by status". */
  label: string;
  options: ReadonlyArray<FilterChipOption<T>>;
  value: T;
  onChange: (value: T) => void;
  /** `small` for chips inside a panel. */
  size?: 'default' | 'small';
  className?: string;
}

/** A row of single-choice filter pills. Each is a toggle button, so the pressed one is announced. */
export function FilterChips<T extends string>({
  label,
  options,
  value,
  onChange,
  size = 'default',
  className,
}: FilterChipsProps<T>) {
  return (
    <div
      role="group"
      aria-label={label}
      className={clsx(styles.group, size === 'small' && styles.small, className)}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={styles.chip}
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {option.dot && <span aria-hidden="true" className={clsx(styles.dot, styles[option.dot])} />}
          {option.label}
          {option.count !== undefined && <span className={styles.count}>{option.count}</span>}
        </button>
      ))}
    </div>
  );
}

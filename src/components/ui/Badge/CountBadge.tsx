import clsx from 'clsx';

import styles from './Badge.module.css';

interface CountBadgeProps {
  count: number;
  /** `attention` (Brass) marks counts that need action; everything else is neutral. */
  tone?: 'neutral' | 'attention';
  /** Use `dark` on Midnight surfaces such as the console sidebar. */
  surface?: 'light' | 'dark';
  /** Read by screen readers instead of the bare number, e.g. "18 bookings need action". */
  label?: string;
  /** Larger counts show as "99+". Pass `Infinity` for totals that must read in full, like 82,410. */
  max?: number;
  className?: string;
}

const DEFAULT_MAX_COUNT = 99;

export function CountBadge({
  count,
  tone = 'neutral',
  surface = 'light',
  label,
  max = DEFAULT_MAX_COUNT,
  className,
}: CountBadgeProps) {
  const toneClass =
    tone === 'attention' ? styles.attention : surface === 'dark' ? styles.neutralOnDark : styles.neutral;
  const display = count > max ? `${max}+` : count.toLocaleString('en-PH');

  return (
    <span className={clsx(styles.countBadge, toneClass, className)} aria-label={label}>
      {display}
    </span>
  );
}

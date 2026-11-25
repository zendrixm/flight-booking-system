import clsx from 'clsx';

import { Icon } from '@/components/icons';
import { formatDayLabel, parseIsoDate, WEEKDAYS_LONG, type IsoDate } from '@/lib/date';

import fieldStyles from './SearchFields.module.css';

interface DateCellProps {
  label: string;
  value: string;
  sub: string;
  active: boolean;
  disabled?: boolean;
  controls?: string;
  ariaLabel?: string;
  onClick: () => void;
}

export function DateCell({
  label,
  value,
  sub,
  active,
  disabled,
  controls,
  ariaLabel,
  onClick,
}: DateCellProps) {
  return (
    <button
      type="button"
      className={clsx(fieldStyles.cell, active && fieldStyles.cellActive)}
      aria-expanded={active}
      aria-controls={active ? controls : undefined}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
    >
      <span className={fieldStyles.eyebrow}>
        <Icon name="calendar" size={14} strokeWidth={1.8} />
        {label}
      </span>
      <span className={fieldStyles.value}>{value}</span>
      <span className={fieldStyles.sub}>{sub}</span>
    </button>
  );
}

/** "Thursday · 2026", or "Thursday · ±3 days" when the search is flexible. */
export function dateSubLabel(date: IsoDate, flexibleDates: boolean): string {
  const value = parseIsoDate(date);
  return `${WEEKDAYS_LONG[value.getUTCDay()]} · ${flexibleDates ? '±3 days' : value.getUTCFullYear()}`;
}

export { formatDayLabel };

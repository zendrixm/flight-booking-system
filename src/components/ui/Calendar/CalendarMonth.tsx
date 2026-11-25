import clsx from 'clsx';

import {
  buildCalendarMonth,
  formatDayLabel,
  monthLabel,
  parseIsoDate,
  WEEKDAY_INITIALS,
  type IsoDate,
} from '@/lib/date';

import styles from './Calendar.module.css';

export interface CalendarDayMeta {
  /** Short text under the day number, e.g. a fare "₱12.9k". */
  label?: string;
  /** Highlights the label in Spruce, e.g. for the lowest fares. */
  isLow?: boolean;
  /** Extra words for screen readers, e.g. "from ₱12,940". */
  description?: string;
}

interface CalendarMonthProps {
  year: number;
  monthIndex: number;
  selectedStart?: IsoDate | null;
  selectedEnd?: IsoDate | null;
  today?: IsoDate;
  isDateDisabled?: (date: IsoDate) => boolean;
  getDayMeta?: (date: IsoDate) => CalendarDayMeta | undefined;
  onSelectDate: (date: IsoDate) => void;
  /**
   * `fare` shows a line of meta under each day; `compact` is the 40px console picker; `touch` is
   * the phone app's picker, with round end dates joined by a Brass band.
   */
  variant?: 'fare' | 'compact' | 'touch';
  /** Hide the S M T W T F S row when the parent pins one above several months. */
  showWeekdays?: boolean;
}

/** One month grid. Range selection and paging live in the parent. */
export function CalendarMonth({
  year,
  monthIndex,
  selectedStart,
  selectedEnd,
  today,
  isDateDisabled,
  getDayMeta,
  onSelectDate,
  variant = 'fare',
  showWeekdays = true,
}: CalendarMonthProps) {
  const month = buildCalendarMonth(year, monthIndex);
  const name = monthLabel(year, monthIndex);
  const hasRange = Boolean(selectedStart && selectedEnd && selectedStart !== selectedEnd);

  return (
    <div className={clsx(styles.month, variant !== 'fare' && styles[variant])}>
      <span className={styles.monthName}>{name}</span>
      <div className={styles.grid} role="group" aria-label={name}>
        {showWeekdays &&
          WEEKDAY_INITIALS.map((initial, index) => (
            <span key={index} className={styles.weekday} aria-hidden="true">
              {initial}
            </span>
          ))}
        {Array.from({ length: month.leadingBlanks }, (_, index) => (
          <span key={`blank-${index}`} aria-hidden="true" />
        ))}
        {month.days.map((date) => {
          const disabled = isDateDisabled?.(date) ?? false;
          const meta = disabled ? undefined : getDayMeta?.(date);
          const isEndpoint = date === selectedStart || date === selectedEnd;
          const isInRange = Boolean(
            selectedStart && selectedEnd && date > selectedStart && date < selectedEnd,
          );
          const label = [formatDayLabel(date), meta?.description].filter(Boolean).join(', ');

          return (
            <button
              key={date}
              type="button"
              disabled={disabled}
              aria-pressed={isEndpoint}
              aria-label={label}
              className={clsx(
                styles.day,
                isEndpoint && styles.selected,
                isInRange && styles.inRange,
                hasRange && date === selectedStart && styles.rangeStart,
                hasRange && date === selectedEnd && styles.rangeEnd,
                meta?.isLow && styles.low,
                date === today && styles.today,
              )}
              onClick={() => onSelectDate(date)}
            >
              <span className={styles.dayNumber}>{parseIsoDate(date).getUTCDate()}</span>
              {variant === 'fare' && <span className={styles.meta}>{meta?.label ?? ' '}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

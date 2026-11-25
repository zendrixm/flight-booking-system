import clsx from 'clsx';
import { useCallback, useMemo } from 'react';

import { Button, CalendarMonth, IconButton, type CalendarDayMeta } from '@/components/ui';
import { BOOKING_HORIZON, DEMO_TODAY } from '@/config/demo';
import { buildCalendarMonth, shiftMonth, type IsoDate } from '@/lib/date';
import { formatPeso, formatPesoCompact } from '@/lib/format';

import styles from './FareCalendarPanel.module.css';
import fieldStyles from './SearchFields.module.css';

/** The calendar can page through these months, two at a time. */
const FIRST_MONTH = { year: 2026, monthIndex: 9 };
const MONTH_COUNT = 6;
export const MAX_CALENDAR_PAGE = MONTH_COUNT - 2;

/** Lowest 15% of visible fares are highlighted in Spruce. */
const LOW_FARE_SHARE = 0.15;

interface FareCalendarPanelProps {
  id: string;
  title: string;
  subtitle: string;
  /** Index of the first visible month, 0..MAX_CALENDAR_PAGE. */
  page: number;
  onPageChange: (page: number) => void;
  selectedStart: IsoDate | null;
  selectedEnd: IsoDate | null;
  /** Dates before this cannot be chosen (today, or the previous flight in a multi-city trip). */
  earliestDate: IsoDate;
  getFare: (date: IsoDate) => number;
  onSelectDate: (date: IsoDate) => void;
  onDone: () => void;
}

export function calendarPageFor(date: IsoDate): number {
  const [year, month] = date.split('-').map(Number);
  const offset = (year - FIRST_MONTH.year) * 12 + (month - 1 - FIRST_MONTH.monthIndex);
  return Math.max(0, Math.min(MAX_CALENDAR_PAGE, offset));
}

export function FareCalendarPanel({
  id,
  title,
  subtitle,
  page,
  onPageChange,
  selectedStart,
  selectedEnd,
  earliestDate,
  getFare,
  onSelectDate,
  onDone,
}: FareCalendarPanelProps) {
  const months = useMemo(
    () => [0, 1].map((offset) => shiftMonth(FIRST_MONTH.year, FIRST_MONTH.monthIndex, page + offset)),
    [page],
  );
  const minimum = earliestDate > DEMO_TODAY ? earliestDate : DEMO_TODAY;
  const isDateDisabled = useCallback((date: IsoDate) => date < minimum || date > BOOKING_HORIZON, [minimum]);

  const lowFareCutoff = useMemo(() => {
    const visibleFares = months
      .flatMap(({ year, monthIndex }) => buildCalendarMonth(year, monthIndex).days)
      .filter((date) => !isDateDisabled(date))
      .map(getFare)
      .sort((a, b) => a - b);
    return visibleFares[Math.floor(visibleFares.length * LOW_FARE_SHARE)] ?? 0;
  }, [months, isDateDisabled, getFare]);

  const getDayMeta = (date: IsoDate): CalendarDayMeta => {
    const fare = getFare(date);
    return {
      label: formatPesoCompact(fare),
      isLow: fare <= lowFareCutoff,
      description: `from ${formatPeso(fare)}`,
    };
  };

  return (
    <div id={id} role="dialog" aria-label="Choose dates" className={clsx(fieldStyles.panel, styles.panel)}>
      <div className={styles.header}>
        <div className={styles.titles}>
          <span className={styles.title}>{title}</span>
          <span className={styles.subtitle}>{subtitle}</span>
        </div>
        <div className={styles.paging}>
          <IconButton
            icon="chevronLeft"
            label="Previous month"
            variant="outline"
            disabled={page <= 0}
            onClick={() => onPageChange(page - 1)}
          />
          <IconButton
            icon="chevronRight"
            label="Next month"
            variant="outline"
            disabled={page >= MAX_CALENDAR_PAGE}
            onClick={() => onPageChange(page + 1)}
          />
        </div>
      </div>
      <div className={styles.months}>
        {months.map(({ year, monthIndex }) => (
          <CalendarMonth
            key={`${year}-${monthIndex}`}
            year={year}
            monthIndex={monthIndex}
            selectedStart={selectedStart}
            selectedEnd={selectedEnd}
            isDateDisabled={isDateDisabled}
            getDayMeta={getDayMeta}
            onSelectDate={onSelectDate}
          />
        ))}
      </div>
      <div className={styles.footer}>
        <span className={styles.legend}>
          <span className={styles.legendDot} aria-hidden="true" />
          Lowest fares this period
        </span>
        <Button onClick={onDone}>Done</Button>
      </div>
    </div>
  );
}

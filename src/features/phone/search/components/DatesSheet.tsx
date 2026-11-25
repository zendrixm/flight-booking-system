import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';

import { Button, CalendarMonth, Sheet } from '@/components/ui';
import { BOOKING_HORIZON, DEMO_TODAY } from '@/config/demo';
import type { SearchFormState } from '@/features/booking/lib/searchForm';
import { nextCalendarTarget } from '@/features/booking/lib/searchFormReducer';
import {
  daysBetween,
  formatDayLabel,
  parseIsoDate,
  shiftMonth,
  WEEKDAY_INITIALS,
  type IsoDate,
} from '@/lib/date';
import { pluralize } from '@/lib/format';

import { dispatchSearch } from '../state/phoneSearchStore';
import styles from './DatesSheet.module.css';

type DateTarget = 'depart' | 'return';

/** Every month from today's to the last bookable one. */
function bookableMonths(): Array<{ year: number; monthIndex: number }> {
  const first = parseIsoDate(DEMO_TODAY);
  const last = parseIsoDate(BOOKING_HORIZON);
  const count =
    (last.getUTCFullYear() - first.getUTCFullYear()) * 12 + last.getUTCMonth() - first.getUTCMonth() + 1;
  return Array.from({ length: count }, (_, offset) =>
    shiftMonth(first.getUTCFullYear(), first.getUTCMonth(), offset),
  );
}

const MONTHS = bookableMonths();

function isOutsideBookingWindow(date: IsoDate): boolean {
  return date < DEMO_TODAY || date > BOOKING_HORIZON;
}

function summaryOf(search: SearchFormState): { title: string; detail: string } {
  if (search.tripType !== 'round') {
    return {
      title: `One way · ${formatDayLabel(search.departDate)}`,
      detail: 'Prices shown per traveler on the next screen',
    };
  }
  if (!search.returnDate) {
    return { title: 'Now choose your return date', detail: `Departing ${formatDayLabel(search.departDate)}` };
  }
  const nights = daysBetween(search.departDate, search.returnDate);
  return {
    title: `${pluralize(nights, 'night')} · ${formatDayLabel(search.departDate)} – ${formatDayLabel(search.returnDate)}`,
    detail: 'Tap a new date to start again',
  };
}

interface DatesSheetProps {
  search: SearchFormState;
  initialTarget: DateTarget;
  onClose: () => void;
}

/** Departure and return dates on one scrolling calendar. Picking a departure moves on to the return. */
export function DatesSheet({ search, initialTarget, onClose }: DatesSheetProps) {
  const isRoundTrip = search.tripType === 'round';
  const [target, setTarget] = useState<DateTarget>(isRoundTrip ? initialTarget : 'depart');
  const departMonthRef = useRef<HTMLDivElement>(null);
  const summary = summaryOf(search);

  // Open on the month of the departure date rather than today's.
  useEffect(() => {
    departMonthRef.current?.scrollIntoView({ block: 'start' });
  }, []);

  const departMonth = parseIsoDate(search.departDate);
  const pick = (date: IsoDate) => {
    const next = nextCalendarTarget(search, { kind: target }, date);
    dispatchSearch({ type: 'pickDate', target: { kind: target }, date });
    if (next && next.kind !== 'leg') setTarget(next.kind);
  };

  const tabs: Array<{ id: DateTarget; label: string; value: string }> = [
    { id: 'depart', label: 'Depart', value: formatDayLabel(search.departDate) },
  ];
  if (isRoundTrip) {
    tabs.push({
      id: 'return',
      label: 'Return',
      value: search.returnDate ? formatDayLabel(search.returnDate) : 'Choose a date',
    });
  }

  return (
    <Sheet
      open
      onClose={onClose}
      height="tall"
      divided
      title="Dates"
      headerExtra={
        <>
          <div className={styles.targets} role="group" aria-label="Which date">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                aria-pressed={target === tab.id}
                className={styles.target}
                onClick={() => setTarget(tab.id)}
              >
                <span className={styles.targetLabel}>{tab.label}</span>
                <span
                  className={clsx(
                    styles.targetValue,
                    !search.returnDate && tab.id === 'return' && styles.placeholder,
                  )}
                >
                  {tab.value}
                </span>
              </button>
            ))}
          </div>
          <div className={styles.weekdays} aria-hidden="true">
            {WEEKDAY_INITIALS.map((initial, index) => (
              <span key={index}>{initial}</span>
            ))}
          </div>
        </>
      }
      footer={
        <div className={styles.footer}>
          <span className={styles.summary} aria-live="polite">
            <span className={styles.summaryTitle}>{summary.title}</span>
            <span className={styles.summaryDetail}>{summary.detail}</span>
          </span>
          <Button disabled={isRoundTrip && !search.returnDate} onClick={onClose}>
            Done
          </Button>
        </div>
      }
    >
      {MONTHS.map(({ year, monthIndex }) => {
        const isDepartMonth =
          year === departMonth.getUTCFullYear() && monthIndex === departMonth.getUTCMonth();
        return (
          <div
            key={`${year}-${monthIndex}`}
            ref={isDepartMonth ? departMonthRef : undefined}
            className={styles.month}
          >
            <CalendarMonth
              variant="touch"
              showWeekdays={false}
              year={year}
              monthIndex={monthIndex}
              today={DEMO_TODAY}
              selectedStart={search.departDate}
              selectedEnd={isRoundTrip ? search.returnDate : null}
              isDateDisabled={isOutsideBookingWindow}
              onSelectDate={pick}
            />
          </div>
        );
      })}
    </Sheet>
  );
}

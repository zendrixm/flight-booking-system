/**
 * Calendar-date helpers. Dates are ISO strings ("2026-11-12") handled in UTC so a date never
 * shifts with the viewer's time zone. Times of day are separate "HH:mm" strings.
 */

export type IsoDate = string;

const DAY_MS = 86_400_000;

export const WEEKDAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
export const WEEKDAYS_LONG = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;
export const WEEKDAY_INITIALS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;
export const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;
export const MONTHS_LONG = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

export function parseIsoDate(date: IsoDate): Date {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function toIsoDate(date: Date): IsoDate {
  return date.toISOString().slice(0, 10);
}

export function makeIsoDate(year: number, monthIndex: number, day: number): IsoDate {
  return toIsoDate(new Date(Date.UTC(year, monthIndex, day)));
}

export function addDays(date: IsoDate, days: number): IsoDate {
  return toIsoDate(new Date(parseIsoDate(date).getTime() + days * DAY_MS));
}

/** Same day `months` later, clamped to the end of shorter months (31 Aug + 6 → 28/29 Feb). */
export function addMonths(date: IsoDate, months: number): IsoDate {
  const value = parseIsoDate(date);
  const target = new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth() + months, 1));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(value.getUTCDate(), lastDay));
  return toIsoDate(target);
}

/** Whole years between a birth date and `on` (age on that day). */
export function yearsBetween(from: IsoDate, on: IsoDate): number {
  const start = parseIsoDate(from);
  const end = parseIsoDate(on);
  let years = end.getUTCFullYear() - start.getUTCFullYear();
  const beforeBirthday =
    end.getUTCMonth() < start.getUTCMonth() ||
    (end.getUTCMonth() === start.getUTCMonth() && end.getUTCDate() < start.getUTCDate());
  if (beforeBirthday) years -= 1;
  return years;
}

/** Whole days from `from` to `to` (negative when `to` is earlier). */
export function daysBetween(from: IsoDate, to: IsoDate): number {
  return Math.round((parseIsoDate(to).getTime() - parseIsoDate(from).getTime()) / DAY_MS);
}

export function isBefore(date: IsoDate, other: IsoDate): boolean {
  return date < other;
}

export function maxDate(a: IsoDate, b: IsoDate): IsoDate {
  return a > b ? a : b;
}

export function minDate(a: IsoDate, b: IsoDate): IsoDate {
  return a < b ? a : b;
}

export function weekdayIndex(date: IsoDate): number {
  return parseIsoDate(date).getUTCDay();
}

export function isWeekend(date: IsoDate): boolean {
  const weekday = weekdayIndex(date);
  return weekday === 0 || weekday === 6;
}

/** "Thu, 12 Nov" */
export function formatDayLabel(date: IsoDate): string {
  const value = parseIsoDate(date);
  return `${WEEKDAYS_SHORT[value.getUTCDay()]}, ${value.getUTCDate()} ${MONTHS_SHORT[value.getUTCMonth()]}`;
}

/** "Thursday, 12 November" */
export function formatLongDayLabel(date: IsoDate): string {
  const value = parseIsoDate(date);
  return `${WEEKDAYS_LONG[value.getUTCDay()]}, ${value.getUTCDate()} ${MONTHS_LONG[value.getUTCMonth()]}`;
}

/** "12 Nov 2026" */
export function formatShortDate(date: IsoDate): string {
  const value = parseIsoDate(date);
  return `${value.getUTCDate()} ${MONTHS_SHORT[value.getUTCMonth()]} ${value.getUTCFullYear()}`;
}

/** "June" */
export function formatMonthName(date: IsoDate): string {
  return MONTHS_LONG[parseIsoDate(date).getUTCMonth()];
}

/** "12 Nov" */
export function formatDayMonth(date: IsoDate): string {
  const value = parseIsoDate(date);
  return `${value.getUTCDate()} ${MONTHS_SHORT[value.getUTCMonth()]}`;
}

/** "Thu 12 Nov" (no comma) — used in compact strips. */
export function formatCompactDay(date: IsoDate): string {
  const value = parseIsoDate(date);
  return `${WEEKDAYS_SHORT[value.getUTCDay()]} ${value.getUTCDate()} ${MONTHS_SHORT[value.getUTCMonth()]}`;
}

/** "Thu 12 – Thu 19 Nov" style range used in summaries. */
export function formatDateRange(start: IsoDate, end: IsoDate | null): string {
  if (!end) return formatDayLabel(start);
  return `${formatDayLabel(start)} – ${formatDayLabel(end)}`;
}

/** "12–19 Nov", or "28 Nov – 3 Dec" across months. */
export function formatDayRange(start: IsoDate, end: IsoDate): string {
  const from = parseIsoDate(start);
  const to = parseIsoDate(end);
  if (from.getUTCMonth() === to.getUTCMonth() && from.getUTCFullYear() === to.getUTCFullYear()) {
    return `${from.getUTCDate()}–${formatDayMonth(end)}`;
  }
  return `${formatDayMonth(start)} – ${formatDayMonth(end)}`;
}

export function monthLabel(year: number, monthIndex: number): string {
  return `${MONTHS_LONG[monthIndex]} ${year}`;
}

export interface CalendarMonth {
  year: number;
  monthIndex: number;
  /** Leading empty cells before day 1 so the grid starts on Sunday. */
  leadingBlanks: number;
  days: IsoDate[];
}

export function buildCalendarMonth(year: number, monthIndex: number): CalendarMonth {
  const first = new Date(Date.UTC(year, monthIndex, 1));
  const dayCount = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  return {
    year,
    monthIndex,
    leadingBlanks: first.getUTCDay(),
    days: Array.from({ length: dayCount }, (_, index) => makeIsoDate(year, monthIndex, index + 1)),
  };
}

/** Shifts a {year, monthIndex} pair by `offset` months. */
export function shiftMonth(year: number, monthIndex: number, offset: number) {
  const total = year * 12 + monthIndex + offset;
  return { year: Math.floor(total / 12), monthIndex: ((total % 12) + 12) % 12 };
}

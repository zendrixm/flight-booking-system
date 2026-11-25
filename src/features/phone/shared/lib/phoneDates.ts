import { daysBetween, formatDayLabel, type IsoDate } from '@/lib/date';

/** "Today", "Tomorrow", or "Sat, 10 Oct". */
export function relativeDayLabel(date: IsoDate, today: IsoDate): string {
  const days = daysBetween(today, date);
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return formatDayLabel(date);
}

import { findAirport } from '@/data/airports';
import { addDays, formatDayMonth, MONTHS_SHORT, parseIsoDate, type IsoDate } from '@/lib/date';
import { formatPeso } from '@/lib/format';
import { PRICE_HISTORY_INTERVAL_DAYS, type PriceAlert } from '@/types/priceAlert';

export type AlertStatus = 'paused' | 'belowTarget' | 'watching';

export function cityOf(code: string): string {
  return findAirport(code)?.city ?? code;
}

export function latestFare(alert: PriceAlert): number | null {
  return alert.priceHistory.length > 1 ? alert.priceHistory[alert.priceHistory.length - 1] : null;
}

export function alertStatus(alert: PriceAlert): AlertStatus {
  if (alert.isPaused) return 'paused';
  const fare = latestFare(alert);
  return fare !== null && alert.targetPrice !== null && fare <= alert.targetPrice
    ? 'belowTarget'
    : 'watching';
}

export const ALERT_STATUS_LABEL: Record<AlertStatus, string> = {
  paused: 'Paused',
  belowTarget: 'Below your target',
  watching: 'Watching',
};

/** Change over the last week: the latest fare against the one two checks (6 days) earlier. */
export function weeklyChange(history: readonly number[]): number {
  if (history.length < 2) return 0;
  return history[history.length - 1] - history[Math.max(0, history.length - 3)];
}

export function weeklyChangeLabel(alert: PriceAlert): string {
  if (latestFare(alert) === null) return 'First check within 6 hours';
  const change = weeklyChange(alert.priceHistory);
  if (change < 0) return `↓ ${formatPeso(-change)} this week`;
  if (change > 0) return `↑ ${formatPeso(change)} this week`;
  return 'No change this week';
}

export function targetLabel(alert: PriceAlert): string {
  const fare = latestFare(alert);
  if (alert.targetPrice === null) return 'No target set';
  if (fare === null) return `Target ${formatPeso(alert.targetPrice)}`;
  return fare <= alert.targetPrice
    ? `Target ${formatPeso(alert.targetPrice)} · ${formatPeso(alert.targetPrice - fare)} under`
    : `Target ${formatPeso(alert.targetPrice)} · ${formatPeso(fare - alert.targetPrice)} to go`;
}

/** Date of the point at `index` in the history ("9 Oct"). */
export function historyPointDate(alert: PriceAlert, index: number): IsoDate {
  const pointsFromEnd = alert.priceHistory.length - 1 - index;
  return addDays(alert.lastCheckedOn, -pointsFromEnd * PRICE_HISTORY_INTERVAL_DAYS);
}

export function historyPointLabel(alert: PriceAlert, index: number): string {
  return formatDayMonth(historyPointDate(alert, index));
}

/** "2 active · 1 paused · 1 below your target · fares checked every 6 hours". */
export function alertsSummary(alerts: readonly PriceAlert[]): string {
  if (alerts.length === 0) return 'We check fares every 6 hours and tell you when they move.';
  const paused = alerts.filter((alert) => alert.isPaused).length;
  const belowTarget = alerts.filter((alert) => alertStatus(alert) === 'belowTarget').length;
  return [
    `${alerts.length - paused} active`,
    paused ? `${paused} paused` : null,
    belowTarget ? `${belowTarget} below your target` : null,
    'fares checked every 6 hours',
  ]
    .filter(Boolean)
    .join(' · ');
}

// ---------- Chart geometry ----------

/** The chart draws in a 100 × 72 box; the line keeps 6 units clear at the top and bottom. */
export const CHART_HEIGHT = 72;
const PLOT_TOP = 6;
const PLOT_HEIGHT = 60;
const PADDING_RATIO = 0.12;

export interface ChartGeometry {
  path: string;
  /** Horizontal position of a point, 0–100. */
  x: (index: number) => number;
  /** Vertical position of a value, 0–CHART_HEIGHT. */
  y: (value: number) => number;
}

export function chartGeometry(history: readonly number[], target: number | null): ChartGeometry {
  const values = target === null ? history : [...history, target];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const low = min - span * PADDING_RATIO;
  const high = max + span * PADDING_RATIO;
  const x = (index: number) => (index / (history.length - 1)) * 100;
  const y = (value: number) => PLOT_TOP + (1 - (value - low) / (high - low)) * PLOT_HEIGHT;
  const path = history
    .map((value, index) => `${index ? 'L' : 'M'}${x(index).toFixed(2)} ${y(value).toFixed(2)}`)
    .join(' ');
  return { path, x, y };
}

// ---------- Create form ----------

export const ALERT_ORIGINS = ['MNL', 'CEB', 'CRK'] as const;
export const ALERT_DESTINATIONS = ['ICN', 'TPE', 'SIN', 'HND', 'KIX', 'HKG', 'BKK', 'CEB', 'MNL'] as const;
export const ALERT_TRAVELER_OPTIONS = [
  '1 adult',
  '2 adults',
  '2 adults, 1 child',
  '2 adults, 2 children',
] as const;
export const ALERT_CABINS = ['Economy', 'Premium economy', 'Business'] as const;

/** The next five months, as "2026-11". */
export function upcomingMonths(today: IsoDate, count = 5): string[] {
  const date = parseIsoDate(today);
  return Array.from({ length: count }, (_, offset) => {
    const value = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1 + offset, 1));
    return `${value.getUTCFullYear()}-${String(value.getUTCMonth() + 1).padStart(2, '0')}`;
  });
}

/** "Nov 2026" for the month chips; `long` gives "November" (or "January 2027" outside this year). */
export function monthLabel(month: string, today: IsoDate, style: 'short' | 'long'): string {
  const [year, monthNumber] = month.split('-').map(Number);
  if (style === 'short') return `${MONTHS_SHORT[monthNumber - 1]} ${year}`;
  const name = new Date(Date.UTC(year, monthNumber - 1, 1)).toLocaleString('en-US', {
    month: 'long',
    timeZone: 'UTC',
  });
  return year === parseIsoDate(today).getUTCFullYear() ? name : `${name} ${year}`;
}

export interface CreateAlertForm {
  from: string;
  to: string;
  dateMode: 'flexible' | 'exact';
  month: string;
  departDate: IsoDate;
  returnDate: IsoDate;
  travelers: string;
  cabin: string;
  /** As typed, e.g. "9,500". */
  targetInput: string;
}

export type CreateAlertErrors = Partial<Record<'to' | 'returnDate' | 'targetInput', string>>;

/** Digits only once commas, spaces and the peso sign are removed; empty means "no target". */
export function parseTargetInput(value: string): number | null | 'invalid' {
  const raw = value.replace(/[,\s₱]/g, '');
  if (!raw) return null;
  return /^\d+$/.test(raw) ? Number(raw) : 'invalid';
}

export function createAlertErrors(
  form: CreateAlertForm,
  watchedRoutes: ReadonlySet<string>,
): CreateAlertErrors {
  const errors: CreateAlertErrors = {};
  if (form.to && form.to === form.from) errors.to = 'Choose a destination different from your origin.';
  else if (form.to && watchedRoutes.has(`${form.from}-${form.to}`)) {
    errors.to = `You’re already watching ${cityOf(form.from)} → ${cityOf(form.to)}.`;
  }
  if (form.dateMode === 'exact' && form.returnDate < form.departDate) {
    errors.returnDate = 'Return must be on or after your departure.';
  }
  if (parseTargetInput(form.targetInput) === 'invalid') {
    errors.targetInput = 'Enter an amount in pesos, like 9,500, or leave it empty.';
  }
  return errors;
}

/** "18 – 27 Dec 2026", "28 Dec – 3 Jan 2027" or "Flexible · December". */
export function alertDatesLabel(form: CreateAlertForm, today: IsoDate): string {
  if (form.dateMode === 'flexible') return `Flexible · ${monthLabel(form.month, today, 'long')}`;
  const depart = parseIsoDate(form.departDate);
  const back = parseIsoDate(form.returnDate);
  const backLabel = `${back.getUTCDate()} ${MONTHS_SHORT[back.getUTCMonth()]} ${back.getUTCFullYear()}`;
  const isSameMonth =
    depart.getUTCFullYear() === back.getUTCFullYear() && depart.getUTCMonth() === back.getUTCMonth();
  return isSameMonth
    ? `${depart.getUTCDate()} – ${backLabel}`
    : `${depart.getUTCDate()} ${MONTHS_SHORT[depart.getUTCMonth()]} – ${backLabel}`;
}

import { DEMO_TODAY } from '@/config/demo';
import { ALERT_NOTIFICATION_SETTINGS, PRICE_ALERTS, WATCH_SUGGESTIONS } from '@/mocks/priceAlerts';
import type {
  AlertNotificationSettings,
  NewPriceAlert,
  PriceAlert,
  WatchSuggestion,
} from '@/types/priceAlert';

import { ApiError, mockRequest } from './mockApi';

/** In-memory store standing in for the alerts API. Resets on reload. */
let alerts: PriceAlert[] = structuredClone([...PRICE_ALERTS]);
let notificationSettings: AlertNotificationSettings = { ...ALERT_NOTIFICATION_SETTINGS };
let nextId = 1;

function requireAlert(id: string): PriceAlert {
  const alert = alerts.find((candidate) => candidate.id === id);
  if (!alert) throw new ApiError('not_found', 'That price alert no longer exists.');
  return alert;
}

function replaceAlert(id: string, patch: Partial<PriceAlert>): PriceAlert {
  const updated = { ...requireAlert(id), ...patch };
  alerts = alerts.map((alert) => (alert.id === id ? updated : alert));
  return updated;
}

export function listPriceAlerts(): Promise<PriceAlert[]> {
  return mockRequest(() => alerts);
}

/** The alert watching exactly this route and these dates, if any. */
export function findPriceAlertForTrip(
  from: string,
  to: string,
  departDate: string,
  returnDate: string | null,
): Promise<PriceAlert | null> {
  return mockRequest(
    () =>
      alerts.find(
        (alert) =>
          alert.from === from &&
          alert.to === to &&
          alert.departDate === departDate &&
          alert.returnDate === returnDate,
      ) ?? null,
  );
}

export function createPriceAlert(input: NewPriceAlert): Promise<PriceAlert> {
  return mockRequest(() => {
    const duplicate = alerts.find(
      (alert) => alert.from === input.from && alert.to === input.to && alert.datesLabel === input.datesLabel,
    );
    if (duplicate) throw new ApiError('duplicate', 'You already watch this route for these dates.');

    const alert: PriceAlert = {
      ...input,
      id: `alert_new_${nextId++}`,
      priceHistory: [],
      lastCheckedOn: DEMO_TODAY,
      isPaused: false,
      statusNote: 'Created just now',
    };
    alerts = [alert, ...alerts];
    return alert;
  });
}

/** `null` removes the target: the alert then reports any drop. */
export function updatePriceAlertTarget(id: string, targetPrice: number | null): Promise<PriceAlert> {
  return mockRequest(() => replaceAlert(id, { mode: targetPrice === null ? 'drop' : 'below', targetPrice }));
}

export function setPriceAlertPaused(id: string, isPaused: boolean): Promise<PriceAlert> {
  return mockRequest(() =>
    replaceAlert(id, {
      isPaused,
      statusNote: isPaused
        ? 'Paused today · we won’t check this route'
        : 'Resumed · next check within 6 hours',
    }),
  );
}

export function deletePriceAlert(id: string): Promise<void> {
  return mockRequest(() => {
    requireAlert(id);
    alerts = alerts.filter((alert) => alert.id !== id);
  });
}

/** Routes from past trips that aren't watched yet. */
export function listWatchSuggestions(): Promise<WatchSuggestion[]> {
  return mockRequest(() =>
    WATCH_SUGGESTIONS.filter(
      (suggestion) => !alerts.some((alert) => alert.from === suggestion.from && alert.to === suggestion.to),
    ),
  );
}

export function getAlertNotificationSettings(): Promise<AlertNotificationSettings> {
  return mockRequest(() => notificationSettings);
}

export function updateAlertNotificationSettings(
  patch: Partial<AlertNotificationSettings>,
): Promise<AlertNotificationSettings> {
  return mockRequest(() => {
    notificationSettings = { ...notificationSettings, ...patch };
    return notificationSettings;
  });
}

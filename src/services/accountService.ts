import { listPriceAlerts } from './priceAlertsService';
import { listTrips } from './tripsService';

export interface AccountSummary {
  upcomingTripCount: number;
  /** Active alerts whose fare is at or below the customer's target. */
  priceDropCount: number;
}

/** Counts shown as badges in the account navigation. */
export async function getAccountSummary(): Promise<AccountSummary> {
  const [trips, alerts] = await Promise.all([listTrips(), listPriceAlerts()]);
  return {
    upcomingTripCount: trips.filter((trip) => trip.status === 'upcoming').length,
    priceDropCount: alerts.filter((alert) => {
      const latest = alert.priceHistory.at(-1);
      return (
        !alert.isPaused && alert.targetPrice !== null && latest !== undefined && latest <= alert.targetPrice
      );
    }).length,
  };
}

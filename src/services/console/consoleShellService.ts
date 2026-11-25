import { CONSOLE_NOTIFICATIONS } from '@/mocks/console/notifications';
import { CONSOLE_SEARCH_INDEX } from '@/mocks/console/searchIndex';
import { NAV_COUNTS } from '@/mocks/console/staff';
import type { ConsoleNotification } from '@/types/console/notification';
import type { ConsoleSearchGroup, ConsoleSearchKind, ConsoleSearchResult } from '@/types/console/search';
import type { ConsoleNavCounts } from '@/types/console/staff';

import { mockRequest } from '../mockApi';

let notifications: ConsoleNotification[] = CONSOLE_NOTIFICATIONS.map((notification) => ({ ...notification }));

export function getNavCounts(): Promise<ConsoleNavCounts> {
  return mockRequest(() => ({ ...NAV_COUNTS }));
}

export function listConsoleNotifications(): Promise<ConsoleNotification[]> {
  return mockRequest(() => notifications);
}

export function markAllNotificationsRead(): Promise<ConsoleNotification[]> {
  return mockRequest(() => {
    notifications = notifications.map((notification) => ({ ...notification, isRead: true }));
    return notifications;
  }, 200);
}

const SEARCH_GROUPS: ReadonlyArray<{ kind: ConsoleSearchKind; label: string }> = [
  { kind: 'booking', label: 'Bookings' },
  { kind: 'customer', label: 'Customers' },
  { kind: 'flight', label: 'Flights' },
];

/** The best few matches per group are returned; `total` says how many there were. */
export const SEARCH_RESULTS_PER_GROUP = 4;

/** Lowercase with spaces and separators removed, so "PQ 117", "pq117" and "PQ-117" all match. */
export function normalizeSearchText(text: string): string {
  return text.toLowerCase().replace(/[\s·⇄→\-–@.,₱]/g, '');
}

function scoreResult(result: ConsoleSearchResult, query: string): number {
  const titleScore = normalizeSearchText(result.title).includes(query) ? 2 : 0;
  const anyScore = normalizeSearchText(`${result.title} ${result.meta} ${result.keywords}`).includes(query)
    ? 1
    : 0;
  return titleScore + anyScore;
}

/** Searches bookings, customers and flights at once. Groups with the strongest match come first. */
export function searchConsole(query: string): Promise<ConsoleSearchGroup[]> {
  return mockRequest(() => {
    const normalized = normalizeSearchText(query);
    if (!normalized) return [];
    return SEARCH_GROUPS.map((group, order) => {
      const matches = CONSOLE_SEARCH_INDEX.map((result, index) => ({
        result,
        index,
        score: scoreResult(result, normalized),
      }))
        .filter((match) => match.result.kind === group.kind && match.score > 0)
        .sort((a, b) => b.score - a.score || a.index - b.index);
      return { group, order, best: matches[0]?.score ?? 0, matches };
    })
      .filter(({ matches }) => matches.length > 0)
      .sort((a, b) => b.best - a.best || a.order - b.order)
      .map(({ group, matches }) => ({
        kind: group.kind,
        label: group.label,
        total: matches.length,
        results: matches.slice(0, SEARCH_RESULTS_PER_GROUP).map((match) => match.result),
      }));
  }, 120);
}

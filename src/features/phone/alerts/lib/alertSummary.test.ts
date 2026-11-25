import { describe, expect, it } from 'vitest';

import { PRICE_ALERTS } from '@/mocks/priceAlerts';
import type { PriceAlert } from '@/types/priceAlert';

import {
  alertRouteLabel,
  alertSearchQuery,
  alertStatusOf,
  alertsSummary,
  alertTargetLine,
  currentFareOf,
} from './alertSummary';

const [seoul, taipei, singapore] = PRICE_ALERTS;
const fresh: PriceAlert = { ...seoul, id: 'new', to: 'KIX', priceHistory: [], targetPrice: 12000 };

describe('alert summaries', () => {
  it('reads the latest fare', () => {
    expect(currentFareOf(seoul)).toBe(11240);
    expect(currentFareOf(fresh)).toBeNull();
  });

  it('works out each alert’s status', () => {
    expect(alertStatusOf(seoul)).toBe('belowTarget');
    expect(alertStatusOf(taipei)).toBe('watching');
    expect(alertStatusOf(singapore)).toBe('paused');
    expect(alertStatusOf(fresh)).toBe('new');
  });

  it('compares the fare with the target', () => {
    expect(alertTargetLine(seoul)).toBe('₱260 under your ₱11,500 target');
    expect(alertTargetLine(taipei)).toBe('₱980 above your ₱6,500 target');
    expect(alertTargetLine(singapore)).toBe('Last seen 3 Oct · target ₱9,000');
    expect(alertTargetLine(fresh)).toBe('Target ₱12,000 · first fare check within 6 hours');
    expect(alertTargetLine({ ...taipei, targetPrice: null })).toBe(
      'No target · we’ll tell you about big drops',
    );
  });

  it('summarises the list', () => {
    expect(alertsSummary(PRICE_ALERTS)).toBe(
      '2 active · 1 paused · 1 below your target · checked every 6 hours',
    );
    expect(alertRouteLabel(seoul)).toBe('Manila → Seoul');
  });

  it('links to the watched dates when the alert has them', () => {
    expect(new URLSearchParams(alertSearchQuery(taipei)).get('depart')).toBe('2027-01-15');
    expect(new URLSearchParams(alertSearchQuery(seoul)).get('to')).toBe('ICN');
  });
});

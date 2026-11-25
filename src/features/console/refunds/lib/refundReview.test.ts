import { describe, expect, it } from 'vitest';

import type { RefundRequest } from '@/types/console/refund';

import {
  amountError,
  approveButtonLabel,
  decisionChip,
  decisionSummary,
  nextPendingRequest,
  parseAmount,
  sanitizeAmountInput,
  tabFromParam,
  waitLabel,
} from './refundReview';

function request(overrides: Partial<RefundRequest> = {}): RefundRequest {
  return {
    bookingReference: 'VL1FJS',
    customerName: 'Paolo Reyes',
    requestedAmount: 14960,
    age: '50h',
    isOverdue: true,
    status: 'pending',
    decision: null,
    ...overrides,
  } as RefundRequest;
}

describe('refund review', () => {
  it('reads tabs from the URL', () => {
    expect(tabFromParam('approved')).toBe('approved');
    expect(tabFromParam('archived')).toBeNull();
  });

  it('reads and cleans typed amounts', () => {
    expect(parseAmount('₱14,960')).toBe(14960);
    expect(parseAmount('')).toBe(0);
    expect(sanitizeAmountInput('14,9x60')).toBe('14,960');
  });

  it('keeps refunds between ₱1 and the requested amount', () => {
    expect(amountError(request(), 0)).toMatch('Enter an amount above ₱0');
    expect(amountError(request(), 15000)).toBe('A refund can’t be more than the ₱14,960 requested.');
    expect(amountError(request(), 12000)).toBeNull();
  });

  it('sends refunds over the limit to Finance', () => {
    expect(approveButtonLabel(0, 50000)).toBe('Approve');
    expect(approveButtonLabel(14960, 50000)).toBe('Approve ₱14,960');
    expect(approveButtonLabel(62000, 50000)).toBe('Send to Finance · ₱62,000');
  });

  it('describes decisions', () => {
    expect(decisionChip(request())).toEqual({ label: 'Pending', tone: 'muted' });
    const withFinance = request({
      decision: {
        status: 'approved',
        amount: 62000,
        isWithFinance: true,
        canUndo: true,
        decidedBy: 'Lea Navarro',
        decidedAt: 'Today 00:58',
      },
    } as Partial<RefundRequest>);
    expect(decisionChip(withFinance)).toEqual({ label: 'With Finance', tone: 'warning' });
    expect(decisionSummary(withFinance)).toBe('Sent to Finance for second approval · customer notified');
    expect(waitLabel(withFinance)).toBe('Today 00:58');
    expect(waitLabel(request())).toBe('50h · overdue');
  });

  it('finds the next request still waiting', () => {
    const first = request();
    const decided = request({ bookingReference: 'VL2AAA', status: 'approved' } as Partial<RefundRequest>);
    const next = request({ bookingReference: 'VL3BBB' });
    expect(nextPendingRequest([first, decided, next], first)?.bookingReference).toBe('VL3BBB');
    expect(nextPendingRequest([first], first)).toBeUndefined();
  });
});

import { describe, expect, it } from 'vitest';

import { BREAK_GLASS_ADMIN, SAVED_SETTINGS, YOUR_IP_ADDRESS } from '@/mocks/console/settings';

import {
  changeCounts,
  draftErrors,
  fromDraft,
  locksYouOut,
  parsePesos,
  sectionsWithErrors,
  securityRisks,
  tabFromParam,
  toDraft,
  type SettingsDraft,
} from './settingsForm';

const saved = toDraft(SAVED_SETTINGS);
const context = { yourIpAddress: YOUR_IP_ADDRESS, breakGlassAdmin: BREAK_GLASS_ADMIN };

function edit(change: (draft: SettingsDraft) => void): SettingsDraft {
  const draft = structuredClone(saved);
  change(draft);
  return draft;
}

describe('settings draft', () => {
  it('round-trips the saved settings through the form', () => {
    expect(saved.payments.minimumPayout).toBe('10,000');
    expect(fromDraft(saved)).toEqual(SAVED_SETTINGS);
  });

  it('reads whole peso amounts as typed', () => {
    expect(parsePesos('₱10,000')).toBe(10000);
    expect(Number.isNaN(parsePesos('10.5'))).toBe(true);
  });

  it('falls back to the General tab', () => {
    expect(tabFromParam('security')).toBe('security');
    expect(tabFromParam('billing')).toBe('general');
  });
});

describe('draftErrors', () => {
  it('starts valid', () => {
    expect(draftErrors(saved)).toEqual({});
  });

  it('flags bad contact details and payout amounts, by section', () => {
    const draft = edit((next) => {
      next.general.supportEmail = 'support@vela';
      next.payments.minimumPayout = '500';
      next.payments.methods = { card: false, wallet: false, bank: false, cash: false };
    });
    const errors = draftErrors(draft);
    expect(Object.keys(errors).sort()).toEqual(['minimumPayout', 'paymentMethods', 'supportEmail']);
    expect(sectionsWithErrors(errors)).toEqual(['general', 'payments']);
  });

  it('only checks the auto-approve limit while auto-approval is on', () => {
    const off = edit((next) => {
      next.payments.autoApproveRefunds = false;
      next.payments.autoApproveLimit = '90,000';
    });
    expect(draftErrors(off).autoApproveLimit).toBeUndefined();
    const on = edit((next) => {
      next.payments.autoApproveLimit = '90,000';
    });
    expect(draftErrors(on).autoApproveLimit).toMatch('up to ₱50,000');
  });
});

describe('changeCounts', () => {
  it('counts one change per edited field, switch and network', () => {
    const draft = edit((next) => {
      next.general.supportEmail = 'care@vela.travel';
      next.payments.methods.cash = true;
      next.security.ipAllowlist = next.security.ipAllowlist.slice(1);
    });
    expect(changeCounts(saved, draft)).toEqual({ general: 1, payments: 1, notifications: 0, security: 1 });
  });
});

describe('security risks', () => {
  it('knows when saving would sign you out', () => {
    expect(locksYouOut(saved.security, YOUR_IP_ADDRESS)).toBe(false);
    const draft = edit((next) => {
      next.security.ipAllowlist = next.security.ipAllowlist.filter(
        (network) => network.cidr !== '203.0.113.0/24',
      );
    });
    expect(locksYouOut(draft.security, YOUR_IP_ADDRESS)).toBe(true);
  });

  it('lists every weakening change', () => {
    const draft = edit((next) => {
      next.security.requireTwoStep = false;
      next.security.requireSso = true;
      next.security.sessionTimeoutMinutes = '480';
    });
    const risks = securityRisks(saved.security, draft.security, context);
    expect(risks).toHaveLength(3);
    expect(risks[1]).toContain(BREAK_GLASS_ADMIN);
    expect(risks[2]).toBe('Idle sessions stay signed in for 8 hours');
  });

  it('has nothing to say about a stricter policy', () => {
    const draft = edit((next) => {
      next.security.sessionTimeoutMinutes = '15';
    });
    expect(securityRisks(saved.security, draft.security, context)).toEqual([]);
  });
});

import { describe, expect, it } from 'vitest';

import {
  attemptsLeftLabel,
  formatRecoveryKey,
  maskRecoveryKey,
  recoveryKeyError,
  recoveryKeyHint,
  resetEmailError,
  workEmailError,
} from './staffLoginForms';

describe('staff sign-in forms', () => {
  it('only accepts @vela.travel work emails', () => {
    expect(workEmailError('')).toBe('Enter your work email.');
    expect(workEmailError('lea@gmail.com')).toMatch('Use your @vela.travel work email');
    expect(workEmailError('lea.navarro@vela.travel')).toBeUndefined();
    expect(resetEmailError('lea.navarro@vela')).toBe('This email looks incomplete — check it and try again.');
  });

  it('formats recovery keys in groups of four as you type', () => {
    expect(formatRecoveryKey('k7qd2mxp9fta')).toBe('K7QD-2MXP-9FTA');
    expect(formatRecoveryKey('k7qd 2m')).toBe('K7QD-2M');
    expect(formatRecoveryKey('k7qd2mxp9fta-extra')).toBe('K7QD-2MXP-9FTA');
  });

  it('explains short keys and confirms complete ones', () => {
    expect(recoveryKeyError('')).toBe('Enter your recovery key to continue.');
    expect(recoveryKeyError('K7QD-2MXP')).toMatch('this one has 8');
    expect(recoveryKeyError('K7QD-2MXP-9FTA')).toBeUndefined();
    expect(recoveryKeyHint('K7QD-2MXP-9FTA')).toBe('Looks complete — 12 of 12 characters');
    expect(maskRecoveryKey('K7QD-2MXP-9FTA')).toBe('••••-••••-9FTA');
    expect(attemptsLeftLabel(1)).toBe('1 attempt left');
  });
});

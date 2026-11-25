import { isValidEmail } from '@/lib/validation';
import { isStaffEmail, RECOVERY_KEY_LENGTH } from '@/services/console/staffAuthService';

export function workEmailError(email: string): string | undefined {
  if (!email.trim()) return 'Enter your work email.';
  if (!isStaffEmail(email)) return 'Use your @vela.travel work email, or continue with company SSO.';
  return undefined;
}

export function resetEmailError(email: string): string | undefined {
  if (!email.trim()) return 'Enter your work email.';
  if (!isValidEmail(email)) return 'This email looks incomplete — check it and try again.';
  if (!isStaffEmail(email)) {
    return 'Use your @vela.travel work email. Partner accounts reset their password through their own company.';
  }
  return undefined;
}

/** "k7qd2mxp9fta" → "K7QD-2MXP-9FTA": letters and digits only, grouped in fours as you type. */
export function formatRecoveryKey(value: string): string {
  const raw = value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, RECOVERY_KEY_LENGTH);
  return raw.replace(/(.{4})(?=.)/g, '$1-');
}

export function recoveryKeyLength(key: string): number {
  return key.replace(/-/g, '').length;
}

export function recoveryKeyError(key: string): string | undefined {
  const length = recoveryKeyLength(key);
  if (length === 0) return 'Enter your recovery key to continue.';
  if (length < RECOVERY_KEY_LENGTH) {
    return `Recovery keys have ${RECOVERY_KEY_LENGTH} letters and numbers — this one has ${length}. Check for a missing group.`;
  }
  return undefined;
}

export function recoveryKeyHint(key: string): string {
  const length = recoveryKeyLength(key);
  return length === RECOVERY_KEY_LENGTH
    ? `Looks complete — ${RECOVERY_KEY_LENGTH} of ${RECOVERY_KEY_LENGTH} characters`
    : `Letters and numbers, dashes are added for you · ${length} of ${RECOVERY_KEY_LENGTH}`;
}

/** "••••-••••-9FTA" */
export function maskRecoveryKey(key: string): string {
  return `••••-••••-${key.slice(-4)}`;
}

export function attemptsLeftLabel(attemptsLeft: number): string {
  return `${attemptsLeft} ${attemptsLeft === 1 ? 'attempt' : 'attempts'} left`;
}

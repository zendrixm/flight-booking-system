import { mockRequest } from '../mockApi';

/**
 * Staff sign-in for Vela Console. Demo rules: any password of 8+ characters is accepted for an
 * @vela.travel email, then any 6-digit authenticator code except 123456, 482107 or a repeated digit.
 * Five wrong passwords, or three wrong codes, lock the account for 15 minutes.
 */

export const STAFF_EMAIL_DOMAIN = 'vela.travel';
const MAX_PASSWORD_ATTEMPTS = 5;
const MAX_CODE_ATTEMPTS = 3;
const MIN_ACCEPTED_PASSWORD_LENGTH = 8;
const REJECTED_CODES = new Set(['123456', '482107']);

export const RECOVERY_KEY_LENGTH = 12;

export function isStaffEmail(email: string): boolean {
  return new RegExp(`^[^@\\s]+@${STAFF_EMAIL_DOMAIN.replace('.', '\\.')}$`, 'i').test(email.trim());
}

export type StaffPasswordResult =
  { status: 'needsCode' } | { status: 'wrongPassword'; attemptsLeft: number } | { status: 'locked' };

export type StaffCodeResult =
  { status: 'signedIn' } | { status: 'wrongCode'; attemptsLeft: number } | { status: 'locked' };

export type RecoveryKeyResult = { status: 'signedIn'; unusedKeysLeft: number } | { status: 'unknownKey' };

let passwordAttemptsLeft = MAX_PASSWORD_ATTEMPTS;
let codeAttemptsLeft = MAX_CODE_ATTEMPTS;

export function signInStaff(_email: string, password: string): Promise<StaffPasswordResult> {
  return mockRequest((): StaffPasswordResult => {
    if (passwordAttemptsLeft <= 0) return { status: 'locked' };
    if (password.length >= MIN_ACCEPTED_PASSWORD_LENGTH) {
      passwordAttemptsLeft = MAX_PASSWORD_ATTEMPTS;
      codeAttemptsLeft = MAX_CODE_ATTEMPTS;
      return { status: 'needsCode' };
    }
    passwordAttemptsLeft -= 1;
    return passwordAttemptsLeft <= 0
      ? { status: 'locked' }
      : { status: 'wrongPassword', attemptsLeft: passwordAttemptsLeft };
  }, 500);
}

export function verifyStaffCode(code: string): Promise<StaffCodeResult> {
  return mockRequest((): StaffCodeResult => {
    const isRejected = REJECTED_CODES.has(code) || /^(\d)\1{5}$/.test(code);
    if (!isRejected) return { status: 'signedIn' };
    codeAttemptsLeft -= 1;
    return codeAttemptsLeft <= 0
      ? { status: 'locked' }
      : { status: 'wrongCode', attemptsLeft: codeAttemptsLeft };
  }, 500);
}

export function verifyRecoveryKey(key: string): Promise<RecoveryKeyResult> {
  return mockRequest((): RecoveryKeyResult => {
    const raw = key.replace(/-/g, '');
    return /^(.)\1+$/.test(raw) ? { status: 'unknownKey' } : { status: 'signedIn', unusedKeysLeft: 7 };
  }, 500);
}

/** Always "succeeds" so the page never reveals whether an account exists. */
export function sendStaffPasswordReset(_email: string): Promise<{ expiresAt: string }> {
  return mockRequest(() => ({ expiresAt: '01:29 PHT' }), 500);
}

/** Sign-in through the company identity provider; the demo returns straight to the console. */
export function startStaffSso(): Promise<void> {
  return mockRequest(() => undefined, 2400);
}

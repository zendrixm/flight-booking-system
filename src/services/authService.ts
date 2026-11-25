import { DEMO_CUSTOMER } from '@/mocks/customer';

import { ApiError, mockRequest } from './mockApi';

/**
 * Sign-in, password reset and sign-up. Demo rules stand in for the real identity service:
 * - any password of 8+ characters signs in; shorter ones count as wrong
 * - five wrong passwords pause password sign-in for 15 minutes
 * - any 6-digit code works except 000000
 * - the demo customer's email is already registered
 */

export const MAX_PASSWORD_ATTEMPTS = 5;
const LOCK_SECONDS = 15 * 60;
const MIN_ACCEPTED_PASSWORD_LENGTH = 8;
const WRONG_TEST_CODE = '000000';

export type PasswordSignInResult =
  | { status: 'signedIn' }
  | { status: 'wrongPassword'; attemptsLeft: number }
  | { status: 'locked'; unlocksAt: number };

let wrongAttempts = 0;
let lockedUntil = 0;

export function isRegisteredEmail(email: string): boolean {
  return email.trim().toLowerCase() === DEMO_CUSTOMER.email;
}

export function signInWithPassword(email: string, password: string): Promise<PasswordSignInResult> {
  return mockRequest((): PasswordSignInResult => {
    if (!email.includes('@')) throw new ApiError('invalid_email', 'Enter your full email address.');
    if (Date.now() < lockedUntil) return { status: 'locked', unlocksAt: lockedUntil };
    if (password.length >= MIN_ACCEPTED_PASSWORD_LENGTH) {
      wrongAttempts = 0;
      return { status: 'signedIn' };
    }
    wrongAttempts += 1;
    if (wrongAttempts >= MAX_PASSWORD_ATTEMPTS) {
      wrongAttempts = 0;
      lockedUntil = Date.now() + LOCK_SECONDS * 1000;
      return { status: 'locked', unlocksAt: lockedUntil };
    }
    return { status: 'wrongPassword', attemptsLeft: MAX_PASSWORD_ATTEMPTS - wrongAttempts };
  });
}

/** Stands in for the WebAuthn ceremony: the browser asks for the device passkey, then the server signs in. */
export function signInWithPasskey(): Promise<void> {
  return mockRequest(() => undefined);
}

/** Emails a one-time sign-in code. */
export function sendSignInCode(email: string): Promise<void> {
  return mockRequest(() => {
    if (!email.includes('@')) {
      throw new ApiError('invalid_email', 'Enter your email first so we know where to send the code.');
    }
  });
}

function checkCode(code: string): void {
  if (code.length !== 6 || code === WRONG_TEST_CODE) {
    throw new ApiError('wrong_code', 'That code doesn’t match.');
  }
}

export function verifySignInCode(code: string): Promise<void> {
  return mockRequest(() => checkCode(code));
}

export function sendPasswordReset(email: string): Promise<void> {
  return mockRequest(() => {
    if (!email.includes('@')) throw new ApiError('invalid_email', 'Enter the email on your account.');
  });
}

export interface NewAccount {
  firstNames: string;
  lastName: string;
  email: string;
  mobile: string;
  /** Empty when the customer signs up with a passkey instead. */
  password: string;
  country: string;
  wantsDeals: boolean;
}

/** Starts sign-up and emails a verification code. */
export function createAccount(account: NewAccount): Promise<void> {
  return mockRequest(() => {
    if (isRegisteredEmail(account.email)) {
      throw new ApiError('email_taken', 'An account already uses this email.');
    }
  });
}

export function verifyEmailCode(code: string): Promise<void> {
  return mockRequest(() => checkCode(code));
}

export function resendEmailCode(): Promise<void> {
  return mockRequest(() => undefined);
}

import { PAYMENT_PROFILE } from '@/mocks/paymentProfile';
import type { PaymentMethodKind, PaymentProfile } from '@/types/payment';

import { ApiError, mockRequest } from './mockApi';

/** Card payments go through the issuer's 3-D Secure check; wallets and banks hand off to the provider. */
export type AuthorizationResult =
  { status: 'challenge'; maskedPhone: string } | { status: 'redirect' } | { status: 'declined' };

export interface PaymentRequest {
  method: PaymentMethodKind;
  amount: number;
  /** Last four digits of the card being charged. */
  cardLast4?: string;
}

/** How long the bank says it is processing before replying. */
const PROCESSING_MS = 1800;

/** Demo rule, like a test card number: cards ending 0002 are always declined. */
const DECLINED_TEST_LAST4 = '0002';
/** Demo rule: this code is always rejected by the "issuer". */
const WRONG_TEST_CODE = '000000';

let profile: PaymentProfile = structuredClone(PAYMENT_PROFILE);

export function getPaymentProfile(): Promise<PaymentProfile> {
  return mockRequest(() => profile);
}

export function updatePaymentProfile(patch: Partial<PaymentProfile>): Promise<PaymentProfile> {
  return mockRequest(() => {
    profile = { ...profile, ...patch };
    return profile;
  });
}

export function authorizePayment(request: PaymentRequest): Promise<AuthorizationResult> {
  return mockRequest((): AuthorizationResult => {
    if (request.method !== 'card') return { status: 'redirect' };
    if (request.cardLast4 === DECLINED_TEST_LAST4) return { status: 'declined' };
    return { status: 'challenge', maskedPhone: '+63 917 ••• 4567' };
  }, PROCESSING_MS);
}

export function verifyPaymentChallenge(code: string): Promise<void> {
  return mockRequest(() => {
    if (code === WRONG_TEST_CODE) throw new ApiError('challenge_failed', 'That code doesn’t match.');
  });
}

/** Confirms the booking once the money is in, returning its reference. */
export function confirmBooking(): Promise<{ reference: string }> {
  return mockRequest(() => ({ reference: 'VL7Q2K' }), PROCESSING_MS);
}

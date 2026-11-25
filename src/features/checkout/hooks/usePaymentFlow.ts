import { useCallback, useReducer } from 'react';

import { ApiError } from '@/services/mockApi';
import {
  authorizePayment,
  confirmBooking,
  verifyPaymentChallenge,
  type PaymentRequest,
} from '@/services/paymentsService';

const CHALLENGE_ATTEMPTS = 3;

export type PaymentFlowState =
  | { step: 'idle' }
  /** `authorizing`: waiting for the bank or wallet; `confirming`: payment in, issuing tickets. */
  | { step: 'processing'; phase: 'authorizing' | 'confirming' }
  | {
      step: 'challenge';
      maskedPhone: string;
      attemptsLeft: number;
      hasError: boolean;
      isVerifying: boolean;
      wasResent: boolean;
    }
  | { step: 'wallet' }
  | { step: 'bank' }
  | { step: 'declined'; reason: 'card' | 'challenge' }
  | { step: 'approved'; reference: string };

type Action =
  | { type: 'start'; phase: 'authorizing' | 'confirming' }
  | { type: 'challenge'; maskedPhone: string }
  | { type: 'redirect'; method: PaymentRequest['method'] }
  | { type: 'declined'; reason: 'card' | 'challenge' }
  | { type: 'verifying' }
  | { type: 'wrongCode' }
  | { type: 'resent' }
  | { type: 'approved'; reference: string }
  | { type: 'reset' };

function reducer(state: PaymentFlowState, action: Action): PaymentFlowState {
  switch (action.type) {
    case 'start':
      return { step: 'processing', phase: action.phase };
    case 'challenge':
      return {
        step: 'challenge',
        maskedPhone: action.maskedPhone,
        attemptsLeft: CHALLENGE_ATTEMPTS,
        hasError: false,
        isVerifying: false,
        wasResent: false,
      };
    case 'redirect':
      return { step: action.method === 'bank' ? 'bank' : 'wallet' };
    case 'declined':
      return { step: 'declined', reason: action.reason };
    case 'verifying':
      return state.step === 'challenge' ? { ...state, isVerifying: true } : state;
    case 'wrongCode': {
      if (state.step !== 'challenge') return state;
      const attemptsLeft = state.attemptsLeft - 1;
      return attemptsLeft <= 0
        ? { step: 'declined', reason: 'challenge' }
        : { ...state, attemptsLeft, hasError: true, isVerifying: false };
    }
    case 'resent':
      return state.step === 'challenge' ? { ...state, wasResent: true, hasError: false } : state;
    case 'approved':
      return { step: 'approved', reference: action.reference };
    case 'reset':
      return { step: 'idle' };
  }
}

/**
 * The payment state machine: authorise → (bank verification | wallet/bank hand-off) → approved,
 * with decline and cancel paths. Keeps dialogs dumb: they render the current step and call these actions.
 */
export function usePaymentFlow(onApproved: (reference: string) => void) {
  const [state, dispatch] = useReducer(reducer, { step: 'idle' });

  const finish = useCallback(async () => {
    dispatch({ type: 'start', phase: 'confirming' });
    const { reference } = await confirmBooking();
    onApproved(reference);
    dispatch({ type: 'approved', reference });
  }, [onApproved]);

  const start = useCallback(async (request: PaymentRequest) => {
    dispatch({ type: 'start', phase: 'authorizing' });
    const result = await authorizePayment(request);
    if (result.status === 'challenge') dispatch({ type: 'challenge', maskedPhone: result.maskedPhone });
    else if (result.status === 'redirect') dispatch({ type: 'redirect', method: request.method });
    else dispatch({ type: 'declined', reason: 'card' });
  }, []);

  const verify = useCallback(
    async (code: string) => {
      dispatch({ type: 'verifying' });
      try {
        await verifyPaymentChallenge(code);
      } catch (error) {
        if (error instanceof ApiError && error.code === 'challenge_failed') {
          dispatch({ type: 'wrongCode' });
          return;
        }
        throw error;
      }
      await finish();
    },
    [finish],
  );

  return {
    state,
    start,
    verify,
    /** Wallet approved in the provider's app, or the bank transfer was started. */
    confirmExternal: finish,
    resendCode: () => dispatch({ type: 'resent' }),
    cancel: () => dispatch({ type: 'reset' }),
  };
}

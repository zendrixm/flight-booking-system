import { useCallback, useState } from 'react';

import { useNow } from '@/hooks';

/** How long to wait before another code or link can be sent. */
const RESEND_DELAY_SECONDS = 45;

/** A countdown that blocks resending until it reaches zero; `restart` starts it again. */
export function useResendTimer(startRunning = true) {
  const [startedAt, setStartedAt] = useState(() => (startRunning ? Date.now() : 0));
  const elapsedSeconds = Math.floor((useNow(1000, startedAt > 0) - startedAt) / 1000);
  const secondsLeft = startedAt ? Math.max(0, RESEND_DELAY_SECONDS - elapsedSeconds) : 0;

  const restart = useCallback(() => setStartedAt(Date.now()), []);

  return { secondsLeft, canResend: secondsLeft === 0, restart };
}

/** "0:45" */
export function formatCountdown(totalSeconds: number): string {
  return `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, '0')}`;
}

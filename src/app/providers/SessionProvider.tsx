import { useCallback, useMemo, useState, type ReactNode } from 'react';

import { readStoredValue, writeStoredValue } from '@/lib/storage';
import { DEMO_CUSTOMER } from '@/mocks/customer';
import type { Customer } from '@/types/customer';

import { SessionContext, type SessionValue } from './sessionContext';

const SESSION_KEY = 'vela.session.signedIn';

/**
 * Demo session. The app starts signed in as the demo customer so account pages are reachable;
 * signing out (and back in) works for the rest of the browser session.
 */
export function SessionProvider({ children }: { children: ReactNode }) {
  const [isSignedIn, setIsSignedIn] = useState(() => readStoredValue('session', SESSION_KEY, true));
  const [customerChanges, setCustomerChanges] = useState<Partial<Customer>>({});

  const update = useCallback((signedIn: boolean) => {
    setIsSignedIn(signedIn);
    writeStoredValue('session', SESSION_KEY, signedIn);
  }, []);

  const value = useMemo<SessionValue>(
    () => ({
      customer: isSignedIn ? { ...DEMO_CUSTOMER, ...customerChanges } : null,
      isSignedIn,
      signIn: () => update(true),
      signOut: () => update(false),
      updateCustomer: (patch) => setCustomerChanges((previous) => ({ ...previous, ...patch })),
    }),
    [isSignedIn, update, customerChanges],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

import { createContext, useContext } from 'react';

import type { Customer } from '@/types/customer';

export interface SessionValue {
  customer: Customer | null;
  isSignedIn: boolean;
  signIn: () => void;
  signOut: () => void;
  /** Applies profile changes saved on the server to the signed-in customer. */
  updateCustomer: (patch: Partial<Customer>) => void;
}

export const SessionContext = createContext<SessionValue | null>(null);

export function useSession(): SessionValue {
  const session = useContext(SessionContext);
  if (!session) throw new Error('useSession must be used inside <SessionProvider>.');
  return session;
}

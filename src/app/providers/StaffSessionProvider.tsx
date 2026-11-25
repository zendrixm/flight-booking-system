import { useCallback, useMemo, useState, type ReactNode } from 'react';

import { readStoredValue, writeStoredValue } from '@/lib/storage';
import { DEMO_STAFF_MEMBER, DEMO_STAFF_SESSION, WORKSPACES } from '@/mocks/console/staff';
import type { WorkspaceCode } from '@/types/console/staff';

import { StaffSessionContext, type StaffSessionValue } from './staffSessionContext';

const SIGNED_IN_KEY = 'vela.console.signedIn';
const WORKSPACE_KEY = 'vela.console.workspace';

/**
 * Demo staff session, separate from the customer session. The console starts signed in so every
 * page is reachable; signing out sends you to the console sign-in page.
 */
export function StaffSessionProvider({ children }: { children: ReactNode }) {
  const [isSignedIn, setIsSignedIn] = useState(() => readStoredValue('session', SIGNED_IN_KEY, true));
  const [workspaceCode, setWorkspaceCode] = useState<WorkspaceCode>(() =>
    readStoredValue<WorkspaceCode>('session', WORKSPACE_KEY, 'PH'),
  );

  const setSignedIn = useCallback((signedIn: boolean) => {
    setIsSignedIn(signedIn);
    writeStoredValue('session', SIGNED_IN_KEY, signedIn);
  }, []);

  const value = useMemo<StaffSessionValue>(
    () => ({
      staff: isSignedIn ? DEMO_STAFF_MEMBER : null,
      isSignedIn,
      session: DEMO_STAFF_SESSION,
      workspace: WORKSPACES.find((workspace) => workspace.code === workspaceCode) ?? WORKSPACES[0],
      switchWorkspace: (code) => {
        setWorkspaceCode(code);
        writeStoredValue('session', WORKSPACE_KEY, code);
      },
      signIn: () => setSignedIn(true),
      signOut: () => setSignedIn(false),
    }),
    [isSignedIn, workspaceCode, setSignedIn],
  );

  return <StaffSessionContext.Provider value={value}>{children}</StaffSessionContext.Provider>;
}

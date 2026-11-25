import { createContext, useContext } from 'react';

import type { StaffMember, StaffSessionDetails, Workspace, WorkspaceCode } from '@/types/console/staff';

export interface StaffSessionValue {
  staff: StaffMember | null;
  isSignedIn: boolean;
  session: StaffSessionDetails;
  workspace: Workspace;
  switchWorkspace: (code: WorkspaceCode) => void;
  signIn: () => void;
  signOut: () => void;
}

export const StaffSessionContext = createContext<StaffSessionValue | null>(null);

/** The signed-in Vela Console user and their workspace. */
export function useStaffSession(): StaffSessionValue {
  const value = useContext(StaffSessionContext);
  if (!value) throw new Error('useStaffSession must be used inside <StaffSessionProvider>.');
  return value;
}

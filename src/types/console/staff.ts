export type WorkspaceCode = 'PH' | 'SG' | 'JP' | 'ALL';

export interface Workspace {
  code: WorkspaceCode;
  name: string;
  /** "PHP · Asia/Manila" */
  description: string;
}

export interface StaffMember {
  id: string;
  fullName: string;
  email: string;
  jobTitle: string;
  /** Permission level shown next to the job title, e.g. "Admin". */
  accessLevel: string;
}

/** Where and when the current staff session started; shown before signing out. */
export interface StaffSessionDetails {
  signedInAt: string;
  location: string;
  ipAddress: string;
}

/** Sidebar counts: work waiting in each area. */
export interface ConsoleNavCounts {
  bookingsNeedingAction: number;
  flightDisruptions: number;
  refundsToReview: number;
}

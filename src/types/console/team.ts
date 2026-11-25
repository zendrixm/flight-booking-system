import type { PreparedExport } from './export';

export const STAFF_ROLES = [
  'Admin',
  'Operations manager',
  'Support agent',
  'Finance',
  'Read-only analyst',
] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];

/** What each role can do, in one line, shown under role pickers. */
export const ROLE_SUMMARIES: Record<StaffRole, string> = {
  Admin: 'Everything, including users, roles and workspace settings',
  'Operations manager': 'Everything Support can do, plus flight status and pricing',
  'Support agent': 'Bookings, customer contact and refunds up to ₱50,000',
  Finance: 'Refund approvals above ₱50,000 and payouts',
  'Read-only analyst': 'View bookings and reports · no changes',
};

export type TeamMemberStatus = 'active' | 'invited' | 'deactivated';

export interface TeamMember {
  id: string;
  fullName: string;
  email: string;
  initials: string;
  role: StaffRole;
  twoStepEnabled: boolean;
  /** "12 min ago", "Invite sent 7 Oct" */
  lastActive: string;
  status: TeamMemberStatus;
  /** How they got access: "Joined 3 Feb 2025 · invited by Ian Cruz". */
  accessNote: string;
  /** "2 devices · Manila", or "None". */
  sessions: string;
  /** Number of devices signed in now; used when deactivating. */
  activeSessionCount: number;
  isYou: boolean;
  /** Why the signed-in staff member can't change this person's role or access, if they can't. */
  lockedReason?: string;
}

export type PermissionRoleId = 'admin' | 'ops' | 'support' | 'finance' | 'readonly';

export interface PermissionRole {
  id: PermissionRoleId;
  /** Column heading, e.g. "Operations". */
  name: string;
  role: StaffRole;
  /** System roles can't be edited. */
  isFixed: boolean;
}

export interface Capability {
  id: string;
  label: string;
  description: string;
}

/** Which capabilities each role has, by capability id. */
export type PermissionMatrix = Record<PermissionRoleId, Record<string, boolean>>;

export type AuditCategory = 'signin' | 'access' | 'reveal' | 'invite';
/** Colour of the event's dot: what kind of change it was. */
export type AuditTone = 'neutral' | 'quiet' | 'reveal' | 'danger' | 'success';

export interface AuditEvent {
  id: string;
  actor: string;
  action: string;
  /** "Today 00:58" */
  when: string;
  category: AuditCategory;
  tone: AuditTone;
}

export interface TeamOverview {
  members: TeamMember[];
  seatLimit: number;
  capabilities: Capability[];
  roles: PermissionRole[];
  permissions: PermissionMatrix;
  /** Newest first. */
  audit: AuditEvent[];
}

export interface TeamResult {
  team: TeamOverview;
  message: string;
}

export type AuditRange = '7' | '30' | '90';

export interface AuditExportRequest {
  range: AuditRange;
  categories: AuditCategory[];
  format: 'csv' | 'json';
}

export type AuditExportFile = PreparedExport;

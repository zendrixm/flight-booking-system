import type {
  AuditCategory,
  AuditEvent,
  AuditRange,
  AuditTone,
  Capability,
  PermissionMatrix,
  PermissionRole,
  PermissionRoleId,
  StaffRole,
  TeamMemberStatus,
} from '@/types/console/team';

export const SEAT_LIMIT = 8;
export const TEAM_DOMAIN = 'vela.travel';
/** The demo clock for audit entries and invite expiry. */
export const TEAM_ACTION_TIME = 'Today 00:58';
export const INVITE_EXPIRES = '16 Oct';

export const CAPABILITIES: readonly Capability[] = [
  { id: 'viewBookings', label: 'View bookings', description: 'Search and open any booking' },
  { id: 'modifyBookings', label: 'Modify bookings', description: 'Seats, bags, name corrections' },
  { id: 'issueRefunds', label: 'Issue refunds up to ₱50,000', description: 'Within fare rules' },
  { id: 'approveRefunds', label: 'Approve refunds above ₱50,000', description: 'Second approval' },
  {
    id: 'editPricing',
    label: 'Edit pricing and promotions',
    description: 'Fare families, markups, promo codes',
  },
  { id: 'revealPersonalData', label: 'Reveal customer personal data', description: 'Each reveal is audited' },
  { id: 'suspendCustomers', label: 'Suspend customer accounts', description: '' },
  {
    id: 'updateFlightStatus',
    label: 'Update flight status',
    description: 'Delays, cancellations, notifications',
  },
  { id: 'manageUsers', label: 'Manage users and roles', description: '' },
];

export const PERMISSION_ROLES: readonly PermissionRole[] = [
  { id: 'admin', name: 'Admin', role: 'Admin', isFixed: true },
  { id: 'ops', name: 'Operations', role: 'Operations manager', isFixed: false },
  { id: 'support', name: 'Support', role: 'Support agent', isFixed: false },
  { id: 'finance', name: 'Finance', role: 'Finance', isFixed: false },
  { id: 'readonly', name: 'Read-only', role: 'Read-only analyst', isFixed: true },
];

/** Capabilities in `CAPABILITIES` order, as 1/0 flags, for compact seeding. */
function matrixRow(flags: readonly number[]): Record<string, boolean> {
  return Object.fromEntries(CAPABILITIES.map((capability, index) => [capability.id, flags[index] === 1]));
}

export const INITIAL_PERMISSIONS: PermissionMatrix = {
  admin: matrixRow([1, 1, 1, 1, 1, 1, 1, 1, 1]),
  ops: matrixRow([1, 1, 1, 0, 0, 1, 1, 1, 0]),
  support: matrixRow([1, 1, 0, 0, 0, 1, 0, 0, 0]),
  finance: matrixRow([1, 0, 1, 1, 0, 0, 0, 0, 0]),
  readonly: matrixRow([1, 0, 0, 0, 0, 0, 0, 0, 0]),
};

export const ROLE_TO_PERMISSION_ROLE: Record<StaffRole, PermissionRoleId> = {
  Admin: 'admin',
  'Operations manager': 'ops',
  'Support agent': 'support',
  Finance: 'finance',
  'Read-only analyst': 'readonly',
};

export interface TeamMemberSeed {
  id: string;
  fullName: string;
  email: string;
  role: StaffRole;
  twoStepEnabled: boolean;
  lastActive: string;
  status: TeamMemberStatus;
  accessNote: string;
  activeSessionCount: number;
  /** When an Admin, only another Admin can change them. */
  isWorkspaceOwner?: boolean;
}

export const TEAM_SEEDS: readonly TeamMemberSeed[] = [
  {
    id: 'lea',
    fullName: 'Lea Navarro',
    email: 'lea.navarro@vela.travel',
    role: 'Operations manager',
    twoStepEnabled: true,
    lastActive: 'Now',
    status: 'active',
    accessNote: 'Joined 3 Feb 2025 · invited by Ian Cruz',
    activeSessionCount: 2,
  },
  {
    id: 'ian',
    fullName: 'Ian Cruz',
    email: 'ian.cruz@vela.travel',
    role: 'Admin',
    twoStepEnabled: true,
    lastActive: '12 min ago',
    status: 'active',
    accessNote: 'Workspace owner · joined 12 Jan 2025',
    activeSessionCount: 2,
    isWorkspaceOwner: true,
  },
  {
    id: 'ramon',
    fullName: 'Ramon Diaz',
    email: 'ramon.diaz@vela.travel',
    role: 'Support agent',
    twoStepEnabled: true,
    lastActive: '14 min ago',
    status: 'active',
    accessNote: 'Joined 21 Jul 2025 · invited by Ian Cruz',
    activeSessionCount: 2,
  },
  {
    id: 'bea',
    fullName: 'Bea Santos',
    email: 'bea.santos@vela.travel',
    role: 'Finance',
    twoStepEnabled: true,
    lastActive: 'Yesterday, 18:02',
    status: 'active',
    accessNote: 'Joined 4 Mar 2025 · invited by Ian Cruz',
    activeSessionCount: 1,
  },
  {
    id: 'mika',
    fullName: 'Mika Tan',
    email: 'mika.tan@vela.travel',
    role: 'Support agent',
    twoStepEnabled: false,
    lastActive: 'Invite sent 7 Oct',
    status: 'invited',
    accessNote: 'Invited 7 Oct by Ian Cruz · link expires 14 Oct',
    activeSessionCount: 0,
  },
  {
    id: 'paolo',
    fullName: 'Paolo Reyes',
    email: 'paolo.reyes@vela.travel',
    role: 'Read-only analyst',
    twoStepEnabled: true,
    lastActive: '2 Sep',
    status: 'deactivated',
    accessNote: 'Deactivated 2 Sep by Ian Cruz',
    activeSessionCount: 0,
  },
];

const event = (
  id: string,
  actor: string,
  action: string,
  when: string,
  category: AuditCategory,
  tone: AuditTone,
): AuditEvent => ({
  id,
  actor,
  action,
  when,
  category,
  tone,
});

export const AUDIT_SEEDS: readonly AuditEvent[] = [
  event('a8', 'Lea Navarro', 'revealed phone number on VL7Q2K', 'Today 00:58', 'reveal', 'reveal'),
  event('a7', 'Ian Cruz', 'changed Bea Santos to Finance', 'Today 00:46', 'access', 'neutral'),
  event('a6', 'Ramon Diaz', 'signed in from a new device · Manila', 'Today 00:31', 'signin', 'quiet'),
  event('a5', 'System', 'blocked 3 failed sign-ins for paolo.reyes', 'Yesterday 22:10', 'signin', 'danger'),
  event(
    'a4',
    'Ian Cruz',
    'invited mika.tan@vela.travel as Support agent',
    '7 Oct 15:20',
    'invite',
    'neutral',
  ),
  event('a3', 'Ian Cruz', 'deactivated Paolo Reyes', '2 Sep 09:12', 'access', 'danger'),
  event('a2', 'Ian Cruz', 'required 2-step verification for everyone', '1 Sep 10:05', 'access', 'neutral'),
  event('a1', 'Lea Navarro', 'revealed passport number on VL5CB3', '28 Aug 11:30', 'reveal', 'reveal'),
];

/** Audit export windows, with how many events each holds in total. */
export const AUDIT_EXPORT_RANGES: Readonly<
  Record<AuditRange, { label: string; dates: string; eventCount: number }>
> = {
  '7': { label: 'Last 7 days', dates: '2 Oct – 9 Oct', eventCount: 412 },
  '30': { label: 'Last 30 days', dates: '10 Sep – 9 Oct', eventCount: 1688 },
  '90': { label: 'Last 90 days', dates: '11 Jul – 9 Oct', eventCount: 4921 },
};

import type { StatusTone } from '@/components/ui';
import type {
  AuditCategory,
  AuditEvent,
  PermissionMatrix,
  StaffRole,
  TeamMember,
  TeamMemberStatus,
  TeamOverview,
} from '@/types/console/team';

import type { ConfirmDialogContent } from '../../shared/components/ConfirmDialog';

const STATUS_CHIPS: Record<TeamMemberStatus, { label: string; tone: StatusTone }> = {
  active: { label: 'Active', tone: 'success' },
  invited: { label: 'Invited', tone: 'warning' },
  deactivated: { label: 'Deactivated', tone: 'muted' },
};

export const memberStatusChip = (status: TeamMemberStatus) => STATUS_CHIPS[status];

/** Roles you can invite someone as; new Admins are made by promoting an existing teammate. */
export const INVITABLE_ROLES: readonly StaffRole[] = [
  'Support agent',
  'Operations manager',
  'Finance',
  'Read-only analyst',
];

export type AuditFilter = 'all' | AuditCategory;

export const AUDIT_FILTERS: ReadonlyArray<{ id: AuditFilter; label: string; noun: string }> = [
  { id: 'all', label: 'All', noun: '' },
  { id: 'signin', label: 'Sign-ins', noun: 'sign-in' },
  { id: 'access', label: 'Roles & access', noun: 'role and access' },
  { id: 'reveal', label: 'Data reveals', noun: 'data reveal' },
  { id: 'invite', label: 'Invites', noun: 'invitation' },
];

/** The panel shows the latest few; the export has everything. */
export const AUDIT_PREVIEW_COUNT = 6;

export function filterAudit(events: readonly AuditEvent[], filter: AuditFilter): AuditEvent[] {
  return filter === 'all' ? [...events] : events.filter((event) => event.category === filter);
}

export function auditFilterLabel(
  filter: (typeof AUDIT_FILTERS)[number],
  events: readonly AuditEvent[],
): string {
  return filter.id === 'all' ? filter.label : `${filter.label} · ${filterAudit(events, filter.id).length}`;
}

export function auditFootnote(shown: number, total: number, filter: AuditFilter): string {
  const noun = AUDIT_FILTERS.find((item) => item.id === filter)?.noun;
  const kind = noun ? `${noun} ` : '';
  return `Showing ${shown} of ${total} ${kind}${total === 1 ? 'event' : 'events'} · Export includes the full history`;
}

export function auditEmptyMessage(filter: AuditFilter): string {
  const noun = AUDIT_FILTERS.find((item) => item.id === filter)?.noun;
  return `No ${noun ? `${noun} ` : ''}events in the last 90 days.`;
}

/** "6 people · 2 seats left on your plan" */
export function teamCountLabel(team: Pick<TeamOverview, 'members' | 'seatLimit'>): string {
  const people = team.members.length;
  const seatsLeft = Math.max(0, team.seatLimit - people);
  return `${people} ${people === 1 ? 'person' : 'people'} · ${seatsLeft} ${seatsLeft === 1 ? 'seat' : 'seats'} left on your plan`;
}

/** Events about this person, or done by them. */
export function memberActivity(member: TeamMember, events: readonly AuditEvent[], limit = 4): AuditEvent[] {
  const handle = member.email.split('@')[0];
  return events
    .filter(
      (event) =>
        event.actor === member.fullName ||
        event.action.includes(member.fullName) ||
        event.action.includes(handle),
    )
    .slice(0, limit);
}

function capabilitiesOf(
  team: TeamOverview,
  role: StaffRole,
  permissions: PermissionMatrix = team.permissions,
): Set<string> {
  const roleId = team.roles.find((candidate) => candidate.role === role)?.id;
  if (!roleId) return new Set();
  return new Set(
    team.capabilities
      .filter((capability) => permissions[roleId][capability.id])
      .map((capability) => capability.id),
  );
}

/** What someone gains and loses moving from one role to another. */
export function roleDifference(team: TeamOverview, from: StaffRole, to: StaffRole) {
  const before = capabilitiesOf(team, from);
  const after = capabilitiesOf(team, to);
  const label = (id: string) => team.capabilities.find((capability) => capability.id === id)?.label ?? id;
  return {
    gains: [...after].filter((id) => !before.has(id)).map(label),
    losses: [...before].filter((id) => !after.has(id)).map(label),
  };
}

const firstNameOf = (member: TeamMember) => member.fullName.split(' ')[0];

export type TeamChange =
  | { kind: 'role'; member: TeamMember; role: StaffRole }
  | { kind: 'deactivate'; member: TeamMember }
  | { kind: 'reactivate'; member: TeamMember }
  | { kind: 'revoke'; member: TeamMember };

/** Title, explanation and buttons for confirming a change to someone's access. */
export function teamChangeContent(change: TeamChange): ConfirmDialogContent {
  const { member } = change;
  const firstName = firstNameOf(member);
  switch (change.kind) {
    case 'role':
      return {
        role: 'dialog',
        title: `Change ${member.fullName} to ${change.role}?`,
        subtitle: `Currently ${member.role} · ${member.email}`,
        body: `${firstName}’s access changes at their next sign-in, and they get an email about the new role. The change is saved to the audit log.`,
        cancelLabel: 'Cancel',
        confirmLabel: 'Change role',
        isDestructive: false,
      };
    case 'deactivate':
      return {
        role: 'alertdialog',
        title: `Deactivate ${member.fullName}?`,
        subtitle: `${member.role} · ${member.email}`,
        body: `${firstName} is signed out of Vela Console on every device right away and can’t sign in again. Bookings, notes and audit history they created stay as they are.`,
        cancelLabel: 'Cancel',
        confirmLabel: `Deactivate ${firstName}`,
        isDestructive: true,
      };
    case 'reactivate':
      return {
        role: 'dialog',
        title: `Reactivate ${member.fullName}?`,
        subtitle: `${member.email} · ${member.accessNote.toLowerCase()}`,
        body: `${firstName} can sign in again with their existing password and gets an email right away. They’ll be asked to set up 2-step verification again.`,
        cancelLabel: 'Cancel',
        confirmLabel: `Reactivate ${firstName}`,
        isDestructive: false,
      };
    case 'revoke':
      return {
        role: 'alertdialog',
        title: `Revoke ${firstName}’s invite?`,
        subtitle: `${member.role} · ${member.email}`,
        body: `The invite link sent to ${member.email} stops working right away and ${firstName} is removed from the team list. You can invite them again at any time.`,
        cancelLabel: 'Cancel',
        confirmLabel: 'Revoke invite',
        isDestructive: true,
      };
  }
}

/** What deactivating someone does, beyond signing them out. */
export function deactivationEffects(member: TeamMember): string[] {
  const firstName = firstNameOf(member);
  const sessions = member.activeSessionCount;
  return [
    sessions
      ? `Signs out ${sessions} active ${sessions === 1 ? 'session' : 'sessions'} now`
      : 'No one is signed in right now',
    `Refund reviews assigned to ${firstName} go back to the shared queue`,
    `You can reactivate ${firstName} later from this list`,
  ];
}

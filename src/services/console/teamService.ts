import { formatNumber, initialsOf } from '@/lib/format';
import { DEMO_STAFF_MEMBER } from '@/mocks/console/staff';
import {
  AUDIT_EXPORT_RANGES,
  AUDIT_SEEDS,
  CAPABILITIES,
  INITIAL_PERMISSIONS,
  INVITE_EXPIRES,
  PERMISSION_ROLES,
  SEAT_LIMIT,
  TEAM_ACTION_TIME,
  TEAM_SEEDS,
  type TeamMemberSeed,
} from '@/mocks/console/team';
import type {
  AuditCategory,
  AuditEvent,
  AuditExportFile,
  AuditExportRequest,
  AuditTone,
  PermissionMatrix,
  StaffRole,
  TeamMember,
  TeamOverview,
  TeamResult,
} from '@/types/console/team';

import { ApiError, mockRequest } from '../mockApi';
import { countPermissionChanges, inviteEmailError } from './teamRules';

const YOU = DEMO_STAFF_MEMBER.fullName;

/** Server-side state for the session. */
const members: TeamMemberSeed[] = structuredClone([...TEAM_SEEDS]);
let permissions: PermissionMatrix = structuredClone(INITIAL_PERMISSIONS);
const audit: AuditEvent[] = [...AUDIT_SEEDS];
let eventCount = 0;

function log(action: string, category: AuditCategory = 'access', tone: AuditTone = 'neutral') {
  eventCount += 1;
  audit.unshift({ id: `session-${eventCount}`, actor: YOU, action, when: TEAM_ACTION_TIME, category, tone });
}

function lockedReason(seed: TeamMemberSeed): string | undefined {
  if (seed.fullName === YOU) return 'This is you. Ask an Admin to change your own role or access.';
  if (seed.role === 'Admin') {
    const firstName = seed.fullName.split(' ')[0];
    return `${firstName} is an Admin. Only another Admin can change an Admin’s role or deactivate them.`;
  }
  return undefined;
}

function toMember(seed: TeamMemberSeed): TeamMember {
  const isActive = seed.status === 'active';
  return {
    id: seed.id,
    fullName: seed.fullName,
    email: seed.email,
    initials: initialsOf(seed.fullName),
    role: seed.role,
    twoStepEnabled: seed.twoStepEnabled,
    lastActive: seed.lastActive,
    status: seed.status,
    accessNote: seed.accessNote,
    sessions:
      isActive && seed.activeSessionCount
        ? `${seed.activeSessionCount} ${seed.activeSessionCount === 1 ? 'device' : 'devices'} · Manila`
        : 'None',
    activeSessionCount: isActive ? seed.activeSessionCount : 0,
    isYou: seed.fullName === YOU,
    lockedReason: lockedReason(seed),
  };
}

function overview(): TeamOverview {
  return {
    members: members.map(toMember),
    seatLimit: SEAT_LIMIT,
    capabilities: [...CAPABILITIES],
    roles: [...PERMISSION_ROLES],
    permissions: structuredClone(permissions),
    audit: [...audit],
  };
}

function findMember(id: string): TeamMemberSeed {
  const member = members.find((candidate) => candidate.id === id);
  if (!member) throw new ApiError('not_found', 'That teammate isn’t on the team any more.');
  return member;
}

/** Runs a change against a teammate the signed-in user may manage. */
function changeMember(id: string, apply: (member: TeamMemberSeed) => string) {
  return mockRequest<TeamResult>(() => {
    const member = findMember(id);
    const reason = lockedReason(member);
    if (reason) throw new ApiError('not_allowed', reason);
    return { message: apply(member), team: overview() };
  });
}

export function getTeam(): Promise<TeamOverview> {
  return mockRequest(overview);
}

/** Invites a colleague by work email. They get a link valid for 7 days. */
export function inviteTeammate({ email, role }: { email: string; role: StaffRole }): Promise<TeamResult> {
  return mockRequest(() => {
    const address = email.trim().toLowerCase();
    const error = inviteEmailError(address, members.map(toMember));
    if (error) throw new ApiError('invalid_email', error);
    if (members.filter((member) => member.status !== 'deactivated').length >= SEAT_LIMIT) {
      throw new ApiError(
        'no_seats',
        'Every seat on your plan is taken. Deactivate someone or add seats first.',
      );
    }
    const fullName = address
      .split('@')[0]
      .replace(/[._-]+/g, ' ')
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
    members.push({
      id: `invite-${members.length}`,
      fullName,
      email: address,
      role,
      twoStepEnabled: false,
      lastActive: 'Invite sent just now',
      status: 'invited',
      accessNote: `Invited today by ${YOU} · link expires ${INVITE_EXPIRES}`,
      activeSessionCount: 0,
    });
    log(`invited ${address} as ${role}`, 'invite');
    return { team: overview(), message: `Invite sent to ${address} as ${role}` };
  });
}

/** Takes effect at the person's next sign-in; they're emailed about it. */
export function changeTeammateRole(id: string, role: StaffRole): Promise<TeamResult> {
  return changeMember(id, (member) => {
    if (member.status === 'deactivated') throw new ApiError('deactivated', 'Reactivate them first.');
    member.role = role;
    log(`changed ${member.fullName} to ${role}`);
    return `${member.fullName} is now ${role} · applies at next sign-in`;
  });
}

/** Signs them out everywhere. Their bookings, notes and audit history stay. */
export function deactivateTeammate(id: string): Promise<TeamResult> {
  return changeMember(id, (member) => {
    member.status = 'deactivated';
    member.lastActive = 'Deactivated just now';
    member.accessNote = `Deactivated today by ${YOU}`;
    log(`deactivated ${member.fullName}`, 'access', 'danger');
    return `${member.fullName} deactivated · signed out on all devices`;
  });
}

/** Lets them sign in again with the chosen role; 2-step verification must be set up again. */
export function reactivateTeammate(id: string, role: StaffRole): Promise<TeamResult> {
  return changeMember(id, (member) => {
    member.status = 'active';
    member.role = role;
    member.twoStepEnabled = false;
    member.activeSessionCount = 0;
    member.lastActive = 'Reactivated just now';
    member.accessNote = `Reactivated today by ${YOU}`;
    log(`reactivated ${member.fullName} as ${role}`, 'access', 'success');
    return `${member.fullName} reactivated as ${role} · sign-in email sent`;
  });
}

export function resendInvite(id: string): Promise<TeamResult> {
  return changeMember(id, (member) => {
    if (member.status !== 'invited') {
      throw new ApiError('not_invited', `${member.fullName} has already joined.`);
    }
    member.lastActive = 'Invite resent just now';
    log(`resent the invite to ${member.email}`, 'invite');
    return `Invite resent to ${member.email} · expires in 7 days`;
  });
}

/** The link stops working and they leave the team list. */
export function revokeInvite(id: string): Promise<TeamResult> {
  return changeMember(id, (member) => {
    if (member.status !== 'invited') {
      throw new ApiError('not_invited', `${member.fullName} has already joined.`);
    }
    members.splice(members.indexOf(member), 1);
    log(`revoked the invite for ${member.email}`, 'invite', 'danger');
    return `Invite for ${member.email} revoked`;
  });
}

/** Saves the editable roles' permissions; fixed system roles are left as they are. */
export function savePermissions(next: PermissionMatrix): Promise<TeamResult> {
  return mockRequest(() => {
    const merged: PermissionMatrix = structuredClone(permissions);
    for (const role of PERMISSION_ROLES) {
      if (!role.isFixed) merged[role.id] = { ...next[role.id] };
    }
    const changes = countPermissionChanges(permissions, merged);
    permissions = merged;
    const label = `${changes} ${changes === 1 ? 'change' : 'changes'}`;
    log(`updated role permissions (${label})`);
    return { team: overview(), message: `Permissions saved · ${label} apply at next sign-in` };
  });
}

/** What an export with these options would contain. */
function describeAuditExport({ range, categories, format }: AuditExportRequest): AuditExportFile {
  const window = AUDIT_EXPORT_RANGES[range];
  const rows = Math.round((window.eventCount * categories.length) / 4);
  const bytes = rows * (format === 'json' ? 260 : 140);
  return {
    fileName: `vela-audit-log_last-${range}-days.${format}`,
    summary: `${formatNumber(rows)} events · ${window.dates}`,
    sizeLabel:
      bytes >= 1_000_000
        ? `${(bytes / 1_000_000).toFixed(1)} MB`
        : `${Math.max(1, Math.round(bytes / 1000))} KB`,
  };
}

/** The chosen window's dates and size, and the file these options would produce. */
export function previewAuditExport(
  request: AuditExportRequest,
): Promise<{ rangeSummary: string; file: AuditExportFile }> {
  return mockRequest(() => {
    const window = AUDIT_EXPORT_RANGES[request.range];
    return {
      rangeSummary: `${window.dates} · about ${formatNumber(window.eventCount)} events in total`,
      file: describeAuditExport(request),
    };
  }, 0);
}

/** Builds the file. Exporting is itself written to the audit log. */
export function prepareAuditExport(request: AuditExportRequest): Promise<AuditExportFile> {
  return mockRequest(() => {
    if (request.categories.length === 0) throw new ApiError('no_events', 'Choose at least one event type.');
    return describeAuditExport(request);
  }, 1200);
}

export function recordAuditDownload(file: AuditExportFile): Promise<TeamResult> {
  return mockRequest(() => {
    log(`exported the audit log (${file.fileName})`);
    return { team: overview(), message: `Downloading ${file.fileName} · ${file.sizeLabel}` };
  });
}

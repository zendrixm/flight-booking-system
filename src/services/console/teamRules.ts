import type { PermissionMatrix, TeamMember } from '@/types/console/team';

/** Staff sign in with Vela accounts; partners get their own workspaces. */
const WORK_EMAIL = /^[^@\s]+@vela\.travel$/i;

/** Why an invite can't go to this address, or null. Shared by the invite form and the server. */
export function inviteEmailError(email: string, team: readonly TeamMember[]): string | null {
  const address = email.trim();
  if (!address) return 'Enter their work email.';
  const existing = team.find((member) => member.email.toLowerCase() === address.toLowerCase());
  if (existing) {
    return `${existing.fullName} already has access as ${existing.role}. Change their role in the team list instead.`;
  }
  if (!WORK_EMAIL.test(address)) {
    return 'Use a @vela.travel address. Airline and agency partners get access through their own workspace.';
  }
  return null;
}

/** How many role × capability switches differ between two matrices. */
export function countPermissionChanges(before: PermissionMatrix, after: PermissionMatrix): number {
  let changes = 0;
  for (const roleId of Object.keys(before) as Array<keyof PermissionMatrix>) {
    for (const capabilityId of Object.keys(before[roleId])) {
      if (before[roleId][capabilityId] !== after[roleId]?.[capabilityId]) changes += 1;
    }
  }
  return changes;
}

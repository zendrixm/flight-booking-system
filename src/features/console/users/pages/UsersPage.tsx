import { useState } from 'react';

import { PageLoader } from '@/components/layout';
import { Alert, Button, useToast } from '@/components/ui';
import { useAsyncData } from '@/hooks';
import { countPermissionChanges } from '@/services/console/teamRules';
import * as teamActions from '@/services/console/teamService';
import { ApiError } from '@/services/mockApi';
import type {
  PermissionMatrix as PermissionMatrixData,
  PermissionRoleId,
  StaffRole,
  TeamMember,
  TeamOverview,
  TeamResult,
} from '@/types/console/team';

import { ConsolePage } from '../../shared/components/ConsolePage';
import { UnsavedChangesBar } from '../../shared/components/UnsavedChangesBar';
import { AuditExportDialog } from '../components/AuditExportDialog';
import { AuditLogPanel } from '../components/AuditLogPanel';
import { PermissionLegend, PermissionMatrix } from '../components/PermissionMatrix';
import { InviteDialog, TeamChangeDialog } from '../components/TeamDialogs';
import { TeammateDrawer } from '../components/TeammateDrawer';
import { TeamTable } from '../components/TeamTable';
import { teamCountLabel, type AuditFilter, type TeamChange } from '../lib/teamPresentation';
import styles from './UsersPage.module.css';

const PAGE_TITLE = 'Users & roles';

export function UsersPage() {
  const team = useAsyncData('team', teamActions.getTeam);

  if (!team.data) {
    if (team.status !== 'error') return <PageLoader label="Loading your team…" />;
    return (
      <ConsolePage section="users" title={PAGE_TITLE}>
        <Alert
          tone="danger"
          role="alert"
          title="The team didn’t load"
          action={
            <Button variant="quiet" size="small" onClick={team.reload}>
              Try again
            </Button>
          }
        />
      </ConsolePage>
    );
  }
  return <UsersView team={team.data} onTeamChange={team.mutate} />;
}

interface UsersViewProps {
  team: TeamOverview;
  onTeamChange: (team: TeamOverview) => void;
}

function UsersView({ team, onTeamChange }: UsersViewProps) {
  const toast = useToast();
  const [draftPermissions, setDraftPermissions] = useState<PermissionMatrixData>(team.permissions);
  const [openMemberId, setOpenMemberId] = useState<string | null>(null);
  const [pendingChange, setPendingChange] = useState<TeamChange | null>(null);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [exportFilter, setExportFilter] = useState<AuditFilter | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const openMember = team.members.find((member) => member.id === openMemberId);
  const permissionChanges = countPermissionChanges(team.permissions, draftPermissions);

  /** Runs a change, shows the fresh team and its message. Returns whether it worked. */
  const run = async (task: () => Promise<TeamResult>) => {
    setIsBusy(true);
    try {
      const result = await task();
      onTeamChange(result.team);
      toast.show({ tone: 'success', message: result.message });
      return result.team;
    } catch (error) {
      toast.show({
        tone: 'error',
        message: error instanceof ApiError ? error.message : 'That didn’t go through. Try again.',
      });
      return null;
    } finally {
      setIsBusy(false);
    }
  };

  const requestRoleChange = (member: TeamMember, role: StaffRole) => {
    if (role !== member.role) setPendingChange({ kind: 'role', member, role });
  };

  const confirmChange = async (returningRole?: StaffRole) => {
    if (!pendingChange) return;
    const { member } = pendingChange;
    const task = {
      role: () =>
        teamActions.changeTeammateRole(
          member.id,
          pendingChange.kind === 'role' ? pendingChange.role : member.role,
        ),
      deactivate: () => teamActions.deactivateTeammate(member.id),
      reactivate: () => teamActions.reactivateTeammate(member.id, returningRole ?? 'Read-only analyst'),
      revoke: () => teamActions.revokeInvite(member.id),
    }[pendingChange.kind];
    const updated = await run(task);
    setPendingChange(null);
    // Leaving the team list or changing access ends the drawer's job.
    if (updated && pendingChange.kind !== 'role') setOpenMemberId(null);
  };

  const togglePermission = (roleId: PermissionRoleId, capabilityId: string) =>
    setDraftPermissions((current) => ({
      ...current,
      [roleId]: { ...current[roleId], [capabilityId]: !current[roleId][capabilityId] },
    }));

  const savePermissions = async () => {
    const updated = await run(() => teamActions.savePermissions(draftPermissions));
    if (updated) setDraftPermissions(updated.permissions);
  };

  return (
    <ConsolePage
      section="users"
      title={PAGE_TITLE}
      description="Who can access the console, and what each role is allowed to do"
      actions={
        <Button
          variant="primary"
          iconStart="plus"
          aria-haspopup="dialog"
          onClick={() => setIsInviteOpen(true)}
        >
          Invite teammate
        </Button>
      }
    >
      <div className={styles.columns}>
        <section aria-labelledby="team-heading" className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 id="team-heading" className={styles.cardTitle}>
              Team
            </h2>
            <span className={styles.cardNote}>{teamCountLabel(team)}</span>
          </div>
          <TeamTable
            members={team.members}
            onRoleChange={requestRoleChange}
            onOpen={(member) => setOpenMemberId(member.id)}
            onResendInvite={(member) => void run(() => teamActions.resendInvite(member.id))}
          />
        </section>
        <AuditLogPanel events={team.audit} onExport={setExportFilter} className={styles.audit} />
      </div>

      <section aria-labelledby="permissions-heading" className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitles}>
            <h2 id="permissions-heading" className={styles.cardTitle}>
              Role permissions
            </h2>
            <span className={styles.cardNote}>
              System roles are fixed. Custom roles can be edited by Admins.
            </span>
          </div>
          <PermissionLegend />
        </div>
        <PermissionMatrix
          capabilities={team.capabilities}
          roles={team.roles}
          permissions={draftPermissions}
          onToggle={togglePermission}
        />
        {permissionChanges > 0 && (
          <UnsavedChangesBar
            className={styles.unsaved}
            title={`${permissionChanges} unsaved ${permissionChanges === 1 ? 'change' : 'changes'}`}
            description="Changes take effect at each person’s next sign-in"
            actions={
              <>
                <Button variant="quiet" onClick={() => setDraftPermissions(team.permissions)}>
                  Discard
                </Button>
                <Button variant="primary" loading={isBusy} onClick={() => void savePermissions()}>
                  Save permissions
                </Button>
              </>
            }
          />
        )}
      </section>

      {openMember && (
        <TeammateDrawer
          member={openMember}
          auditEvents={team.audit}
          isBusy={isBusy}
          onClose={() => setOpenMemberId(null)}
          onRoleChange={(role) => requestRoleChange(openMember, role)}
          onDeactivate={() => setPendingChange({ kind: 'deactivate', member: openMember })}
          onReactivate={() => setPendingChange({ kind: 'reactivate', member: openMember })}
          onRevokeInvite={() => setPendingChange({ kind: 'revoke', member: openMember })}
          onResendInvite={() => void run(() => teamActions.resendInvite(openMember.id))}
        />
      )}
      {pendingChange && (
        <TeamChangeDialog
          change={pendingChange}
          team={team}
          isBusy={isBusy}
          onClose={() => setPendingChange(null)}
          onConfirm={(role) => void confirmChange(role)}
        />
      )}
      {isInviteOpen && (
        <InviteDialog
          members={team.members}
          isBusy={isBusy}
          onClose={() => setIsInviteOpen(false)}
          onInvite={(invite) =>
            void run(() => teamActions.inviteTeammate(invite)).then(
              (updated) => updated && setIsInviteOpen(false),
            )
          }
        />
      )}
      {exportFilter && (
        <AuditExportDialog
          initialFilter={exportFilter}
          onClose={() => setExportFilter(null)}
          onDownload={(file) => {
            setExportFilter(null);
            void run(() => teamActions.recordAuditDownload(file));
          }}
        />
      )}
    </ConsolePage>
  );
}

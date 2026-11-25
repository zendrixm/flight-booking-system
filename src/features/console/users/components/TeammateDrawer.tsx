import clsx from 'clsx';

import { Alert, Avatar, Button, Drawer, SelectField, StatusChip } from '@/components/ui';
import {
  ROLE_SUMMARIES,
  STAFF_ROLES,
  type AuditEvent,
  type StaffRole,
  type TeamMember,
} from '@/types/console/team';

import { memberActivity, memberStatusChip } from '../lib/teamPresentation';
import { AuditEventList } from './AuditEventList';
import styles from './TeammateDrawer.module.css';

interface TeammateDrawerProps {
  member: TeamMember;
  auditEvents: readonly AuditEvent[];
  isBusy: boolean;
  onClose: () => void;
  onRoleChange: (role: StaffRole) => void;
  onDeactivate: () => void;
  onReactivate: () => void;
  onRevokeInvite: () => void;
  onResendInvite: () => void;
}

/** One teammate's access: role, 2-step, sessions, recent activity and what you can change. */
export function TeammateDrawer({
  member,
  auditEvents,
  isBusy,
  onClose,
  onRoleChange,
  onDeactivate,
  onReactivate,
  onRevokeInvite,
  onResendInvite,
}: TeammateDrawerProps) {
  const chip = memberStatusChip(member.status);
  const activity = memberActivity(member, auditEvents);
  const canManage = !member.lockedReason;
  const facts = [
    {
      label: '2-step verification',
      value: member.twoStepEnabled ? 'Enabled · authenticator app' : 'Not set up',
      isWarning: !member.twoStepEnabled,
    },
    { label: 'Last active', value: member.lastActive },
    { label: member.status === 'invited' ? 'Invite' : 'Access', value: member.accessNote },
    { label: 'Sessions', value: member.sessions },
  ];

  return (
    <Drawer
      open
      onClose={onClose}
      leading={<Avatar initials={member.initials} size={48} tone={member.isYou ? 'midnight' : 'neutral'} />}
      title={member.fullName}
      description={member.email}
      headerExtra={
        <span className={styles.badges}>
          <StatusChip tone={chip.tone} hideDot size="compact">
            {chip.label}
          </StatusChip>
          <span className={styles.rolePill}>{member.role}</span>
        </span>
      }
      footer={
        <>
          <Button variant="quiet" onClick={onClose}>
            Close
          </Button>
          {canManage && member.status === 'active' && (
            <Button variant="destructiveQuiet" aria-haspopup="dialog" onClick={onDeactivate}>
              Deactivate user
            </Button>
          )}
          {canManage && member.status === 'invited' && (
            <>
              <Button variant="destructiveQuiet" aria-haspopup="dialog" onClick={onRevokeInvite}>
                Revoke invite
              </Button>
              <Button variant="primary" loading={isBusy} onClick={onResendInvite}>
                Resend invite
              </Button>
            </>
          )}
          {canManage && member.status === 'deactivated' && (
            <Button variant="primary" aria-haspopup="dialog" onClick={onReactivate}>
              Reactivate
            </Button>
          )}
        </>
      }
    >
      <dl className={styles.facts}>
        {facts.map((fact) => (
          <div key={fact.label}>
            <dt>{fact.label}</dt>
            <dd className={clsx(fact.isWarning && styles.warning)}>{fact.value}</dd>
          </div>
        ))}
      </dl>

      {canManage && member.status !== 'deactivated' && (
        <section className={styles.section}>
          <SelectField
            label="Role"
            required
            value={member.role}
            options={STAFF_ROLES.map((role) => ({ value: role, label: role }))}
            helpText={ROLE_SUMMARIES[member.role]}
            onChange={(event) => onRoleChange(event.target.value as StaffRole)}
          />
        </section>
      )}

      {member.lockedReason && (
        <Alert tone="info" icon="lock">
          {member.lockedReason}
        </Alert>
      )}

      <section className={styles.section} aria-label="Recent activity">
        <h3 className={styles.caption}>Recent activity</h3>
        {activity.length > 0 ? (
          <AuditEventList events={activity} />
        ) : (
          <p className={styles.muted}>No activity in the last 90 days.</p>
        )}
      </section>
    </Drawer>
  );
}

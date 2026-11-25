import clsx from 'clsx';

import { Avatar, Button, SelectField, StatusChip, Table } from '@/components/ui';
import { STAFF_ROLES, type StaffRole, type TeamMember } from '@/types/console/team';

import { memberStatusChip } from '../lib/teamPresentation';
import styles from './TeamTable.module.css';

interface TeamTableProps {
  members: readonly TeamMember[];
  /** Picking a different role asks for confirmation first. */
  onRoleChange: (member: TeamMember, role: StaffRole) => void;
  onOpen: (member: TeamMember) => void;
  onResendInvite: (member: TeamMember) => void;
}

const ROLE_OPTIONS = STAFF_ROLES.map((role) => ({ value: role, label: role }));

export function TeamTable({ members, onRoleChange, onOpen, onResendInvite }: TeamTableProps) {
  return (
    <Table minWidth={680} className={styles.table}>
      <thead>
        <tr>
          <th scope="col">Person</th>
          <th scope="col">Role</th>
          <th scope="col">2-step</th>
          <th scope="col">Last active</th>
          <th scope="col">Status</th>
        </tr>
      </thead>
      <tbody>
        {members.map((member) => {
          const chip = memberStatusChip(member.status);
          const isRoleLocked = Boolean(member.lockedReason) || member.status === 'deactivated';
          return (
            <tr key={member.id} className={clsx(member.status === 'deactivated' && styles.deactivated)}>
              <td>
                <span className={styles.person}>
                  <Avatar initials={member.initials} size={32} tone={member.isYou ? 'midnight' : 'neutral'} />
                  <span className={styles.identity}>
                    <button
                      type="button"
                      className={styles.name}
                      aria-haspopup="dialog"
                      aria-label={`Manage ${member.fullName}`}
                      onClick={() => onOpen(member)}
                    >
                      {member.fullName}
                      {member.isYou && ' (you)'}
                    </button>
                    <span className={styles.email}>{member.email}</span>
                  </span>
                </span>
              </td>
              <td className={styles.roleCell}>
                {isRoleLocked ? (
                  <span className={styles.lockedRole} title={member.lockedReason}>
                    {member.role}
                  </span>
                ) : (
                  <SelectField
                    label={`Role for ${member.fullName}`}
                    labelHidden
                    value={member.role}
                    options={ROLE_OPTIONS}
                    selectClassName={styles.roleSelect}
                    onChange={(event) => onRoleChange(member, event.target.value as StaffRole)}
                  />
                )}
              </td>
              <td>
                <span className={clsx(styles.twoStep, !member.twoStepEnabled && styles.twoStepOff)}>
                  <span aria-hidden="true" className={styles.dot} />
                  {member.twoStepEnabled ? 'Enabled' : 'Not set up'}
                </span>
              </td>
              <td className={styles.lastActive}>{member.lastActive}</td>
              <td>
                <span className={styles.status}>
                  <StatusChip tone={chip.tone} hideDot size="compact">
                    {chip.label}
                  </StatusChip>
                  {member.status === 'invited' && (
                    <Button variant="ghost" size="small" onClick={() => onResendInvite(member)}>
                      Resend invite
                    </Button>
                  )}
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
}

import { useState } from 'react';

import { Button, Dialog, SelectField, Switch, TextField } from '@/components/ui';
import { inviteEmailError } from '@/services/console/teamRules';
import { ROLE_SUMMARIES, type StaffRole, type TeamMember, type TeamOverview } from '@/types/console/team';

import { ConfirmDialog } from '../../shared/components/ConfirmDialog';
import {
  deactivationEffects,
  INVITABLE_ROLES,
  roleDifference,
  teamChangeContent,
  type TeamChange,
} from '../lib/teamPresentation';
import styles from './TeamDialogs.module.css';

const INVITABLE_OPTIONS = INVITABLE_ROLES.map((role) => ({ value: role, label: role }));

interface InviteDialogProps {
  members: readonly TeamMember[];
  isBusy: boolean;
  onClose: () => void;
  onInvite: (invite: { email: string; role: StaffRole }) => void;
}

/** Mount while open so each invite starts empty. */
export function InviteDialog({ members, isBusy, onClose, onInvite }: InviteDialogProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<StaffRole>('Support agent');
  const [hasTried, setHasTried] = useState(false);
  const error = inviteEmailError(email, members);

  const submit = () => {
    setHasTried(true);
    if (!error) onInvite({ email: email.trim(), role });
  };

  return (
    <Dialog
      open
      onClose={onClose}
      size="medium"
      title="Invite a teammate"
      busy={isBusy}
      footer={
        <>
          <Button variant="quiet" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" loading={isBusy} onClick={submit}>
            Send invite
          </Button>
        </>
      }
    >
      <form
        noValidate
        className={styles.form}
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <TextField
          label="Work email"
          required
          type="email"
          autoComplete="off"
          placeholder="name@vela.travel"
          value={email}
          error={hasTried ? error : undefined}
          onChange={(event) => setEmail(event.target.value)}
        />
        <SelectField
          label="Role"
          required
          value={role}
          options={INVITABLE_OPTIONS}
          helpText={ROLE_SUMMARIES[role]}
          onChange={(event) => setRole(event.target.value as StaffRole)}
        />
        <Switch
          label="Require 2-step verification"
          description="Enforced for everyone by workspace policy"
          placement="end"
          checked
          disabled
          onChange={() => undefined}
        />
      </form>
    </Dialog>
  );
}

interface TeamChangeDialogProps {
  change: TeamChange;
  team: TeamOverview;
  isBusy: boolean;
  onClose: () => void;
  /** `role` is the role chosen for a reactivation. */
  onConfirm: (role?: StaffRole) => void;
}

/** Confirms a role change, deactivation, reactivation or revoked invite, spelling out the effect. */
export function TeamChangeDialog({ change, team, isBusy, onClose, onConfirm }: TeamChangeDialogProps) {
  const [returningRole, setReturningRole] = useState<StaffRole>(
    INVITABLE_ROLES.includes(change.member.role) ? change.member.role : 'Read-only analyst',
  );
  const difference = change.kind === 'role' ? roleDifference(team, change.member.role, change.role) : null;

  return (
    <ConfirmDialog
      content={teamChangeContent(change)}
      isBusy={isBusy}
      onClose={onClose}
      onConfirm={() => onConfirm(change.kind === 'reactivate' ? returningRole : undefined)}
    >
      {difference && (
        <div className={styles.difference}>
          <div className={styles.gains}>
            <span className={styles.differenceTitle}>Gains</span>
            <ul className={styles.differenceList}>
              {(difference.gains.length ? difference.gains : ['No new permissions']).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className={styles.losses}>
            <span className={styles.differenceTitle}>Loses</span>
            <ul className={styles.differenceList}>
              {(difference.losses.length ? difference.losses : ['Nothing removed']).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
      {change.kind === 'deactivate' && (
        <ul className={styles.points}>
          {deactivationEffects(change.member).map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      )}
      {change.kind === 'reactivate' && (
        <SelectField
          label="Role when they’re back"
          required
          value={returningRole}
          options={INVITABLE_OPTIONS}
          helpText={ROLE_SUMMARIES[returningRole]}
          onChange={(event) => setReturningRole(event.target.value as StaffRole)}
        />
      )}
    </ConfirmDialog>
  );
}

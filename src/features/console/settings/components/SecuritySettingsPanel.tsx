import clsx from 'clsx';
import { useState } from 'react';
import { Link } from 'react-router';

import { paths } from '@/app/paths';
import {
  Alert,
  Avatar,
  Button,
  IconButton,
  SelectField,
  StatusChip,
  Switch,
  Table,
  TextField,
} from '@/components/ui';
import { initialsOf } from '@/lib/format';
import { networkCovers, networkError } from '@/services/console/settingsRules';
import type {
  AllowedNetwork,
  SecuritySettings,
  SettingsAuditEntry,
  SettingsOverview,
} from '@/types/console/settings';

import { ConfirmDialog } from '../../shared/components/ConfirmDialog';
import { helpFor, PASSWORD_EXPIRY, PASSWORD_LENGTHS, SESSION_TIMEOUTS } from '../lib/settingsCopy';
import { locksYouOut } from '../lib/settingsForm';
import { SettingsCard, SettingsGrid, SettingsRow, SettingText } from './SettingsLayout';
import styles from './SettingsPanels.module.css';

interface SecuritySettingsPanelProps {
  draft: SecuritySettings;
  overview: Pick<SettingsOverview, 'audit' | 'yourIpAddress' | 'activeStaffCount' | 'breakGlassAdmin'>;
  staffName: string;
  isExporting: boolean;
  onChange: (change: Partial<SecuritySettings>) => void;
  onExportAudit: (actor: string | null) => void;
}

export function SecuritySettingsPanel({
  draft,
  overview,
  staffName,
  isExporting,
  onChange,
  onExportAudit,
}: SecuritySettingsPanelProps) {
  const [networkDraft, setNetworkDraft] = useState({ cidr: '', label: '' });
  const [hasTriedNetwork, setHasTriedNetwork] = useState(false);
  const [networkToRemove, setNetworkToRemove] = useState<AllowedNetwork | null>(null);
  const [auditActor, setAuditActor] = useState<string | null>(null);

  const { yourIpAddress } = overview;
  const networkProblem = networkError(
    networkDraft.cidr,
    draft.ipAllowlist.map((network) => network.cidr),
  );
  const isLockedOut = locksYouOut(draft, yourIpAddress);
  const actors = [...new Set(overview.audit.map((entry) => entry.actor))];
  const auditRows = overview.audit.filter((entry) => !auditActor || entry.actor === auditActor);

  const addNetwork = () => {
    setHasTriedNetwork(true);
    if (networkProblem) return;
    onChange({
      ipAllowlist: [
        ...draft.ipAllowlist,
        {
          cidr: networkDraft.cidr.trim(),
          label: networkDraft.label.trim() || 'No label',
          addedBy: `Added by ${staffName} · not saved yet`,
        },
      ],
    });
    setNetworkDraft({ cidr: '', label: '' });
    setHasTriedNetwork(false);
  };

  return (
    <>
      <SettingsCard
        title="Staff sign-in"
        description="Applies to everyone with access to the Vela Console."
        aside={<Link to={paths.console.users}>Review staff in Users &amp; roles</Link>}
      >
        <SettingsRow>
          <Switch
            className={styles.wideSwitch}
            label="Require 2-step verification"
            description={
              draft.requireTwoStep ? (
                '5 of 6 staff have set it up. Mika Tan (invited) will set it up when she first signs in.'
              ) : (
                <span className={styles.warningText}>
                  Turning this off lets staff sign in with a password alone. Not recommended for a production
                  workspace.
                </span>
              )
            }
            placement="end"
            checked={draft.requireTwoStep}
            onChange={(requireTwoStep) => onChange({ requireTwoStep })}
          />
        </SettingsRow>
        <SettingsRow align="start">
          <SettingText
            title={
              <span className={styles.keyTitle}>
                Single sign-on (SAML)
                <StatusChip tone="success" size="compact">
                  Configured
                </StatusChip>
              </span>
            }
            description={
              <>
                Identity provider: vela.travel staff directory · signing certificate valid until 14 Mar 2027
                <br />
                {draft.requireSso
                  ? `Required · password sign-in is turned off for everyone except 1 break-glass Admin (${overview.breakGlassAdmin}).`
                  : 'Optional · staff can choose SSO or their password.'}
              </>
            }
          />
          <Switch
            label="Require SSO"
            checked={draft.requireSso}
            onChange={(requireSso) => onChange({ requireSso })}
          />
        </SettingsRow>
        <SettingsRow>
          <SettingText
            title="Session timeout"
            description="Staff are signed out after this long without activity."
          />
          <SelectField
            label="Session timeout"
            labelHidden
            className={styles.compactSelect}
            value={draft.sessionTimeoutMinutes}
            options={SESSION_TIMEOUTS}
            onChange={(event) =>
              onChange({
                sessionTimeoutMinutes: event.target.value as SecuritySettings['sessionTimeoutMinutes'],
              })
            }
          />
        </SettingsRow>
      </SettingsCard>

      <SettingsCard
        title="IP allowlist"
        description="Only these networks can open the console or call the API with a key."
        aside={
          <span className={styles.switchWithText}>
            <span aria-hidden="true">{draft.enforceIpAllowlist ? 'Enforced' : 'Off'}</span>
            <Switch
              label="Enforce IP allowlist"
              labelHidden
              checked={draft.enforceIpAllowlist}
              onChange={(enforceIpAllowlist) => onChange({ enforceIpAllowlist })}
            />
          </span>
        }
      >
        <ul className={styles.plainList}>
          {draft.ipAllowlist.map((network) => (
            <li key={network.cidr}>
              <SettingsRow>
                <span className={styles.network}>
                  <code className={clsx(styles.mono, styles.cidr)}>{network.cidr}</code>
                  <SettingText
                    title={
                      <span className={styles.keyTitle}>
                        {network.label}
                        {networkCovers(network.cidr, yourIpAddress) && (
                          <StatusChip tone="success" hideDot size="compact">
                            Your network
                          </StatusChip>
                        )}
                      </span>
                    }
                    description={network.addedBy}
                  />
                </span>
                <IconButton
                  icon="trash"
                  label={`Remove ${network.cidr} (${network.label})`}
                  variant="outline"
                  shape="square"
                  aria-haspopup="dialog"
                  onClick={() => setNetworkToRemove(network)}
                />
              </SettingsRow>
            </li>
          ))}
        </ul>
        {draft.ipAllowlist.length === 0 && (
          <SettingsRow>
            <p className={styles.meta}>No networks on the list. Add one below, or turn the allowlist off.</p>
          </SettingsRow>
        )}
        <SettingsRow align="start">
          <form
            noValidate
            className={styles.addNetwork}
            onSubmit={(event) => {
              event.preventDefault();
              addNetwork();
            }}
          >
            <TextField
              label="IP address or range"
              required
              placeholder="203.0.113.0/24"
              inputClassName={styles.mono}
              value={networkDraft.cidr}
              error={hasTriedNetwork ? networkProblem : undefined}
              onChange={(event) => setNetworkDraft((current) => ({ ...current, cidr: event.target.value }))}
            />
            <TextField
              label="Label"
              placeholder="e.g. Clark ops center"
              value={networkDraft.label}
              onChange={(event) => setNetworkDraft((current) => ({ ...current, label: event.target.value }))}
            />
            <Button type="submit" variant="quiet" className={styles.addNetworkButton}>
              Add to list
            </Button>
          </form>
        </SettingsRow>
        <div className={styles.cardNote}>
          {!draft.enforceIpAllowlist ? (
            <Alert tone="info">
              The allowlist is off · anyone with a staff login can open the console from any network.
            </Alert>
          ) : isLockedOut ? (
            <Alert tone="danger" role="alert" icon="alertTriangle">
              You’re signed in from {yourIpAddress}, which isn’t covered any more. Saving would sign you out
              of the console.
            </Alert>
          ) : (
            <Alert tone="success" icon="check">
              You’re signed in from {yourIpAddress}, which is on the list.
            </Alert>
          )}
        </div>
      </SettingsCard>

      <SettingsCard
        title="Password policy"
        description="For staff who sign in with a password instead of SSO."
      >
        <SettingsGrid>
          <SelectField
            label="Minimum length"
            required
            value={draft.minPasswordLength}
            options={PASSWORD_LENGTHS}
            onChange={(event) =>
              onChange({ minPasswordLength: event.target.value as SecuritySettings['minPasswordLength'] })
            }
          />
          <SelectField
            label="Require a new password"
            required
            value={draft.passwordExpiry}
            options={PASSWORD_EXPIRY}
            helpText={helpFor(PASSWORD_EXPIRY, draft.passwordExpiry)}
            onChange={(event) =>
              onChange({ passwordExpiry: event.target.value as SecuritySettings['passwordExpiry'] })
            }
          />
        </SettingsGrid>
        <SettingsRow>
          <Switch
            className={styles.wideSwitch}
            label="Block reused passwords"
            description="Staff can’t reuse any of their last 5 passwords."
            placement="end"
            checked={draft.blockReusedPasswords}
            onChange={(blockReusedPasswords) => onChange({ blockReusedPasswords })}
          />
        </SettingsRow>
        <SettingsRow>
          <Switch
            className={styles.wideSwitch}
            label="Reject known breached passwords"
            description="New passwords are checked against public breach lists."
            placement="end"
            checked={draft.rejectBreachedPasswords}
            onChange={(rejectBreachedPasswords) => onChange({ rejectBreachedPasswords })}
          />
        </SettingsRow>
      </SettingsCard>

      <SettingsCard
        title="Audit log"
        description="Settings changes, sign-in events and data reveals. Kept for 400 days."
        aside={
          <>
            <SelectField
              label="Filter by staff"
              labelHidden
              className={styles.compactSelect}
              value={auditActor ?? 'all'}
              options={[
                { value: 'all', label: 'All staff' },
                ...actors.map((actor) => ({ value: actor, label: actor })),
              ]}
              onChange={(event) => setAuditActor(event.target.value === 'all' ? null : event.target.value)}
            />
            <Button
              variant="quiet"
              iconStart="download"
              loading={isExporting}
              onClick={() => onExportAudit(auditActor)}
            >
              Export
            </Button>
          </>
        }
      >
        <AuditTable entries={auditRows} />
        <p className={styles.tableFooter}>
          Showing {auditRows.length} of {overview.audit.length} events from the last 60 days
        </p>
      </SettingsCard>

      <ConfirmDialog
        content={
          networkToRemove && {
            role: 'alertdialog',
            title: `Remove ${networkToRemove.cidr} from the allowlist?`,
            subtitle: networkToRemove.label,
            body: 'Staff on this network can’t open the console or use API keys once you save. You can still discard the change before saving.',
            cancelLabel: 'Keep it',
            confirmLabel: 'Remove from list',
            isDestructive: true,
          }
        }
        onClose={() => setNetworkToRemove(null)}
        onConfirm={() => {
          if (!networkToRemove) return;
          onChange({
            ipAllowlist: draft.ipAllowlist.filter((network) => network.cidr !== networkToRemove.cidr),
          });
          setNetworkToRemove(null);
        }}
      >
        {networkToRemove && networkCovers(networkToRemove.cidr, yourIpAddress) && (
          <Alert tone="danger" icon="alertTriangle">
            This is the network you’re signed in from ({yourIpAddress}). Saving without it would sign you out.
          </Alert>
        )}
      </ConfirmDialog>
    </>
  );
}

function AuditTable({ entries }: { entries: readonly SettingsAuditEntry[] }) {
  return (
    <Table minWidth={640} className={styles.auditTable}>
      <thead>
        <tr>
          <th scope="col">Time</th>
          <th scope="col">Staff</th>
          <th scope="col">Action</th>
          <th scope="col">Target</th>
        </tr>
      </thead>
      <tbody>
        {entries.map((entry) => (
          <tr key={entry.id}>
            <td className={styles.nowrap}>{entry.time}</td>
            <td>
              <span className={styles.actor}>
                <Avatar
                  initials={entry.actor === 'System' ? 'SY' : initialsOf(entry.actor)}
                  size={24}
                  tone={entry.actor === 'System' ? 'brass' : 'neutral'}
                />
                {entry.actor}
              </span>
            </td>
            <td>{entry.action}</td>
            <td className={styles.target}>{entry.target}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

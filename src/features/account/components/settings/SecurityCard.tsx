import clsx from 'clsx';
import { useState } from 'react';

import { Icon } from '@/components/icons';
import { Alert, Button, Checkbox, StatusChip, Switch, TextField } from '@/components/ui';
import type { SecuritySettings, SignedInDevice } from '@/types/accountSettings';

import { passwordErrors, passwordRules, type PasswordForm } from '../../lib/accountSettingsForms';
import styles from './SecurityCard.module.css';
import card from './SettingsCard.module.css';

const EMPTY_PASSWORD_FORM: PasswordForm = { current: '', next: '', confirm: '' };

interface SecurityCardProps {
  security: SecuritySettings;
  devices: SignedInDevice[];
  isSaving: boolean;
  /** Resolves an error message for the current-password field, or `null` once changed. */
  onChangePassword: (form: PasswordForm) => Promise<string | null>;
  onToggleTwoStep: () => void;
  onSignOutDevice: (device: SignedInDevice) => void;
  onSignOutOthers: () => void;
}

export function SecurityCard({
  security,
  devices,
  isSaving,
  onChangePassword,
  onToggleTwoStep,
  onSignOutDevice,
  onSignOutOthers,
}: SecurityCardProps) {
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const otherDeviceCount = devices.filter((device) => !device.isCurrent).length;

  return (
    <>
      <div className={card.card}>
        <div className={card.row}>
          <span className={card.rowText}>
            <span className={card.rowTitle}>Password</span>
            <span className={card.rowDetail}>{security.passwordNote}</span>
          </span>
          {!isChangingPassword && (
            <Button variant="quiet" onClick={() => setIsChangingPassword(true)}>
              Change password
            </Button>
          )}
        </div>
        {isChangingPassword && (
          <ChangePasswordForm
            isSaving={isSaving}
            onCancel={() => setIsChangingPassword(false)}
            onSubmit={async (form) => {
              const error = await onChangePassword(form);
              if (!error) setIsChangingPassword(false);
              return error;
            }}
          />
        )}
        <div className={card.row}>
          <Switch
            className={styles.switch}
            placement="end"
            label="Two-step verification"
            description={
              security.isTwoStepOn
                ? `On · codes from your authenticator app. ${security.backupCodesLeft} backup codes left.`
                : 'Off · we’ll only ask for your password.'
            }
            checked={security.isTwoStepOn}
            onChange={onToggleTwoStep}
          />
        </div>
        {!security.isTwoStepOn && (
          <div className={clsx(styles.warning, card.attached)}>
            <Alert tone="danger" role="alert" icon="alertTriangle">
              Without a second step, anyone with your password can see your trips and use saved cards. We
              recommend keeping it on.
            </Alert>
          </div>
        )}
      </div>

      <div className={card.card}>
        <div className={card.row}>
          <span className={card.rowText}>
            <span className={card.rowTitle}>Where you’re signed in</span>
            <span className={card.rowDetail}>
              {devices.length === 1 ? 'Only this device' : `${devices.length} devices · last 30 days`}
            </span>
          </span>
          <Button
            variant="ghost"
            disabled={otherDeviceCount === 0}
            aria-haspopup="dialog"
            onClick={onSignOutOthers}
          >
            Sign out of other devices
          </Button>
        </div>
        {devices.map((device) => (
          <div key={device.id} className={card.row}>
            <span className={card.rowIcon} aria-hidden="true">
              <Icon name={device.kind === 'phone' ? 'smartphone' : 'laptop'} size={20} strokeWidth={1.6} />
            </span>
            <span className={card.rowText}>
              <span className={card.rowTitle}>
                {device.name}
                {device.isCurrent && (
                  <StatusChip tone="success" size="compact" hideDot>
                    This device
                  </StatusChip>
                )}
              </span>
              <span className={card.rowDetail}>{device.detail}</span>
            </span>
            {!device.isCurrent && (
              <Button
                variant="ghost"
                size="small"
                aria-label={`Sign out ${device.name}`}
                aria-haspopup="dialog"
                onClick={() => onSignOutDevice(device)}
              >
                Sign out
              </Button>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

interface ChangePasswordFormProps {
  isSaving: boolean;
  onCancel: () => void;
  onSubmit: (form: PasswordForm) => Promise<string | null>;
}

function ChangePasswordForm({ isSaving, onCancel, onSubmit }: ChangePasswordFormProps) {
  const [form, setForm] = useState(EMPTY_PASSWORD_FORM);
  const [hasTried, setHasTried] = useState(false);
  const [isShown, setIsShown] = useState(false);
  const [serverError, setServerError] = useState<string>();
  const errors = passwordErrors(form, hasTried);
  const rules = passwordRules(form);
  const inputType = isShown ? 'text' : 'password';
  const update = (patch: Partial<PasswordForm>) => {
    setForm((previous) => ({ ...previous, ...patch }));
    if ('current' in patch) setServerError(undefined);
  };

  const handleSubmit = async () => {
    if (Object.keys(passwordErrors(form, true)).length > 0) {
      setHasTried(true);
      return;
    }
    setServerError((await onSubmit(form)) ?? undefined);
  };

  return (
    <form
      aria-label="Change password"
      noValidate
      className={clsx(styles.passwordForm, card.attached)}
      onSubmit={(event) => {
        event.preventDefault();
        void handleSubmit();
      }}
    >
      <TextField
        label="Current password"
        required
        type={inputType}
        autoComplete="current-password"
        value={form.current}
        error={errors.current ?? serverError}
        onChange={(event) => update({ current: event.target.value })}
      />
      <div className={styles.passwordGrid}>
        <TextField
          label="New password"
          required
          type={inputType}
          autoComplete="new-password"
          aria-describedby="password-rules"
          value={form.next}
          error={errors.next}
          onChange={(event) => update({ next: event.target.value })}
        />
        <TextField
          label="Confirm new password"
          required
          type={inputType}
          autoComplete="new-password"
          value={form.confirm}
          error={errors.confirm}
          onChange={(event) => update({ confirm: event.target.value })}
        />
      </div>
      <ul id="password-rules" className={styles.rules}>
        {rules.map((rule) => (
          <li key={rule.label} className={rule.isMet ? styles.ruleMet : styles.rule}>
            <Icon name={rule.isMet ? 'check' : 'dot'} size={14} strokeWidth={2.4} />
            <span>
              {rule.label}
              <span className="visually-hidden">{rule.isMet ? ' — met' : ' — not met yet'}</span>
            </span>
          </li>
        ))}
      </ul>
      <div className={styles.passwordFooter}>
        <Checkbox
          label="Show passwords"
          checked={isShown}
          onChange={(event) => setIsShown(event.target.checked)}
        />
        <span className={card.formActions}>
          <Button variant="quiet" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={isSaving}>
            Update password
          </Button>
        </span>
      </div>
    </form>
  );
}

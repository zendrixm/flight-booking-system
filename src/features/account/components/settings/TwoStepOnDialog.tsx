import { useState } from 'react';
import { Link } from 'react-router';

import { paths } from '@/app/paths';
import { Button, Dialog, TextField } from '@/components/ui';
import { formatMonthName } from '@/lib/date';

import styles from './SettingsDialogs.module.css';

interface TwoStepOnDialogProps {
  authenticatorSetUpOn: string;
  backupCodesLeft: number;
  isSaving: boolean;
  /** Resolves an error message, or `null` once two-step verification is on. */
  onConfirm: (code: string) => Promise<string | null>;
  onClose: () => void;
}

export function TwoStepOnDialog({
  authenticatorSetUpOn,
  backupCodesLeft,
  isSaving,
  onConfirm,
  onClose,
}: TwoStepOnDialogProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string>();

  const submit = async () => {
    if (code.replace(/\D/g, '').length !== 6) {
      setError('Enter all 6 digits. Codes change every 30 seconds — use the one showing now.');
      return;
    }
    setError((await onConfirm(code)) ?? undefined);
  };

  return (
    <Dialog
      open
      onClose={onClose}
      size="small"
      title="Turn on two-step verification"
      description={`Open the authenticator app you set up in ${formatMonthName(authenticatorSetUpOn)} and enter the 6-digit code for Vela.`}
      footer={
        <>
          <Button variant="quiet" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" loading={isSaving} onClick={submit}>
            Turn on
          </Button>
        </>
      }
    >
      <TextField
        label="Code from your authenticator app"
        required
        inputMode="numeric"
        autoComplete="one-time-code"
        placeholder="123 456"
        inputClassName={styles.code}
        value={code}
        error={error}
        onChange={(event) => {
          setCode(event.target.value.replace(/[^\d ]/g, '').slice(0, 7));
          setError(undefined);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') void submit();
        }}
      />
      <p className={styles.note}>
        Lost your phone? Use one of your {backupCodesLeft} backup codes instead, or{' '}
        <Link to={`${paths.help}#chat`}>ask us to reset it</Link>.
      </p>
    </Dialog>
  );
}

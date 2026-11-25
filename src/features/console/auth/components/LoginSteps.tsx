import { useState, type FormEvent } from 'react';

import { Icon } from '@/components/icons';
import {
  Alert,
  Button,
  Checkbox,
  CODE_LENGTH,
  CodeInput,
  OrDivider,
  PasswordField,
  TextField,
} from '@/components/ui';

import { recoveryKeyHint } from '../lib/staffLoginForms';
import { LoginHeading } from './LoginHeading';
import styles from './LoginSteps.module.css';

const preventSubmit = (handler: () => void) => (event: FormEvent) => {
  event.preventDefault();
  handler();
};

/* ---------- Email and password ---------- */

interface CredentialsStepProps {
  email: string;
  password: string;
  emailError?: string;
  passwordError?: string;
  isBusy: boolean;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onSubmit: () => void;
  onSso: () => void;
  onForgotPassword: () => void;
}

export function CredentialsStep(props: CredentialsStepProps) {
  return (
    <form className={styles.step} noValidate onSubmit={preventSubmit(props.onSubmit)}>
      <LoginHeading title="Staff sign-in">For Vela employees and approved partners only.</LoginHeading>
      <Button variant="primary" iconStart="building" fullWidth onClick={props.onSso}>
        Continue with company SSO
      </Button>
      <OrDivider label="or with your work email" />
      <TextField
        label="Work email"
        required
        type="email"
        autoComplete="username"
        value={props.email}
        error={props.emailError}
        onChange={(event) => props.onEmailChange(event.target.value)}
      />
      <div className={styles.passwordBlock}>
        <button type="button" className={styles.forgotLink} onClick={props.onForgotPassword}>
          Forgot password?
        </button>
        <PasswordField
          label="Password"
          required
          autoComplete="current-password"
          placeholder="••••••••••••"
          value={props.password}
          error={props.passwordError}
          onChange={(event) => props.onPasswordChange(event.target.value)}
        />
      </div>
      <Button type="submit" variant="secondary" fullWidth disabled={!props.password} loading={props.isBusy}>
        Sign in
      </Button>
    </form>
  );
}

/* ---------- Company SSO ---------- */

export function SsoStep({ onCancel }: { onCancel: () => void }) {
  return (
    <div className={styles.step} role="status" aria-live="polite">
      <LoginHeading title="Redirecting to SSO" badge={{ icon: 'building', tone: 'attention' }}>
        Taking you to Vela single sign-on. Sign in there with your company account — 2-step verification
        happens on that page, then you’ll land on the dashboard.
      </LoginHeading>
      <span className={styles.progress} aria-hidden="true">
        <span className={styles.progressBar} />
      </span>
      <div className={styles.note}>
        <span className={styles.noteTitle}>Nothing happening after a few seconds?</span>
        <span>Pop-up blockers can stop the redirect. Allow pop-ups for vela.travel, then try again.</span>
      </div>
      <Button variant="quiet" fullWidth onClick={onCancel}>
        Cancel and use a password
      </Button>
    </div>
  );
}

/* ---------- Locked ---------- */

interface LockedStepProps {
  email: string;
  onResetPassword: () => void;
  onBack: () => void;
}

export function LockedStep({ email, onResetPassword, onBack }: LockedStepProps) {
  return (
    <div className={styles.step}>
      <LoginHeading
        title="Account locked for 15 minutes"
        badge={{ icon: 'lock', tone: 'danger' }}
        role="alert"
      >
        Too many incorrect attempts for {email}. You can try again at 01:14 PHT, or reset your password now to
        sign in straight away.
      </LoginHeading>
      <Alert tone="attention" icon="mail">
        We emailed {email} about these attempts. If they weren’t you, reset your password now and tell your
        workspace admin.
      </Alert>
      <Button variant="primary" fullWidth onClick={onResetPassword}>
        Reset password
      </Button>
      <Button variant="quiet" fullWidth onClick={onBack}>
        Back to sign-in
      </Button>
    </div>
  );
}

/* ---------- Forgot password ---------- */

interface ForgotStepProps {
  email: string;
  error?: string;
  isBusy: boolean;
  onEmailChange: (email: string) => void;
  onSubmit: () => void;
  onBack: () => void;
}

export function ForgotStep({ email, error, isBusy, onEmailChange, onSubmit, onBack }: ForgotStepProps) {
  return (
    <form className={styles.step} noValidate onSubmit={preventSubmit(onSubmit)}>
      <LoginHeading title="Reset your password" badge={{ icon: 'key', tone: 'attention' }}>
        Enter your work email and we’ll send a reset link. For your security it works once and expires in 30
        minutes.
      </LoginHeading>
      <TextField
        label="Work email"
        required
        type="email"
        autoComplete="username"
        placeholder="name@vela.travel"
        value={email}
        error={error}
        onChange={(event) => onEmailChange(event.target.value)}
      />
      <Button type="submit" variant="primary" fullWidth loading={isBusy}>
        Send reset link
      </Button>
      <div className={styles.footnote}>
        <span>Signing in with company SSO? Your password is managed by IT, not Vela Console.</span>
        <button type="button" className={styles.textButton} onClick={onBack}>
          <Icon name="arrowLeft" size={16} strokeWidth={1.8} />
          Back to sign-in
        </button>
      </div>
    </form>
  );
}

interface ResetSentStepProps {
  email: string;
  expiresAt: string;
  wasResent: boolean;
  onResend: () => void;
  onUseDifferentEmail: () => void;
  onBack: () => void;
}

export function ResetSentStep({
  email,
  expiresAt,
  wasResent,
  onResend,
  onUseDifferentEmail,
  onBack,
}: ResetSentStepProps) {
  return (
    <div className={styles.step}>
      <LoginHeading title="Check your email" badge={{ icon: 'mail', tone: 'success' }} role="status">
        If {email} has a Console account, a reset link is on its way. It expires at {expiresAt}.
      </LoginHeading>
      {wasResent && (
        <span role="status" className={styles.resent}>
          <Icon name="check" size={16} strokeWidth={2} />
          Sent again · the earlier link no longer works
        </span>
      )}
      <Button variant="primary" fullWidth onClick={onBack}>
        Back to sign-in
      </Button>
      <div className={styles.links}>
        <button type="button" className={styles.textButton} disabled={wasResent} onClick={onResend}>
          Resend link
        </button>
        <button type="button" className={styles.textButton} onClick={onUseDifferentEmail}>
          Use a different email
        </button>
      </div>
    </div>
  );
}

/* ---------- Authenticator code ---------- */

interface CodeStepProps {
  email: string;
  code: string;
  error?: string;
  isBusy: boolean;
  onCodeChange: (code: string) => void;
  onSubmit: (trustDevice: boolean) => void;
  onUseDifferentAccount: () => void;
  onUseRecoveryKey: () => void;
}

export function CodeStep(props: CodeStepProps) {
  const [trustDevice, setTrustDevice] = useState(true);
  return (
    <form className={styles.step} noValidate onSubmit={preventSubmit(() => props.onSubmit(trustDevice))}>
      <LoginHeading title="Verify it’s you" badge={{ icon: 'smartphone', tone: 'attention' }}>
        Enter the 6-digit code from your authenticator app for {props.email}.
      </LoginHeading>
      <div className={styles.codeBlock}>
        <CodeInput
          label="Verification code"
          value={props.code}
          isInvalid={Boolean(props.error)}
          describedBy={props.error ? 'staff-code-error' : undefined}
          onChange={props.onCodeChange}
        />
        {props.error && (
          <span id="staff-code-error" role="alert" className={styles.error}>
            <Icon name="alertCircle" size={16} strokeWidth={1.8} />
            {props.error}
          </span>
        )}
      </div>
      <Checkbox
        label="Trust this device for 12 hours"
        checked={trustDevice}
        onChange={(event) => setTrustDevice(event.target.checked)}
      />
      <Button
        type="submit"
        variant="primary"
        fullWidth
        disabled={props.code.length < CODE_LENGTH}
        loading={props.isBusy}
      >
        Verify and continue
      </Button>
      <div className={styles.links}>
        <button type="button" className={styles.textButton} onClick={props.onUseDifferentAccount}>
          Use a different account
        </button>
        <button type="button" className={styles.textButton} onClick={props.onUseRecoveryKey}>
          Use a recovery key
        </button>
      </div>
    </form>
  );
}

/* ---------- Recovery key ---------- */

interface RecoveryStepProps {
  email: string;
  recoveryKey: string;
  error?: string;
  isBusy: boolean;
  onKeyChange: (key: string) => void;
  onSubmit: () => void;
  onBack: () => void;
}

export function RecoveryStep({
  email,
  recoveryKey,
  error,
  isBusy,
  onKeyChange,
  onSubmit,
  onBack,
}: RecoveryStepProps) {
  return (
    <form className={styles.step} noValidate onSubmit={preventSubmit(onSubmit)}>
      <LoginHeading title="Use a recovery key" badge={{ icon: 'key', tone: 'attention' }}>
        Enter one of the 12-character keys you saved when you set up 2-step verification for {email}. Each key
        works once.
      </LoginHeading>
      <TextField
        label="Recovery key"
        required
        autoComplete="one-time-code"
        autoCapitalize="characters"
        spellCheck={false}
        maxLength={14}
        placeholder="XXXX-XXXX-XXXX"
        inputClassName={styles.recoveryInput}
        value={recoveryKey}
        error={error}
        helpText={recoveryKeyHint(recoveryKey)}
        onChange={(event) => onKeyChange(event.target.value)}
      />
      <Button type="submit" variant="primary" fullWidth loading={isBusy}>
        Verify recovery key
      </Button>
      <button type="button" className={styles.textButton} onClick={onBack}>
        <Icon name="arrowLeft" size={16} strokeWidth={1.8} />
        Back to authenticator code
      </button>
    </form>
  );
}

interface RecoveredStepProps {
  maskedKey: string;
  unusedKeysLeft: number;
  onContinue: () => void;
}

export function RecoveredStep({ maskedKey, unusedKeysLeft, onContinue }: RecoveredStepProps) {
  return (
    <div className={styles.step}>
      <LoginHeading title="You’re signed in" badge={{ icon: 'check', tone: 'success' }} role="status">
        Recovery key {maskedKey} has been used and can’t be used again. You have {unusedKeysLeft} unused keys
        left.
      </LoginHeading>
      <Alert tone="attention" icon="smartphone">
        Lost your phone? Set up your authenticator again in Settings › Security. Your workspace admin has been
        notified of this sign-in.
      </Alert>
      <Button variant="primary" fullWidth iconEnd="arrowRight" onClick={onContinue}>
        Continue to the console
      </Button>
    </div>
  );
}

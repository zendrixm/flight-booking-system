import { useState, type ReactNode } from 'react';
import { Link } from 'react-router';

import { paths } from '@/app/paths';
import { Icon } from '@/components/icons';
import {
  Alert,
  Button,
  Checkbox,
  CODE_LENGTH,
  CodeInput,
  LinkButton,
  PasswordField,
  TextField,
} from '@/components/ui';
import { useNow } from '@/hooks';
import { isValidEmail } from '@/lib/validation';

import { formatCountdown } from '../../hooks/useResendTimer';
import styles from './SignInSteps.module.css';

// ---------- Email ----------

interface EmailStepProps {
  email: string;
  /** Shown when someone asked for a code before entering an email. */
  needsEmailForCode: boolean;
  onEmailChange: (email: string) => void;
  onContinue: () => void;
}

export function EmailStep({ email, needsEmailForCode, onEmailChange, onContinue }: EmailStepProps) {
  const isValid = isValidEmail(email.trim());
  const error = needsEmailForCode
    ? 'Enter your email first so we know where to send the code.'
    : email.trim() && !isValid
      ? 'Enter your full email address, like name@example.com.'
      : undefined;

  return (
    <form
      className={styles.step}
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        if (isValid) onContinue();
      }}
    >
      <TextField
        label="Email"
        required
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={email}
        error={error}
        onChange={(event) => onEmailChange(event.target.value)}
      />
      <Button type="submit" variant="primary" size="large" fullWidth disabled={!isValid}>
        Continue
      </Button>
    </form>
  );
}

// ---------- Password ----------

interface PasswordStepProps {
  email: string;
  attemptsLeft: number | null;
  isSubmitting: boolean;
  onChangeEmail: () => void;
  onForgotPassword: () => void;
  onSubmit: (password: string, keepSignedIn: boolean) => void;
}

export function PasswordStep({
  email,
  attemptsLeft,
  isSubmitting,
  onChangeEmail,
  onForgotPassword,
  onSubmit,
}: PasswordStepProps) {
  const [password, setPassword] = useState('');
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [hasEditedSinceError, setHasEditedSinceError] = useState(false);
  const error =
    attemptsLeft !== null && !hasEditedSinceError
      ? `That password doesn’t match. ${attemptsLeft} ${attemptsLeft === 1 ? 'attempt' : 'attempts'} left before we pause sign-in for 15 minutes.`
      : undefined;

  return (
    <form
      className={styles.step}
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        if (!password) return;
        setHasEditedSinceError(false);
        onSubmit(password, keepSignedIn);
      }}
    >
      <div className={styles.identity}>
        <span className={styles.identityText}>
          <span className={styles.identityLabel}>Signing in as</span>
          <span className={styles.identityEmail}>{email}</span>
        </span>
        <button type="button" className={styles.textButton} onClick={onChangeEmail}>
          Change
        </button>
      </div>
      <PasswordField
        label="Password"
        required
        autoComplete="current-password"
        // eslint-disable-next-line jsx-a11y/no-autofocus -- the password step replaces the email step, so focus follows it
        autoFocus
        hint={
          <button type="button" className={styles.smallTextButton} onClick={onForgotPassword}>
            Forgot password?
          </button>
        }
        value={password}
        error={error}
        onChange={(event) => {
          setPassword(event.target.value);
          setHasEditedSinceError(true);
        }}
      />
      <Checkbox
        label="Keep me signed in on this device"
        checked={keepSignedIn}
        onChange={(event) => setKeepSignedIn(event.target.checked)}
      />
      <Button
        type="submit"
        variant="primary"
        size="large"
        fullWidth
        disabled={!password}
        loading={isSubmitting}
      >
        Sign in
      </Button>
    </form>
  );
}

// ---------- Forgot password ----------

interface ResetStepProps {
  initialEmail: string;
  isSubmitting: boolean;
  onSend: (email: string) => void;
  onBack: () => void;
}

export function ResetStep({ initialEmail, isSubmitting, onSend, onBack }: ResetStepProps) {
  const [email, setEmail] = useState(initialEmail);
  const isValid = isValidEmail(email.trim());

  return (
    <form
      className={styles.step}
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        if (isValid) onSend(email.trim());
      }}
    >
      <TextField
        label="Email"
        required
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <Button
        type="submit"
        variant="primary"
        size="large"
        fullWidth
        disabled={!isValid}
        loading={isSubmitting}
      >
        Send reset link
      </Button>
      <Button variant="ghost" iconStart="arrowLeft" className={styles.centered} onClick={onBack}>
        Back to sign in
      </Button>
    </form>
  );
}

interface ResetSentStepProps {
  email: string;
  secondsUntilResend: number;
  resentCount: number;
  onResend: () => void;
  onBack: () => void;
  onUseDifferentEmail: () => void;
}

export function ResetSentStep({
  email,
  secondsUntilResend,
  resentCount,
  onResend,
  onBack,
  onUseDifferentEmail,
}: ResetSentStepProps) {
  return (
    <div className={styles.step}>
      <ol className={styles.instructions}>
        <li>Open the email from Vela on this device.</li>
        <li>
          Tap <strong>Choose a new password</strong>.
        </li>
        <li>Sign in with your new password — your trips stay as they are.</li>
      </ol>
      <div className={styles.resendRow}>
        <span className={styles.muted}>Didn’t get it? Check spam first.</span>
        <ResendButton label="Resend link" secondsLeft={secondsUntilResend} onResend={onResend} />
      </div>
      {resentCount > 0 && <SentNotice>New link sent to {email}</SentNotice>}
      <Button variant="quiet" size="large" fullWidth onClick={onBack}>
        Back to sign in
      </Button>
      <Button variant="ghost" className={styles.centered} onClick={onUseDifferentEmail}>
        Use a different email
      </Button>
    </div>
  );
}

// ---------- One-time code ----------

interface CodeStepProps {
  email: string;
  isWrong: boolean;
  isSubmitting: boolean;
  secondsUntilResend: number;
  resentCount: number;
  onVerify: (code: string) => void;
  onCodeEdited: () => void;
  onResend: () => void;
  onUsePassword: () => void;
}

export function CodeStep({
  email,
  isWrong,
  isSubmitting,
  secondsUntilResend,
  resentCount,
  onVerify,
  onCodeEdited,
  onResend,
  onUsePassword,
}: CodeStepProps) {
  const [code, setCode] = useState('');
  const isComplete = code.length === CODE_LENGTH;

  return (
    <form
      className={styles.step}
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        if (isComplete && !isWrong) onVerify(code);
      }}
    >
      <CodeInput
        label="One-time code"
        value={code}
        isInvalid={isWrong}
        describedBy={isWrong ? 'code-error' : undefined}
        onChange={(next) => {
          setCode(next);
          onCodeEdited();
        }}
      />
      {isWrong && (
        <p id="code-error" role="alert" className={styles.error}>
          <Icon name="alertCircle" size={16} strokeWidth={1.8} />
          That code doesn’t match. Use the code in the newest email from Vela — older codes stop working when
          you ask for a new one.
        </p>
      )}
      <Button
        type="submit"
        variant="primary"
        size="large"
        fullWidth
        disabled={!isComplete || isWrong}
        loading={isSubmitting}
      >
        Verify and sign in
      </Button>
      {resentCount > 0 && <SentNotice>New code sent to {email}</SentNotice>}
      <div className={styles.resendRow}>
        <button type="button" className={styles.textButton} onClick={onUsePassword}>
          Use my password instead
        </button>
        <ResendButton
          label="Resend code"
          secondsLeft={secondsUntilResend}
          onResend={() => {
            setCode('');
            onResend();
          }}
        />
      </div>
    </form>
  );
}

// ---------- Locked ----------

interface LockedStepProps {
  unlocksAt: number;
  onResetPassword: () => void;
  onUseCode: () => void;
}

export function LockedStep({ unlocksAt, onResetPassword, onUseCode }: LockedStepProps) {
  const secondsLeft = Math.max(0, Math.ceil((unlocksAt - useNow(1000)) / 1000));
  return (
    <div className={styles.step}>
      <Alert
        tone="danger"
        role="alert"
        icon="clock"
        title={`Try your password again in ${formatCountdown(secondsLeft)}`}
      >
        <span className={styles.alertBody}>
          Your trips and saved cards are safe. If these attempts weren’t you, reset your password now.
        </span>
      </Alert>
      <Button variant="primary" size="large" fullWidth onClick={onResetPassword}>
        Reset my password
      </Button>
      <Button variant="quiet" size="large" fullWidth iconStart="mail" onClick={onUseCode}>
        Sign in with a one-time code instead
      </Button>
      <Link to={`${paths.help}#chat`} className={styles.centeredLink}>
        Contact support
      </Link>
    </div>
  );
}

// ---------- Signed in ----------

export function SignedInStep({ continueTo }: { continueTo: string }) {
  return (
    <div className={styles.stepTight}>
      <LinkButton to={continueTo} variant="primary" size="large" fullWidth iconEnd="arrowRight">
        {continueTo === paths.trips ? 'Go to my trips' : 'Continue'}
      </LinkButton>
      <LinkButton to={paths.home} variant="quiet" size="large" fullWidth>
        Search flights
      </LinkButton>
    </div>
  );
}

// ---------- Shared bits ----------

function ResendButton({
  label,
  secondsLeft,
  onResend,
}: {
  label: string;
  secondsLeft: number;
  onResend: () => void;
}) {
  return (
    <button type="button" className={styles.resend} disabled={secondsLeft > 0} onClick={onResend}>
      {secondsLeft > 0 ? `${label} in ${formatCountdown(secondsLeft)}` : label}
    </button>
  );
}

function SentNotice({ children }: { children: ReactNode }) {
  return (
    <p role="status" className={styles.sent}>
      <Icon name="check" size={16} strokeWidth={2.2} />
      {children}
    </p>
  );
}

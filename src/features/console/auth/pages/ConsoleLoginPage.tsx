import { useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

import { paths } from '@/app/paths';
import { useStaffSession } from '@/app/providers';
import { Logo } from '@/components/ui';
import { useDocumentTitle } from '@/hooks';
import { safeRedirect } from '@/lib/safeRedirect';
import { DEMO_STAFF_MEMBER, DEMO_STAFF_SESSION } from '@/mocks/console/staff';
import * as staffAuth from '@/services/console/staffAuthService';

import {
  CodeStep,
  CredentialsStep,
  ForgotStep,
  LockedStep,
  RecoveredStep,
  RecoveryStep,
  ResetSentStep,
  SsoStep,
} from '../components/LoginSteps';
import {
  attemptsLeftLabel,
  formatRecoveryKey,
  maskRecoveryKey,
  recoveryKeyError,
  resetEmailError,
  workEmailError,
} from '../lib/staffLoginForms';
import styles from './ConsoleLoginPage.module.css';

type LoginStep =
  | 'credentials'
  | 'sso'
  | 'locked'
  | 'forgot'
  | 'resetSent'
  | 'code'
  | 'recovery'
  | 'recovered';

/** Vela Console sign-in: company SSO, or work email + password + authenticator code. */
export function ConsoleLoginPage() {
  useDocumentTitle('Staff sign-in · Vela Console');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn } = useStaffSession();
  const destination = safeRedirect(searchParams.get('redirect'), paths.console.dashboard);

  const [step, setStep] = useState<LoginStep>('credentials');
  const [email, setEmail] = useState(DEMO_STAFF_MEMBER.email);
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [recoveryKey, setRecoveryKey] = useState('');
  const [resetEmail, setResetEmail] = useState(DEMO_STAFF_MEMBER.email);
  const [resetExpiresAt, setResetExpiresAt] = useState('');
  const [wasResent, setWasResent] = useState(false);
  const [unusedKeysLeft, setUnusedKeysLeft] = useState(0);
  const [errors, setErrors] = useState<
    Partial<Record<'email' | 'password' | 'code' | 'recoveryKey' | 'resetEmail', string>>
  >({});
  const [isBusy, setIsBusy] = useState(false);

  const goTo = (next: LoginStep) => {
    setErrors({});
    setStep(next);
  };

  const enterConsole = () => {
    signIn();
    navigate(destination, { replace: true });
  };

  const run = async (task: () => Promise<void>) => {
    setIsBusy(true);
    try {
      await task();
    } finally {
      setIsBusy(false);
    }
  };

  const submitCredentials = () => {
    const emailError = workEmailError(email);
    if (emailError) return setErrors({ email: emailError });
    void run(async () => {
      const result = await staffAuth.signInStaff(email, password);
      if (result.status === 'needsCode') {
        setCode('');
        goTo('code');
      } else if (result.status === 'locked') {
        goTo('locked');
      } else {
        setErrors({
          password: `The email or password is incorrect. ${attemptsLeftLabel(result.attemptsLeft)} before the account locks for 15 minutes.`,
        });
      }
    });
  };

  const submitCode = () =>
    run(async () => {
      const result = await staffAuth.verifyStaffCode(code);
      if (result.status === 'signedIn') enterConsole();
      else if (result.status === 'locked') goTo('locked');
      else {
        setErrors({
          code: `That code didn’t work — codes refresh every 30 seconds, so enter the newest one. ${attemptsLeftLabel(result.attemptsLeft)}.`,
        });
      }
    });

  const submitRecoveryKey = () => {
    const keyError = recoveryKeyError(recoveryKey);
    if (keyError) return setErrors({ recoveryKey: keyError });
    void run(async () => {
      const result = await staffAuth.verifyRecoveryKey(recoveryKey);
      if (result.status === 'unknownKey') {
        setErrors({
          recoveryKey: 'That key doesn’t match any unused key on your account. Each key works only once.',
        });
        return;
      }
      signIn();
      setUnusedKeysLeft(result.unusedKeysLeft);
      goTo('recovered');
    });
  };

  const sendReset = (isResend = false) => {
    const emailError = resetEmailError(resetEmail);
    if (emailError) return setErrors({ resetEmail: emailError });
    void run(async () => {
      const { expiresAt } = await staffAuth.sendStaffPasswordReset(resetEmail.trim());
      setResetExpiresAt(expiresAt);
      setWasResent(isResend);
      goTo('resetSent');
    });
  };

  /** Bumped on cancel, so a redirect that finishes after "Cancel" is ignored. */
  const ssoAttempt = useRef(0);
  const startSso = () => {
    goTo('sso');
    const attempt = ++ssoAttempt.current;
    void staffAuth.startStaffSso().then(() => {
      if (ssoAttempt.current === attempt) enterConsole();
    });
  };
  const cancelSso = () => {
    ssoAttempt.current += 1;
    goTo('credentials');
  };

  const openForgot = () => {
    setResetEmail(email || DEMO_STAFF_MEMBER.email);
    goTo('forgot');
  };

  const renderStep = () => {
    switch (step) {
      case 'sso':
        return <SsoStep onCancel={cancelSso} />;
      case 'locked':
        return <LockedStep email={email} onResetPassword={openForgot} onBack={() => goTo('credentials')} />;
      case 'forgot':
        return (
          <ForgotStep
            email={resetEmail}
            error={errors.resetEmail}
            isBusy={isBusy}
            onEmailChange={(value) => {
              setResetEmail(value);
              setErrors({});
            }}
            onSubmit={() => sendReset()}
            onBack={() => goTo('credentials')}
          />
        );
      case 'resetSent':
        return (
          <ResetSentStep
            email={resetEmail.trim()}
            expiresAt={resetExpiresAt}
            wasResent={wasResent}
            onResend={() => sendReset(true)}
            onUseDifferentEmail={() => goTo('forgot')}
            onBack={() => goTo('credentials')}
          />
        );
      case 'code':
        return (
          <CodeStep
            email={email.trim()}
            code={code}
            error={errors.code}
            isBusy={isBusy}
            onCodeChange={(value) => {
              setCode(value);
              setErrors({});
            }}
            onSubmit={() => void submitCode()}
            onUseDifferentAccount={() => goTo('credentials')}
            onUseRecoveryKey={() => goTo('recovery')}
          />
        );
      case 'recovery':
        return (
          <RecoveryStep
            email={email.trim()}
            recoveryKey={recoveryKey}
            error={errors.recoveryKey}
            isBusy={isBusy}
            onKeyChange={(value) => {
              setRecoveryKey(formatRecoveryKey(value));
              setErrors({});
            }}
            onSubmit={submitRecoveryKey}
            onBack={() => goTo('code')}
          />
        );
      case 'recovered':
        return (
          <RecoveredStep
            maskedKey={maskRecoveryKey(recoveryKey)}
            unusedKeysLeft={unusedKeysLeft}
            onContinue={() => navigate(destination, { replace: true })}
          />
        );
      default:
        return (
          <CredentialsStep
            email={email}
            password={password}
            emailError={errors.email}
            passwordError={errors.password}
            isBusy={isBusy}
            onEmailChange={(value) => {
              setEmail(value);
              setErrors({});
            }}
            onPasswordChange={(value) => {
              setPassword(value);
              setErrors({});
            }}
            onSubmit={submitCredentials}
            onSso={startSso}
            onForgotPassword={openForgot}
          />
        );
    }
  };

  return (
    <div className={styles.page} data-density="compact">
      <svg className={styles.orbits} viewBox="0 0 1100 1100" aria-hidden="true">
        <circle cx="550" cy="550" r="520" />
        <ellipse cx="550" cy="550" rx="400" ry="520" />
        <ellipse cx="550" cy="550" rx="240" ry="520" />
        <ellipse cx="550" cy="550" rx="80" ry="520" />
        <ellipse cx="550" cy="330" rx="470" ry="80" />
        <ellipse cx="550" cy="550" rx="520" ry="96" />
        <ellipse cx="550" cy="770" rx="470" ry="80" />
      </svg>
      <Logo
        to={paths.console.login}
        label="Vela Console"
        size={30}
        product="Console"
        className={styles.logo}
      />
      <main className={styles.card}>{renderStep()}</main>
      <p className={styles.notice}>
        Access is logged and monitored. Signing in from {DEMO_STAFF_SESSION.ipAddress} ·{' '}
        {DEMO_STAFF_SESSION.location}. Lost access? Contact your workspace admin.
      </p>
    </div>
  );
}

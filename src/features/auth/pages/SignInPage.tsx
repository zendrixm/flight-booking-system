import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router';

import { paths } from '@/app/paths';
import { useSession } from '@/app/providers';
import { Button, OrDivider } from '@/components/ui';
import { useDocumentTitle } from '@/hooks';
import { safeRedirect } from '@/lib/safeRedirect';
import { isValidEmail } from '@/lib/validation';
import * as auth from '@/services/authService';

import { AuthHeading, type AuthBadgeTone } from '../components/AuthHeading';
import { AuthLayout, type AuthPerk } from '../components/AuthLayout';
import { AuthTabs } from '../components/AuthTabs';
import {
  CodeStep,
  EmailStep,
  LockedStep,
  PasswordStep,
  ResetSentStep,
  ResetStep,
  SignedInStep,
} from '../components/signIn/SignInSteps';
import { useResendTimer } from '../hooks/useResendTimer';
import { readRememberedEmail, rememberEmail } from '../lib/rememberedEmail';
import styles from './AuthPages.module.css';

const PERKS: AuthPerk[] = [
  { icon: 'check', title: 'Travelers and passports saved securely for faster checkout' },
  { icon: 'check', title: 'Price alerts on the routes you watch' },
  { icon: 'check', title: 'Every trip, receipt and boarding pass in one place' },
];

type SignInStep = 'email' | 'password' | 'reset' | 'resetSent' | 'code' | 'locked' | 'signedIn';

/** `#reset` and `#code` open those steps directly, e.g. from emails or the locked screen. */
function initialStep(hash: string): SignInStep {
  if (hash === '#reset') return 'reset';
  if (hash === '#code') return 'code';
  return 'email';
}

export function SignInPage() {
  useDocumentTitle('Sign in');
  const navigate = useNavigate();
  const { hash } = useLocation();
  const [searchParams] = useSearchParams();
  const { isSignedIn, signIn, customer } = useSession();
  const continueTo = safeRedirect(searchParams.get('redirect'), paths.trips);

  const [wasSignedInOnArrival] = useState(isSignedIn);
  const [step, setStep] = useState<SignInStep>(() => initialStep(hash));
  const [email, setEmail] = useState(() => readRememberedEmail() || '');
  const [resetEmail, setResetEmail] = useState('');
  const [needsEmailForCode, setNeedsEmailForCode] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);
  const [unlocksAt, setUnlocksAt] = useState(0);
  const [isWrongCode, setIsWrongCode] = useState(false);
  const [resentCount, setResentCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const resendTimer = useResendTimer(step === 'code' || step === 'resetSent');

  if (wasSignedInOnArrival) return <Navigate to={continueTo} replace />;

  const goTo = (next: SignInStep) => {
    setStep(next);
    setResentCount(0);
    setIsWrongCode(false);
  };

  const finishSignIn = (keepSignedIn: boolean) => {
    if (keepSignedIn) rememberEmail(email.trim());
    signIn();
  };

  const submitPassword = async (password: string, keepSignedIn: boolean) => {
    setIsSubmitting(true);
    try {
      const result = await auth.signInWithPassword(email.trim(), password);
      if (result.status === 'signedIn') {
        finishSignIn(keepSignedIn);
        navigate(continueTo, { replace: true });
      } else if (result.status === 'locked') {
        setUnlocksAt(result.unlocksAt);
        setAttemptsLeft(null);
        goTo('locked');
      } else {
        setAttemptsLeft(result.attemptsLeft);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCode = async () => {
    if (!isValidEmail(email.trim())) {
      setNeedsEmailForCode(true);
      goTo('email');
      return;
    }
    await auth.sendSignInCode(email.trim());
    resendTimer.restart();
    goTo('code');
  };

  const verifyCode = async (code: string) => {
    setIsSubmitting(true);
    try {
      await auth.verifySignInCode(code);
      finishSignIn(true);
      goTo('signedIn');
    } catch {
      setIsWrongCode(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const sendReset = async (address: string) => {
    setIsSubmitting(true);
    try {
      await auth.sendPasswordReset(address);
      setResetEmail(address);
      resendTimer.restart();
      goTo('resetSent');
    } finally {
      setIsSubmitting(false);
    }
  };

  const backToSignIn = () => goTo(unlocksAt > Date.now() ? 'locked' : 'password');

  const headings: Record<
    SignInStep,
    { title: string; subtitle: string; badge?: { icon: 'mail' | 'lock' | 'check'; tone: AuthBadgeTone } }
  > = {
    email: { title: 'Welcome back', subtitle: 'Sign in to see your trips and check in faster.' },
    password: { title: 'Welcome back', subtitle: 'Sign in to see your trips and check in faster.' },
    reset: {
      title: 'Reset your password',
      subtitle: 'Enter the email on your account and we’ll send a link to choose a new password.',
    },
    resetSent: {
      title: 'Check your inbox',
      subtitle: `We sent a reset link to ${resetEmail}. It expires in 30 minutes.`,
      badge: { icon: 'mail', tone: 'attention' },
    },
    code: {
      title: 'Enter your code',
      subtitle: `We sent a 6-digit code to ${email.trim()}. It expires in 10 minutes.`,
      badge: { icon: 'lock', tone: 'attention' },
    },
    locked: {
      title: 'Sign-in paused',
      subtitle: `Too many wrong passwords for ${email.trim()}. To protect your account, password sign-in is paused for 15 minutes.`,
      badge: { icon: 'lock', tone: 'danger' },
    },
    signedIn: {
      title: 'You’re signed in',
      subtitle: `Welcome back${customer ? `, ${customer.firstName}` : ''}. Your trips, receipts and boarding passes are ready.`,
      badge: { icon: 'check', tone: 'success' },
    },
  };
  const heading = headings[step];
  const showsAlternatives = step === 'email' || step === 'password';

  return (
    <AuthLayout
      headline={
        <>
          Pick up right <em>where you left off.</em>
        </>
      }
      perks={PERKS}
    >
      <AuthHeading title={heading.title} subtitle={heading.subtitle} badge={heading.badge} />
      {showsAlternatives && <AuthTabs />}

      {step === 'email' && (
        <EmailStep
          email={email}
          needsEmailForCode={needsEmailForCode}
          onEmailChange={(value) => {
            setEmail(value);
            setNeedsEmailForCode(false);
          }}
          onContinue={() => goTo('password')}
        />
      )}
      {step === 'password' && (
        <PasswordStep
          email={email.trim()}
          attemptsLeft={attemptsLeft}
          isSubmitting={isSubmitting}
          onChangeEmail={() => {
            setAttemptsLeft(null);
            goTo('email');
          }}
          onForgotPassword={() => goTo('reset')}
          onSubmit={submitPassword}
        />
      )}
      {step === 'reset' && (
        <ResetStep
          initialEmail={resetEmail || email}
          isSubmitting={isSubmitting}
          onSend={sendReset}
          onBack={backToSignIn}
        />
      )}
      {step === 'resetSent' && (
        <ResetSentStep
          email={resetEmail}
          secondsUntilResend={resendTimer.secondsLeft}
          resentCount={resentCount}
          onResend={async () => {
            await auth.sendPasswordReset(resetEmail);
            resendTimer.restart();
            setResentCount((count) => count + 1);
          }}
          onBack={backToSignIn}
          onUseDifferentEmail={() => goTo('reset')}
        />
      )}
      {step === 'code' && (
        <CodeStep
          email={email.trim()}
          isWrong={isWrongCode}
          isSubmitting={isSubmitting}
          secondsUntilResend={resendTimer.secondsLeft}
          resentCount={resentCount}
          onVerify={verifyCode}
          onCodeEdited={() => setIsWrongCode(false)}
          onResend={async () => {
            await auth.sendSignInCode(email.trim());
            resendTimer.restart();
            setIsWrongCode(false);
            setResentCount((count) => count + 1);
          }}
          onUsePassword={backToSignIn}
        />
      )}
      {step === 'locked' && (
        <LockedStep unlocksAt={unlocksAt} onResetPassword={() => goTo('reset')} onUseCode={openCode} />
      )}
      {step === 'signedIn' && <SignedInStep continueTo={continueTo} />}

      {showsAlternatives && (
        <div className={styles.alternatives}>
          <OrDivider />
          <div className={styles.alternativeButtons}>
            <Button
              variant="quiet"
              size="large"
              fullWidth
              iconStart="key"
              onClick={async () => {
                await auth.signInWithPasskey();
                signIn();
                navigate(continueTo, { replace: true });
              }}
            >
              Continue with a passkey
            </Button>
            <Button variant="quiet" size="large" fullWidth iconStart="mail" onClick={openCode}>
              Email me a one-time code
            </Button>
          </div>
        </div>
      )}

      {step !== 'signedIn' && step !== 'locked' && (
        <p className={styles.terms}>
          By continuing you agree to Vela’s <Link to={paths.legal('terms')}>Terms</Link> and{' '}
          <Link to={paths.legal('privacy')}>Privacy notice</Link>. Booking without an account?{' '}
          <Link to={paths.home}>Continue as a guest</Link>.
        </p>
      )}
    </AuthLayout>
  );
}

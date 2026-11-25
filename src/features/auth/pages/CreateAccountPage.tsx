import { useState } from 'react';

import { useSession } from '@/app/providers';
import { useDocumentTitle } from '@/hooks';
import { firstNameOf } from '@/lib/format';
import * as auth from '@/services/authService';
import { ApiError } from '@/services/mockApi';

import { AuthHeading } from '../components/AuthHeading';
import { AuthLayout, type AuthPerk } from '../components/AuthLayout';
import { AuthTabs } from '../components/AuthTabs';
import { SignUpFormStep } from '../components/signUp/SignUpFormStep';
import { VerifyEmailStep } from '../components/signUp/VerifyEmailStep';
import { WelcomeStep } from '../components/signUp/WelcomeStep';
import { useResendTimer } from '../hooks/useResendTimer';
import { rememberEmail } from '../lib/rememberedEmail';
import { EMPTY_SIGN_UP_FORM, phoneCountry, type SignUpForm } from '../lib/signUpForm';

const PERKS: AuthPerk[] = [
  {
    icon: 'users',
    title: 'Check out in under a minute',
    detail: 'Save travelers and passports once. We fill them in for every booking.',
  },
  {
    icon: 'bell',
    title: 'Hear about price drops first',
    detail: 'Watch any route and get an alert the moment it falls below your price.',
  },
  {
    icon: 'tag',
    title: '₱500 off your first trip',
    detail: 'New members get the WELCOME code automatically.',
  },
];

type SignUpStep = 'form' | 'verify' | 'done';

export function CreateAccountPage() {
  useDocumentTitle('Create your account');
  const { signIn, updateCustomer } = useSession();
  const [step, setStep] = useState<SignUpStep>('form');
  const [form, setForm] = useState<SignUpForm>(EMPTY_SIGN_UP_FORM);
  const [isEmailTaken, setIsEmailTaken] = useState(false);
  const [isWrongCode, setIsWrongCode] = useState(false);
  const [wasResent, setWasResent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const resendTimer = useResendTimer(false);

  const submitForm = async (withPasskey: boolean) => {
    setIsSubmitting(true);
    try {
      const country = phoneCountry(form.phoneCountry);
      await auth.createAccount({
        firstNames: form.firstNames.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        mobile: form.mobile.trim() ? `${country.dialCode} ${form.mobile.trim()}` : '',
        password: withPasskey ? '' : form.password,
        country: form.country,
        wantsDeals: form.wantsDeals,
      });
      resendTimer.restart();
      setWasResent(false);
      setStep('verify');
    } catch (error) {
      if (error instanceof ApiError && error.code === 'email_taken') setIsEmailTaken(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const verify = async (code: string) => {
    setIsSubmitting(true);
    try {
      await auth.verifyEmailCode(code);
      const [firstName, ...middle] = form.firstNames.trim().split(/\s+/);
      updateCustomer({
        firstName,
        middleName: middle.join(' ') || undefined,
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        mobile: form.mobile.trim() ? `${phoneCountry(form.phoneCountry).dialCode} ${form.mobile.trim()}` : '',
        memberTier: 'Blue',
        tripCount: 0,
        travelCredit: 0,
      });
      rememberEmail(form.email.trim());
      signIn();
      setStep('done');
    } catch {
      setIsWrongCode(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      headline={
        <>
          Your next trip, <em>already halfway booked.</em>
        </>
      }
      perks={PERKS}
    >
      {step === 'form' && (
        <>
          <AuthHeading
            title="Create your account"
            subtitle="It takes a minute, and your next checkout will take less."
          />
          <AuthTabs />
          <SignUpFormStep
            form={form}
            isEmailTaken={isEmailTaken}
            isSubmitting={isSubmitting}
            onChange={(patch) => {
              setForm((previous) => ({ ...previous, ...patch }));
              if ('email' in patch) setIsEmailTaken(false);
            }}
            onSubmit={submitForm}
          />
        </>
      )}
      {step === 'verify' && (
        <VerifyEmailStep
          email={form.email.trim()}
          isWrong={isWrongCode}
          isSubmitting={isSubmitting}
          wasResent={wasResent}
          secondsUntilResend={resendTimer.secondsLeft}
          onVerify={verify}
          onCodeEdited={() => setIsWrongCode(false)}
          onResend={async () => {
            await auth.resendEmailCode();
            resendTimer.restart();
            setIsWrongCode(false);
            setWasResent(true);
          }}
          onWrongEmail={() => setStep('form')}
        />
      )}
      {step === 'done' && <WelcomeStep firstName={firstNameOf(form.firstNames) || 'traveler'} />}
    </AuthLayout>
  );
}

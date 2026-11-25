import { useState } from 'react';
import { Link } from 'react-router';

import { paths } from '@/app/paths';
import { Button, Checkbox, OrDivider, PasswordField, SelectField, TextField } from '@/components/ui';

import {
  missingSummary,
  mobileHint,
  PHONE_COUNTRIES,
  phoneCountry,
  RESIDENCE_COUNTRIES,
  signUpErrors,
  type SignUpField,
  type SignUpForm,
} from '../../lib/signUpForm';
import { PasswordStrength } from '../PasswordStrength';
import styles from './SignUp.module.css';

interface SignUpFormStepProps {
  form: SignUpForm;
  /** Set by the server when the email already has an account. */
  isEmailTaken: boolean;
  isSubmitting: boolean;
  onChange: (patch: Partial<SignUpForm>) => void;
  /** `withPasskey` skips the password: the passkey replaces it. */
  onSubmit: (withPasskey: boolean) => void;
}

/** Errors show for a field once it has been left, and for every field after a submit attempt. */
export function SignUpFormStep({
  form,
  isEmailTaken,
  isSubmitting,
  onChange,
  onSubmit,
}: SignUpFormStepProps) {
  const [touched, setTouched] = useState<Partial<Record<SignUpField, boolean>>>({});
  const [hasTried, setHasTried] = useState(false);
  const errors = signUpErrors(form);
  const show = (field: SignUpField) => (hasTried || touched[field] ? errors[field] : undefined);
  const touch = (field: SignUpField) => () => setTouched((previous) => ({ ...previous, [field]: true }));
  const missing = missingSummary(errors);
  const country = phoneCountry(form.phoneCountry);
  const passkeyMissing = missingSummary({ ...errors, password: undefined });

  return (
    <form
      className={styles.form}
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        setHasTried(true);
        if (!missing) onSubmit(false);
      }}
    >
      <Button
        variant="quiet"
        size="large"
        fullWidth
        iconStart="key"
        onClick={() => {
          setHasTried(true);
          if (!passkeyMissing) onSubmit(true);
        }}
      >
        Sign up with a passkey
      </Button>
      <OrDivider label="or with email" />

      <div className={styles.nameRow}>
        <TextField
          label="First and middle names"
          required
          autoComplete="given-name"
          value={form.firstNames}
          error={show('firstNames')}
          onBlur={touch('firstNames')}
          onChange={(event) => onChange({ firstNames: event.target.value })}
        />
        <TextField
          label="Last name"
          required
          autoComplete="family-name"
          value={form.lastName}
          error={show('lastName')}
          onBlur={touch('lastName')}
          onChange={(event) => onChange({ lastName: event.target.value })}
        />
      </div>
      <p className={styles.note}>Use your name exactly as it appears on your passport.</p>

      <TextField
        label="Email"
        required
        type="email"
        autoComplete="email"
        value={form.email}
        error={
          isEmailTaken ? (
            <>
              An account already uses this email. <Link to={paths.signIn}>Sign in instead</Link>
            </>
          ) : (
            show('email')
          )
        }
        onBlur={touch('email')}
        onChange={(event) => onChange({ email: event.target.value })}
      />

      <div className={styles.mobileRow}>
        <SelectField
          className={styles.countryCode}
          label="Country code"
          labelHidden
          options={PHONE_COUNTRIES.map((option) => ({
            value: option.id,
            label: `${option.id} ${option.dialCode}`,
          }))}
          value={form.phoneCountry}
          onChange={(event) => onChange({ phoneCountry: event.target.value as SignUpForm['phoneCountry'] })}
        />
        <TextField
          className={styles.mobile}
          label={
            <>
              Mobile number <span className={styles.optional}>· for flight alerts</span>
            </>
          }
          inputMode="tel"
          autoComplete="tel-national"
          placeholder={country.example}
          value={form.mobile}
          error={show('mobile')}
          helpText={mobileHint(form)}
          onBlur={touch('mobile')}
          onChange={(event) => onChange({ mobile: event.target.value })}
        />
      </div>

      <div className={styles.passwordBlock}>
        <PasswordField
          label="Create a password"
          required
          autoComplete="new-password"
          aria-describedby="sign-up-password-rules"
          value={form.password}
          error={show('password')}
          onBlur={touch('password')}
          onChange={(event) => onChange({ password: event.target.value })}
        />
        <PasswordStrength id="sign-up-password-rules" password={form.password} />
      </div>

      <SelectField
        label="Country of residence"
        required
        options={RESIDENCE_COUNTRIES.map((value) => ({ value, label: value }))}
        value={form.country}
        onChange={(event) => {
          const residence = event.target.value;
          const matchingPhone = PHONE_COUNTRIES.find((option) => option.residence === residence);
          onChange(
            matchingPhone && !form.mobile.trim()
              ? { country: residence, phoneCountry: matchingPhone.id }
              : { country: residence },
          );
        }}
      />

      <div className={styles.consents}>
        <Checkbox
          label="Email me price drops and member-only fares. Unsubscribe anytime."
          checked={form.wantsDeals}
          onChange={(event) => onChange({ wantsDeals: event.target.checked })}
        />
        <Checkbox
          label={
            <>
              I agree to Vela’s <Link to={paths.legal('terms')}>Terms of service</Link> and{' '}
              <Link to={paths.legal('privacy')}>Privacy notice</Link>.{' '}
              <span className={styles.required}>Required</span>
            </>
          }
          checked={form.acceptsTerms}
          aria-invalid={show('acceptsTerms') ? true : undefined}
          onChange={(event) => {
            onChange({ acceptsTerms: event.target.checked });
            touch('acceptsTerms')();
          }}
        />
        {show('acceptsTerms') && (
          <span role="alert" className={styles.error}>
            {errors.acceptsTerms}
          </span>
        )}
      </div>

      <Button type="submit" variant="primary" size="large" fullWidth loading={isSubmitting}>
        Create account
      </Button>
      <p className={missing ? styles.hint : styles.hintReady} aria-live="polite">
        {missing ?? 'All set. We’ll email you a code to confirm it’s you.'}
      </p>
    </form>
  );
}

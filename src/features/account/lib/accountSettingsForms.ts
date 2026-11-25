import { requiredPasswordChecks } from '@/lib/password';
import { digitsOnly, isValidEmail } from '@/lib/validation';
import type { ProfileUpdate } from '@/types/accountSettings';

export type ProfileErrors = Partial<Record<keyof ProfileUpdate, string>>;

/** An international number: "+", country code and at least 10 digits in all. */
function isInternationalMobile(value: string): boolean {
  return /^\+\d[\d\s]{8,}$/.test(value.trim()) && digitsOnly(value).length >= 10;
}

export function profileErrors(profile: ProfileUpdate): ProfileErrors {
  const errors: ProfileErrors = {};
  if (!profile.firstName.trim()) errors.firstName = 'Enter your first name.';
  if (!profile.lastName.trim()) errors.lastName = 'Enter your last name.';
  if (!isValidEmail(profile.email.trim())) errors.email = 'Enter an email like name@example.com.';
  if (!isInternationalMobile(profile.mobile)) {
    errors.mobile = 'Include the country code, e.g. +63 917 555 0123.';
  }
  return errors;
}

// ---------- Password ----------

export interface PasswordForm {
  current: string;
  next: string;
  confirm: string;
}

export interface PasswordRule {
  label: string;
  isMet: boolean;
}

export function passwordRules(form: PasswordForm): PasswordRule[] {
  return [
    ...requiredPasswordChecks(form.next),
    { label: 'Different from current', isMet: Boolean(form.next) && form.next !== form.current },
  ];
}

export type PasswordErrors = Partial<Record<keyof PasswordForm, string>>;

/** A mismatched confirmation shows as soon as it's typed; the rest waits for a submit attempt. */
export function passwordErrors(form: PasswordForm, showAll: boolean): PasswordErrors {
  const errors: PasswordErrors = {};
  if (form.confirm && form.confirm !== form.next) errors.confirm = 'Passwords don’t match.';
  if (!showAll) return errors;
  if (!form.current) errors.current = 'Enter your current password.';
  if (!passwordRules(form).every((rule) => rule.isMet)) errors.next = 'Meet every rule below to continue.';
  if (!form.confirm) errors.confirm = 'Type the new password again.';
  return errors;
}

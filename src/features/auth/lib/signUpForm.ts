import { joinWithAnd } from '@/lib/format';
import { meetsPasswordRules } from '@/lib/password';
import { digitsOnly, isValidEmail } from '@/lib/validation';

export interface PhoneCountry {
  id: 'PH' | 'SG' | 'JP' | 'US';
  dialCode: string;
  /** Digits after the dial code. */
  digits: number;
  example: string;
  residence: string;
}

export const PHONE_COUNTRIES: readonly PhoneCountry[] = [
  { id: 'PH', dialCode: '+63', digits: 10, example: '917 123 4567', residence: 'Philippines' },
  { id: 'SG', dialCode: '+65', digits: 8, example: '8123 4567', residence: 'Singapore' },
  { id: 'JP', dialCode: '+81', digits: 10, example: '90 1234 5678', residence: 'Japan' },
  { id: 'US', dialCode: '+1', digits: 10, example: '201 555 0123', residence: 'United States' },
];

export const RESIDENCE_COUNTRIES = ['Philippines', 'Singapore', 'Japan', 'United States', 'Other'] as const;

export function phoneCountry(id: PhoneCountry['id']): PhoneCountry {
  return PHONE_COUNTRIES.find((country) => country.id === id) ?? PHONE_COUNTRIES[0];
}

export interface SignUpForm {
  firstNames: string;
  lastName: string;
  email: string;
  phoneCountry: PhoneCountry['id'];
  /** Optional; used only for flight alerts. */
  mobile: string;
  password: string;
  country: string;
  wantsDeals: boolean;
  acceptsTerms: boolean;
}

export const EMPTY_SIGN_UP_FORM: SignUpForm = {
  firstNames: '',
  lastName: '',
  email: '',
  phoneCountry: 'PH',
  mobile: '',
  password: '',
  country: 'Philippines',
  wantsDeals: true,
  acceptsTerms: false,
};

export type SignUpField = keyof SignUpForm;
export type SignUpErrors = Partial<Record<SignUpField, string>>;

export function signUpErrors(form: SignUpForm): SignUpErrors {
  const errors: SignUpErrors = {};
  const country = phoneCountry(form.phoneCountry);
  const mobileDigits = digitsOnly(form.mobile).length;

  if (!form.firstNames.trim()) errors.firstNames = 'Enter your first name as it appears on your passport.';
  if (!form.lastName.trim()) errors.lastName = 'Enter your last name.';
  if (!isValidEmail(form.email.trim())) {
    errors.email = 'Enter your full email address, like name@example.com.';
  }
  if (mobileDigits > 0 && mobileDigits !== country.digits) {
    errors.mobile = `That number looks too short — ${country.id} mobiles have ${country.digits} digits after ${country.dialCode}, like ${country.example}.`;
  }
  if (!meetsPasswordRules(form.password)) {
    errors.password = 'Add the missing rules above — 10+ characters, upper and lower case and a number.';
  }
  if (!form.acceptsTerms) {
    errors.acceptsTerms = 'Tick this box to agree to the terms — we can’t create an account without it.';
  }
  return errors;
}

/** "To continue, add your name, a valid email and the terms." — or `null` when nothing is missing. */
export function missingSummary(errors: SignUpErrors): string | null {
  const missing = [
    errors.firstNames || errors.lastName ? 'your name' : null,
    errors.email ? 'a valid email' : null,
    errors.mobile ? 'a complete mobile number' : null,
    errors.password ? 'a stronger password' : null,
    errors.acceptsTerms ? 'the terms' : null,
  ].filter((item): item is string => item !== null);
  return missing.length ? `To continue, add ${joinWithAnd(missing)}.` : null;
}

/** The hint under the mobile field: an example, the number we'll text, or the error. */
export function mobileHint(form: SignUpForm): string {
  const country = phoneCountry(form.phoneCountry);
  return form.mobile.trim()
    ? `We’ll text flight alerts to ${country.dialCode} ${form.mobile.trim()}.`
    : `Format: ${country.dialCode} ${country.example} · we only text about your flights.`;
}

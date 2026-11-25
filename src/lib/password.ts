/** Password rules shared by sign-up and password changes. */

export const MIN_PASSWORD_LENGTH = 10;

export interface PasswordCheck {
  label: string;
  isMet: boolean;
}

/** The three rules every new password must meet. */
export function requiredPasswordChecks(password: string): PasswordCheck[] {
  return [
    { label: `${MIN_PASSWORD_LENGTH}+ characters`, isMet: password.length >= MIN_PASSWORD_LENGTH },
    { label: 'Upper and lower case', isMet: /[a-z]/.test(password) && /[A-Z]/.test(password) },
    { label: 'At least one number', isMet: /\d/.test(password) },
  ];
}

export function meetsPasswordRules(password: string): boolean {
  return requiredPasswordChecks(password).every((check) => check.isMet);
}

/** 0–4: the required rules plus a symbol. Drives the strength meter. */
export function passwordStrength(password: string): number {
  const checks = [
    ...requiredPasswordChecks(password),
    { label: 'symbol', isMet: /[^A-Za-z0-9]/.test(password) },
  ];
  return checks.filter((check) => check.isMet).length;
}

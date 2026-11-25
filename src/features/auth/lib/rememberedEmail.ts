import { readStoredValue, writeStoredValue } from '@/lib/storage';

const REMEMBERED_EMAIL_KEY = 'vela.auth.rememberedEmail';

/** The email last used to sign in on this device, pre-filled on the sign-in page. */
export function readRememberedEmail(): string {
  return readStoredValue('local', REMEMBERED_EMAIL_KEY, '');
}

export function rememberEmail(email: string): void {
  writeStoredValue('local', REMEMBERED_EMAIL_KEY, email);
}

export function forgetRememberedEmail(): void {
  writeStoredValue('local', REMEMBERED_EMAIL_KEY, '');
}

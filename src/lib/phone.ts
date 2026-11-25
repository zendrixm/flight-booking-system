import { digitsOnly } from './validation';

/** "+63 917 ••• 0123": enough to recognise the number without exposing it. */
export function maskInternationalMobile(value: string): string {
  const digits = digitsOnly(value);
  return `+${digits.slice(0, 2)} ${digits.slice(2, 5)} ••• ${digits.slice(-4)}`;
}

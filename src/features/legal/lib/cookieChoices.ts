import type { CookieConsent } from '@/types/legal';

export type OptionalCookieType = keyof CookieConsent;

export interface CookieTypeInfo {
  id: OptionalCookieType | 'essential';
  name: string;
  description: string;
}

export const COOKIE_TYPES: readonly CookieTypeInfo[] = [
  { id: 'essential', name: 'Essential', description: 'Sign-in, checkout and security. Always on.' },
  { id: 'analytics', name: 'Analytics', description: 'Aggregated page performance and errors.' },
  { id: 'personalisation', name: 'Personalisation', description: 'Recent searches and destination ideas.' },
  { id: 'advertising', name: 'Advertising', description: 'Vela fares on partner sites.' },
];

export const OPTIONAL_COOKIE_TYPES: readonly OptionalCookieType[] = [
  'analytics',
  'personalisation',
  'advertising',
];

export const ESSENTIAL_ONLY: CookieConsent = { analytics: false, personalisation: false, advertising: false };

export function isConsentChanged(draft: CookieConsent, saved: CookieConsent): boolean {
  return OPTIONAL_COOKIE_TYPES.some((type) => draft[type] !== saved[type]);
}

/** "Saved · 2 of 3 optional types on" */
export function consentSummary(saved: CookieConsent): string {
  const onCount = OPTIONAL_COOKIE_TYPES.filter((type) => saved[type]).length;
  return `Saved · ${onCount} of ${OPTIONAL_COOKIE_TYPES.length} optional types on`;
}

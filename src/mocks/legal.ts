import type { CookieConsent, LegalDocumentId } from '@/types/legal';

/** The PDF behind "Download PDF" for each policy. */
export const LEGAL_PDF_FILES: Record<LegalDocumentId, string> = {
  carriage: 'vela-terms-of-carriage.pdf',
  terms: 'vela-terms-of-service.pdf',
  privacy: 'vela-privacy-notice.pdf',
  cookies: 'vela-cookie-policy.pdf',
};

/** What a first-time visitor starts with; advertising is always opt-in. */
export const DEFAULT_COOKIE_CONSENT: CookieConsent = {
  analytics: true,
  personalisation: true,
  advertising: false,
};

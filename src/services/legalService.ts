import { readStoredValue, writeStoredValue } from '@/lib/storage';
import { DEFAULT_COOKIE_CONSENT, LEGAL_PDF_FILES } from '@/mocks/legal';
import type { CookieConsent, LegalDocumentId } from '@/types/legal';

import { mockRequest } from './mockApi';

/** Cookie choices belong to the device, not the account, so they live in local storage. */
const COOKIE_CONSENT_KEY = 'vela.cookieConsent';

export function downloadLegalDocument(documentId: LegalDocumentId): Promise<{ fileName: string }> {
  return mockRequest(() => ({ fileName: LEGAL_PDF_FILES[documentId] }));
}

export function getCookieConsent(): CookieConsent {
  return {
    ...DEFAULT_COOKIE_CONSENT,
    ...readStoredValue<Partial<CookieConsent>>('local', COOKIE_CONSENT_KEY, {}),
  };
}

export function saveCookieConsent(consent: CookieConsent): Promise<CookieConsent> {
  return mockRequest(() => {
    writeStoredValue('local', COOKIE_CONSENT_KEY, consent);
    return consent;
  }, 300);
}

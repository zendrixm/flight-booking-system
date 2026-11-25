export type LegalDocumentId = 'carriage' | 'terms' | 'privacy' | 'cookies';

export interface LegalSection {
  /** Anchor id, unique within its document, e.g. "fares" for /legal/carriage#fares. */
  id: string;
  title: string;
  paragraphs: string[];
}

export interface LegalDocument {
  id: LegalDocumentId;
  /** Tab label. */
  label: string;
  title: string;
  updated: string;
  summary: string[];
  sections: LegalSection[];
  callToAction: { title: string; body: string; label: string; to: string };
}

/** Optional cookie types; essential cookies are always on. */
export interface CookieConsent {
  analytics: boolean;
  personalisation: boolean;
  advertising: boolean;
}

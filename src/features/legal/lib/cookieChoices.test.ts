import { describe, expect, it } from 'vitest';

import { consentSummary, ESSENTIAL_ONLY, isConsentChanged } from './cookieChoices';

describe('cookie choices', () => {
  it('notices any optional type changing', () => {
    expect(isConsentChanged(ESSENTIAL_ONLY, ESSENTIAL_ONLY)).toBe(false);
    expect(isConsentChanged({ ...ESSENTIAL_ONLY, analytics: true }, ESSENTIAL_ONLY)).toBe(true);
  });

  it('summarises what is saved', () => {
    expect(consentSummary({ analytics: true, personalisation: true, advertising: false })).toBe(
      'Saved · 2 of 3 optional types on',
    );
  });
});

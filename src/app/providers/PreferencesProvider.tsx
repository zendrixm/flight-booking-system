import { useMemo, useState, type ReactNode } from 'react';

import { readStoredValue, writeStoredValue } from '@/lib/storage';

import {
  PreferencesContext,
  type CurrencyCode,
  type LanguageCode,
  type PreferencesValue,
} from './preferencesContext';

const PREFERENCES_KEY = 'vela.preferences';

interface StoredPreferences {
  currency: CurrencyCode;
  language: LanguageCode;
}

/** Display currency and language. Fares are always charged in pesos. */
export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<StoredPreferences>(() =>
    readStoredValue('local', PREFERENCES_KEY, { currency: 'PHP', language: 'EN' }),
  );

  const value = useMemo<PreferencesValue>(
    () => ({
      ...preferences,
      setPreferences: (next) => {
        setPreferences(next);
        writeStoredValue('local', PREFERENCES_KEY, next);
      },
    }),
    [preferences],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

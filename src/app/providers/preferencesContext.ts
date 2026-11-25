import { createContext, useContext } from 'react';

export const CURRENCIES = [
  { code: 'PHP', symbol: '₱', name: 'Philippine peso' },
  { code: 'USD', symbol: '$', name: 'US dollar' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese yen' },
  { code: 'KRW', symbol: '₩', name: 'Korean won' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong dollar' },
] as const;

export const LANGUAGES = [
  { code: 'EN', name: 'English' },
  { code: 'FIL', name: 'Filipino' },
  { code: 'JA', name: '日本語' },
  { code: 'KO', name: '한국어' },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]['code'];
export type LanguageCode = (typeof LANGUAGES)[number]['code'];

export interface PreferencesValue {
  currency: CurrencyCode;
  language: LanguageCode;
  setPreferences: (preferences: { currency: CurrencyCode; language: LanguageCode }) => void;
}

export const PreferencesContext = createContext<PreferencesValue | null>(null);

export function usePreferences(): PreferencesValue {
  const preferences = useContext(PreferencesContext);
  if (!preferences) throw new Error('usePreferences must be used inside <PreferencesProvider>.');
  return preferences;
}

export function currencyOf(code: CurrencyCode) {
  return CURRENCIES.find((currency) => currency.code === code) ?? CURRENCIES[0];
}

export function languageOf(code: LanguageCode) {
  return LANGUAGES.find((language) => language.code === code) ?? LANGUAGES[0];
}

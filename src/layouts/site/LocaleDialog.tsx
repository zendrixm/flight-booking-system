import { useEffect, useId, useState } from 'react';

import {
  CURRENCIES,
  LANGUAGES,
  languageOf,
  usePreferences,
  type CurrencyCode,
  type LanguageCode,
} from '@/app/providers';
import { Alert, Button, Dialog, useToast } from '@/components/ui';

import styles from './LocaleDialog.module.css';

interface LocaleDialogProps {
  open: boolean;
  onClose: () => void;
}

export function LocaleDialog({ open, onClose }: LocaleDialogProps) {
  const { currency, language, setPreferences } = usePreferences();
  const toast = useToast();
  const groupName = useId();
  const [draftCurrency, setDraftCurrency] = useState<CurrencyCode>(currency);
  const [draftLanguage, setDraftLanguage] = useState<LanguageCode>(language);

  // Start from the saved preferences every time the dialog opens.
  useEffect(() => {
    if (open) {
      setDraftCurrency(currency);
      setDraftLanguage(language);
    }
  }, [open, currency, language]);

  function save() {
    const changed = draftCurrency !== currency || draftLanguage !== language;
    setPreferences({ currency: draftCurrency, language: draftLanguage });
    onClose();
    if (changed) {
      toast.show({
        tone: 'info',
        key: 'locale',
        message: `Prices now shown in ${draftCurrency} · language set to ${languageOf(draftLanguage).name}`,
      });
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Currency and language"
      description="Choose how prices and text appear across Vela."
      footer={
        <>
          <Button variant="quiet" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save}>Save</Button>
        </>
      }
    >
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Currency</legend>
        <div className={styles.currencyGrid}>
          {CURRENCIES.map((option) => (
            <label key={option.code} className={styles.option}>
              <input
                type="radio"
                name={`${groupName}-currency`}
                className={styles.input}
                checked={draftCurrency === option.code}
                onChange={() => setDraftCurrency(option.code)}
              />
              <span className={styles.currencyOption}>
                <span className={styles.currencyCode}>
                  {option.code} <span className={styles.currencySymbol}>{option.symbol}</span>
                </span>
                <span className={styles.currencyName}>{option.name}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Language</legend>
        <div className={styles.languageRow}>
          {LANGUAGES.map((option) => (
            <label key={option.code} className={styles.option}>
              <input
                type="radio"
                name={`${groupName}-language`}
                className={styles.input}
                checked={draftLanguage === option.code}
                onChange={() => setDraftLanguage(option.code)}
              />
              <span className={styles.languageOption}>{option.name}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {draftCurrency !== 'PHP' && (
        <Alert tone="attention" icon="info">
          Fares are charged in Philippine pesos. Amounts shown in {draftCurrency} are estimates and may differ
          slightly from your card statement.
        </Alert>
      )}
    </Dialog>
  );
}

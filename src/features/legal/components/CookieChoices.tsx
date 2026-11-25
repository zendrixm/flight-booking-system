import { useState } from 'react';

import { Icon } from '@/components/icons';
import { Button, Switch, useToast } from '@/components/ui';
import { getCookieConsent, saveCookieConsent } from '@/services/legalService';
import type { CookieConsent } from '@/types/legal';

import { consentSummary, COOKIE_TYPES, ESSENTIAL_ONLY, isConsentChanged } from '../lib/cookieChoices';
import styles from './CookieChoices.module.css';

/** The switches on the cookie policy. Changes apply only when saved. */
export function CookieChoices() {
  const toast = useToast();
  const [saved, setSaved] = useState<CookieConsent>(getCookieConsent);
  const [draft, setDraft] = useState<CookieConsent>(saved);
  const [isSaving, setIsSaving] = useState(false);
  const hasChanges = isConsentChanged(draft, saved);

  const save = async (consent: CookieConsent, message: string) => {
    setIsSaving(true);
    try {
      const stored = await saveCookieConsent(consent);
      setSaved(stored);
      setDraft(stored);
      toast.show({ tone: 'success', message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section aria-labelledby="cookie-choices-heading" className={styles.card}>
      <div className={styles.header}>
        <span className={styles.heading}>
          <h3 id="cookie-choices-heading" className={styles.title}>
            Your cookie choices on this device
          </h3>
          <span className={hasChanges ? styles.unsaved : styles.status} aria-live="polite">
            {hasChanges ? 'You have unsaved changes — save to apply them.' : consentSummary(saved)}
          </span>
        </span>
        <span className={styles.actions}>
          <Button
            variant="quiet"
            size="small"
            disabled={isSaving}
            onClick={() => save(ESSENTIAL_ONLY, 'Only essential cookies are on.')}
          >
            Essential only
          </Button>
          <Button
            variant="primary"
            size="small"
            loading={isSaving}
            onClick={() => save(draft, 'Cookie choices saved.')}
          >
            Save choices
          </Button>
        </span>
      </div>

      {COOKIE_TYPES.map((type) => {
        const isEssential = type.id === 'essential';
        return (
          <Switch
            key={type.id}
            className={isEssential ? `${styles.row} ${styles.locked}` : styles.row}
            placement="end"
            label={
              <span className={styles.name}>
                {type.name}
                {isEssential && <Icon name="lock" size={14} strokeWidth={1.8} />}
              </span>
            }
            description={type.description}
            checked={isEssential || draft[type.id as keyof CookieConsent]}
            disabled={isEssential}
            onChange={(checked) => {
              if (!isEssential) setDraft((previous) => ({ ...previous, [type.id]: checked }));
            }}
          />
        );
      })}
    </section>
  );
}

import { useState } from 'react';

import { Icon } from '@/components/icons';
import { Switch } from '@/components/ui';
import type { EmailPreferences } from '@/types/accountSettings';

import styles from './EmailPreferencesCard.module.css';
import card from './SettingsCard.module.css';

interface EmailPreferencesCardProps {
  preferences: EmailPreferences;
  /** Shown when someone tries to turn off trip updates, e.g. "Singapore on 10 Oct and Tokyo on 12 Nov". */
  upcomingTripsLabel: string;
  onChange: (patch: Partial<EmailPreferences>) => void;
}

export function EmailPreferencesCard({
  preferences,
  upcomingTripsLabel,
  onChange,
}: EmailPreferencesCardProps) {
  const [isLockNoteShown, setIsLockNoteShown] = useState(false);

  return (
    <div className={card.card}>
      <div className={styles.lockedRow}>
        <div className={card.row}>
          <Switch
            className={styles.switch}
            placement="end"
            label={
              <span className={styles.lockedLabel}>
                Trip updates
                <Icon name="lock" size={14} strokeWidth={1.8} label="Required" />
              </span>
            }
            description="Schedule changes, check-in reminders and receipts. Required while you have bookings."
            checked={preferences.tripUpdates}
            onChange={() => setIsLockNoteShown((shown) => !shown)}
          />
        </div>
        {isLockNoteShown && (
          <p role="status" className={styles.lockNote}>
            <Icon name="info" size={16} strokeWidth={1.8} />
            <span>
              Trip updates stay on while you have upcoming bookings — {upcomingTripsLabel}. You can turn them
              off after you’re back.
            </span>
          </p>
        )}
      </div>
      <div className={card.row}>
        <Switch
          className={styles.switch}
          placement="end"
          label="Deals and inspiration"
          description="Fare sales and destination ideas, about twice a month."
          checked={preferences.deals}
          onChange={(deals) => onChange({ deals })}
        />
      </div>
      <div className={card.row}>
        <Switch
          className={styles.switch}
          placement="end"
          label="Partner offers"
          description="Hotels, insurance and car hire from partners we trust."
          checked={preferences.partnerOffers}
          onChange={(partnerOffers) => onChange({ partnerOffers })}
        />
      </div>
    </div>
  );
}

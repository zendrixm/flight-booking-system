import type { ReactNode } from 'react';
import { Link } from 'react-router';

import { paths } from '@/app/paths';
import { Icon, type IconName } from '@/components/icons';
import { Alert, Switch } from '@/components/ui';
import type { AlertFrequency, AlertNotificationSettings as Settings } from '@/types/priceAlert';

import styles from './AlertNotificationSettings.module.css';

const FREQUENCIES: ReadonlyArray<{ value: AlertFrequency; label: string; detail: string }> = [
  { value: 'instant', label: 'Right away', detail: 'When the lowest fare moves 5% or more' },
  { value: 'daily', label: 'Daily digest', detail: 'One email at 8:00 AM' },
  { value: 'weekly', label: 'Weekly', detail: 'Mondays at 8:00 AM' },
];

interface AlertNotificationSettingsProps {
  settings: Settings;
  email: string;
  maskedMobile: string;
  /** Short description of the last change, e.g. "Quiet hours off". */
  savedNote?: string;
  onChange: (patch: Partial<Settings>, savedNote: string) => void;
}

function SettingRow({ icon, children }: { icon: IconName; children: ReactNode }) {
  return (
    <div className={styles.row}>
      <span className={styles.icon} aria-hidden="true">
        <Icon name={icon} size={20} strokeWidth={1.6} />
      </span>
      {children}
    </div>
  );
}

/** Channels, frequency and quiet hours for price alerts. Each change saves straight away. */
export function AlertNotificationSettings({
  settings,
  email,
  maskedMobile,
  savedNote,
  onChange,
}: AlertNotificationSettingsProps) {
  const isEverythingOff = !settings.email && !settings.sms;

  return (
    <section aria-labelledby="notify-title" className={styles.section}>
      <div className={styles.header}>
        <h2 id="notify-title" className={styles.title}>
          How we notify you
        </h2>
        {savedNote && (
          <span role="status" className={styles.saved}>
            <Icon name="check" size={14} strokeWidth={2.4} />
            Saved · {savedNote}
          </span>
        )}
      </div>

      {isEverythingOff && (
        <Alert tone="danger" role="alert">
          Email and texts are both off, so you won’t hear about price drops. Your alerts keep running — turn
          one channel on to get them.
        </Alert>
      )}

      <div className={styles.panel}>
        <SettingRow icon="mail">
          <Switch
            className={styles.switch}
            placement="end"
            label="Email"
            description={email}
            checked={settings.email}
            onChange={(checked) =>
              onChange({ email: checked }, checked ? 'Email alerts on' : 'Email alerts off')
            }
          />
        </SettingRow>
        <SettingRow icon="smartphone">
          <Switch
            className={styles.switch}
            placement="end"
            label="Push notifications"
            description={
              <>
                Install the Vela app on your phone to get instant alerts.{' '}
                <Link to={paths.phone.search}>Get the app</Link>
              </>
            }
            checked={settings.push}
            disabled
            onChange={() => undefined}
          />
        </SettingRow>
        <SettingRow icon="messageSquare">
          <Switch
            className={styles.switch}
            placement="end"
            label="Text message"
            description={`${maskedMobile} · standard rates may apply`}
            checked={settings.sms}
            onChange={(checked) => onChange({ sms: checked }, checked ? 'Text alerts on' : 'Text alerts off')}
          />
        </SettingRow>

        <div className={styles.frequency}>
          <fieldset className={styles.frequencyGroup}>
            <legend className={styles.frequencyTitle}>How often</legend>
            <div className={styles.frequencyOptions}>
              {FREQUENCIES.map((option) => (
                <label key={option.value} className={styles.frequencyOption}>
                  <input
                    type="radio"
                    name="alert-frequency"
                    className="visually-hidden"
                    checked={settings.frequency === option.value}
                    onChange={() => onChange({ frequency: option.value }, option.label)}
                  />
                  <span className={styles.frequencyLabel}>{option.label}</span>
                  <span className={styles.frequencyDetail}>{option.detail}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <SettingRow icon="moon">
          <Switch
            className={styles.switch}
            placement="end"
            label="Quiet hours"
            description={
              settings.quietHours
                ? 'No texts or pushes from 10:00 PM to 7:00 AM, Manila time. Email still arrives.'
                : 'Off · alerts can arrive at any hour.'
            }
            checked={settings.quietHours}
            onChange={(checked) =>
              onChange({ quietHours: checked }, checked ? 'Quiet hours on' : 'Quiet hours off')
            }
          />
        </SettingRow>
      </div>
    </section>
  );
}

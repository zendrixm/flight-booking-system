import { CURRENCIES, LANGUAGES, type CurrencyCode, type LanguageCode } from '@/app/providers';
import { SegmentedControl, SelectField } from '@/components/ui';
import { findAirport, PHILIPPINE_ORIGINS } from '@/data/airports';
import { SEAT_PREFERENCES } from '@/data/travelerOptions';
import type { SearchDefaults } from '@/types/accountSettings';

import { ALERT_CABINS } from '../../lib/priceAlerts';
import styles from './PreferencesCard.module.css';

interface PreferencesCardProps {
  currency: CurrencyCode;
  language: LanguageCode;
  searchDefaults: SearchDefaults;
  onDisplayChange: (patch: { currency?: CurrencyCode; language?: LanguageCode }) => void;
  onSearchDefaultsChange: (patch: Partial<SearchDefaults>) => void;
}

/** Display currency and language plus search defaults. Every change saves straight away. */
export function PreferencesCard({
  currency,
  language,
  searchDefaults,
  onDisplayChange,
  onSearchDefaultsChange,
}: PreferencesCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.grid}>
        <SelectField
          label="Currency"
          options={CURRENCIES.map((option) => ({
            value: option.code,
            label: `${option.name} (${option.symbol})`,
          }))}
          value={currency}
          onChange={(event) => onDisplayChange({ currency: event.target.value as CurrencyCode })}
        />
        <SelectField
          label="Language"
          options={LANGUAGES.map((option) => ({ value: option.code, label: option.name }))}
          value={language}
          onChange={(event) => onDisplayChange({ language: event.target.value as LanguageCode })}
        />
        <SelectField
          label="Home airport"
          options={PHILIPPINE_ORIGINS.map((code) => ({
            value: code,
            label: `${findAirport(code)?.city ?? code} (${code})`,
          }))}
          value={searchDefaults.homeAirport}
          onChange={(event) => onSearchDefaultsChange({ homeAirport: event.target.value })}
        />
        <SelectField
          label="Usual cabin"
          options={ALERT_CABINS.map((cabin) => ({ value: cabin, label: cabin }))}
          value={searchDefaults.cabin}
          onChange={(event) => onSearchDefaultsChange({ cabin: event.target.value })}
        />
      </div>
      <div className={styles.seat}>
        <span className={styles.seatLabel} aria-hidden="true">
          Seat preference
        </span>
        <SegmentedControl
          label="Seat preference"
          appearance="soft"
          density="compact"
          fullWidth
          options={SEAT_PREFERENCES.map((seat) => ({ value: seat, label: seat }))}
          value={searchDefaults.seat}
          onChange={(seat) => onSearchDefaultsChange({ seat })}
        />
      </div>
    </div>
  );
}

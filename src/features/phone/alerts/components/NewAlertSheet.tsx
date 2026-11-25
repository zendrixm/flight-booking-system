import { useState } from 'react';

import { Button, Checkbox, SelectField, Sheet, TextField } from '@/components/ui';
import { findAirport } from '@/data/airports';
import type { NewPriceAlert, PriceAlert } from '@/types/priceAlert';

import {
  ALERT_DATE_OPTIONS,
  ALERT_DESTINATIONS,
  ALERT_TRAVELER_OPTIONS,
  HOME_AIRPORT,
  INITIAL_NEW_ALERT_FORM,
  newAlertErrors,
  toNewPriceAlert,
  type NewAlertForm,
} from '../lib/newAlertForm';
import styles from './NewAlertSheet.module.css';

const DESTINATION_OPTIONS = ALERT_DESTINATIONS.map((code) => ({
  value: code,
  label: `${findAirport(code)?.city ?? code} ${code}`,
}));

interface NewAlertSheetProps {
  existingAlerts: readonly PriceAlert[];
  isSaving: boolean;
  onClose: () => void;
  onCreate: (alert: NewPriceAlert) => void;
}

/** Watch a route from Manila, optionally with a target fare. */
export function NewAlertSheet({ existingAlerts, isSaving, onClose, onCreate }: NewAlertSheetProps) {
  const [form, setForm] = useState<NewAlertForm>(INITIAL_NEW_ALERT_FORM);
  const [hasTried, setHasTried] = useState(false);
  const errors = newAlertErrors(form, existingAlerts);
  const shownErrors = hasTried ? errors : {};
  const edit = (change: Partial<NewAlertForm>) => setForm((current) => ({ ...current, ...change }));

  const submit = () => {
    setHasTried(true);
    if (Object.keys(errors).length === 0) onCreate(toNewPriceAlert(form));
  };

  return (
    <Sheet
      open
      onClose={onClose}
      title="New price alert"
      footer={
        <Button size="large" fullWidth iconStart="bell" loading={isSaving} onClick={submit}>
          Create alert
        </Button>
      }
    >
      <form
        noValidate
        className={styles.form}
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <div className={styles.route}>
          <TextField
            label="From"
            leadingIcon="lock"
            value={`${findAirport(HOME_AIRPORT)?.city ?? ''} ${HOME_AIRPORT}`}
            readOnly
          />
          <SelectField
            label="To"
            required
            placeholder="Choose…"
            options={DESTINATION_OPTIONS}
            value={form.to}
            error={shownErrors.to}
            onChange={(event) => edit({ to: event.target.value })}
          />
        </div>
        <SelectField
          label="When"
          required
          options={ALERT_DATE_OPTIONS.map((option) => ({ value: option, label: option }))}
          value={form.datesLabel}
          onChange={(event) => edit({ datesLabel: event.target.value as NewAlertForm['datesLabel'] })}
        />
        <SelectField
          label="Travelers"
          required
          options={ALERT_TRAVELER_OPTIONS.map((option) => ({ value: option, label: `${option} · Economy` }))}
          value={form.travelers}
          onChange={(event) => edit({ travelers: event.target.value as NewAlertForm['travelers'] })}
        />
        <TextField
          label="Target price per traveler"
          prefix="₱"
          inputMode="numeric"
          placeholder="e.g. 9,500"
          helpText="Leave empty to hear about any big drop"
          value={form.targetInput}
          error={shownErrors.target}
          onChange={(event) => edit({ targetInput: event.target.value })}
        />
        <Checkbox
          label="Email me too, not just push notifications"
          checked={form.emailToo}
          onChange={() => edit({ emailToo: !form.emailToo })}
        />
      </form>
    </Sheet>
  );
}

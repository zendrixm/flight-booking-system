import { useState } from 'react';

import { Button, IconButton, SegmentedControl, SelectField, TextField } from '@/components/ui';
import { DEMO_TODAY } from '@/config/demo';
import { addDays } from '@/lib/date';

import {
  ALERT_CABINS,
  ALERT_DESTINATIONS,
  ALERT_ORIGINS,
  ALERT_TRAVELER_OPTIONS,
  alertDatesLabel,
  cityOf,
  createAlertErrors,
  monthLabel,
  upcomingMonths,
  type CreateAlertForm as CreateAlertFormState,
} from '../../lib/priceAlerts';
import styles from './CreateAlertForm.module.css';

const MONTHS = upcomingMonths(DEMO_TODAY);

export const INITIAL_CREATE_ALERT_FORM: CreateAlertFormState = {
  from: 'MNL',
  to: '',
  dateMode: 'flexible',
  month: MONTHS[1],
  departDate: '2026-12-18',
  returnDate: '2026-12-27',
  travelers: ALERT_TRAVELER_OPTIONS[0],
  cabin: ALERT_CABINS[0],
  targetInput: '',
};

const airportOptions = (codes: readonly string[]) =>
  codes.map((code) => ({ value: code, label: `${cityOf(code)} (${code})` }));

interface CreateAlertFormProps {
  /** "MNL-ICN" keys of routes already watched, to stop duplicates before they're submitted. */
  watchedRoutes: ReadonlySet<string>;
  isSaving: boolean;
  onCancel: () => void;
  onCreate: (form: CreateAlertFormState) => void;
}

export function CreateAlertForm({ watchedRoutes, isSaving, onCancel, onCreate }: CreateAlertFormProps) {
  const [form, setForm] = useState(INITIAL_CREATE_ALERT_FORM);
  const errors = createAlertErrors(form, watchedRoutes);
  const hasErrors = Object.keys(errors).length > 0;
  const canCreate = Boolean(form.to) && !hasErrors;
  const update = (patch: Partial<CreateAlertFormState>) => setForm((previous) => ({ ...previous, ...patch }));

  const preview = hasErrors
    ? 'Fix the highlighted fields to preview your alert.'
    : form.to
      ? `${cityOf(form.from)} → ${cityOf(form.to)} · ${alertDatesLabel(form, DEMO_TODAY)} · ${form.travelers}, ${form.cabin}`
      : 'Pick a destination to preview your alert.';

  return (
    <form
      aria-labelledby="new-alert-title"
      noValidate
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault();
        if (canCreate) onCreate(form);
      }}
    >
      <div className={styles.header}>
        <div className={styles.heading}>
          <h2 id="new-alert-title" className={styles.title}>
            New price alert
          </h2>
          <span className={styles.subtitle}>
            We’ll compare every airline on the route and tell you when the lowest fare moves.
          </span>
        </div>
        <IconButton icon="close" label="Close" variant="soft" onClick={onCancel} />
      </div>

      <div className={styles.grid}>
        <SelectField
          label="From"
          required
          options={airportOptions(ALERT_ORIGINS)}
          value={form.from}
          onChange={(event) => update({ from: event.target.value })}
        />
        <SelectField
          label="To"
          required
          placeholder="Choose a destination"
          options={airportOptions(ALERT_DESTINATIONS)}
          value={form.to}
          error={errors.to}
          onChange={(event) => update({ to: event.target.value })}
        />
      </div>

      <fieldset className={styles.when}>
        <legend className={styles.legend}>When</legend>
        <SegmentedControl
          label="Date type"
          appearance="soft"
          className={styles.compactControl}
          options={[
            { value: 'flexible', label: 'Flexible month' },
            { value: 'exact', label: 'Exact dates' },
          ]}
          value={form.dateMode}
          onChange={(dateMode) => update({ dateMode })}
        />
        {form.dateMode === 'flexible' ? (
          <SegmentedControl
            label="Month"
            className={styles.compactControl}
            options={MONTHS.map((month) => ({ value: month, label: monthLabel(month, DEMO_TODAY, 'short') }))}
            value={form.month}
            onChange={(month) => update({ month })}
          />
        ) : (
          <div className={styles.grid}>
            <TextField
              label="Depart"
              required
              type="date"
              min={addDays(DEMO_TODAY, 1)}
              value={form.departDate}
              onChange={(event) => update({ departDate: event.target.value })}
            />
            <TextField
              label="Return"
              required
              type="date"
              min={form.departDate}
              value={form.returnDate}
              error={errors.returnDate}
              onChange={(event) => update({ returnDate: event.target.value })}
            />
          </div>
        )}
      </fieldset>

      <div className={styles.gridThree}>
        <SelectField
          label="Travelers"
          required
          options={ALERT_TRAVELER_OPTIONS.map((value) => ({ value, label: value }))}
          value={form.travelers}
          onChange={(event) => update({ travelers: event.target.value })}
        />
        <SelectField
          label="Cabin"
          required
          options={ALERT_CABINS.map((value) => ({ value, label: value }))}
          value={form.cabin}
          onChange={(event) => update({ cabin: event.target.value })}
        />
        <TextField
          label="Target price"
          prefix="₱"
          inputMode="numeric"
          placeholder="e.g. 9,500"
          value={form.targetInput}
          error={errors.targetInput}
          helpText="Per traveler, round trip. We’ll flag the alert when fares hit it."
          onChange={(event) => update({ targetInput: event.target.value })}
        />
      </div>

      <div className={styles.footer}>
        <span className={hasErrors ? styles.previewProblem : styles.preview} aria-live="polite">
          {preview}
        </span>
        <div className={styles.actions}>
          <Button variant="quiet" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={!canCreate} loading={isSaving}>
            Create alert
          </Button>
        </div>
      </div>
    </form>
  );
}

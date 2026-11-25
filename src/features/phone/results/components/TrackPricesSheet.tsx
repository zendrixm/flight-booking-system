import { useId, useState } from 'react';

import { Button, Checkbox, ChoiceCard, Sheet, TextField } from '@/components/ui';
import {
  getTrackPricesErrors,
  sanitizeAmountInput,
  type TrackPricesForm,
} from '@/features/booking/lib/trackPricesForm';
import { formatPeso } from '@/lib/format';

import { PHONE_TRACK_PRICES_FORM } from '../lib/phoneResults';
import styles from './TrackPricesSheet.module.css';

interface TrackPricesSheetProps {
  /** "Manila → Tokyo · 12–19 Nov · 2 adults" */
  tripLabel: string;
  lowestFare: number;
  /** "Solenne · 1 stop · Thu 12 Nov – Thu 19 Nov" */
  lowestFareDetail: string;
  email: string;
  isSaving: boolean;
  onClose: () => void;
  onCreate: (form: TrackPricesForm) => void;
}

/** Create a price alert for this search: below a target, or on any drop. */
export function TrackPricesSheet({
  tripLabel,
  lowestFare,
  lowestFareDetail,
  email,
  isSaving,
  onClose,
  onCreate,
}: TrackPricesSheetProps) {
  const modeName = useId();
  const [form, setForm] = useState<TrackPricesForm>(PHONE_TRACK_PRICES_FORM);
  const [hasTried, setHasTried] = useState(false);
  const errors = getTrackPricesErrors(form, lowestFare);
  const shownErrors = hasTried ? errors : {};
  const edit = (change: Partial<TrackPricesForm>) => setForm((current) => ({ ...current, ...change }));

  const submit = () => {
    setHasTried(true);
    if (Object.keys(errors).length === 0) onCreate(form);
  };

  return (
    <Sheet
      open
      onClose={onClose}
      title="Track prices"
      description={tripLabel}
      footer={
        <Button size="large" fullWidth iconStart="bell" loading={isSaving} onClick={submit}>
          Create alert
        </Button>
      }
    >
      <div className={styles.lowest}>
        <span className={styles.lowestText}>
          <span className={styles.lowestLabel}>Today’s lowest</span>
          <span className={styles.lowestDetail}>{lowestFareDetail}</span>
        </span>
        <span className={styles.lowestFare}>{formatPeso(lowestFare)}</span>
      </div>

      <fieldset className={styles.modes}>
        <legend className={styles.legend}>Alert me when</legend>
        <ChoiceCard
          name={modeName}
          title="It drops below my target"
          description="Set the price you’d happily pay"
          checked={form.mode === 'below'}
          onChange={() => edit({ mode: 'below' })}
        />
        <ChoiceCard
          name={modeName}
          title="The price drops"
          description="Any drop of ₱500 or more"
          checked={form.mode === 'drop'}
          onChange={() => edit({ mode: 'drop' })}
        />
      </fieldset>

      {form.mode === 'below' && (
        <TextField
          label="Target price per traveler"
          required
          prefix="₱"
          inputMode="numeric"
          placeholder="e.g. 11,500"
          value={form.targetInput}
          error={shownErrors.target}
          onChange={(event) => edit({ targetInput: sanitizeAmountInput(event.target.value) })}
        />
      )}

      <fieldset className={styles.channels}>
        <legend className="visually-hidden">How we reach you</legend>
        <Checkbox
          label="Push notification"
          description="On this phone"
          checked={form.notifyByPush}
          onChange={() => edit({ notifyByPush: !form.notifyByPush })}
        />
        <Checkbox
          label="Email"
          description={email}
          checked={form.notifyByEmail}
          onChange={() => edit({ notifyByEmail: !form.notifyByEmail })}
        />
        {shownErrors.channels && (
          <p role="alert" className={styles.error}>
            {shownErrors.channels}
          </p>
        )}
      </fieldset>
    </Sheet>
  );
}

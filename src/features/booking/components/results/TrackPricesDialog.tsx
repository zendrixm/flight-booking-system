import { useState } from 'react';

import { useSession } from '@/app/providers';
import { Button, Checkbox, ChoiceCard, Dialog, TextField } from '@/components/ui';
import { formatPeso } from '@/lib/format';

import {
  getTrackPricesErrors,
  INITIAL_TRACK_PRICES_FORM,
  sanitizeAmountInput,
  type TrackPricesForm,
} from '../../lib/trackPricesForm';
import styles from './TrackPricesDialog.module.css';

interface TrackPricesDialogProps {
  open: boolean;
  onClose: () => void;
  /** "Manila → Tokyo · round trip · 2 adults · Economy". */
  tripLabel: string;
  lowestFare: number;
  /** "Solenne · 1 stop · Thu 12 Nov – Thu 19 Nov". */
  lowestFareLabel: string;
  isSaving: boolean;
  onCreate: (form: TrackPricesForm) => void;
}

/** Create a price alert for the current search: any drop, or below a target price. */
export function TrackPricesDialog({
  open,
  onClose,
  tripLabel,
  lowestFare,
  lowestFareLabel,
  isSaving,
  onCreate,
}: TrackPricesDialogProps) {
  const { customer } = useSession();
  const [form, setForm] = useState<TrackPricesForm>(INITIAL_TRACK_PRICES_FORM);
  const [hasTriedSubmit, setHasTriedSubmit] = useState(false);

  const errors = getTrackPricesErrors(form, lowestFare);
  const visibleErrors = hasTriedSubmit ? errors : {};
  const update = (patch: Partial<TrackPricesForm>) => setForm((previous) => ({ ...previous, ...patch }));

  const handleCreate = () => {
    setHasTriedSubmit(true);
    if (Object.keys(errors).length === 0) onCreate(form);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="large"
      title="Track prices for this trip"
      description={tripLabel}
      footer={
        <>
          <Button variant="quiet" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" iconStart="bell" loading={isSaving} onClick={handleCreate}>
            Create alert
          </Button>
        </>
      }
    >
      <div className={styles.lowest}>
        <span className={styles.lowestText}>
          <span className={styles.eyebrow}>Today’s lowest fare</span>
          <span className={styles.lowestMeta}>{lowestFareLabel}</span>
        </span>
        <span className={styles.lowestPrice}>
          <span className={styles.amount}>{formatPeso(lowestFare)}</span>
          <span className={styles.per}>per traveler</span>
        </span>
      </div>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Alert me when</legend>
        <div className={styles.modes}>
          <ChoiceCard
            name="alert-mode"
            title="Any price drop"
            description="Whenever the lowest fare for these dates falls"
            checked={form.mode === 'drop'}
            onChange={() => update({ mode: 'drop' })}
          />
          <ChoiceCard
            name="alert-mode"
            title="Below a target price"
            description="Only when it drops under your number"
            checked={form.mode === 'below'}
            onChange={() => update({ mode: 'below' })}
          />
        </div>
      </fieldset>

      {form.mode === 'below' && (
        <TextField
          label="Target price per traveler"
          required
          prefix="₱"
          inputMode="numeric"
          placeholder="e.g. 11,500"
          value={form.targetInput}
          onChange={(event) => update({ targetInput: sanitizeAmountInput(event.target.value) })}
          error={visibleErrors.target}
        />
      )}

      <Checkbox
        label="Also watch nearby dates (±3 days)"
        checked={form.watchNearbyDates}
        onChange={(event) => update({ watchNearbyDates: event.target.checked })}
      />

      <fieldset
        className={styles.channels}
        aria-describedby={visibleErrors.channels ? 'track-channels-error' : undefined}
      >
        <legend className={styles.legend}>Notify me by</legend>
        <Checkbox
          label={<strong>Email</strong>}
          description={customer?.email}
          checked={form.notifyByEmail}
          onChange={(event) => update({ notifyByEmail: event.target.checked })}
        />
        <Checkbox
          label={<strong>Push notification</strong>}
          description="Vela app on your phone"
          checked={form.notifyByPush}
          onChange={(event) => update({ notifyByPush: event.target.checked })}
        />
        {visibleErrors.channels && (
          <span id="track-channels-error" role="alert" className={styles.error}>
            {visibleErrors.channels}
          </span>
        )}
      </fieldset>
    </Dialog>
  );
}

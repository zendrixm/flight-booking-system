import { useState } from 'react';

import { Alert, Button, Checkbox, IconButton, TextField } from '@/components/ui';
import { DEMO_TODAY_PARTS } from '@/config/demo';
import { detectCardBrand, formatCardNumberInput, formatExpiryInput, digitsOnly } from '@/lib/validation';

import { newCardErrors, type NewCardDraft } from '../../lib/paymentMethodForms';
import styles from './PaymentForms.module.css';

interface AddCardFormProps {
  defaultHolderName: string;
  isSaving: boolean;
  onCancel: () => void;
  onSave: (draft: NewCardDraft) => void;
}

/** Inline form under the card grid; the card is checked with a ₱1 hold before it's saved. */
export function AddCardForm({ defaultHolderName, isSaving, onCancel, onSave }: AddCardFormProps) {
  const [draft, setDraft] = useState<NewCardDraft>({
    holderName: defaultHolderName,
    number: '',
    expiry: '',
    securityCode: '',
    makeDefault: false,
  });
  const [hasTried, setHasTried] = useState(false);
  const errors = newCardErrors(draft, DEMO_TODAY_PARTS, hasTried);
  const errorCount = Object.keys(errors).length;
  const brand = detectCardBrand(draft.number);
  const update = (patch: Partial<NewCardDraft>) => setDraft((previous) => ({ ...previous, ...patch }));

  const handleSubmit = () => {
    if (Object.keys(newCardErrors(draft, DEMO_TODAY_PARTS, true)).length > 0) {
      setHasTried(true);
      return;
    }
    onSave(draft);
  };

  return (
    <form
      aria-labelledby="add-card-title"
      noValidate
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault();
        handleSubmit();
      }}
    >
      <div className={styles.formHeader}>
        <h3 id="add-card-title" className={styles.formTitle}>
          Add a card
        </h3>
        <IconButton icon="close" label="Close" variant="soft" shape="square" onClick={onCancel} />
      </div>

      {hasTried && errorCount > 1 && (
        <Alert tone="danger" role="alert">
          Check {errorCount} fields before saving — the card hasn’t been added yet.
        </Alert>
      )}

      <div className={styles.cardGrid}>
        <TextField
          className={styles.fullRow}
          label="Name on card"
          required
          autoComplete="cc-name"
          value={draft.holderName}
          error={errors.holderName}
          onChange={(event) => update({ holderName: event.target.value })}
        />
        <TextField
          className={styles.fullRow}
          label="Card number"
          required
          hint={brand ?? undefined}
          inputMode="numeric"
          autoComplete="cc-number"
          placeholder="1234 5678 9012 3456"
          inputClassName={styles.cardNumber}
          value={draft.number}
          error={errors.number}
          onChange={(event) => update({ number: formatCardNumberInput(event.target.value) })}
        />
        <TextField
          label="Expiry"
          required
          inputMode="numeric"
          autoComplete="cc-exp"
          placeholder="MM / YY"
          inputClassName={styles.tabular}
          value={draft.expiry}
          error={errors.expiry}
          onChange={(event) => update({ expiry: formatExpiryInput(event.target.value) })}
        />
        <TextField
          label="Security code"
          required
          inputMode="numeric"
          autoComplete="cc-csc"
          maxLength={4}
          placeholder="3 or 4 digits"
          value={draft.securityCode}
          error={errors.securityCode}
          onChange={(event) => update({ securityCode: digitsOnly(event.target.value) })}
        />
      </div>

      <Checkbox
        label="Make this my default card"
        checked={draft.makeDefault}
        onChange={(event) => update({ makeDefault: event.target.checked })}
      />
      <p className={styles.note}>
        We’ll place a temporary ₱1 hold to confirm the card with your bank. It disappears within a few days.
      </p>

      <div className={styles.formActions}>
        <Button variant="quiet" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={isSaving}>
          Save card
        </Button>
      </div>
    </form>
  );
}

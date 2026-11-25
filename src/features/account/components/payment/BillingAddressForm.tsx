import { useState } from 'react';

import { Button, SelectField, TextField } from '@/components/ui';
import { BILLING_COUNTRIES } from '@/data/paymentOptions';
import type { BillingAddress } from '@/types/payment';

import { billingAddressErrors } from '../../lib/paymentMethodForms';
import styles from './PaymentForms.module.css';

interface BillingAddressFormProps {
  initialAddress: BillingAddress;
  isSaving: boolean;
  onCancel: () => void;
  onSave: (address: BillingAddress) => void;
}

export function BillingAddressForm({ initialAddress, isSaving, onCancel, onSave }: BillingAddressFormProps) {
  const [address, setAddress] = useState(initialAddress);
  const [hasTried, setHasTried] = useState(false);
  const errors = billingAddressErrors(address);
  const visible: Partial<typeof errors> = hasTried ? errors : {};
  const update = (patch: Partial<BillingAddress>) => setAddress((previous) => ({ ...previous, ...patch }));

  const handleSubmit = () => {
    if (Object.keys(errors).length > 0) {
      setHasTried(true);
      return;
    }
    onSave({
      ...address,
      line1: address.line1.trim(),
      city: address.city.trim(),
      postalCode: address.postalCode.trim(),
    });
  };

  return (
    <form
      aria-label="Edit billing address"
      noValidate
      className={styles.inlineForm}
      onSubmit={(event) => {
        event.preventDefault();
        handleSubmit();
      }}
    >
      <TextField
        label="Street address"
        required
        autoComplete="street-address"
        value={address.line1}
        error={visible.line1}
        onChange={(event) => update({ line1: event.target.value })}
      />
      <div className={styles.twoColumns}>
        <TextField
          label="City"
          required
          autoComplete="address-level2"
          value={address.city}
          error={visible.city}
          onChange={(event) => update({ city: event.target.value })}
        />
        <TextField
          label="Postal code"
          required
          inputMode="numeric"
          autoComplete="postal-code"
          inputClassName={styles.tabular}
          value={address.postalCode}
          error={visible.postalCode}
          onChange={(event) => update({ postalCode: event.target.value })}
        />
      </div>
      <SelectField
        label="Country"
        required
        options={BILLING_COUNTRIES.map((country) => ({ value: country, label: country }))}
        value={address.country}
        onChange={(event) => update({ country: event.target.value })}
      />
      <div className={styles.formActions}>
        <Button variant="quiet" size="small" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="small" loading={isSaving}>
          Save address
        </Button>
      </div>
    </form>
  );
}

import { useState } from 'react';

import { Button, TextField } from '@/components/ui';
import type { CompanyBillingDetails } from '@/types/payment';

import { companyDetailsErrors } from '../../lib/paymentMethodForms';
import styles from './PaymentForms.module.css';

export const EMPTY_COMPANY: CompanyBillingDetails = { name: '', tin: '', address: '' };

interface CompanyDetailsFormProps {
  initialDetails: CompanyBillingDetails;
  isSaving: boolean;
  onCancel: () => void;
  onSave: (details: CompanyBillingDetails) => void;
}

/** Registered company name, TIN and address, printed on receipts for expense claims. */
export function CompanyDetailsForm({ initialDetails, isSaving, onCancel, onSave }: CompanyDetailsFormProps) {
  const [details, setDetails] = useState(initialDetails);
  const [hasTried, setHasTried] = useState(false);
  const errors = companyDetailsErrors(details);
  const visible: Partial<typeof errors> = hasTried ? errors : {};
  const update = (patch: Partial<CompanyBillingDetails>) =>
    setDetails((previous) => ({ ...previous, ...patch }));

  const handleSubmit = () => {
    if (Object.keys(errors).length > 0) {
      setHasTried(true);
      return;
    }
    onSave({ name: details.name.trim(), tin: details.tin.trim(), address: details.address.trim() });
  };

  return (
    <form
      aria-label="Company details for receipts"
      noValidate
      className={styles.inlineFormQuiet}
      onSubmit={(event) => {
        event.preventDefault();
        handleSubmit();
      }}
    >
      <TextField
        label="Registered company name"
        required
        autoComplete="organization"
        value={details.name}
        error={visible.name}
        onChange={(event) => update({ name: event.target.value })}
      />
      <TextField
        label="TIN"
        required
        inputMode="numeric"
        placeholder="000-000-000-00000"
        inputClassName={styles.tabular}
        value={details.tin}
        error={visible.tin}
        onChange={(event) => update({ tin: event.target.value })}
      />
      <TextField
        label="Registered address"
        required
        value={details.address}
        error={visible.address}
        onChange={(event) => update({ address: event.target.value })}
      />
      <div className={styles.formActions}>
        <Button variant="quiet" size="small" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="small" loading={isSaving}>
          Save details
        </Button>
      </div>
    </form>
  );
}

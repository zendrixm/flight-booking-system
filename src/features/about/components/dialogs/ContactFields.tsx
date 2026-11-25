import { TextField } from '@/components/ui';

import type { ContactDetailsForm } from '../../lib/contactForms';
import styles from './AboutDialogs.module.css';

interface ContactFieldsProps {
  form: ContactDetailsForm;
  errors: Partial<Record<keyof ContactDetailsForm, string>>;
  onChange: (patch: Partial<ContactDetailsForm>) => void;
}

/** Full name and email, side by side; both forms on the About page start with them. */
export function ContactFields({ form, errors, onChange }: ContactFieldsProps) {
  return (
    <div className={styles.fieldRow}>
      <TextField
        label="Full name"
        required
        autoComplete="name"
        value={form.fullName}
        error={errors.fullName}
        onChange={(event) => onChange({ fullName: event.target.value })}
      />
      <TextField
        label="Email"
        required
        type="email"
        autoComplete="email"
        value={form.email}
        error={errors.email}
        onChange={(event) => onChange({ email: event.target.value })}
      />
    </div>
  );
}

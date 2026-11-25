import { useState } from 'react';

import { Button, Checkbox, Dialog, TextField } from '@/components/ui';
import { digitsOnly, isValidEmail } from '@/lib/validation';
import type { ManagedBooking, TripContact } from '@/types/managedBooking';

import styles from './ManageDialogs.module.css';

interface ContactDialogProps {
  booking: ManagedBooking;
  isSaving: boolean;
  onClose: () => void;
  onSave: (contact: TripContact) => void;
}

/** Where gate changes and new e-tickets go for this one booking. */
export function ContactDialog({ booking, isSaving, onClose, onSave }: ContactDialogProps) {
  const [contact, setContact] = useState<TripContact>(booking.contact);
  const [hasTried, setHasTried] = useState(false);
  const update = (patch: Partial<TripContact>) => setContact((previous) => ({ ...previous, ...patch }));

  const errors = {
    email: isValidEmail(contact.email.trim())
      ? undefined
      : 'Enter a full email address, like name@example.com.',
    mobile:
      digitsOnly(contact.mobile).length === 10
        ? undefined
        : 'Philippine mobile numbers have 10 digits after +63, like 917 482 4567.',
  };
  const visible: Partial<typeof errors> = hasTried ? errors : {};

  const save = () => {
    setHasTried(true);
    if (errors.email || errors.mobile) return;
    onSave({ ...contact, email: contact.email.trim() });
  };

  return (
    <Dialog
      open
      onClose={onClose}
      size="medium"
      title="Contact for this trip"
      description={`Only changes ${booking.reference}. Your account email stays the same.`}
      footer={
        <>
          <Button variant="quiet" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" loading={isSaving} onClick={save}>
            Save
          </Button>
        </>
      }
    >
      <TextField
        label="Email"
        required
        type="email"
        autoComplete="email"
        value={contact.email}
        error={visible.email}
        onChange={(event) => update({ email: event.target.value })}
      />
      <TextField
        label="Mobile"
        required
        prefix="+63"
        inputMode="tel"
        autoComplete="tel-national"
        value={contact.mobile}
        error={visible.mobile}
        onChange={(event) => update({ mobile: event.target.value })}
      />
      <TextField
        label="Also text updates to"
        hint="e.g. Miguel"
        prefix="+63"
        inputMode="tel"
        value={contact.alternateMobile}
        onChange={(event) => update({ alternateMobile: event.target.value })}
      />
      <div className={styles.group}>
        <Checkbox
          label="Text me gate changes and delays"
          checked={contact.textUpdates}
          onChange={(event) => update({ textUpdates: event.target.checked })}
        />
        <Checkbox
          label="Email me check-in reminders"
          checked={contact.emailUpdates}
          onChange={(event) => update({ emailUpdates: event.target.checked })}
        />
      </div>
    </Dialog>
  );
}

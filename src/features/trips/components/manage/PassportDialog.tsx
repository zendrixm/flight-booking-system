import { useState } from 'react';

import { Button, Dialog, SelectField, TextField } from '@/components/ui';
import { formatDayLabel } from '@/lib/date';
import type { ManagedBooking, ManagedTraveler } from '@/types/managedBooking';

import styles from './ManageDialogs.module.css';

const NATIONALITIES = [
  { value: 'PH', label: 'Philippines' },
  { value: 'SG', label: 'Singapore' },
  { value: 'JP', label: 'Japan' },
  { value: 'US', label: 'United States' },
];

/** Philippine passports: one or two letters, 7 digits and an optional letter. */
const PASSPORT_PATTERN = /^[A-Z]{1,2}\d{7}[A-Z]?$/;
const EXPIRY_PATTERN = /^(\d{2})\/(\d{2})\/(\d{4})$/;

interface PassportDialogProps {
  booking: ManagedBooking;
  traveler: ManagedTraveler;
  isSaving: boolean;
  onClose: () => void;
  onSave: (passport: { passportNumber: string; passportExpiry: string; passportNationality: string }) => void;
}

/** "DD/MM/YYYY" → "YYYY-MM-DD", or null when it isn't a real date. */
function toIsoDate(value: string): string | null {
  const match = EXPIRY_PATTERN.exec(value.trim());
  if (!match) return null;
  const [, day, month, year] = match;
  const iso = `${year}-${month}-${day}`;
  return Number.isNaN(Date.parse(iso)) ? null : iso;
}

export function PassportDialog({ booking, traveler, isSaving, onClose, onSave }: PassportDialogProps) {
  const [passportNumber, setPassportNumber] = useState(traveler.passportNumber);
  const [nationality, setNationality] = useState(traveler.passportNationality);
  const [expiry, setExpiry] = useState(traveler.passportExpiry);
  const [hasTried, setHasTried] = useState(false);

  const lastFlight = booking.flights[booking.flights.length - 1];
  const expiryIso = toIsoDate(expiry);
  const errors = {
    number: PASSPORT_PATTERN.test(passportNumber.trim().toUpperCase())
      ? undefined
      : 'Philippine passport numbers are a letter, 7 digits and a letter, like P1234567A.',
    expiry: !expiryIso
      ? 'Enter the expiry date as DD/MM/YYYY.'
      : lastFlight && expiryIso < lastFlight.date
        ? `This passport expires before your return on ${formatDayLabel(lastFlight.date)}. Renew it before you travel, or update it here once you have the new one.`
        : undefined,
  };
  const visible: Partial<typeof errors> = hasTried ? errors : {};

  const save = () => {
    setHasTried(true);
    if (errors.number || errors.expiry) return;
    onSave({
      passportNumber: passportNumber.trim().toUpperCase(),
      passportExpiry: expiry.trim(),
      passportNationality: nationality,
    });
  };

  return (
    <Dialog
      open
      onClose={onClose}
      size="medium"
      title={`Passport details · ${traveler.firstNames.split(' ')[0]} ${traveler.lastName}`}
      description={`Sent to ${booking.airlineName} and immigration before you fly.`}
      footer={
        <>
          <Button variant="quiet" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" loading={isSaving} onClick={save}>
            Save passport
          </Button>
        </>
      }
    >
      <div className={styles.fields}>
        <TextField
          className={styles.fullRow}
          label="Passport number"
          required
          autoComplete="off"
          value={passportNumber}
          helpText="Philippine passport numbers are a letter, 7 digits and a letter, like P1234567A."
          error={visible.number}
          onChange={(event) => setPassportNumber(event.target.value.toUpperCase())}
        />
        <SelectField
          label="Nationality"
          required
          options={NATIONALITIES}
          value={nationality}
          onChange={(event) => setNationality(event.target.value)}
        />
        <TextField
          label="Expiry date"
          required
          placeholder="DD/MM/YYYY"
          inputMode="numeric"
          value={expiry}
          error={visible.expiry}
          onChange={(event) => setExpiry(event.target.value)}
        />
      </div>
      <p className={styles.body}>
        Japan needs your passport to be valid for your whole stay, until your return
        {lastFlight ? ` on ${formatDayLabel(lastFlight.date)}` : ''}. Filipino travelers also need a Japanese
        visa.
      </p>
    </Dialog>
  );
}

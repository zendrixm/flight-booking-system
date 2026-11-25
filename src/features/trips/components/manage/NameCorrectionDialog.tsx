import clsx from 'clsx';
import { useState } from 'react';

import { Icon } from '@/components/icons';
import { Alert, Button, Dialog, IconButton, SelectField, TextField } from '@/components/ui';
import type { ManagedBooking } from '@/types/managedBooking';

import styles from './ManageDialogs.module.css';

const REASONS = [
  { value: 'typo', label: 'A typo of up to 3 letters' },
  { value: 'middle', label: 'Missing or extra middle name' },
  { value: 'legal', label: 'Name changed by marriage or law' },
  { value: 'other', label: 'Something else' },
] as const;

type Reason = (typeof REASONS)[number]['value'];

const FEE_NOTES: Record<Reason, string> = {
  typo: 'Free. Corrections of up to 3 letters and missing middle names are free, and you’re within 24 hours of booking.',
  middle:
    'Free. Corrections of up to 3 letters and missing middle names are free, and you’re within 24 hours of booking.',
  legal:
    'Name changes by marriage or law are free with a marriage certificate or court order — we’ll ask for it by email.',
  other: 'We’ll tell you about any airline fee before anything changes.',
};

interface NameCorrectionDialogProps {
  booking: ManagedBooking;
  isSaving: boolean;
  onClose: () => void;
  onSend: (travelerId: string, newName: string) => Promise<void>;
}

/** Ask the airline to correct a name, with a photo of the passport as proof. */
export function NameCorrectionDialog({ booking, isSaving, onClose, onSend }: NameCorrectionDialogProps) {
  const [travelerId, setTravelerId] = useState(booking.travelers[0]?.id ?? '');
  const traveler = booking.travelers.find((candidate) => candidate.id === travelerId);
  const [firstNames, setFirstNames] = useState(traveler?.firstNames ?? '');
  const [lastName, setLastName] = useState(traveler?.lastName ?? '');
  const [reason, setReason] = useState<Reason | ''>('');
  const [file, setFile] = useState<{ name: string; size: number } | null>(null);
  const [hasTried, setHasTried] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const errors = {
    firstNames: !firstNames.trim() ? 'Enter the first and middle names exactly as printed.' : undefined,
    lastName: !lastName.trim() ? 'Enter the last name as printed.' : undefined,
    reason: !reason ? 'Choose what needs correcting.' : undefined,
    file: !file
      ? `Add a photo of the passport page so ${booking.airlineName} can check the spelling.`
      : undefined,
  };
  const visible: Partial<typeof errors> = hasTried ? errors : {};
  const currentName = traveler ? `${traveler.title} ${traveler.firstNames} ${traveler.lastName}` : '';
  const newName = `${traveler?.title ?? ''} ${firstNames.trim()} ${lastName.trim()}`.trim();

  const pickTraveler = (id: string) => {
    const next = booking.travelers.find((candidate) => candidate.id === id);
    setTravelerId(id);
    setFirstNames(next?.firstNames ?? '');
    setLastName(next?.lastName ?? '');
  };

  const send = async () => {
    setHasTried(true);
    if (Object.values(errors).some(Boolean)) return;
    await onSend(travelerId, newName);
    setIsSent(true);
  };

  if (isSent) {
    return (
      <Dialog
        open
        onClose={onClose}
        size="medium"
        title="Name correction requested"
        description={`${booking.airlineName} checks every change against the passport`}
        footer={
          <Button variant="primary" onClick={onClose}>
            Done
          </Button>
        }
      >
        <div className={styles.done}>
          <div className={styles.reference}>
            <span className={styles.currentLabel}>Case number</span>
            <span className={styles.referenceValue}>VC-48372</span>
          </div>
          <dl className={styles.doneFacts}>
            <div>
              <dt>From</dt>
              <dd>{currentName}</dd>
            </div>
            <div>
              <dt>To</dt>
              <dd>{newName}</dd>
            </div>
            <div>
              <dt>Reason</dt>
              <dd>{REASONS.find((option) => option.value === reason)?.label}</dd>
            </div>
            <div>
              <dt>Fee</dt>
              <dd>Free</dd>
            </div>
          </dl>
          <p className={styles.body}>
            We’ll check with {booking.airlineName} and email you within 24 hours. Your booking and seats stay
            exactly as they are while we do.
          </p>
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog
      open
      onClose={onClose}
      size="large"
      title="Request a name correction"
      description="Names must match passports exactly, or the airline can refuse boarding."
      footer={
        <>
          <Button variant="quiet" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" loading={isSaving} onClick={send}>
            Send request
          </Button>
        </>
      }
    >
      <fieldset className={styles.group}>
        <legend className={styles.legend}>Traveler</legend>
        <div className={styles.pills}>
          {booking.travelers.map((candidate) => (
            <label key={candidate.id} className={styles.pill}>
              <input
                type="radio"
                name="name-traveler"
                className="visually-hidden"
                checked={travelerId === candidate.id}
                onChange={() => pickTraveler(candidate.id)}
              />
              {candidate.firstNames.split(' ')[0]} {candidate.lastName}
            </label>
          ))}
        </div>
      </fieldset>
      <div className={styles.current}>
        <span className={styles.currentLabel}>Name on the booking</span>
        <span className={styles.currentValue}>{currentName}</span>
      </div>
      <div className={styles.fields}>
        <TextField
          label="First and middle names, as on passport"
          required
          value={firstNames}
          error={visible.firstNames}
          onChange={(event) => setFirstNames(event.target.value)}
        />
        <TextField
          label="Last name"
          required
          value={lastName}
          error={visible.lastName}
          onChange={(event) => setLastName(event.target.value)}
        />
        <SelectField
          className={styles.fullRow}
          label="What needs correcting?"
          required
          placeholder="Choose a reason"
          options={REASONS}
          value={reason}
          error={visible.reason}
          onChange={(event) => setReason(event.target.value as Reason)}
        />
      </div>
      <div className={styles.group}>
        <span className={styles.legend}>
          Photo of the passport page{' '}
          <span aria-hidden="true" className={styles.error}>
            *
          </span>
        </span>
        <div className={styles.upload}>
          {file ? (
            <span className={styles.file}>
              <Icon name="paperclip" size={16} />
              {file.name} <span className={styles.fileSize}>{(file.size / 1_000_000).toFixed(1)} MB</span>
              <IconButton
                icon="close"
                size="small"
                label={`Remove ${file.name}`}
                onClick={() => setFile(null)}
              />
            </span>
          ) : (
            <label className={clsx(styles.uploadButton, visible.file && styles.uploadInvalid)}>
              <input
                type="file"
                accept="image/jpeg,image/png,application/pdf"
                className="visually-hidden"
                aria-invalid={Boolean(visible.file)}
                aria-describedby="name-file-help"
                onChange={(event) => {
                  const picked = event.target.files?.[0];
                  if (picked) setFile({ name: picked.name, size: picked.size });
                }}
              />
              <Icon name="paperclip" size={16} />
              Upload photo
            </label>
          )}
        </div>
        {visible.file && (
          <p role="alert" className={styles.error}>
            {visible.file}
          </p>
        )}
        <p id="name-file-help" className={styles.fileHint}>
          JPG, PNG or PDF up to 10 MB. Only the airline sees it, and we delete it after 30 days.
        </p>
      </div>
      {reason && <Alert tone="info">{FEE_NOTES[reason]}</Alert>}
    </Dialog>
  );
}

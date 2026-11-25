import clsx from 'clsx';
import { useState } from 'react';

import { Button, ChoiceCard, Dialog, TextAreaField, TextField } from '@/components/ui';
import { digitsOnly } from '@/lib/validation';
import type { ManagedBooking } from '@/types/managedBooking';

import styles from './ManageDialogs.module.css';

const ASSISTANCE_TYPES = [
  { id: 'wchr', label: 'Wheelchair to the gate', description: 'Can walk short distances and manage stairs' },
  { id: 'wchs', label: 'Wheelchair to the seat', description: 'Can’t manage stairs or long walks' },
  { id: 'blnd', label: 'Blind or low vision', description: 'Guided through the airport and on board' },
  { id: 'deaf', label: 'Deaf or hard of hearing', description: 'Written updates at the gate and on board' },
  { id: 'svan', label: 'Service dog', description: 'Trained assistance dog in the cabin' },
  { id: 'other', label: 'Something else', description: 'Oxygen, medical devices or other needs' },
] as const;

interface AssistanceDialogProps {
  booking: ManagedBooking;
  isSaving: boolean;
  onClose: () => void;
  onSend: (travelerId: string, requests: string[]) => Promise<void>;
}

/** Free assistance requests passed to the airline: who, what kind, notes and a phone number for the day. */
export function AssistanceDialog({ booking, isSaving, onClose, onSend }: AssistanceDialogProps) {
  const [travelerId, setTravelerId] = useState(booking.travelers[0]?.id ?? '');
  const [types, setTypes] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [phone, setPhone] = useState(booking.contact.mobile);
  const [hasTried, setHasTried] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const flights = booking.flights.map((flight) => flight.flightNumber).join(' and ');
  const traveler = booking.travelers.find((candidate) => candidate.id === travelerId);
  const errors = {
    types: types.length === 0 ? 'Choose at least one kind of help so the airline can prepare.' : undefined,
    notes:
      types.includes('other') && !notes.trim()
        ? 'Tell us what you need — the airline can’t arrange “something else” without details.'
        : undefined,
    phone:
      digitsOnly(phone).length < 10
        ? 'Enter a mobile number so the assistance team can reach you at the airport.'
        : undefined,
  };
  const visible: Partial<typeof errors> = hasTried ? errors : {};
  const labels = types.map((id) => ASSISTANCE_TYPES.find((type) => type.id === id)?.label ?? id);

  const send = async () => {
    setHasTried(true);
    if (Object.values(errors).some(Boolean)) return;
    await onSend(travelerId, labels);
    setIsSent(true);
  };

  if (isSent) {
    return (
      <Dialog
        open
        onClose={onClose}
        size="medium"
        title="Assistance requested"
        description="Free of charge · both flights"
        footer={
          <Button variant="primary" onClick={onClose}>
            Done
          </Button>
        }
      >
        <div className={styles.done}>
          <div className={styles.reference}>
            <span className={styles.currentLabel}>Request reference</span>
            <span className={styles.referenceValue}>VA-2611-0387</span>
          </div>
          <dl className={styles.doneFacts}>
            <div>
              <dt>Traveler</dt>
              <dd>{traveler ? `${traveler.firstNames.split(' ')[0]} ${traveler.lastName}` : ''}</dd>
            </div>
            <div>
              <dt>Help</dt>
              <dd>{labels.join(', ')}</dd>
            </div>
            <div>
              <dt>Flights</dt>
              <dd>{flights}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>Waiting for {booking.airlineName}</dd>
            </div>
          </dl>
          <p className={styles.body}>
            {booking.airlineName} usually confirms within 48 hours — we’ll email {booking.contact.email}. On
            the day, check in as normal and tell the bag-drop counter; someone will meet you there.
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
      title="Special assistance"
      description={`Free of charge. We pass your request to ${booking.airlineName} for ${flights}.`}
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
        <legend className={styles.legend}>Who needs help?</legend>
        <div className={styles.pills}>
          {booking.travelers.map((candidate) => (
            <label key={candidate.id} className={styles.pill}>
              <input
                type="radio"
                name="assist-traveler"
                className="visually-hidden"
                checked={travelerId === candidate.id}
                onChange={() => setTravelerId(candidate.id)}
              />
              {candidate.firstNames.split(' ')[0]} {candidate.lastName}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset
        className={clsx(styles.group, visible.types && styles.groupInvalid)}
        aria-describedby={visible.types ? 'assist-types-error' : undefined}
      >
        <legend className={styles.legend}>
          What kind of help? <span className={styles.legendNote}>· choose all that apply</span>
        </legend>
        <div className={styles.grid}>
          {ASSISTANCE_TYPES.map((type) => (
            <ChoiceCard
              key={type.id}
              type="checkbox"
              title={type.label}
              description={type.description}
              checked={types.includes(type.id)}
              onChange={(event) =>
                setTypes((previous) =>
                  event.target.checked ? [...previous, type.id] : previous.filter((id) => id !== type.id),
                )
              }
            />
          ))}
        </div>
        {visible.types && (
          <p id="assist-types-error" role="alert" className={styles.error}>
            {visible.types}
          </p>
        )}
      </fieldset>

      <TextAreaField
        label="Anything else the crew should know?"
        required={types.includes('other')}
        rows={3}
        maxLength={300}
        showCount
        value={notes}
        error={visible.notes}
        onChange={(event) => setNotes(event.target.value)}
      />
      <TextField
        label="Mobile number on the day"
        required
        prefix="+63"
        inputMode="tel"
        value={phone}
        error={visible.phone}
        onChange={(event) => setPhone(event.target.value)}
      />
    </Dialog>
  );
}

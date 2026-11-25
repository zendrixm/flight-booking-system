import { useState } from 'react';

import { useSession } from '@/app/providers';
import { Icon } from '@/components/icons';
import { Button, ChoiceCard, Dialog, SegmentedControl, SelectField, TextField } from '@/components/ui';
import { maskInternationalMobile } from '@/lib/phone';
import { listCallbackSlots, requestCallback } from '@/services/helpService';
import type { SupportTopic } from '@/types/help';

import {
  CALLBACK_TOPICS,
  callbackErrors,
  sanitizeReference,
  SUPPORT_TOPIC_LABELS,
  type CallbackForm,
} from '../lib/supportForms';
import styles from './SupportDialogs.module.css';

interface CallbackDialogProps {
  onClose: () => void;
  /** Called with a one-line summary, e.g. "We’ll call +63 917 ••• 0123 within 15 minutes". */
  onRequested: (summary: string) => void;
}

const INITIAL_FORM: CallbackForm = {
  numberChoice: 'account',
  otherNumber: '',
  topic: '',
  bookingReference: '',
  timing: 'asap',
  slotId: '',
};

export function CallbackDialog({ onClose, onRequested }: CallbackDialogProps) {
  const { customer } = useSession();
  const slots = listCallbackSlots();
  const [form, setForm] = useState(INITIAL_FORM);
  const [hasTried, setHasTried] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [caseNumber, setCaseNumber] = useState<string>();

  const errors = callbackErrors(form);
  const visible: Partial<typeof errors> = hasTried ? errors : {};
  const update = (patch: Partial<CallbackForm>) => setForm((previous) => ({ ...previous, ...patch }));
  const accountNumber = customer ? maskInternationalMobile(customer.mobile) : '';
  const numberToCall = form.numberChoice === 'other' ? form.otherNumber.trim() : accountNumber;
  const slot = slots.find((candidate) => candidate.id === form.slotId);
  const whenLine =
    form.timing === 'scheduled' && slot
      ? `We’ll call you ${slot.dayLabel === 'Today' ? 'today' : `on ${slot.dayLabel}`} at ${slot.time}`
      : 'We’ll call you within 15 minutes';

  const submit = async () => {
    if (Object.keys(errors).length > 0 || !form.topic) {
      setHasTried(true);
      return;
    }
    setIsSending(true);
    try {
      const result = await requestCallback({
        phoneNumber: form.numberChoice === 'other' ? form.otherNumber.trim() : (customer?.mobile ?? ''),
        topic: form.topic,
        bookingReference: form.bookingReference,
        slotId: form.timing === 'scheduled' ? form.slotId : null,
      });
      setCaseNumber(result.caseNumber);
      onRequested(`${whenLine.replace('We’ll call you', `We’ll call ${numberToCall}`)}.`);
    } finally {
      setIsSending(false);
    }
  };

  if (caseNumber) {
    return (
      <Dialog
        open
        onClose={onClose}
        size="medium"
        title="Call requested"
        description={`Case ${caseNumber} · we’ve emailed you a confirmation`}
        footer={
          <Button variant="primary" onClick={onClose}>
            Done
          </Button>
        }
      >
        <div role="status" className={styles.confirmation}>
          <div className={styles.confirmationBanner}>
            <span className={styles.confirmationIcon} aria-hidden="true">
              <Icon name="check" size={20} strokeWidth={2.4} />
            </span>
            <span className={styles.confirmationText}>
              <span className={styles.confirmationTitle}>{whenLine}</span>
              <span className={styles.muted}>On {numberToCall}</span>
            </span>
          </div>
          <dl className={styles.rows}>
            {[
              { label: 'About', value: form.topic ? SUPPORT_TOPIC_LABELS[form.topic] : '—' },
              { label: 'Booking', value: form.bookingReference || 'Not given' },
              { label: 'Case number', value: caseNumber },
            ].map((row) => (
              <div key={row.label} className={styles.row}>
                <dt className={styles.rowLabel}>{row.label}</dt>
                <dd className={styles.rowValue}>{row.value}</dd>
              </div>
            ))}
          </dl>
          <p className={styles.note}>
            Keep your phone nearby — the call shows as Vela Support. If we miss you, we’ll try once more and
            then email {customer?.email ?? 'you'}.
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
      title="Request a call back"
      description="A travel specialist calls you — no hold music"
      footer={
        <>
          <Button variant="quiet" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" iconStart="smartphone" loading={isSending} onClick={submit}>
            Request call
          </Button>
        </>
      }
    >
      <fieldset className={styles.group}>
        <legend className={styles.legend}>Number to call</legend>
        <div className={styles.choices}>
          <ChoiceCard
            name="callback-number"
            checked={form.numberChoice === 'account'}
            onChange={() => update({ numberChoice: 'account' })}
            title={accountNumber || 'Mobile on your account'}
            description="Mobile on your account"
          />
          <ChoiceCard
            name="callback-number"
            checked={form.numberChoice === 'other'}
            onChange={() => update({ numberChoice: 'other' })}
            title="Another number"
            description="For this call only"
          />
        </div>
        {form.numberChoice === 'other' && (
          <TextField
            label="Phone number"
            labelHidden
            type="tel"
            autoComplete="tel"
            placeholder="+63 917 555 0123"
            value={form.otherNumber}
            error={visible.otherNumber}
            onChange={(event) => update({ otherNumber: event.target.value })}
          />
        )}
      </fieldset>

      <div className={styles.twoColumns}>
        <SelectField
          label="What’s it about?"
          required
          placeholder="Choose a topic"
          options={CALLBACK_TOPICS.map((topic) => ({ value: topic, label: SUPPORT_TOPIC_LABELS[topic] }))}
          value={form.topic}
          error={visible.topic}
          onChange={(event) => update({ topic: event.target.value as SupportTopic })}
        />
        <TextField
          label="Booking reference"
          placeholder="e.g. VL3MZ8"
          inputClassName={styles.reference}
          value={form.bookingReference}
          onChange={(event) => update({ bookingReference: sanitizeReference(event.target.value) })}
        />
      </div>

      <fieldset className={styles.group}>
        <legend className={styles.legend}>When should we call?</legend>
        <SegmentedControl
          label="When should we call?"
          appearance="soft"
          fullWidth
          options={[
            { value: 'asap', label: 'As soon as possible' },
            { value: 'scheduled', label: 'Pick a time' },
          ]}
          value={form.timing}
          onChange={(timing) => update({ timing })}
        />
        {form.timing === 'scheduled' && (
          <div role="radiogroup" aria-label="Time slot" className={styles.slots}>
            {slots.map((candidate) => (
              <label key={candidate.id} className={visible.slotId ? styles.slotInvalid : styles.slot}>
                <input
                  type="radio"
                  name="callback-slot"
                  className="visually-hidden"
                  checked={form.slotId === candidate.id}
                  onChange={() => update({ slotId: candidate.id })}
                />
                <span className={styles.slotDay}>{candidate.dayLabel}</span>
                <span className={styles.slotTime}>{candidate.time}</span>
              </label>
            ))}
          </div>
        )}
        {visible.slotId && (
          <span role="alert" className={styles.fileError}>
            {visible.slotId}
          </span>
        )}
      </fieldset>
    </Dialog>
  );
}

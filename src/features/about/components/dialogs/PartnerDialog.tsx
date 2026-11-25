import { useState } from 'react';

import { Alert, Button, Dialog, SelectField, TextAreaField, TextField } from '@/components/ui';
import { firstNameOf } from '@/lib/format';
import { sendPartnerEnquiry } from '@/services/companyService';
import { ApiError } from '@/services/mockApi';

import {
  BLANK_PARTNER_ENQUIRY,
  PARTNER_KIND_OPTIONS,
  partnerErrors,
  partnerKindFrom,
  type PartnerForm,
} from '../../lib/contactForms';
import styles from './AboutDialogs.module.css';
import { ContactFields } from './ContactFields';
import { SentDialog } from './SentDialog';

interface PartnerDialogProps {
  onClose: () => void;
}

export function PartnerDialog({ onClose }: PartnerDialogProps) {
  const [form, setForm] = useState<PartnerForm>(BLANK_PARTNER_ENQUIRY);
  const [hasTried, setHasTried] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string>();
  const [sentTo, setSentTo] = useState<{ name: string; email: string }>();

  const errors = partnerErrors(form);
  const visible: Partial<typeof errors> = hasTried ? errors : {};
  const update = (patch: Partial<PartnerForm>) => setForm((previous) => ({ ...previous, ...patch }));

  const send = async () => {
    if (Object.keys(errors).length > 0) {
      setHasTried(true);
      return;
    }
    setIsSending(true);
    setSendError(undefined);
    try {
      const enquiry = {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        company: form.company.trim(),
        kind: form.kind,
        message: form.message.trim(),
      };
      await sendPartnerEnquiry(enquiry);
      setSentTo({ name: firstNameOf(enquiry.fullName), email: enquiry.email });
    } catch (error) {
      setSendError(error instanceof ApiError ? error.message : 'We couldn’t send your message. Try again.');
    } finally {
      setIsSending(false);
    }
  };

  if (sentTo) {
    return (
      <SentDialog
        message={`Thanks, ${sentTo.name} — our partnerships team will reply to ${sentTo.email} within 2 working days.`}
        onClose={onClose}
      />
    );
  }

  return (
    <Dialog
      open
      onClose={onClose}
      size="large"
      title="Partner with Vela"
      description="Tell us a little about you and our partnerships team will be in touch."
      busy={isSending}
      footer={
        <>
          <Button variant="quiet" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" loading={isSending} loadingLabel="Sending…" onClick={send}>
            Send
          </Button>
        </>
      }
    >
      <form
        className={styles.form}
        aria-label="Partner with Vela"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void send();
        }}
      >
        {sendError && (
          <Alert tone="danger" role="alert">
            {sendError}
          </Alert>
        )}
        <ContactFields form={form} errors={visible} onChange={update} />
        <div className={styles.fieldRow}>
          <TextField
            label="Company"
            required
            autoComplete="organization"
            value={form.company}
            error={visible.company}
            onChange={(event) => update({ company: event.target.value })}
          />
          <SelectField
            label="You are"
            required
            value={form.kind}
            options={PARTNER_KIND_OPTIONS}
            onChange={(event) => update({ kind: partnerKindFrom(event.target.value) ?? form.kind })}
          />
        </div>
        <TextAreaField
          label="How could we work together?"
          required
          rows={4}
          placeholder="Routes, volumes, timelines — whatever helps"
          value={form.message}
          error={visible.message}
          onChange={(event) => update({ message: event.target.value })}
        />
      </form>
    </Dialog>
  );
}

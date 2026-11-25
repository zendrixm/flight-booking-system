import { useRef, useState } from 'react';

import { useSession } from '@/app/providers';
import { Icon } from '@/components/icons';
import { Button, Dialog, IconButton, SelectField, TextAreaField, TextField } from '@/components/ui';
import { sendSupportMessage } from '@/services/helpService';
import type { SupportTopic } from '@/types/help';

import {
  ACCEPTED_ATTACHMENTS,
  formatFileSize,
  MAX_ATTACHMENT_BYTES,
  MAX_ATTACHMENTS,
  MESSAGE_TOPICS,
  messageErrors,
  messageHint,
  MIN_MESSAGE_LENGTH,
  sanitizeReference,
  SUPPORT_TOPIC_LABELS,
  type MessageForm,
} from '../lib/supportForms';
import type { MessagePrefill } from '../state/helpSupportContext';
import styles from './SupportDialogs.module.css';

interface MessageDialogProps {
  prefill?: MessagePrefill;
  onClose: () => void;
  onOpenChat: () => void;
}

/** "Write to us": a support case with optional attachments; best for receipts and anything with files. */
export function MessageDialog({ prefill, onClose, onOpenChat }: MessageDialogProps) {
  const { customer } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<MessageForm>({
    topic: prefill?.topic ?? '',
    bookingReference: prefill?.bookingReference ?? '',
    replyTo: customer?.email ?? '',
    body: '',
    attachments: [],
  });
  const [hasTried, setHasTried] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [rejectedFile, setRejectedFile] = useState<string>();
  const [caseNumber, setCaseNumber] = useState<string>();

  const errors = messageErrors(form);
  const visible: Partial<typeof errors> = hasTried ? errors : {};
  const hasErrors = Object.keys(errors).length > 0;
  const bodyLength = form.body.trim().length;
  const update = (patch: Partial<MessageForm>) => setForm((previous) => ({ ...previous, ...patch }));

  const addFiles = (files: FileList | null) => {
    const picked = Array.from(files ?? []);
    const tooBig = picked.find((file) => file.size > MAX_ATTACHMENT_BYTES);
    setRejectedFile(tooBig ? `${tooBig.name} is over 10 MB, so it wasn’t added.` : undefined);
    const accepted = picked.filter((file) => file.size <= MAX_ATTACHMENT_BYTES);
    if (accepted.length) {
      update({ attachments: [...form.attachments, ...accepted].slice(0, MAX_ATTACHMENTS) });
    }
  };

  const send = async () => {
    if (hasErrors || !form.topic) {
      setHasTried(true);
      return;
    }
    setIsSending(true);
    try {
      const result = await sendSupportMessage({
        topic: form.topic,
        bookingReference: form.bookingReference,
        replyTo: form.replyTo.trim(),
        body: form.body.trim(),
        attachments: form.attachments.map((file) => ({ name: file.name, size: file.size })),
      });
      setCaseNumber(result.caseNumber);
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
        title="Message sent"
        description="We’ve emailed you a copy"
        footer={
          <>
            <Button variant="quiet" onClick={onOpenChat}>
              Chat with us now
            </Button>
            <Button variant="primary" onClick={onClose}>
              Done
            </Button>
          </>
        }
      >
        <div role="status" className={styles.confirmation}>
          <div className={styles.confirmationBanner}>
            <span className={styles.confirmationIcon} aria-hidden="true">
              <Icon name="check" size={20} strokeWidth={2.4} />
            </span>
            <span className={styles.confirmationText}>
              <span className={styles.confirmationLabel}>Case number</span>
              <span className={styles.confirmationValue}>{caseNumber}</span>
            </span>
          </div>
          <dl className={styles.rows}>
            {[
              { label: 'Topic', value: form.topic ? SUPPORT_TOPIC_LABELS[form.topic] : '—' },
              { label: 'Booking', value: form.bookingReference || 'Not given' },
              { label: 'Reply to', value: form.replyTo.trim() },
              {
                label: 'Attachments',
                value: form.attachments.length
                  ? `${form.attachments.length} ${form.attachments.length === 1 ? 'file' : 'files'}`
                  : 'None',
              },
            ].map((row) => (
              <div key={row.label} className={styles.row}>
                <dt className={styles.rowLabel}>{row.label}</dt>
                <dd className={styles.rowValue}>{row.value}</dd>
              </div>
            ))}
          </dl>
          <p className={styles.note}>
            Expect a reply within 24 hours, usually much sooner. If you chat with us in the meantime, mention{' '}
            {caseNumber} so we can pick up where you left off.
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
      title="Write to us"
      description="A travel specialist replies within 24 hours"
      footer={
        <>
          <Button variant="quiet" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" loading={isSending} onClick={send}>
            Send message
          </Button>
        </>
      }
    >
      <div className={styles.twoColumns}>
        <SelectField
          label="Topic"
          required
          placeholder="Choose a topic"
          options={MESSAGE_TOPICS.map((topic) => ({ value: topic, label: SUPPORT_TOPIC_LABELS[topic] }))}
          value={form.topic}
          error={visible.topic}
          onChange={(event) => update({ topic: event.target.value as SupportTopic })}
        />
        <TextField
          label="Booking reference"
          placeholder="e.g. VL7Q2K"
          inputClassName={styles.reference}
          value={form.bookingReference}
          error={form.bookingReference.length === 6 || hasTried ? errors.bookingReference : undefined}
          onChange={(event) => update({ bookingReference: sanitizeReference(event.target.value) })}
        />
      </div>
      <TextField
        label="Reply to"
        required
        type="email"
        autoComplete="email"
        value={form.replyTo}
        error={visible.replyTo}
        onChange={(event) => update({ replyTo: event.target.value })}
      />
      <TextAreaField
        label="Message"
        required
        rows={4}
        maxLength={2000}
        placeholder="Tell us what happened and what you’d like us to do. Include dates and names if it helps."
        value={form.body}
        error={visible.body}
        hint={
          bodyLength >= MIN_MESSAGE_LENGTH
            ? `${bodyLength} characters`
            : `${bodyLength} / ${MIN_MESSAGE_LENGTH} minimum`
        }
        onChange={(event) => update({ body: event.target.value })}
      />
      <div className={styles.attachments}>
        <span className={styles.attachmentsLabel}>
          Attachments <span className={styles.muted}>· up to {MAX_ATTACHMENTS} files</span>
        </span>
        <div className={styles.files}>
          {form.attachments.map((file, index) => (
            <span key={`${file.name}-${index}`} className={styles.file}>
              <Icon name="paperclip" size={14} strokeWidth={1.8} />
              <span className={styles.fileName}>{file.name}</span>
              <span className={styles.muted}>{formatFileSize(file.size)}</span>
              <IconButton
                icon="close"
                label={`Remove ${file.name}`}
                size="small"
                onClick={() =>
                  update({ attachments: form.attachments.filter((_, position) => position !== index) })
                }
              />
            </span>
          ))}
          {form.attachments.length < MAX_ATTACHMENTS && (
            <Button
              variant="quiet"
              size="small"
              iconStart="paperclip"
              onClick={() => fileInputRef.current?.click()}
            >
              Attach a file
            </Button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={ACCEPTED_ATTACHMENTS}
            className="visually-hidden"
            tabIndex={-1}
            aria-hidden="true"
            onChange={(event) => {
              addFiles(event.target.files);
              event.target.value = '';
            }}
          />
        </div>
        <span
          className={rejectedFile ? styles.fileError : styles.muted}
          role={rejectedFile ? 'alert' : undefined}
        >
          {rejectedFile ??
            'PDF, JPG or PNG, up to 10 MB each. Photos of receipts or bag tags help us move faster.'}
        </span>
      </div>
      <p className={hasErrors ? (hasTried ? styles.hintProblem : styles.hint) : styles.hintReady}>
        {messageHint(errors)}
      </p>
    </Dialog>
  );
}

import { useState, type FormEvent } from 'react';

import { Icon } from '@/components/icons';
import { Button, Dialog, IconButton, TextAreaField, TextField } from '@/components/ui';
import { joinWithAnd } from '@/lib/format';
import { isValidEmail } from '@/lib/validation';

import styles from './EmailItineraryDialog.module.css';

const MAX_RECIPIENTS = 5;
const NOTE_LIMIT = 300;

interface EmailItineraryDialogProps {
  open: boolean;
  onClose: () => void;
  /** "Tokyo · 12–19 Nov · VL7Q2K" */
  tripLine: string;
  defaultRecipient: string;
  notePlaceholder: string;
}

/** Send the itinerary to up to five people, with an optional note. */
export function EmailItineraryDialog({
  open,
  onClose,
  tripLine,
  defaultRecipient,
  notePlaceholder,
}: EmailItineraryDialogProps) {
  const [recipients, setRecipients] = useState<string[]>([defaultRecipient]);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string>();
  const [note, setNote] = useState('');
  const [sentTo, setSentTo] = useState<string[] | null>(null);

  /** Adds the typed address; returns the new list, or null when the address can't be added. */
  const addDraft = (): string[] | null => {
    const address = draft.trim().toLowerCase();
    if (!address) return recipients;
    if (!isValidEmail(address)) return fail('Enter a full email address, like name@example.com.');
    if (recipients.includes(address)) return fail('That address is already on the list.');
    if (recipients.length >= MAX_RECIPIENTS) {
      return fail(`You can send to up to ${MAX_RECIPIENTS} addresses at a time.`);
    }
    const next = [...recipients, address];
    setRecipients(next);
    setDraft('');
    return next;
  };

  function fail(message: string) {
    setError(message);
    return null;
  }

  const handleAdd = (event: FormEvent) => {
    event.preventDefault();
    addDraft();
  };

  const handleSend = () => {
    const list = addDraft();
    if (list && list.length) setSentTo(list);
  };

  const startOver = () => {
    setSentTo(null);
    setRecipients([]);
    setNote('');
    setDraft('');
    setError(undefined);
  };

  const canSend = recipients.length > 0 || draft.trim().length > 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="large"
      title={sentTo ? 'Itinerary sent' : 'Email itinerary'}
      description={tripLine}
      footer={
        sentTo ? (
          <>
            <Button variant="quiet" onClick={startOver}>
              Send to someone else
            </Button>
            <Button variant="primary" onClick={onClose}>
              Done
            </Button>
          </>
        ) : (
          <>
            <Button variant="quiet" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" disabled={!canSend} onClick={handleSend}>
              {recipients.length > 1 ? `Send to ${recipients.length} people` : 'Send itinerary'}
            </Button>
          </>
        )
      }
    >
      {sentTo ? (
        <div role="status" className={styles.sent}>
          <span className={styles.sentIcon}>
            <Icon name="check" size={22} strokeWidth={2.2} />
          </span>
          <p>
            Sent to <strong>{joinWithAnd(sentTo)}</strong>. It can take a couple of minutes to arrive — check
            spam if it doesn’t.
          </p>
        </div>
      ) : (
        <>
          <div className={styles.recipients}>
            <span id="email-recipients-label" className={styles.label}>
              Send to
            </span>
            <ul aria-labelledby="email-recipients-label" className={styles.chips}>
              {recipients.map((address) => (
                <li key={address} className={styles.chip}>
                  <span className={styles.address}>{address}</span>
                  <IconButton
                    icon="close"
                    size="small"
                    label={`Remove ${address}`}
                    onClick={() => {
                      setRecipients(recipients.filter((item) => item !== address));
                      setError(undefined);
                    }}
                  />
                </li>
              ))}
              {recipients.length === 0 && <li className={styles.empty}>Add at least one email address.</li>}
            </ul>
          </div>
          <form className={styles.addRow} onSubmit={handleAdd} noValidate>
            <TextField
              className={styles.addField}
              label="Add another address"
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              value={draft}
              error={error}
              onChange={(event) => {
                setDraft(event.target.value);
                setError(undefined);
              }}
            />
            <Button
              type="submit"
              variant="quiet"
              size="large"
              className={styles.addButton}
              disabled={!draft.trim()}
            >
              Add
            </Button>
          </form>
          <TextAreaField
            label="Note"
            showCount
            rows={3}
            maxLength={NOTE_LIMIT}
            placeholder={notePlaceholder}
            value={note}
            onChange={(event) => setNote(event.target.value.slice(0, NOTE_LIMIT))}
          />
          <p className={styles.privacy}>
            <Icon name="shield" size={16} />
            Includes both flights, seats, bags and e-ticket numbers. Payment details are left out.
          </p>
        </>
      )}
    </Dialog>
  );
}

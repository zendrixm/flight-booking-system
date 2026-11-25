import { useState } from 'react';

import { Button, Dialog, TextAreaField, TextField } from '@/components/ui';
import { formatPeso } from '@/lib/format';
import { isValidEmail, isValidTin } from '@/lib/validation';
import type { InvoiceRequest } from '@/services/manageBookingService';
import type { ManagedBooking } from '@/types/managedBooking';

import styles from './ManageDialogs.module.css';

interface InvoiceDialogProps {
  booking: ManagedBooking;
  isSaving: boolean;
  onClose: () => void;
  onRequest: (request: InvoiceRequest) => Promise<void>;
}

/** A BIR-registered invoice in a company's name, for expense claims. */
export function InvoiceDialog({ booking, isSaving, onClose, onRequest }: InvoiceDialogProps) {
  const [request, setRequest] = useState<InvoiceRequest>({
    company: '',
    tin: '',
    address: '',
    email: booking.contact.email,
  });
  const [hasTried, setHasTried] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const update = (patch: Partial<InvoiceRequest>) => setRequest((previous) => ({ ...previous, ...patch }));
  const totalPaid = booking.payments
    .filter((payment) => payment.amount > 0)
    .reduce((sum, payment) => sum + payment.amount, 0);

  const errors = {
    company: request.company.trim() ? undefined : 'Enter the company name as registered with the BIR.',
    tin: isValidTin(request.tin)
      ? undefined
      : 'A TIN has 9 digits plus a 3–5 digit branch code, like 123-456-789-00000.',
    address:
      request.address.trim().length >= 10
        ? undefined
        : 'Enter the address printed on the company’s BIR certificate.',
    email: isValidEmail(request.email.trim()) ? undefined : 'Enter a full email address.',
  };
  const visible: Partial<typeof errors> = hasTried ? errors : {};

  const send = async () => {
    setHasTried(true);
    if (Object.values(errors).some(Boolean)) return;
    await onRequest(request);
    setIsSent(true);
  };

  if (isSent) {
    return (
      <Dialog
        open
        onClose={onClose}
        size="medium"
        title="Invoice on its way"
        description={`For booking ${booking.reference}`}
        footer={
          <Button variant="primary" onClick={onClose}>
            Done
          </Button>
        }
      >
        <div className={styles.done}>
          <div className={styles.reference}>
            <span className={styles.currentLabel}>Invoice requested</span>
            <span className={styles.referenceValue}>VI-2610-0042</span>
          </div>
          <dl className={styles.doneFacts}>
            <div>
              <dt>Company</dt>
              <dd>{request.company}</dd>
            </div>
            <div>
              <dt>TIN</dt>
              <dd>{request.tin}</dd>
            </div>
            <div>
              <dt>Amount</dt>
              <dd>{formatPeso(totalPaid)} incl. VAT</dd>
            </div>
            <div>
              <dt>Send to</dt>
              <dd>{request.email}</dd>
            </div>
          </dl>
          <p className={styles.body}>
            The BIR-registered invoice arrives as a PDF within 1 working day. It replaces the receipt for
            expense claims.
          </p>
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog
      open
      onClose={onClose}
      size="medium"
      title="Official invoice"
      description="A BIR-registered invoice in your company’s name, for expense claims."
      footer={
        <>
          <Button variant="quiet" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" loading={isSaving} onClick={send}>
            Request invoice
          </Button>
        </>
      }
    >
      <TextField
        label="Registered company name"
        required
        autoComplete="organization"
        value={request.company}
        error={visible.company}
        onChange={(event) => update({ company: event.target.value })}
      />
      <TextField
        label="TIN"
        required
        inputMode="numeric"
        placeholder="123-456-789-00000"
        value={request.tin}
        error={visible.tin}
        onChange={(event) => update({ tin: event.target.value })}
      />
      <TextAreaField
        label="Registered address"
        required
        rows={2}
        value={request.address}
        error={visible.address}
        onChange={(event) => update({ address: event.target.value })}
      />
      <TextField
        label="Send to"
        required
        type="email"
        value={request.email}
        error={visible.email}
        onChange={(event) => update({ email: event.target.value })}
      />
    </Dialog>
  );
}

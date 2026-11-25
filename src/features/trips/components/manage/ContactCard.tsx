import { Alert, Button } from '@/components/ui';
import type { ManagedBooking } from '@/types/managedBooking';

import styles from './BookingSections.module.css';

function maskMobile(number: string) {
  const digits = number.replace(/\D/g, '');
  return digits.length >= 10 ? `+63 ${digits.slice(0, 3)} ••• ${digits.slice(6)}` : `+63 ${number}`;
}

interface ContactCardProps {
  booking: ManagedBooking;
  isSaved: boolean;
  onEdit: () => void;
}

export function ContactCard({ booking, isSaved, onEdit }: ContactCardProps) {
  const { contact } = booking;
  return (
    <section className={styles.card} aria-labelledby="manage-contact-title">
      <div className={styles.header}>
        <span>
          <h2 id="manage-contact-title" className={styles.title}>
            Contact for this trip
          </h2>
          <span className={styles.subtitle}>
            Where {booking.airlineName} and Vela send gate changes, delays and new e-tickets
          </span>
        </span>
        <Button variant="quiet" size="small" disabled={booking.status === 'cancelled'} onClick={onEdit}>
          Edit contact details
        </Button>
      </div>
      {isSaved && (
        <Alert tone="success" role="status" icon="check">
          Saved. Updates for {booking.reference} now go to the details below.
        </Alert>
      )}
      <dl className={styles.contactList}>
        <div className={styles.contactItem}>
          <dt className={styles.fieldLabel}>Email</dt>
          <dd>{contact.email}</dd>
        </div>
        <div className={styles.contactItem}>
          <dt className={styles.fieldLabel}>Mobile</dt>
          <dd>
            {maskMobile(contact.mobile)}
            {contact.textUpdates ? ' · texts on' : ''}
          </dd>
        </div>
        <div className={styles.contactItem}>
          <dt className={styles.fieldLabel}>Also texts</dt>
          <dd>{contact.alternateMobile ? maskMobile(contact.alternateMobile) : 'No one else'}</dd>
        </div>
      </dl>
    </section>
  );
}

import clsx from 'clsx';
import { useState } from 'react';

import { Button, Dialog, StatusChip } from '@/components/ui';
import { AIRLINE_NAMES } from '@/data/airlineDesignators';
import { useAsyncData } from '@/hooks';
import { formatDayMonth } from '@/lib/date';
import { TICKETED_STATUSES } from '@/services/console/bookingQuery';
import { getConsoleBookings, resendItineraries } from '@/services/console/bookingsService';

import styles from './ResendItineraryDialog.module.css';

interface ResendItineraryDialogProps {
  references: readonly string[];
  onClose: () => void;
  onSent: (result: { sent: number; skipped: number }) => void;
}

/** Bulk resend: lists who will get their itinerary again and who is skipped because they have no tickets yet. */
export function ResendItineraryDialog({ references, onClose, onSent }: ResendItineraryDialogProps) {
  const bookings =
    useAsyncData(`resend-${references.join(',')}`, () => getConsoleBookings(references)).data ?? [];
  const [isSending, setIsSending] = useState(false);
  const sendable = bookings.filter((booking) => TICKETED_STATUSES.includes(booking.status));
  const skipped = bookings.length - sendable.length;

  const send = async () => {
    setIsSending(true);
    try {
      onSent(await resendItineraries(references));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog
      open
      onClose={onClose}
      size="medium"
      title={`Resend itinerary to ${sendable.length} ${sendable.length === 1 ? 'customer' : 'customers'}?`}
      description={`${references.length} ${references.length === 1 ? 'booking' : 'bookings'} selected${
        skipped ? ` · ${skipped} will be skipped` : ''
      }`}
      busy={isSending}
      footer={
        <>
          <Button variant="quiet" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" disabled={sendable.length === 0} loading={isSending} onClick={send}>
            {sendable.length
              ? `Send ${sendable.length} ${sendable.length === 1 ? 'itinerary' : 'itineraries'}`
              : 'Nothing to send'}
          </Button>
        </>
      }
    >
      <ul className={styles.list}>
        {bookings.map((booking) => {
          const willSend = TICKETED_STATUSES.includes(booking.status);
          return (
            <li key={booking.reference} className={clsx(styles.item, !willSend && styles.skipped)}>
              <span className={styles.text}>
                <span className={styles.title}>
                  {booking.reference} · {booking.leadTraveler}
                </span>
                <span className={styles.meta}>
                  {willSend
                    ? `${booking.email} · ${booking.route} · departs ${formatDayMonth(booking.departureDate)}`
                    : `${booking.status} · no e-tickets yet · ${AIRLINE_NAMES[booking.airline]}`}
                </span>
              </span>
              <StatusChip tone={willSend ? 'success' : 'muted'} hideDot size="compact">
                {willSend ? 'Will send' : 'Skipped'}
              </StatusChip>
            </li>
          );
        })}
      </ul>
    </Dialog>
  );
}

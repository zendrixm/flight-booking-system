import { useState } from 'react';

import { Avatar, Button, Dialog, Stepper } from '@/components/ui';
import { formatPeso, initialsOf, joinWithAnd, pluralize } from '@/lib/format';
import { EXTRA_BAG_PRICE_PER_FLIGHT } from '@/services/manageBookingService';
import type { ManagedBooking } from '@/types/managedBooking';

import styles from './ManageDialogs.module.css';

const MAX_EXTRA_BAGS = 2;

interface AddBagsDialogProps {
  booking: ManagedBooking;
  isSaving: boolean;
  onClose: () => void;
  onConfirm: (extraBags: Record<string, number>, pricePerBag: number, message: string) => void;
}

export function AddBagsDialog({ booking, isSaving, onClose, onConfirm }: AddBagsDialogProps) {
  const [extra, setExtra] = useState<Record<string, number>>({});
  const flightCount = booking.flights.length;
  const pricePerBag = EXTRA_BAG_PRICE_PER_FLIGHT * flightCount;
  const total = Object.values(extra).reduce((sum, count) => sum + count, 0);
  const flightNumbers = joinWithAnd(booking.flights.map((flight) => flight.flightNumber));

  const confirm = () => {
    const who = booking.travelers
      .filter((traveler) => extra[traveler.id])
      .map((traveler) => `${traveler.firstNames.split(' ')[0]} ${traveler.lastName}`);
    onConfirm(
      extra,
      pricePerBag,
      `${total} extra ${total === 1 ? 'bag' : 'bags'} added for ${joinWithAnd(who)} · ${formatPeso(total * pricePerBag)} charged to card ending ${booking.cardLast4}`,
    );
  };

  return (
    <Dialog
      open
      onClose={onClose}
      size="medium"
      title="Add checked bags"
      description={`Each extra 23 kg bag is ${formatPeso(EXTRA_BAG_PRICE_PER_FLIGHT)} per flight — ${formatPeso(pricePerBag)} for ${flightNumbers}. That’s about half the airport price.`}
      footer={
        <div className={styles.footerSplit}>
          <span className={styles.footerNote}>
            {total ? `${pluralize(total, 'bag')} · ${formatPeso(total * pricePerBag)}` : 'No bags added yet'}
            <span className={styles.footerSub}>Charged to card ending {booking.cardLast4}</span>
          </span>
          <span className={styles.footerButtons}>
            <Button variant="quiet" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" disabled={total === 0} loading={isSaving} onClick={confirm}>
              {total ? `Pay ${formatPeso(total * pricePerBag)}` : 'Pay'}
            </Button>
          </span>
        </div>
      }
    >
      <ul className={styles.rows}>
        {booking.travelers.map((traveler) => {
          const name = `${traveler.firstNames.split(' ')[0]} ${traveler.lastName}`;
          const added = extra[traveler.id] ?? 0;
          return (
            <li key={traveler.id} className={styles.row}>
              <Avatar initials={initialsOf(name)} size={40} tone="neutral" />
              <span className={styles.rowText}>
                <span className={styles.rowTitle}>{name}</span>
                <span className={styles.rowSub}>
                  {traveler.checkedBags > 1
                    ? `Has 1 included + ${traveler.checkedBags - 1} extra × 23 kg`
                    : 'Has 1 included × 23 kg'}
                </span>
              </span>
              <Stepper
                value={added}
                max={MAX_EXTRA_BAGS}
                decrementLabel={`Remove a bag for ${name}`}
                incrementLabel={`Add a bag for ${name}`}
                onChange={(value) => setExtra((previous) => ({ ...previous, [traveler.id]: value }))}
              />
            </li>
          );
        })}
      </ul>
    </Dialog>
  );
}

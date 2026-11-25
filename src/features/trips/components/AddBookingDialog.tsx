import { useState } from 'react';
import { Link } from 'react-router';

import { paths } from '@/app/paths';
import { Icon } from '@/components/icons';
import { Alert, Button, Dialog, StatusChip, TextField } from '@/components/ui';
import { addTripToAccount, lookUpTrip, type TripLookupResult } from '@/services/tripsService';
import type { Trip, TripStatus } from '@/types/trip';

import {
  getBookingLookupErrors,
  hasErrors,
  normalizeReferenceInput,
  type BookingLookupValues,
} from '../lib/bookingLookup';
import { tripDateRange } from '../lib/tripDates';
import styles from './AddBookingDialog.module.css';

const TAB_NAMES: Record<TripStatus, string> = { upcoming: 'Upcoming', past: 'Past', cancelled: 'Cancelled' };

interface AddBookingDialogProps {
  open: boolean;
  onClose: () => void;
  onAdded: (trip: Trip) => void;
  onShowExisting: (trip: Trip) => void;
}

/** Find a guest booking by reference and last name, check it, then add it to My trips. */
export function AddBookingDialog({ open, onClose, onAdded, onShowExisting }: AddBookingDialogProps) {
  const [values, setValues] = useState<BookingLookupValues>({ reference: '', lastName: '' });
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isWorking, setIsWorking] = useState(false);
  const [result, setResult] = useState<TripLookupResult | null>(null);
  const [searched, setSearched] = useState<BookingLookupValues | null>(null);

  const errors = hasSubmitted ? getBookingLookupErrors(values) : {};
  const isEmpty = !values.reference.trim() && !values.lastName.trim();

  const update = (patch: Partial<BookingLookupValues>) => {
    setValues((previous) => ({ ...previous, ...patch }));
    setResult(null);
  };

  const find = async () => {
    setHasSubmitted(true);
    if (hasErrors(getBookingLookupErrors(values))) return;
    setIsWorking(true);
    setResult(await lookUpTrip(values.reference, values.lastName));
    setSearched(values);
    setIsWorking(false);
  };

  const confirmAdd = async (trip: Trip) => {
    setIsWorking(true);
    await addTripToAccount(trip.reference);
    setIsWorking(false);
    onAdded(trip);
  };

  if (result?.kind === 'found') {
    const { trip } = result;
    return (
      <Dialog
        open={open}
        onClose={onClose}
        size="medium"
        title="Is this your booking?"
        description="We found it. Check the details before adding it to your account."
        footer={
          <>
            <Button variant="quiet" onClick={() => setResult(null)}>
              Not this booking
            </Button>
            <Button variant="primary" iconStart="plus" loading={isWorking} onClick={() => confirmAdd(trip)}>
              Add to My trips
            </Button>
          </>
        }
      >
        <div className={styles.found}>
          <div className={styles.chips}>
            <StatusChip tone="success" hideDot size="compact">
              <Icon name="check" size={12} strokeWidth={3} />
              Confirmed
            </StatusChip>
            <StatusChip tone="muted" hideDot size="compact">
              Ref {trip.reference}
            </StatusChip>
          </div>
          <div className={styles.heading}>
            <span className={styles.city}>{trip.city}</span>
            <span className={styles.dates}>
              {tripDateRange(trip)} {trip.departDate.slice(0, 4)} ·{' '}
              {trip.returnDate ? 'round trip' : 'one way'}
            </span>
          </div>
          <div className={styles.times}>
            <span className={styles.endpoint}>
              <span className={styles.time}>{trip.outbound.departure.time}</span>
              <span className={styles.airport}>
                {trip.outbound.departure.airportCode} {trip.outbound.departure.terminal}
              </span>
            </span>
            <span className={styles.line} aria-hidden="true" />
            <span className={styles.endpoint}>
              <span className={styles.time}>{trip.outbound.arrival.time}</span>
              <span className={styles.airport}>
                {trip.outbound.arrival.airportCode} {trip.outbound.arrival.terminal}
              </span>
            </span>
            <span className={styles.airport}>
              {trip.airlineName} {trip.flightNumbers.replace(' and ', ' · return ')}
            </span>
          </div>
          <dl className={styles.facts}>
            <div>
              <dt>Traveler</dt>
              <dd>Andrea Lim Reyes</dd>
            </div>
            <div>
              <dt>Booked</dt>
              <dd>As a guest · 28 Sep 2026</dd>
            </div>
          </dl>
        </div>
        <p className={styles.note}>
          <Icon name="info" size={16} />
          Adding it lets you check in, see receipts and get updates here. The person who booked keeps their
          access too.
        </p>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="medium"
      title="Add a booking"
      description="Booked as a guest or by someone else? Find it with the reference and a traveler’s last name."
      footer={
        <>
          <Button variant="quiet" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" disabled={isEmpty} loading={isWorking} onClick={find}>
            Find booking
          </Button>
        </>
      }
    >
      <TextField
        label="Booking reference"
        required
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        placeholder="e.g. VL5KX8"
        inputClassName={styles.reference}
        helpText="6 letters and numbers, at the top of your confirmation email."
        value={values.reference}
        error={errors.reference}
        onChange={(event) => update({ reference: normalizeReferenceInput(event.target.value) })}
      />
      <TextField
        label="Last name"
        required
        autoComplete="family-name"
        placeholder="As on the booking"
        value={values.lastName}
        error={errors.lastName}
        onChange={(event) => update({ lastName: event.target.value })}
      />
      {result?.kind === 'notFound' && searched && (
        <Alert tone="danger" role="alert" title="We couldn’t find that booking">
          No booking matches {searched.reference} with the last name “{searched.lastName.trim()}”. Check the
          reference in your confirmation email and use the last name exactly as booked.{' '}
          <Link to={`${paths.help}#chat`}>Ask us to find it</Link>
        </Alert>
      )}
      {result?.kind === 'alreadyInAccount' && (
        <Alert
          tone="attention"
          icon="info"
          role="status"
          title="This booking is already in My trips"
          action={
            <Button variant="quiet" size="small" onClick={() => onShowExisting(result.trip)}>
              Show it
            </Button>
          }
        >
          {result.trip.reference} · {result.trip.city} is on the {TAB_NAMES[result.trip.status]} tab.
        </Alert>
      )}
    </Dialog>
  );
}

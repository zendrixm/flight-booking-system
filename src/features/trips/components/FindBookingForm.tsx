import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';

import { paths } from '@/app/paths';
import { Alert, Button, TextField } from '@/components/ui';
import { lookUpTrip } from '@/services/tripsService';

import {
  getBookingLookupErrors,
  hasErrors,
  normalizeReferenceInput,
  type BookingLookupErrors,
  type BookingLookupValues,
} from '../lib/bookingLookup';
import styles from './FindBookingForm.module.css';

type LookupStatus = 'idle' | 'searching' | 'notFound';

/** "Already booked?" — find a booking by reference and last name, then open Manage booking. */
export function FindBookingForm() {
  const navigate = useNavigate();
  const [values, setValues] = useState<BookingLookupValues>({ reference: '', lastName: '' });
  const [errors, setErrors] = useState<BookingLookupErrors>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [status, setStatus] = useState<LookupStatus>('idle');
  const [searchedFor, setSearchedFor] = useState<BookingLookupValues | null>(null);

  const updateValue = (field: keyof BookingLookupValues, value: string) => {
    const next = { ...values, [field]: value };
    setValues(next);
    setStatus('idle');
    if (hasSubmitted) setErrors(getBookingLookupErrors(next));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setHasSubmitted(true);
    const nextErrors = getBookingLookupErrors(values);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    setStatus('searching');
    const result = await lookUpTrip(values.reference, values.lastName);
    if (result.kind === 'notFound') {
      setSearchedFor(values);
      setStatus('notFound');
      return;
    }
    navigate(paths.trip(result.trip.reference));
  };

  return (
    <section id="find-booking" className={styles.panel} aria-labelledby="find-booking-title">
      <div className={styles.intro}>
        <h2 id="find-booking-title" className={styles.title}>
          Already booked?
        </h2>
        <p className={styles.description}>
          Change seats, add bags or update travelers. Online check-in opens 48 hours before departure.
        </p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <TextField
          className={styles.field}
          inputClassName={styles.referenceInput}
          label="Booking reference"
          required
          placeholder="e.g. VL7Q2K"
          autoComplete="off"
          spellCheck={false}
          value={values.reference}
          onChange={(event) => updateValue('reference', normalizeReferenceInput(event.target.value))}
          error={errors.reference}
        />
        <TextField
          className={styles.field}
          label="Last name"
          required
          placeholder="As on your booking"
          autoComplete="family-name"
          value={values.lastName}
          onChange={(event) => updateValue('lastName', event.target.value)}
          error={errors.lastName}
        />
        <Button
          type="submit"
          variant="secondary"
          size="large"
          className={styles.submit}
          loading={status === 'searching'}
          loadingLabel="Finding…"
        >
          Find booking
        </Button>

        {status === 'notFound' && searchedFor && (
          <Alert
            tone="danger"
            role="alert"
            className={styles.notFound}
            action={
              <Link to={paths.trips} className={styles.notFoundLink}>
                See my trips
              </Link>
            }
          >
            No booking matches {searchedFor.reference} and “{searchedFor.lastName.trim()}”. Check the
            reference in your confirmation email — it’s 6 letters and numbers.
          </Alert>
        )}
      </form>
    </section>
  );
}

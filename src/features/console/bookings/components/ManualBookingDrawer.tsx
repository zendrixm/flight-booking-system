import { useState } from 'react';

import {
  Alert,
  Button,
  ChoiceCard,
  Dialog,
  Drawer,
  SegmentedControl,
  SelectField,
  Stepper,
  TextAreaField,
  TextField,
} from '@/components/ui';
import { DEMO_TODAY } from '@/config/demo';
import { AIRLINE_NAMES } from '@/data/airlineDesignators';
import { formatPeso } from '@/lib/format';
import { createManualBooking } from '@/services/console/bookingsService';
import type { AirlineCode, ConsoleBooking, TripType } from '@/types/console/booking';

import {
  BLANK_MANUAL_BOOKING,
  FARE_OPTIONS,
  isManualBookingChanged,
  MANUAL_BOOKING_AIRPORTS,
  manualBookingErrors,
  manualBookingSummary,
  MAX_MANUAL_TRAVELERS,
  parseQuotedTotal,
  toManualBookingInput,
  type ManualBookingForm,
} from '../lib/manualBookingForm';
import styles from './ManualBookingDrawer.module.css';

const AIRLINE_OPTIONS = (Object.keys(AIRLINE_NAMES) as AirlineCode[]).map((code) => ({
  value: code,
  label: AIRLINE_NAMES[code],
}));

interface ManualBookingDrawerProps {
  onClose: () => void;
  onCreated: (booking: ConsoleBooking) => void;
}

/** An agent books for a customer by phone or at the office; the customer gets a payment link or an invoice. */
export function ManualBookingDrawer({ onClose, onCreated }: ManualBookingDrawerProps) {
  const [form, setForm] = useState<ManualBookingForm>(BLANK_MANUAL_BOOKING);
  const [hasTried, setHasTried] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDiscardOpen, setIsDiscardOpen] = useState(false);

  const errors = manualBookingErrors(form);
  const visible: Partial<typeof errors> = hasTried ? errors : {};
  const errorCount = Object.keys(visible).length;
  const update = (patch: Partial<ManualBookingForm>) => setForm((previous) => ({ ...previous, ...patch }));
  const quotedTotal = parseQuotedTotal(form.total);
  const customerName = `${form.firstName} ${form.lastName}`.trim() || 'this customer';

  const requestClose = () => {
    if (isManualBookingChanged(form)) setIsDiscardOpen(true);
    else onClose();
  };

  const submit = async () => {
    if (Object.keys(errors).length > 0) {
      setHasTried(true);
      return;
    }
    setIsSaving(true);
    try {
      onCreated(await createManualBooking(toManualBookingInput(form)));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Drawer
        open
        onClose={requestClose}
        size="wide"
        title="Manual booking"
        description="Agent channel · Philippines market · the customer gets a payment link"
        footer={
          <div className={styles.footer}>
            <span className={styles.footerSummary}>
              <span className={styles.footerNote}>{manualBookingSummary(form)}</span>
              <strong className={styles.footerTotal}>{quotedTotal ? formatPeso(quotedTotal) : '₱—'}</strong>
            </span>
            <span className={styles.footerActions}>
              <Button variant="quiet" onClick={requestClose}>
                Cancel
              </Button>
              <Button variant="primary" loading={isSaving} onClick={submit}>
                Create booking
              </Button>
            </span>
          </div>
        }
      >
        <form
          className={styles.form}
          noValidate
          aria-label="Manual booking"
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
        >
          {errorCount > 0 && (
            <Alert tone="danger" role="alert">
              {errorCount === 1
                ? 'One field needs attention before the booking can be created.'
                : `${errorCount} fields need attention before the booking can be created.`}
            </Alert>
          )}

          <fieldset className={styles.section}>
            <legend className={styles.legend}>Lead traveler</legend>
            <div className={styles.twoColumns}>
              <TextField
                label="First name"
                required
                autoComplete="off"
                value={form.firstName}
                error={visible.firstName}
                onChange={(event) => update({ firstName: event.target.value })}
              />
              <TextField
                label="Last name"
                required
                autoComplete="off"
                value={form.lastName}
                error={visible.lastName}
                onChange={(event) => update({ lastName: event.target.value })}
              />
            </div>
            <div className={styles.twoColumns}>
              <TextField
                label="Email"
                required
                type="email"
                autoComplete="off"
                placeholder="name@example.com"
                value={form.email}
                error={visible.email}
                onChange={(event) => update({ email: event.target.value })}
              />
              <TextField
                label="Mobile"
                type="tel"
                autoComplete="off"
                placeholder="+63"
                value={form.phone}
                onChange={(event) => update({ phone: event.target.value })}
              />
            </div>
          </fieldset>

          <fieldset className={styles.section}>
            <legend className={styles.legend}>Itinerary</legend>
            <SegmentedControl<TripType>
              label="Trip type"
              appearance="soft"
              density="compact"
              className={styles.tripType}
              value={form.tripType}
              onChange={(tripType) =>
                update({ tripType, returnDate: tripType === 'oneway' ? '' : form.returnDate })
              }
              options={[
                { value: 'return', label: 'Return' },
                { value: 'oneway', label: 'One-way' },
              ]}
            />
            <div className={styles.twoColumns}>
              <SelectField
                label="From"
                required
                value={form.from}
                options={MANUAL_BOOKING_AIRPORTS}
                onChange={(event) => update({ from: event.target.value })}
              />
              <SelectField
                label="To"
                required
                value={form.to}
                options={MANUAL_BOOKING_AIRPORTS}
                error={visible.to}
                onChange={(event) => update({ to: event.target.value })}
              />
            </div>
            <div className={styles.twoColumns}>
              <TextField
                label="Departure"
                required
                type="date"
                min={DEMO_TODAY}
                value={form.departDate}
                error={visible.departDate}
                onChange={(event) => update({ departDate: event.target.value })}
              />
              {form.tripType === 'return' && (
                <TextField
                  label="Return"
                  required
                  type="date"
                  min={form.departDate || DEMO_TODAY}
                  value={form.returnDate}
                  error={visible.returnDate}
                  onChange={(event) => update({ returnDate: event.target.value })}
                />
              )}
            </div>
            <div className={styles.twoColumns}>
              <SelectField
                label="Airline"
                required
                value={form.airline}
                options={AIRLINE_OPTIONS}
                onChange={(event) =>
                  update({
                    airline:
                      AIRLINE_OPTIONS.find((option) => option.value === event.target.value)?.value ??
                      form.airline,
                  })
                }
              />
              <SelectField
                label="Fare"
                required
                value={form.fare}
                options={FARE_OPTIONS}
                onChange={(event) =>
                  update({
                    fare:
                      FARE_OPTIONS.find((option) => option.value === event.target.value)?.value ?? form.fare,
                  })
                }
              />
            </div>
            <div className={styles.travelers}>
              <span className={styles.travelersText}>
                <span id="manual-travelers-label" className={styles.travelersLabel}>
                  Travelers
                </span>
                <span className={styles.travelersHint}>Adults, up to {MAX_MANUAL_TRAVELERS} per booking</span>
              </span>
              <Stepper
                value={form.travelerCount}
                min={1}
                max={MAX_MANUAL_TRAVELERS}
                decrementLabel="Remove a traveler"
                incrementLabel="Add a traveler"
                onChange={(travelerCount) => update({ travelerCount })}
              />
            </div>
          </fieldset>

          <fieldset className={styles.section}>
            <legend className={styles.legend}>Payment</legend>
            <TextField
              label="Quoted total (₱)"
              required
              inputMode="numeric"
              placeholder="e.g. 18,450"
              value={form.total}
              error={visible.total}
              helpText="Include taxes and fees. Seats and bags can be added after ticketing."
              onChange={(event) => update({ total: event.target.value })}
            />
            <div role="radiogroup" aria-label="How the customer pays" className={styles.payments}>
              <ChoiceCard
                name="manual-payment"
                title="Send a payment link"
                description="Customer pays by card or GCash within 24 hours; seats are held until then"
                checked={form.paymentMethod === 'link'}
                onChange={() => update({ paymentMethod: 'link' })}
              />
              <ChoiceCard
                name="manual-payment"
                title="Corporate invoice"
                description="Bill the customer’s company account · 30-day terms"
                checked={form.paymentMethod === 'invoice'}
                onChange={() => update({ paymentMethod: 'invoice' })}
              />
            </div>
            <TextAreaField
              label="Internal note"
              hint="Staff only"
              rows={2}
              value={form.note}
              onChange={(event) => update({ note: event.target.value })}
            />
          </fieldset>
        </form>
      </Drawer>

      <Dialog
        open={isDiscardOpen}
        onClose={() => setIsDiscardOpen(false)}
        role="alertdialog"
        size="small"
        icon="alertTriangle"
        iconTone="danger"
        title="Discard this manual booking?"
        description={`You’ve started a booking for ${customerName} (${form.from} ${form.tripType === 'return' ? '⇄' : '→'} ${form.to}). If you discard it, nothing is saved, no seats are held and no payment link is sent.`}
        footer={
          <>
            <Button variant="quiet" onClick={() => setIsDiscardOpen(false)}>
              Keep editing
            </Button>
            <Button variant="destructive" onClick={onClose}>
              Discard booking
            </Button>
          </>
        }
      />
    </>
  );
}

import clsx from 'clsx';
import { useState } from 'react';

import { Icon } from '@/components/icons';
import { Alert, Button, ChoiceCard, Dialog, SelectField, TextField } from '@/components/ui';
import { addDays, formatCompactDay } from '@/lib/date';
import { formatPeso } from '@/lib/format';
import { DEMO_STAFF_MEMBER } from '@/mocks/console/staff';
import { ApiError } from '@/services/mockApi';
import type {
  BookingDetail,
  ReissueReason,
  ReissueRequest,
  ResendItineraryRequest,
} from '@/types/console/bookingDetail';
import { CHANGE_FEE_PER_TRAVELER, DATE_CHANGE_OPTIONS, REISSUE_REASONS } from '@/types/console/bookingDetail';

import { nameCorrectionError } from '../../lib/bookingActions';
import styles from './BookingActionDialogs.module.css';

interface ActionDialogProps<Request> {
  detail: BookingDetail;
  onClose: () => void;
  /** Rejects with an `ApiError` the dialog shows inline. */
  onSubmit: (request: Request) => Promise<void>;
}

/** Runs a submit and keeps any API error message for an inline alert. */
function useSubmit<Request>(onSubmit: (request: Request) => Promise<void>) {
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string>();
  const submit = async (request: Request) => {
    setIsBusy(true);
    setError(undefined);
    try {
      await onSubmit(request);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'That didn’t work. Try again.');
    } finally {
      setIsBusy(false);
    }
  };
  return { isBusy, error, submit };
}

/* ---------- Resend itinerary ---------- */

const ATTACHMENTS: ReadonlyArray<{ id: ResendItineraryRequest['attachments'][number]; label: string }> = [
  { id: 'itinerary', label: 'Itinerary PDF' },
  { id: 'e-tickets', label: 'E-tickets' },
  { id: 'receipt', label: 'Receipt' },
];

export function ResendItineraryDialog({
  detail,
  onClose,
  onSubmit,
}: ActionDialogProps<ResendItineraryRequest>) {
  const { booking } = detail;
  const [toLeadTraveler, setToLeadTraveler] = useState(true);
  const [copyToMe, setCopyToMe] = useState(false);
  const [attachments, setAttachments] = useState<ReadonlySet<string>>(new Set(['itinerary', 'e-tickets']));
  const { isBusy, error, submit } = useSubmit(onSubmit);
  const hasRecipient = toLeadTraveler || copyToMe;

  return (
    <Dialog
      open
      onClose={onClose}
      size="large"
      title="Resend itinerary"
      description={`${booking.reference} · ${booking.route} · ${booking.travelerCount} ${booking.travelerCount === 1 ? 'traveler' : 'travelers'}`}
      busy={isBusy}
      footer={
        <>
          <Button variant="quiet" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            disabled={!hasRecipient}
            loading={isBusy}
            onClick={() =>
              submit({
                toLeadTraveler,
                copyToMe,
                attachments: ATTACHMENTS.filter((attachment) => attachments.has(attachment.id)).map(
                  (attachment) => attachment.id,
                ),
              })
            }
          >
            Send itinerary
          </Button>
        </>
      }
    >
      <div className={styles.form}>
        {error && (
          <Alert tone="danger" role="alert">
            {error}
          </Alert>
        )}
        <fieldset className={styles.field}>
          <legend className={styles.label}>Send to</legend>
          <ChoiceCard
            type="checkbox"
            title={booking.email}
            description={`Lead traveler · ${booking.leadTraveler}`}
            checked={toLeadTraveler}
            onChange={(event) => setToLeadTraveler(event.target.checked)}
          />
          <ChoiceCard
            type="checkbox"
            title={DEMO_STAFF_MEMBER.email}
            description="Copy to me"
            checked={copyToMe}
            onChange={(event) => setCopyToMe(event.target.checked)}
          />
          {!hasRecipient && (
            <span role="alert" className={styles.error}>
              Choose at least one recipient.
            </span>
          )}
        </fieldset>
        <fieldset className={styles.field}>
          <legend className={styles.label}>Attachments</legend>
          <div className={styles.pills}>
            {ATTACHMENTS.map((attachment) => {
              const isOn = attachments.has(attachment.id);
              return (
                <button
                  key={attachment.id}
                  type="button"
                  role="checkbox"
                  aria-checked={isOn}
                  className={clsx(styles.pill, isOn && styles.pillOn)}
                  onClick={() =>
                    setAttachments((previous) => {
                      const next = new Set(previous);
                      if (isOn) next.delete(attachment.id);
                      else next.add(attachment.id);
                      return next;
                    })
                  }
                >
                  {isOn && <Icon name="check" size={14} strokeWidth={2.2} />}
                  {attachment.label}
                </button>
              );
            })}
          </div>
        </fieldset>
      </div>
    </Dialog>
  );
}

/* ---------- Reissue ---------- */

export function ReissueDialog({ detail, onClose, onSubmit }: ActionDialogProps<ReissueRequest>) {
  const travelers = detail.travelers;
  const [selected, setSelected] = useState<ReadonlySet<number>>(
    new Set(travelers.map((_traveler, index) => index)),
  );
  const [reason, setReason] = useState<ReissueReason>(detail.defaultReissueReason);
  const [names, setNames] = useState<Record<number, string>>(
    Object.fromEntries(travelers.map((traveler, index) => [index, traveler.displayName])),
  );
  const [dayShift, setDayShift] = useState<number>(DATE_CHANGE_OPTIONS[0].days);
  const [hasTried, setHasTried] = useState(false);
  const { isBusy, error, submit } = useSubmit(onSubmit);

  const indexes = [...selected].sort();
  const isNameCorrection = reason === 'Name correction';
  const isDateChange = reason === 'Date change requested';
  const nameErrors = isNameCorrection
    ? Object.fromEntries(
        indexes.map((index) => [
          index,
          nameCorrectionError(names[index] ?? '', travelers[index].displayName),
        ]),
      )
    : {};
  const hasNameErrors = Object.values(nameErrors).some(Boolean);
  const dateOption = DATE_CHANGE_OPTIONS.find((option) => option.days === dayShift) ?? DATE_CHANGE_OPTIONS[0];
  const fee = isDateChange
    ? (CHANGE_FEE_PER_TRAVELER + dateOption.fareDifference) * Math.max(1, indexes.length)
    : 0;
  const newDates = detail.segments
    .map(
      (segment) =>
        `${segment.flightNumber} ${formatCompactDay(addDays(segment.date, dayShift))} ${segment.departureTime}`,
    )
    .join(' · ');

  const toggleTraveler = (index: number) =>
    setSelected((previous) => {
      const next = new Set(previous);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });

  const confirm = () => {
    if (hasNameErrors) {
      setHasTried(true);
      return;
    }
    void submit({ travelerIndexes: indexes, reason, correctedNames: names, dayShift });
  };

  return (
    <Dialog
      open
      onClose={onClose}
      size="large"
      title="Reissue ticket"
      description="New e-ticket numbers replace the old ones. Seats and bags carry over."
      busy={isBusy}
      footer={
        <>
          <Button variant="quiet" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" disabled={indexes.length === 0} loading={isBusy} onClick={confirm}>
            Reissue {indexes.length || ''} {indexes.length === 1 ? 'ticket' : 'tickets'}
          </Button>
        </>
      }
    >
      <div className={styles.form}>
        {error && (
          <Alert tone="danger" role="alert">
            {error}
          </Alert>
        )}
        <fieldset className={styles.field}>
          <legend className={styles.label}>Travelers</legend>
          {travelers.map((traveler, index) => (
            <ChoiceCard
              key={traveler.recordName}
              type="checkbox"
              title={traveler.displayName}
              description={`Current ticket ${traveler.ticketNumber ?? '—'}`}
              checked={selected.has(index)}
              onChange={() => toggleTraveler(index)}
            />
          ))}
          {indexes.length === 0 && (
            <span role="alert" className={styles.error}>
              Choose at least one traveler.
            </span>
          )}
        </fieldset>
        <SelectField
          label="Reason"
          required
          value={reason}
          options={REISSUE_REASONS.map((value) => ({ value, label: value }))}
          onChange={(event) => {
            setReason(REISSUE_REASONS.find((value) => value === event.target.value) ?? reason);
            setHasTried(false);
          }}
        />
        {isNameCorrection && (
          <div className={styles.field}>
            {indexes.map((index) => (
              <TextField
                key={index}
                label={`Corrected name · now ${travelers[index].displayName}`}
                required
                autoComplete="off"
                value={names[index] ?? ''}
                error={hasTried ? nameErrors[index] : undefined}
                onChange={(event) => setNames((previous) => ({ ...previous, [index]: event.target.value }))}
              />
            ))}
            <span className={styles.hint}>
              Type the name exactly as printed on the passport. Airlines allow up to 3 letters to change.
            </span>
          </div>
        )}
        {isDateChange && (
          <SelectField
            label="Move the trip"
            required
            value={String(dayShift)}
            options={DATE_CHANGE_OPTIONS.map((option) => ({
              value: String(option.days),
              label: option.label,
            }))}
            helpText={`${newDates} · fare difference ${
              dateOption.fareDifference ? `${formatPeso(dateOption.fareDifference)} per traveler` : 'none'
            }`}
            onChange={(event) => setDayShift(Number(event.target.value))}
          />
        )}
        <div className={styles.feeBox}>
          <span className={styles.feeText}>
            <span className={styles.feeTitle}>
              {isDateChange ? 'Change fee and fare difference' : 'No change fee'}
            </span>
            <span className={styles.hint}>
              {isDateChange
                ? `${formatPeso(CHANGE_FEE_PER_TRAVELER)} change fee${
                    dateOption.fareDifference
                      ? ` + ${formatPeso(dateOption.fareDifference)} fare difference`
                      : ''
                  } per traveler · charged to ${detail.refundDestination} first`
                : `Waived for ${reason.toLowerCase()}`}
            </span>
          </span>
          <strong className={styles.feeAmount}>{formatPeso(fee)}</strong>
        </div>
      </div>
    </Dialog>
  );
}

/* ---------- Payment link ---------- */

export function PaymentLinkDialog({
  detail,
  onClose,
  onSubmit,
}: ActionDialogProps<{ email: boolean; sms: boolean }>) {
  const { booking, paymentLink } = detail;
  const [email, setEmail] = useState(true);
  const [sms, setSms] = useState(false);
  const { isBusy, error, submit } = useSubmit(onSubmit);
  const hasChannel = email || sms;

  return (
    <Dialog
      open
      onClose={onClose}
      size="large"
      title={detail.actions.paymentLinkLabel}
      description={`${booking.reference} · ${formatPeso(booking.total)} · seats held until ${paymentLink.holdUntil}`}
      busy={isBusy}
      footer={
        <>
          <Button variant="quiet" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            disabled={!hasChannel}
            loading={isBusy}
            onClick={() => submit({ email, sms })}
          >
            Send link
          </Button>
        </>
      }
    >
      <div className={styles.form}>
        {error && (
          <Alert tone="danger" role="alert">
            {error}
          </Alert>
        )}
        <fieldset className={styles.field}>
          <legend className={styles.label}>Send to</legend>
          <ChoiceCard
            type="checkbox"
            title={booking.email}
            description="Email · lead traveler"
            checked={email}
            onChange={(event) => setEmail(event.target.checked)}
          />
          <ChoiceCard
            type="checkbox"
            title={paymentLink.smsTo}
            description="Text message · mobile on the booking"
            checked={sms}
            onChange={(event) => setSms(event.target.checked)}
          />
          {!hasChannel && (
            <span role="alert" className={styles.error}>
              Choose email, text message or both.
            </span>
          )}
        </fieldset>
        <div className={styles.preview}>
          <span className={styles.label}>What the customer sees</span>
          <span className={styles.message}>{paymentLink.message}</span>
          <span className={styles.hint}>
            The link opens a secure Vela checkout for this booking only. It stops working when the seat hold
            ends.
          </span>
        </div>
      </div>
    </Dialog>
  );
}

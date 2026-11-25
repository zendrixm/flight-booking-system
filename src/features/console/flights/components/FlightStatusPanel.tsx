import clsx from 'clsx';
import { useId, useRef, useState, type Ref } from 'react';

import { Icon } from '@/components/icons';
import { Alert, Button, ChoiceCard, SelectField, StatusChip, TextField } from '@/components/ui';
import { formatCompactDay, type IsoDate } from '@/lib/date';
import { ApiError } from '@/services/mockApi';
import {
  DISRUPTION_REASONS,
  FLIGHT_STATUS_CHOICES,
  NOTIFICATION_CHANNELS,
  type DisruptionReason,
  type FlightOpsRecord,
  type FlightStatusChoice,
  type FlightStatusDraft,
  type FlightStatusUpdate,
  type NotificationChannel,
} from '@/types/console/flightOps';

import { isStatusLocked, lockedStatusMessage } from '../lib/flightOpsPresentation';
import {
  confirmContent,
  connectionsNote,
  departureError,
  initialFormValues,
  isCancellation,
  isPristine,
  saveButtonLabel,
  toStatusUpdate,
  type ConfirmKind,
  type StatusFormValues,
} from '../lib/flightStatusForm';
import { FlightStatusConfirmDialog } from './FlightStatusConfirmDialog';
import styles from './FlightStatusPanel.module.css';

interface FlightStatusPanelProps {
  record: FlightOpsRecord;
  date: IsoDate;
  ref?: Ref<HTMLElement>;
  /** Briefly rings the panel, e.g. after "Update status" in the details drawer. */
  isHighlighted: boolean;
  onHighlightEnd: () => void;
  onOpenDetails: () => void;
  /** Saves the update and resolves with the message to show, e.g. "Saved · 31 travelers notified at 00:59". */
  onSave: (update: FlightStatusUpdate) => Promise<string>;
}

/**
 * The selected flight's summary and status form. Mount it with a `key` per flight so the form
 * starts again from that flight's saved status.
 */
export function FlightStatusPanel({
  record,
  date,
  ref,
  isHighlighted,
  onHighlightEnd,
  onOpenDetails,
  onSave,
}: FlightStatusPanelProps) {
  const { flight } = record;
  const [values, setValues] = useState<StatusFormValues>(() => initialFormValues(record));
  const [hasTried, setHasTried] = useState(false);
  const [confirmKind, setConfirmKind] = useState<ConfirmKind | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const timeInputRef = useRef<HTMLInputElement>(null);
  const timeErrorId = useId();

  const { draft, channels } = values;
  const isLocked = isStatusLocked(flight);
  const cancels = isCancellation(record, draft);
  const notifies = channels.length > 0;
  const timeError = departureError(record, draft);
  const showTimeError = hasTried && timeError !== null;
  const showOutcome = !isLocked && draft.status === 'cancelled' && flight.phase === 'cancelled';
  const dayLabel = formatCompactDay(date);

  const edit = (change: Partial<StatusFormValues>) => {
    setValues((current) => ({ ...current, ...change }));
    setSavedMessage(null);
    setSaveError(null);
  };
  const editDraft = (change: Partial<FlightStatusDraft>) => edit({ draft: { ...draft, ...change } });
  const toggleChannel = (channel: NotificationChannel) =>
    edit({
      channels: channels.includes(channel)
        ? channels.filter((item) => item !== channel)
        : [...channels, channel],
    });

  const requestSave = () => {
    if (isLocked) return;
    if (timeError) {
      setHasTried(true);
      setSavedMessage(null);
      timeInputRef.current?.focus();
      return;
    }
    setHasTried(false);
    setConfirmKind(cancels ? 'cancel' : 'save');
  };

  const confirm = async () => {
    if (confirmKind === 'discard') {
      setValues((current) => ({ ...initialFormValues(record), channels: current.channels }));
      setHasTried(false);
      setSavedMessage(null);
      setConfirmKind(null);
      return;
    }
    setIsSaving(true);
    try {
      setSavedMessage(await onSave(toStatusUpdate(record, values)));
      setSaveError(null);
    } catch (error) {
      setSaveError(
        error instanceof ApiError
          ? error.message
          : 'The status wasn’t saved. Check your connection and try again.',
      );
    } finally {
      setIsSaving(false);
      setConfirmKind(null);
    }
  };

  return (
    <aside
      ref={ref}
      aria-label={`Flight ${flight.flightNumber} details`}
      className={clsx(styles.panel, isHighlighted && styles.highlighted)}
      onAnimationEnd={onHighlightEnd}
    >
      <div className={styles.summary}>
        <div className={styles.summaryTitle}>
          <span className={styles.flightNumber}>{flight.flightNumber}</span>
          <StatusChip tone={flight.status.tone} hideDot size="compact">
            {flight.status.label}
          </StatusChip>
        </div>
        <span className={styles.meta}>
          {flight.route} · {flight.aircraft} · {dayLabel}
        </span>
        <dl className={styles.stats}>
          <div>
            <dt>Scheduled</dt>
            <dd>{flight.scheduledTime}</dd>
          </div>
          <div>
            <dt>Estimated</dt>
            <dd>{flight.estimatedTime}</dd>
          </div>
          <div>
            <dt>Vela travelers</dt>
            <dd>{flight.velaTravelers}</dd>
          </div>
        </dl>
        <Button
          variant="quiet"
          size="small"
          aria-haspopup="dialog"
          className={styles.detailsButton}
          onClick={onOpenDetails}
        >
          Travelers and timeline
        </Button>
      </div>

      <form
        noValidate
        className={styles.form}
        onSubmit={(event) => {
          event.preventDefault();
          requestSave();
        }}
      >
        <h2 className={styles.caption}>Update status</h2>
        {isLocked && (
          <Alert tone="info" icon="lock">
            {lockedStatusMessage(record)}
          </Alert>
        )}

        <SelectField
          label="Status"
          required
          name="status"
          value={draft.status}
          options={FLIGHT_STATUS_CHOICES.map(({ id, label }) => ({ value: id, label }))}
          disabled={isLocked}
          onChange={(event) => editDraft({ status: event.target.value as FlightStatusChoice })}
        />

        <div className={styles.timeRow}>
          <TextField
            ref={timeInputRef}
            label="New departure"
            required
            type="time"
            name="departureTime"
            value={draft.departureTime}
            disabled={isLocked || draft.status !== 'delayed'}
            aria-invalid={showTimeError || undefined}
            aria-describedby={showTimeError ? timeErrorId : undefined}
            onChange={(event) => editDraft({ departureTime: event.target.value })}
          />
          <TextField
            label="Gate"
            hint="Airline feed"
            value={flight.gate}
            readOnly
            trailing={<Icon name="lock" size={14} className={styles.lockIcon} />}
          />
        </div>
        {/* Spans both columns so long messages stay readable. */}
        {showTimeError && (
          <p id={timeErrorId} role="alert" className={styles.timeError}>
            <Icon name="alertCircle" size={14} strokeWidth={1.8} />
            {timeError}
          </p>
        )}

        <SelectField
          label="Reason shown to travelers"
          required
          name="reason"
          value={draft.reason}
          options={DISRUPTION_REASONS.map(({ id, label }) => ({ value: id, label }))}
          disabled={isLocked || draft.status === 'onTime'}
          onChange={(event) => editDraft({ reason: event.target.value as DisruptionReason })}
        />

        {cancels && (
          <fieldset className={styles.rebooking}>
            <legend className={styles.legend}>Rebook {flight.velaTravelers} travelers</legend>
            {record.rebookingOptions.map((option) => (
              <ChoiceCard
                key={option.plan}
                name="rebooking"
                value={option.plan}
                title={option.title}
                description={option.description}
                checked={values.rebooking === option.plan}
                onChange={() => edit({ rebooking: option.plan })}
              />
            ))}
          </fieldset>
        )}
        {showOutcome && record.cancellationOutcome && (
          <Alert tone="info" icon="ban">
            {record.cancellationOutcome}
          </Alert>
        )}

        <fieldset className={styles.notify} disabled={isLocked}>
          <legend className={styles.notifyTitle}>Notify {flight.velaTravelers} travelers</legend>
          {NOTIFICATION_CHANNELS.map((channel) => (
            <label key={channel.id} className={styles.channel}>
              {channel.label}
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={channels.includes(channel.id)}
                onChange={() => toggleChannel(channel.id)}
              />
            </label>
          ))}
          <p className={styles.note}>{connectionsNote(record, draft)}</p>
          {!isLocked && !notifies && (
            <Alert tone="attention" icon="bellOff">
              Nobody will be messaged. Travelers see the change only when they open their trip in the Vela
              app.
            </Alert>
          )}
        </fieldset>

        {saveError && (
          <Alert tone="danger" role="alert">
            {saveError}
          </Alert>
        )}
        {/* Always mounted so screen readers announce the saved message when it appears. */}
        <div role="status" className={styles.savedRegion}>
          {savedMessage && (
            <span className={styles.saved}>
              <Icon name="checkCircle" size={16} strokeWidth={1.8} />
              {savedMessage}
            </span>
          )}
        </div>

        <div className={styles.actions}>
          <Button
            type="submit"
            variant={cancels ? 'destructive' : 'primary'}
            disabled={isLocked}
            className={styles.saveButton}
          >
            {saveButtonLabel(cancels, notifies)}
          </Button>
          <Button
            variant="quiet"
            disabled={isPristine(record, values)}
            aria-haspopup="dialog"
            onClick={() => setConfirmKind('discard')}
          >
            Discard
          </Button>
        </div>
      </form>

      <FlightStatusConfirmDialog
        content={confirmKind && confirmContent(confirmKind, record, values, date)}
        subtitle={`${flight.flightNumber} · ${flight.route} · ${dayLabel} · ${flight.status.label}`}
        isBusy={isSaving}
        onClose={() => setConfirmKind(null)}
        onConfirm={confirm}
      />
    </aside>
  );
}

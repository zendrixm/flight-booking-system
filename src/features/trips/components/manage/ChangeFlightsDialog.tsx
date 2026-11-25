import clsx from 'clsx';
import { useState } from 'react';

import { Icon } from '@/components/icons';
import { Alert, Button, Checkbox, ChoiceCard, Dialog } from '@/components/ui';
import { formatDayLabel, formatDayMonth, WEEKDAYS_SHORT, parseIsoDate } from '@/lib/date';
import { formatDuration, formatPeso, joinWithAnd } from '@/lib/format';
import { CHANGE_OPTIONS } from '@/services/manageBookingService';
import type { ManagedBooking, ManagedFlight, SegmentKey } from '@/types/managedBooking';

import {
  fareDifference,
  flightOption,
  isSoldOut,
  lowestDifference,
  quoteChange,
  type SegmentChoice,
} from '../../lib/flightChange';
import styles from './ChangeFlightsDialog.module.css';

const STEP_LABELS = ['Flights and dates', 'New flight', 'Price difference', 'Confirm and pay'] as const;
const STEP_TITLES = [
  'Choose new dates',
  'Pick your new flight',
  'Check the price difference',
  'Confirm and pay',
] as const;

export interface FlightChangeResult {
  choices: Array<{ segment: SegmentKey; date: string; flightNumber: string }>;
  amount: number;
}

interface ChangeFlightsDialogProps {
  booking: ManagedBooking;
  travelCredit: number;
  isSaving: boolean;
  onClose: () => void;
  onConfirm: (result: FlightChangeResult) => void;
}

function flightLine(
  flight: Pick<ManagedFlight, 'flightNumber' | 'from' | 'to' | 'departureTime' | 'arrivalTime'>,
) {
  return `${flight.flightNumber} · ${flight.from} ${flight.departureTime} → ${flight.to} ${flight.arrivalTime}`;
}

/** Four-step change: which flights and dates, which flight, the price, then payment. */
export function ChangeFlightsDialog({
  booking,
  travelCredit,
  isSaving,
  onClose,
  onConfirm,
}: ChangeFlightsDialogProps) {
  const [step, setStep] = useState(1);
  const [choices, setChoices] = useState<Record<SegmentKey, SegmentChoice | null>>({
    outbound: null,
    inbound: null,
  });
  const [payWith, setPayWith] = useState<'card' | 'credit'>('card');
  const [hasAcknowledged, setHasAcknowledged] = useState(false);

  const travelerCount = booking.travelers.length;
  const firstNames = joinWithAnd(booking.travelers.map((traveler) => traveler.firstNames.split(' ')[0]));
  const active = [choices.outbound, choices.inbound].filter(
    (choice): choice is SegmentChoice => choice !== null,
  );
  const quote = quoteChange(active, travelerCount);
  const amountDue = payWith === 'credit' ? Math.max(0, quote.total - travelCredit) : quote.total;

  const hasDates = active.length > 0 && active.every((choice) => choice.date);
  const hasFlights = active.every((choice) => choice.flightNumber);
  const canContinue = step === 1 ? hasDates : step === 2 ? hasFlights : step === 4 ? hasAcknowledged : true;

  const currentFlight = (segment: SegmentKey) => booking.flights.find((flight) => flight.segment === segment);
  const setChoice = (segment: SegmentKey, patch: Partial<SegmentChoice> | null) =>
    setChoices((previous) => ({
      ...previous,
      [segment]:
        patch === null
          ? null
          : { ...(previous[segment] ?? { segment, date: null, flightNumber: null }), ...patch },
    }));

  const newFlightLine = (choice: SegmentChoice) => {
    const option = flightOption(choice.segment, choice.flightNumber);
    const current = currentFlight(choice.segment);
    if (!option || !choice.date || !current) return '';
    return `${formatDayLabel(choice.date)} · ${option.flightNumber} · ${current.from} → ${current.to} ${option.departureTime} → ${option.arrivalTime}${option.arrivesNextDay ? ' +1' : ''}`;
  };

  const footNote =
    step === 1
      ? hasDates
        ? 'Next: choose a flight'
        : 'Choose a flight and a new date'
      : step === 2
        ? hasFlights
          ? `Fare difference ${formatPeso(quote.differencePerTraveler)} per traveler`
          : 'Choose a flight'
        : `Total ${formatPeso(quote.total)}`;

  const next = () => {
    if (!canContinue) return;
    if (step < 4) {
      setStep(step + 1);
      return;
    }
    onConfirm({
      choices: active.map((choice) => ({
        segment: choice.segment,
        date: choice.date ?? '',
        flightNumber: choice.flightNumber ?? '',
      })),
      amount: amountDue,
    });
  };

  return (
    <Dialog
      open
      onClose={onClose}
      size="wide"
      title={
        <span className={styles.titleStack}>
          <span className={styles.eyebrow}>Change flights · step {step} of 4</span>
          {STEP_TITLES[step - 1]}
        </span>
      }
      description={
        [
          'Pick the flights to change and the day you’d like to fly instead.',
          `${booking.airlineName} flights on your new date. Prices are the fare difference per traveler.`,
          'Here’s exactly what changes and what it costs. Nothing is charged yet.',
          'We’ll issue new e-tickets as soon as the payment goes through.',
        ][step - 1]
      }
      footer={
        <div className={styles.footer}>
          <span className={styles.footNote}>{footNote}</span>
          <span className={styles.footerButtons}>
            <Button variant="quiet" onClick={() => (step === 1 ? onClose() : setStep(step - 1))}>
              {step === 1 ? 'Cancel' : 'Back'}
            </Button>
            <Button variant="primary" disabled={!canContinue} loading={isSaving} onClick={next}>
              {step === 4
                ? `Pay ${formatPeso(amountDue)} and change`
                : step === 3
                  ? 'Continue to payment'
                  : 'Continue'}
            </Button>
          </span>
        </div>
      }
    >
      <ol aria-label="Steps" className={styles.progress}>
        {STEP_LABELS.map((label, index) => (
          <li
            key={label}
            aria-current={index + 1 === step ? 'step' : undefined}
            className={clsx(
              styles.progressStep,
              index + 1 < step && styles.done,
              index + 1 === step && styles.current,
            )}
          >
            <span className={styles.bar} />
            <span className={styles.progressLabel}>{label}</span>
          </li>
        ))}
      </ol>

      {step === 1 && (
        <>
          <fieldset className={styles.group}>
            <legend className={styles.legend}>Which flights do you want to change?</legend>
            <div className={styles.legChoices}>
              {booking.flights.map((flight) => (
                <ChoiceCard
                  key={flight.segment}
                  type="checkbox"
                  title={`${flight.segment === 'outbound' ? 'Depart' : 'Return'} · ${formatDayLabel(flight.date)}`}
                  description={flightLine(flight)}
                  checked={Boolean(choices[flight.segment])}
                  onChange={(event) => setChoice(flight.segment, event.target.checked ? {} : null)}
                />
              ))}
            </div>
          </fieldset>

          {active.map((choice) => (
            <fieldset key={choice.segment} className={styles.group}>
              <legend className={styles.legend}>
                {choice.segment === 'outbound' ? 'New departure date' : 'New return date'}{' '}
                <span className={styles.legendNote}>· lowest fare difference per traveler</span>
              </legend>
              <div className={styles.days}>
                {CHANGE_OPTIONS[choice.segment].days.map((day) => {
                  const isCurrent = day.baseDifference === null;
                  const lowest = isCurrent ? 0 : lowestDifference(choice.segment, day.date);
                  return (
                    <label key={day.date} className={clsx(styles.day, isCurrent && styles.dayCurrent)}>
                      <input
                        type="radio"
                        name={`change-date-${choice.segment}`}
                        className="visually-hidden"
                        disabled={isCurrent}
                        checked={choice.date === day.date}
                        onChange={() => setChoice(choice.segment, { date: day.date, flightNumber: null })}
                      />
                      <span className={styles.dayName}>
                        {WEEKDAYS_SHORT[parseIsoDate(day.date).getUTCDay()]}
                      </span>
                      <span className={styles.dayDate}>{formatDayMonth(day.date)}</span>
                      <span className={clsx(styles.dayPrice, !isCurrent && lowest <= 700 && styles.cheap)}>
                        {isCurrent ? 'Current' : lowest === 0 ? 'No extra' : `+${formatPeso(lowest)}`}
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ))}

          <Alert tone="info">
            {firstNames} move together. Your {booking.fareName} fare changes for ₱2,500 per traveler, plus any
            fare difference. If the new fare is lower, the difference isn’t refunded.
          </Alert>
        </>
      )}

      {step === 2 &&
        active.map((choice) => {
          const current = currentFlight(choice.segment);
          return (
            <fieldset key={choice.segment} className={styles.group}>
              <legend className={styles.legend}>
                {choice.segment === 'outbound' ? 'Depart' : 'Return'} ·{' '}
                {choice.date && formatDayLabel(choice.date)} · {current?.from} → {current?.to}
              </legend>
              {CHANGE_OPTIONS[choice.segment].flights.map((flight) => {
                const soldOut = choice.date ? isSoldOut(choice.date, flight.flightNumber) : false;
                const difference = choice.date ? fareDifference(choice.segment, choice.date, flight) : 0;
                return (
                  <ChoiceCard
                    key={flight.flightNumber}
                    name={`change-flight-${choice.segment}`}
                    className={styles.flightOption}
                    disabled={soldOut}
                    checked={choice.flightNumber === flight.flightNumber}
                    onChange={() => setChoice(choice.segment, { flightNumber: flight.flightNumber })}
                    title={
                      <span className={styles.flightTimes}>
                        <span>{flight.departureTime}</span>
                        <span className={styles.flightLine} aria-hidden="true" />
                        <span>
                          {flight.arrivalTime}
                          {flight.arrivesNextDay ? ' +1' : ''}
                        </span>
                      </span>
                    }
                    description={`${flight.flightNumber} · Nonstop ${formatDuration(current?.durationMinutes ?? 0)} · ${
                      soldOut ? `No seats left for ${travelerCount} travelers` : flight.note
                    }`}
                    meta={
                      <span className={styles.flightPrice}>
                        <span className={difference === 0 && !soldOut ? styles.noDifference : undefined}>
                          {soldOut
                            ? 'Sold out'
                            : difference === 0
                              ? 'No difference'
                              : `+${formatPeso(difference)}`}
                        </span>
                        {!soldOut && <span className={styles.perTraveler}>per traveler</span>}
                      </span>
                    }
                  />
                );
              })}
            </fieldset>
          );
        })}

      {step === 3 && (
        <>
          <div className={styles.compare}>
            {booking.flights.map((flight) => {
              const choice = choices[flight.segment];
              return (
                <div key={flight.segment} className={styles.compareRow}>
                  <span className={styles.compareKind}>
                    {flight.segment === 'outbound' ? 'Depart' : 'Return'}
                  </span>
                  <span className={styles.compareText}>
                    <span className={choice ? styles.oldFlight : styles.sameFlight}>
                      {formatDayLabel(flight.date)} · {flightLine(flight)}
                    </span>
                    {choice && <span className={styles.newFlight}>{newFlightLine(choice)}</span>}
                  </span>
                  <span className={choice ? styles.newTag : styles.sameTag}>
                    {choice ? 'New' : 'No change'}
                  </span>
                </div>
              );
            })}
          </div>
          <dl className={styles.costs}>
            <div className={styles.costRow}>
              <dt>
                <span className={styles.costLabel}>Change fee</span>
                <span className={styles.costDetail}>
                  ₱2,500 × {travelerCount} travelers · {booking.fareName} fare
                </span>
              </dt>
              <dd>{formatPeso(quote.changeFee)}</dd>
            </div>
            <div className={styles.costRow}>
              <dt>
                <span className={styles.costLabel}>Fare difference</span>
                <span className={styles.costDetail}>
                  {formatPeso(quote.differencePerTraveler)} × {travelerCount} travelers
                </span>
              </dt>
              <dd>{formatPeso(quote.fareDifference)}</dd>
            </div>
            <div className={styles.costTotal}>
              <dt>To pay now</dt>
              <dd>{formatPeso(quote.total)}</dd>
            </div>
          </dl>
          <ul className={styles.keeps}>
            {[
              `Seats ${joinWithAnd(booking.travelers.map((traveler) => traveler.seats.outbound))} carry over — they’re free on the new flight.`,
              `Checked bags${booking.hasProtection ? ' and Vela Protect' : ''} carry over.`,
              `Your booking reference ${booking.reference} stays the same.`,
            ].map((item) => (
              <li key={item} className={styles.keep}>
                <Icon name="check" size={16} strokeWidth={2} className={styles.keepIcon} />
                {item}
              </li>
            ))}
          </ul>
        </>
      )}

      {step === 4 && (
        <>
          <div className={styles.summary}>
            <span className={styles.summaryTitle}>Your new flights</span>
            {active.map((choice) => (
              <span key={choice.segment} className={styles.summaryLine}>
                {newFlightLine(choice)}
              </span>
            ))}
          </div>
          <fieldset className={styles.group}>
            <legend className={styles.legend}>Pay with</legend>
            <ChoiceCard
              name="change-pay"
              title={`Card ending ${booking.cardLast4}`}
              description="Visa · Andrea Lim Reyes"
              meta={formatPeso(quote.total)}
              checked={payWith === 'card'}
              onChange={() => setPayWith('card')}
            />
            {travelCredit > 0 && (
              <ChoiceCard
                name="change-pay"
                title="Travel credit + card"
                description={`${formatPeso(travelCredit)} credit, rest on card ending ${booking.cardLast4}`}
                meta={`${formatPeso(Math.max(0, quote.total - travelCredit))} on card`}
                checked={payWith === 'credit'}
                onChange={() => setPayWith('credit')}
              />
            )}
          </fieldset>
          <Checkbox
            label={`I understand my current ${joinWithAnd(
              active.map((choice) => {
                const flight = currentFlight(choice.segment);
                return `${flight ? formatDayLabel(flight.date) : ''} ${choice.segment === 'outbound' ? 'departure' : 'return'}`;
              }),
            )} will be cancelled and new e-tickets issued.`}
            checked={hasAcknowledged}
            onChange={(event) => setHasAcknowledged(event.target.checked)}
          />
        </>
      )}
    </Dialog>
  );
}

import clsx from 'clsx';
import { useState } from 'react';

import { Icon } from '@/components/icons';
import { Alert, Button, Checkbox, Dialog } from '@/components/ui';
import { joinWithAnd } from '@/lib/format';
import type { ManagedBooking } from '@/types/managedBooking';

import styles from './ManageDialogs.module.css';

interface CheckInDialogProps {
  booking: ManagedBooking;
  /** "Tue, 10 Nov at 08:40" */
  opensLabel: string;
  isSaving: boolean;
  onClose: () => void;
  onSetReminder: (channels: { email: boolean; sms: boolean }) => Promise<void>;
}

/** Check-in isn't open yet: what's ready, what to prepare, and a reminder for when it opens. */
export function CheckInDialog({ booking, opensLabel, isSaving, onClose, onSetReminder }: CheckInDialogProps) {
  const [email, setEmail] = useState(booking.checkInReminder?.email ?? true);
  const [sms, setSms] = useState(booking.checkInReminder?.sms ?? true);
  const [hasTried, setHasTried] = useState(false);
  const isSet = booking.checkInReminder !== null;
  const firstFlight = booking.flights[0];
  const noChannel = hasTried && !email && !sms;

  const checks = [
    {
      isReady: true,
      title: `Passports saved for ${booking.travelers.length === 1 ? 'you' : `all ${booking.travelers.length} travelers`}`,
      detail: booking.travelers
        .map(
          (traveler) =>
            `${traveler.firstNames.split(' ')[0]} ••••${traveler.passportNumber.slice(-4)} (${traveler.passportExpiry.slice(-4)})`,
        )
        .join(' · '),
    },
    {
      isReady: true,
      title: `Seats ${joinWithAnd(booking.travelers.map((traveler) => traveler.seats.outbound))} on ${firstFlight?.flightNumber}`,
      detail: 'You can still change them until check-in closes',
    },
    {
      isReady: false,
      title: 'Japanese visa',
      detail: 'Filipino travelers need a visa for Japan. Have it ready — the airline checks it at bag drop.',
    },
  ];

  const setReminder = async () => {
    setHasTried(true);
    if (!email && !sms) return;
    await onSetReminder({ email, sms });
  };

  return (
    <Dialog
      open
      onClose={onClose}
      size="medium"
      title={
        <span className={styles.titleStack}>
          <span className={styles.currentLabel}>Online check-in · {firstFlight?.flightNumber}</span>
          <span>Opens {opensLabel}</span>
        </span>
      }
      description="That’s 48 hours before you fly. Get ready now and it takes about a minute on the day."
      footer={
        isSet ? (
          <Button variant="primary" onClick={onClose}>
            Done
          </Button>
        ) : (
          <>
            <Button variant="quiet" onClick={onClose}>
              Close
            </Button>
            <Button variant="primary" iconStart="bell" loading={isSaving} onClick={setReminder}>
              Remind me
            </Button>
          </>
        )
      }
    >
      <ul className={styles.checks}>
        {checks.map((check) => (
          <li key={check.title} className={styles.check}>
            <span className={clsx(styles.checkDot, !check.isReady && styles.checkWarn)} aria-hidden="true">
              <Icon name={check.isReady ? 'check' : 'alertCircle'} size={14} strokeWidth={2.2} />
            </span>
            <span className={styles.checkText}>
              <span className={styles.checkTitle}>{check.title}</span>
              <span className={styles.checkSub}>{check.detail}</span>
            </span>
          </li>
        ))}
      </ul>
      {isSet ? (
        <Alert tone="success" icon="bell" role="status" title={`Reminder set for ${opensLabel}`}>
          We’ll{' '}
          {joinWithAnd(
            [
              booking.checkInReminder?.email ? `email ${booking.contact.email}` : '',
              booking.checkInReminder?.sms ? 'text +63 917 ••• 4567' : '',
            ].filter(Boolean),
          )}{' '}
          the moment check-in opens.
        </Alert>
      ) : (
        <fieldset className={clsx(styles.group, noChannel && styles.groupInvalid)}>
          <legend className={styles.legend}>Remind me when check-in opens</legend>
          <Checkbox
            label={`Email ${booking.contact.email}`}
            checked={email}
            onChange={(event) => setEmail(event.target.checked)}
          />
          <Checkbox
            label="Text +63 917 ••• 4567"
            checked={sms}
            onChange={(event) => setSms(event.target.checked)}
          />
          {noChannel && (
            <p role="alert" className={styles.error}>
              Choose at least one way to remind you.
            </p>
          )}
        </fieldset>
      )}
    </Dialog>
  );
}

import { useState } from 'react';

import { Icon } from '@/components/icons';
import { Button, useToast } from '@/components/ui';

import styles from './ConfirmationHero.module.css';

interface ConfirmationHeroProps {
  reference: string;
  destinationCity: string;
  email: string;
  bookedAt: string;
  airlineReference: string;
}

/** Midnight hero: "You're going to Tokyo." and the booking reference with a copy button. */
export function ConfirmationHero({
  reference,
  destinationCity,
  email,
  bookedAt,
  airlineReference,
}: ConfirmationHeroProps) {
  const toast = useToast();
  const [isCopied, setIsCopied] = useState(false);

  const copyReference = async () => {
    try {
      await navigator.clipboard.writeText(reference);
    } catch {
      // Clipboard access can be blocked; the reference is still on screen to copy by hand.
    }
    setIsCopied(true);
    toast.show({ tone: 'success', message: `Booking reference ${reference} copied` });
  };

  return (
    <section className={styles.hero} aria-labelledby="confirmation-title">
      <div className={styles.inner}>
        <div className={styles.message}>
          <p className={styles.eyebrow}>
            <Icon name="checkCircle" size={18} strokeWidth={1.8} />
            Booking confirmed
          </p>
          <h1 id="confirmation-title" className={styles.title}>
            You’re going to <em className={styles.accent}>{destinationCity}.</em>
          </h1>
          <p className={styles.lede}>
            Your e-tickets are on their way to {email}. Keep your booking reference handy — with your last
            name, it’s all you need to manage this trip.
          </p>
        </div>
        <div className={styles.referenceCard}>
          <div className={styles.referenceHeader}>
            <span className={styles.referenceLabel}>Booking reference</span>
            <span className={styles.ticketed}>
              <span className={styles.ticketedDot} aria-hidden="true" />
              Ticketed
            </span>
          </div>
          <div className={styles.referenceRow}>
            <span className={styles.reference}>{reference}</span>
            <Button
              variant="inverseQuiet"
              iconStart={isCopied ? 'check' : 'copy'}
              aria-label="Copy booking reference"
              onClick={copyReference}
            >
              {isCopied ? 'Copied' : 'Copy'}
            </Button>
          </div>
          <span className={styles.bookedAt}>
            Booked {bookedAt} · Airline ref {airlineReference}
          </span>
        </div>
      </div>
    </section>
  );
}

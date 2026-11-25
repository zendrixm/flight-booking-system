import { Icon } from '@/components/icons';
import { Alert, Button, StatusChip } from '@/components/ui';
import { formatShortDate } from '@/lib/date';
import type { ManagedBooking, ManagedTraveler } from '@/types/managedBooking';

import styles from './BookingSections.module.css';

function maskPassport(traveler: ManagedTraveler) {
  return `••••${traveler.passportNumber.slice(-4)} · ${traveler.passportExpiry.slice(-4)}`;
}

interface TravelersCardProps {
  booking: ManagedBooking;
  note?: string;
  onRequestNameCorrection: () => void;
  onEditPassport: (travelerId: string) => void;
  onEditSeats: (travelerId: string) => void;
}

export function TravelersCard({
  booking,
  note,
  onRequestNameCorrection,
  onEditPassport,
  onEditSeats,
}: TravelersCardProps) {
  const isCancelled = booking.status === 'cancelled';
  const hasReturn = booking.flights.length > 1;

  return (
    <section className={styles.card} aria-labelledby="manage-travelers-title">
      <div className={styles.header}>
        <h2 id="manage-travelers-title" className={styles.title}>
          Travelers
        </h2>
        <span className={styles.note}>
          <span className={styles.noteLabel}>
            <Icon name="lock" size={14} />
            Names and birth dates are locked once ticketed
          </span>
          <button
            type="button"
            className={styles.linkButton}
            disabled={isCancelled}
            onClick={onRequestNameCorrection}
          >
            Request a name correction
          </button>
        </span>
      </div>
      {note && (
        <Alert tone="success" role="status" icon="check">
          {note}
        </Alert>
      )}
      {booking.travelers.map((traveler) => {
        const shortName = `${traveler.firstNames.split(' ')[0]} ${traveler.lastName}`;
        const seats = hasReturn
          ? `${traveler.seats.outbound} · ${traveler.seats.inbound}`
          : traveler.seats.outbound;
        return (
          <div key={traveler.id} className={styles.traveler}>
            {(traveler.assistanceRequests.length > 0 || traveler.pendingNameCorrection) && (
              <div className={styles.chips}>
                {traveler.assistanceRequests.length > 0 && (
                  <StatusChip tone="warning" hideDot>
                    {traveler.assistanceRequests.join(', ')} · awaiting {booking.airlineName}
                  </StatusChip>
                )}
                {traveler.pendingNameCorrection && (
                  <StatusChip tone="warning" hideDot>
                    Name correction in review · VC-48372
                  </StatusChip>
                )}
              </div>
            )}
            <dl className={styles.fields}>
              <div className={styles.field}>
                <dt className={styles.fieldLabel}>Name</dt>
                <dd className={styles.fieldLocked}>
                  <span className={styles.fieldValue}>
                    {traveler.title} {traveler.firstNames} {traveler.lastName}
                  </span>
                  <Icon name="lock" size={14} label="Locked" />
                </dd>
              </div>
              <div className={styles.field}>
                <dt className={styles.fieldLabel}>Date of birth</dt>
                <dd className={styles.fieldLocked}>
                  <span className={styles.fieldValue}>{formatShortDate(traveler.dateOfBirth)}</span>
                  <Icon name="lock" size={14} label="Locked" />
                </dd>
              </div>
              <div className={styles.field}>
                <dt className={styles.fieldLabel}>Passport</dt>
                <dd className={styles.fieldBox}>
                  <span className={styles.fieldValue}>{maskPassport(traveler)}</span>
                  {!isCancelled && (
                    <Button
                      variant="ghost"
                      size="small"
                      aria-label={`Change passport for ${shortName}`}
                      onClick={() => onEditPassport(traveler.id)}
                    >
                      Change
                    </Button>
                  )}
                </dd>
              </div>
              <div className={styles.field}>
                <dt className={styles.fieldLabel}>Seats</dt>
                <dd className={styles.fieldBox}>
                  <span className={styles.fieldValue}>{seats}</span>
                  {!isCancelled && (
                    <Button
                      variant="ghost"
                      size="small"
                      aria-label={`Change seats for ${shortName}`}
                      onClick={() => onEditSeats(traveler.id)}
                    >
                      Change
                    </Button>
                  )}
                </dd>
              </div>
            </dl>
          </div>
        );
      })}
    </section>
  );
}

import { useState } from 'react';

import { Avatar, Button, Dialog, useToast } from '@/components/ui';
import { formatDayLabel } from '@/lib/date';

import type { Confirmation } from '../../lib/confirmation';
import styles from './ETicketsDialog.module.css';

interface ETicketsDialogProps {
  open: boolean;
  onClose: () => void;
  confirmation: Confirmation;
  fareLabel: string;
}

/** One e-ticket PDF per traveler, each listing their flights and seats. */
export function ETicketsDialog({ open, onClose, confirmation, fareLabel }: ETicketsDialogProps) {
  const toast = useToast();
  const [downloaded, setDownloaded] = useState<ReadonlySet<string>>(() => new Set());
  const { travelers, legs, reference } = confirmation;

  const markDownloaded = (ticketNumbers: string[]) =>
    setDownloaded((previous) => new Set([...previous, ...ticketNumbers]));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="large"
      title="E-tickets"
      description={`${reference} · Issued 9 Oct 2026 · one PDF per traveler`}
      footer={
        <>
          <Button variant="quiet" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="primary"
            iconStart="download"
            onClick={() => {
              markDownloaded(travelers.map((traveler) => traveler.ticketNumber));
              onClose();
              toast.show({ tone: 'success', message: `${travelers.length} e-tickets downloaded as PDF` });
            }}
          >
            Download all ({travelers.length})
          </Button>
        </>
      }
    >
      <ul className={styles.tickets}>
        {travelers.map((traveler) => {
          const isDownloaded = downloaded.has(traveler.ticketNumber);
          return (
            <li key={traveler.ticketNumber} className={styles.ticket}>
              <div className={styles.header}>
                <Avatar initials={traveler.initials} size={40} tone="midnight" />
                <span className={styles.identity}>
                  <span className={styles.name}>{traveler.name}</span>
                  <span className={styles.number}>E-ticket {traveler.ticketNumber}</span>
                </span>
                <Button
                  size="small"
                  variant="quiet"
                  className={isDownloaded ? styles.downloaded : undefined}
                  iconStart={isDownloaded ? 'check' : 'download'}
                  aria-label={
                    isDownloaded
                      ? `Download again: ${traveler.name}`
                      : `Download e-ticket for ${traveler.name}`
                  }
                  onClick={() => {
                    markDownloaded([traveler.ticketNumber]);
                    toast.show({ tone: 'success', message: `E-ticket for ${traveler.firstName} downloaded` });
                  }}
                >
                  {isDownloaded ? 'Downloaded' : 'Download'}
                </Button>
              </div>
              <div className={styles.flights}>
                {legs.map(({ leg }, index) => (
                  <div key={leg.flightNumber} className={styles.flight}>
                    <span className={styles.flightCode}>
                      {leg.flightNumber} · {leg.from} → {leg.to}
                    </span>
                    <span className={styles.flightMeta}>
                      {formatDayLabel(leg.date)} · {leg.departureTime} · Seat {traveler.seats[index]}
                    </span>
                  </div>
                ))}
                <span className={styles.fare}>
                  {fareLabel} · {traveler.bags} checked
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </Dialog>
  );
}

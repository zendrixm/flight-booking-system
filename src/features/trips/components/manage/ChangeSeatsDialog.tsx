import { useMemo, useState } from 'react';

import { SeatMap } from '@/components/flight';
import { Button, ChoiceCard, Dialog, SegmentedControl } from '@/components/ui';
import { buildSeatMap, seatPrice, type Seat } from '@/data/seatMap';
import { formatPeso, initialsOf } from '@/lib/format';
import type { ManagedBooking, SegmentKey } from '@/types/managedBooking';

import styles from './ChangeSeatsDialog.module.css';

type SeatDraft = Record<string, Record<SegmentKey, string>>;

interface ChangeSeatsDialogProps {
  booking: ManagedBooking;
  initialTravelerId?: string;
  isSaving: boolean;
  onClose: () => void;
  onSave: (seats: SeatDraft, amount: number, summary: string) => void;
}

function shortName(firstNames: string, lastName: string) {
  return `${firstNames.split(' ')[0]} ${lastName}`;
}

/** Move travelers to other seats; paid seats are charged to the card on file. */
export function ChangeSeatsDialog({
  booking,
  initialTravelerId,
  isSaving,
  onClose,
  onSave,
}: ChangeSeatsDialogProps) {
  const saved: SeatDraft = Object.fromEntries(
    booking.travelers.map((traveler) => [traveler.id, traveler.seats]),
  );
  const [draft, setDraft] = useState<SeatDraft>(saved);
  const [segment, setSegment] = useState<SegmentKey>('outbound');
  const [travelerId, setTravelerId] = useState(initialTravelerId ?? booking.travelers[0]?.id ?? '');

  const flight = booking.flights.find((candidate) => candidate.segment === segment) ?? booking.flights[0];
  const party = booking.travelers.map((traveler) => ({
    ...traveler,
    name: shortName(traveler.firstNames, traveler.lastName),
  }));
  // Seats the party holds now or held before are never drawn as taken by someone else.
  const reservedKey = party
    .flatMap((traveler) => [saved[traveler.id][segment], draft[traveler.id][segment]])
    .join(',');
  const rows = useMemo(() => buildSeatMap(segment, reservedKey.split(',')), [segment, reservedKey]);

  const occupants = new Map(
    party.map((traveler) => [
      draft[traveler.id][segment],
      { name: traveler.name, initials: initialsOf(traveler.name) },
    ]),
  );

  const changes = party.flatMap((traveler) =>
    booking.flights
      .filter((candidate) => draft[traveler.id][candidate.segment] !== saved[traveler.id][candidate.segment])
      .map((candidate) => ({
        traveler,
        flightNumber: candidate.flightNumber,
        from: saved[traveler.id][candidate.segment],
        to: draft[traveler.id][candidate.segment],
      })),
  );
  const amount = changes.reduce((sum, change) => sum + seatPrice(change.to), 0);
  const summary = changes.length
    ? changes
        .map(
          (change) =>
            `${change.traveler.firstNames.split(' ')[0]} ${change.from} → ${change.to} (${change.flightNumber})`,
        )
        .join(' · ')
    : 'No seat changes yet';

  const selectSeat = (seat: Seat) => {
    const owner = party.find((traveler) => draft[traveler.id][segment] === seat.code);
    if (owner && owner.id !== travelerId) return setTravelerId(owner.id);
    setDraft((previous) => ({
      ...previous,
      [travelerId]: { ...previous[travelerId], [segment]: seat.code },
    }));
  };

  return (
    <Dialog
      open
      onClose={onClose}
      size="wide"
      title="Change seats"
      description="Pick a traveler, then a free seat. Standard seats are included with your fare."
      footer={
        <div className={styles.footer}>
          <span className={styles.summary}>
            <span className={styles.summaryText}>{summary}</span>
            <span className={styles.priceLine}>
              {changes.length
                ? amount
                  ? `${formatPeso(amount)} for paid seats · card ending ${booking.cardLast4}`
                  : `Free — standard seats on your ${booking.fareName} fare`
                : 'Pick a traveler, then tap a free seat'}
            </span>
          </span>
          <span className={styles.buttons}>
            <Button variant="quiet" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={changes.length === 0}
              loading={isSaving}
              onClick={() => onSave(draft, amount, summary)}
            >
              {amount ? `Pay ${formatPeso(amount)} and save` : 'Save seats'}
            </Button>
          </span>
        </div>
      }
    >
      <div className={styles.layout}>
        <div className={styles.controls}>
          {booking.flights.length > 1 && (
            <SegmentedControl
              label="Flight"
              appearance="soft"
              value={segment}
              onChange={setSegment}
              options={booking.flights.map((candidate) => ({
                value: candidate.segment,
                label: `${candidate.flightNumber} · ${candidate.from} → ${candidate.to}`,
              }))}
            />
          )}
          <fieldset className={styles.travelers}>
            <legend className={styles.legend}>Selecting for</legend>
            {party.map((traveler) => {
              const now = draft[traveler.id][segment];
              const was = saved[traveler.id][segment];
              return (
                <ChoiceCard
                  key={traveler.id}
                  name="seat-traveler"
                  indicator="none"
                  checked={travelerId === traveler.id}
                  onChange={() => setTravelerId(traveler.id)}
                  leading={
                    <span className={styles.seatBadge} aria-hidden="true">
                      {initialsOf(traveler.name)}
                    </span>
                  }
                  title={traveler.name}
                  description={
                    now === was
                      ? `Seat ${now} · no change`
                      : `Seat ${was} → ${now} · ${seatPrice(now) ? formatPeso(seatPrice(now)) : 'free'}`
                  }
                />
              );
            })}
          </fieldset>
        </div>
        <div className={styles.map}>
          <SeatMap
            label={`Seat map, ${flight.flightNumber} ${flight.from} to ${flight.to}`}
            aircraftLabel={`${flight.flightNumber} · ${flight.from} → ${flight.to} · ${flight.aircraft}`}
            rows={rows}
            occupants={occupants}
            onSelectSeat={selectSeat}
          />
        </div>
      </div>
    </Dialog>
  );
}

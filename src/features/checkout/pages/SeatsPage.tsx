import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';

import { paths } from '@/app/paths';
import { SeatLegend, SeatMap } from '@/components/flight';
import { Icon } from '@/components/icons';
import { Button, Dialog, LinkButton, StatusChip } from '@/components/ui';
import { AIRLINES, findAirport } from '@/data/airports';
import {
  buildSeatMap,
  SEAT_ZONE_FEATURES,
  seatPrice,
  zoneOfRow,
  positionOfColumn,
  type FlightSegment,
  type Seat,
} from '@/data/seatMap';
import { useDocumentTitle } from '@/hooks';
import { formatDayLabel } from '@/lib/date';
import { formatPeso, initialsOf, joinWithAnd } from '@/lib/format';
import type { SeatAssignments } from '@/types/checkout';
import type { FlightLeg } from '@/types/flight';

import { CheckoutTripSummary } from '../components/CheckoutTripSummary';
import { ExitRowDialog } from '../components/seats/ExitRowDialog';
import { StepIntro } from '../components/StepIntro';
import { useCheckoutContext } from '../hooks/useCheckoutContext';
import { saveSeats } from '../state/checkoutStore';
import styles from './SeatsPage.module.css';

function emptySeats(count: number): SeatAssignments {
  return { outbound: Array(count).fill(null), inbound: Array(count).fill(null) };
}

export function SeatsPage() {
  useDocumentTitle('Choose your seats');
  const navigate = useNavigate();
  const { checkout, selection } = useCheckoutContext();
  const { offer, search } = selection;
  const airline = AIRLINES[offer.airlineId];

  const travelerNames = checkout.travelers.map((traveler, index) =>
    traveler.firstNames
      ? `${traveler.firstNames.split(' ')[0]} ${traveler.lastName}`
      : `Traveler ${index + 1}`,
  );
  const travelerCount = Math.max(travelerNames.length, 1);

  const [seats, setSeats] = useState<SeatAssignments>(() =>
    checkout.seats.outbound.length === travelerCount ? checkout.seats : emptySeats(travelerCount),
  );
  const [segment, setSegment] = useState<FlightSegment>('outbound');
  const [activeTraveler, setActiveTraveler] = useState(0);
  const [pendingExitSeat, setPendingExitSeat] = useState<string | null>(null);
  const [hasAcceptedExitRules, setHasAcceptedExitRules] = useState(false);
  const [isSkipDialogOpen, setIsSkipDialogOpen] = useState(false);

  const segments: Array<{ id: FlightSegment; leg: FlightLeg }> = [
    { id: 'outbound', leg: offer.outbound },
    ...(search.returnDate ? [{ id: 'inbound' as const, leg: offer.inbound }] : []),
  ];
  const currentLeg = segment === 'outbound' ? offer.outbound : offer.inbound;
  const segmentSeats = seats[segment];
  const rows = useMemo(
    () => buildSeatMap(segment, seats[segment].filter(Boolean) as string[]),
    [segment, seats],
  );
  const occupants = new Map(
    segmentSeats.flatMap((code, index) =>
      code
        ? [[code, { name: travelerNames[index], initials: initialsOf(travelerNames[index]) }] as const]
        : [],
    ),
  );
  const routeLabel = (leg: FlightLeg) =>
    `${findAirport(leg.from)?.city ?? leg.from} → ${findAirport(leg.to)?.city ?? leg.to}`;

  const placeSeat = (code: string | null) => {
    const nextSegmentSeats = segmentSeats.map((current, index) =>
      index === activeTraveler ? code : current,
    );
    const next = { ...seats, [segment]: nextSegmentSeats };
    setSeats(next);
    saveSeats(next);
    const nextTraveler = nextSegmentSeats.findIndex((current) => current === null);
    if (code && nextTraveler >= 0) setActiveTraveler(nextTraveler);
  };

  const handleSelectSeat = (seat: Seat) => {
    const owner = segmentSeats.indexOf(seat.code);
    if (owner === activeTraveler) return placeSeat(null);
    if (owner >= 0) return setActiveTraveler(owner);
    if (seat.zone === 'legroom' && !hasAcceptedExitRules) return setPendingExitSeat(seat.code);
    placeSeat(seat.code);
  };

  const chosenSeatsBySegment = segments
    .map(({ id }) => seats[id].filter(Boolean).join(' and '))
    .filter(Boolean);

  const skipSeats = () => {
    saveSeats(emptySeats(travelerCount));
    navigate(paths.checkout.extras);
  };

  const activeCode = segmentSeats[activeTraveler];

  return (
    <>
      <StepIntro title="Choose your seats">
        Standard seats are included with your Classic fare. Front-cabin and extra-legroom seats can be added
        for a fee.
      </StepIntro>

      <div className={styles.layout}>
        <div className={styles.controls}>
          <fieldset className={styles.group}>
            <legend className="visually-hidden">Flight</legend>
            {segments.map(({ id, leg }) => {
              const chosen = seats[id].filter(Boolean).length;
              return (
                <label key={id} className={styles.segment}>
                  <input
                    type="radio"
                    name="seat-segment"
                    className="visually-hidden"
                    checked={segment === id}
                    onChange={() => {
                      setSegment(id);
                      setActiveTraveler(0);
                    }}
                  />
                  <span className={styles.segmentText}>
                    <span className={styles.segmentRoute}>{routeLabel(leg)}</span>
                    <span className={styles.segmentMeta}>
                      {formatDayLabel(leg.date)} · {leg.flightNumber}
                    </span>
                  </span>
                  <StatusChip tone={chosen === travelerCount ? 'success' : 'muted'} hideDot size="compact">
                    {chosen} of {travelerCount} seats
                  </StatusChip>
                </label>
              );
            })}
          </fieldset>

          <fieldset className={styles.group}>
            <legend className={styles.groupTitle}>Selecting for</legend>
            {travelerNames.map((name, index) => {
              const code = segmentSeats[index];
              const price = code ? seatPrice(code) : 0;
              return (
                <label key={name} className={styles.traveler}>
                  <input
                    type="radio"
                    name="seat-traveler"
                    className="visually-hidden"
                    checked={activeTraveler === index}
                    onChange={() => setActiveTraveler(index)}
                  />
                  <span className={styles.initials} aria-hidden="true">
                    {initialsOf(name)}
                  </span>
                  <span className={styles.travelerText}>
                    <span className={styles.travelerName}>{name}</span>
                    <span className={styles.travelerMeta}>
                      {code
                        ? `${positionOfColumn(code.slice(-1))} · ${price ? formatPeso(price) : 'Included'}`
                        : 'No seat yet'}
                    </span>
                  </span>
                  <span className={code ? styles.seatCode : styles.seatCodeEmpty}>{code ?? '—'}</span>
                </label>
              );
            })}
          </fieldset>

          {activeCode && (
            <div className={styles.detail} aria-live="polite">
              <div className={styles.detailHeader}>
                <span className={styles.detailCode}>Seat {activeCode}</span>
                <span className={styles.detailPrice}>
                  {seatPrice(activeCode) ? formatPeso(seatPrice(activeCode)) : 'Included'}
                </span>
              </div>
              <ul className={styles.features}>
                {[
                  positionOfColumn(activeCode.slice(-1)),
                  ...SEAT_ZONE_FEATURES[zoneOfRow(Number.parseInt(activeCode, 10))],
                ].map((feature) => (
                  <li key={feature} className={styles.feature}>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <SeatLegend />

          <div className={styles.skip}>
            <p className={styles.skipText}>
              Prefer not to choose? Skip ahead and we’ll assign included seats at check-in. Seats together
              can’t be guaranteed.
            </p>
            <Button
              variant="ghost"
              className={styles.skipButton}
              aria-haspopup={chosenSeatsBySegment.length ? 'dialog' : undefined}
              onClick={() => (chosenSeatsBySegment.length ? setIsSkipDialogOpen(true) : skipSeats())}
            >
              Skip seat selection
            </Button>
          </div>
        </div>

        <div className={styles.map}>
          <SeatMap
            label={`Seat map, ${routeLabel(currentLeg).replace(' → ', ' to ')}`}
            aircraftLabel={`${currentLeg.flightNumber} · ${currentLeg.from} → ${currentLeg.to} · Airbus A321neo`}
            rows={rows}
            occupants={occupants}
            onSelectSeat={handleSelectSeat}
          />
        </div>

        <div className={styles.aside}>
          <CheckoutTripSummary />
          <LinkButton
            to={paths.checkout.extras}
            variant="primary"
            size="large"
            fullWidth
            iconEnd="arrowRight"
          >
            Continue to extras
          </LinkButton>
          <Link to={paths.checkout.travelers} className={styles.back}>
            <Icon name="chevronLeft" size={16} strokeWidth={1.8} />
            Back to travelers
          </Link>
        </div>
      </div>

      <ExitRowDialog
        seatCode={pendingExitSeat}
        flightLabel={`${currentLeg.flightNumber} · ${routeLabel(currentLeg)}`}
        travelerName={travelerNames[activeTraveler]}
        airlineName={airline.name}
        onClose={() => setPendingExitSeat(null)}
        onAccept={() => {
          setHasAcceptedExitRules(true);
          placeSeat(pendingExitSeat);
          setPendingExitSeat(null);
        }}
      />

      <Dialog
        open={isSkipDialogOpen}
        onClose={() => setIsSkipDialogOpen(false)}
        role="alertdialog"
        size="small"
        icon="alertTriangle"
        iconTone="danger"
        title="Skip seat selection?"
        description={`We’ll release the seats you’ve chosen (${joinWithAnd(
          chosenSeatsBySegment.map(
            (codes, index) => `${codes} ${index === 0 ? 'on the way out' : 'on the way back'}`,
          ),
        )}) and assign included seats for free at check-in. We can’t guarantee you’ll sit together.`}
        footer={
          <>
            <Button variant="quiet" onClick={() => setIsSkipDialogOpen(false)}>
              Keep my seats
            </Button>
            <Button variant="destructive" onClick={skipSeats}>
              Release seats and skip
            </Button>
          </>
        }
      />
    </>
  );
}

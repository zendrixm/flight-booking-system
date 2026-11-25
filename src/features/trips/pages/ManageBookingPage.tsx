import clsx from 'clsx';
import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';

import { paths } from '@/app/paths';
import { useSession } from '@/app/providers';
import { ReceiptDialog } from '@/components/booking';
import { PageLoader } from '@/components/layout';
import {
  Alert,
  Breadcrumbs,
  Button,
  EmptyState,
  LinkButton,
  Menu,
  StatusChip,
  useToast,
} from '@/components/ui';
import { DEMO_TODAY } from '@/config/demo';
import { useAsyncData, useDocumentTitle } from '@/hooks';
import { addDays, daysBetween, formatDayLabel } from '@/lib/date';
import { formatPeso, joinWithAnd, pluralize } from '@/lib/format';
import * as manageBooking from '@/services/manageBookingService';
import type { ManagedBooking, ManagedTraveler } from '@/types/managedBooking';

import { AddBagsDialog } from '../components/manage/AddBagsDialog';
import { AssistanceDialog } from '../components/manage/AssistanceDialog';
import { CancelTripDialog } from '../components/manage/CancelTripDialog';
import { ChangeFlightsDialog } from '../components/manage/ChangeFlightsDialog';
import { ChangeSeatsDialog } from '../components/manage/ChangeSeatsDialog';
import { CheckInDialog } from '../components/manage/CheckInDialog';
import { ContactCard } from '../components/manage/ContactCard';
import { ContactDialog } from '../components/manage/ContactDialog';
import { FareRulesCard } from '../components/manage/FareRulesCard';
import { FlightsCard } from '../components/manage/FlightsCard';
import { InvoiceDialog } from '../components/manage/InvoiceDialog';
import { ManageActions, type ManageAction } from '../components/manage/ManageActions';
import { NameCorrectionDialog } from '../components/manage/NameCorrectionDialog';
import { PassportDialog } from '../components/manage/PassportDialog';
import { PaymentsCard } from '../components/manage/PaymentsCard';
import { TravelersCard } from '../components/manage/TravelersCard';
import styles from './ManageBookingPage.module.css';

type ManageDialog =
  | { kind: ManageAction }
  | { kind: 'seatsFor'; travelerId: string }
  | { kind: 'passport'; travelerId: string }
  | { kind: 'name' }
  | { kind: 'contact' }
  | { kind: 'receipt' }
  | { kind: 'invoice' }
  | null;

const DIALOG_HASHES: readonly ManageAction[] = ['change', 'seats', 'bags', 'assist', 'checkin', 'cancel'];

function initialDialog(hash: string): ManageDialog {
  const action = hash.replace('#', '') as ManageAction;
  return DIALOG_HASHES.includes(action) ? { kind: action } : null;
}

export function ManageBookingPage() {
  const { reference = '' } = useParams();
  const result = useAsyncData(`manage:${reference}`, () => manageBooking.getManagedBooking(reference));
  useDocumentTitle(result.data ? `${result.data.city} · ${reference}` : 'Manage booking');

  if (result.status === 'error') {
    return (
      <main className={styles.page}>
        <EmptyState
          icon="searchX"
          title={`We can’t find booking ${reference}`}
          description="Check the reference in your confirmation email, or find the trip in My trips."
          actions={
            <LinkButton to={paths.trips} variant="primary">
              Go to My trips
            </LinkButton>
          }
        />
      </main>
    );
  }
  if (!result.data) return <PageLoader label="Loading your booking…" />;
  return <ManageBookingView key={reference} initialBooking={result.data} />;
}

function ManageBookingView({ initialBooking }: { initialBooking: ManagedBooking }) {
  const navigate = useNavigate();
  const toast = useToast();
  const { hash } = useLocation();
  const { customer } = useSession();
  const [booking, setBooking] = useState(initialBooking);
  const [dialog, setDialog] = useState<ManageDialog>(() => initialDialog(hash));
  const [isSaving, setIsSaving] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [travelersNote, setTravelersNote] = useState<string>();
  const [isContactSaved, setIsContactSaved] = useState(false);
  const [changeNote, setChangeNote] = useState<string>();
  const [receiptStatus, setReceiptStatus] = useState<string>();

  const isCancelled = booking.status === 'cancelled';
  const [firstFlight] = booking.flights;
  const lastFlight = booking.flights[booking.flights.length - 1];
  const checkInOpens = addDays(firstFlight.date, -2);
  const checkInOpensLabel = `${formatDayLabel(checkInOpens)} at ${firstFlight.departureTime}`;
  const daysToGo = daysBetween(DEMO_TODAY, firstFlight.date);
  const isCheckInOpen = daysToGo >= 0 && daysToGo <= 1;
  const close = () => setDialog(null);

  /** Runs a change against the API, swaps in the updated booking and closes the dialog. */
  const save = async (operation: () => Promise<ManagedBooking>, keepOpen = false) => {
    setIsSaving(true);
    try {
      setBooking(await operation());
      if (!keepOpen) close();
    } catch {
      toast.show({
        tone: 'error',
        message: 'That didn’t go through. Nothing was charged — please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const travelerById = (id: string) => booking.travelers.find((traveler) => traveler.id === id);
  const shortName = (traveler: ManagedTraveler) =>
    `${traveler.firstNames.split(' ')[0]} ${traveler.lastName}`;
  const sameSeatsBothWays = booking.travelers.every(
    (traveler) => traveler.seats.outbound === traveler.seats.inbound,
  );
  const bagCount = booking.travelers.reduce((sum, traveler) => sum + traveler.checkedBags, 0);
  const assistanceCount = booking.travelers.filter(
    (traveler) => traveler.assistanceRequests.length > 0,
  ).length;

  const handleAction = (action: ManageAction) => {
    if (action === 'checkin' && isCheckInOpen) {
      navigate(paths.boardingPass(booking.reference));
      return;
    }
    setDialog({ kind: action });
  };

  const tripLine = `${formatDayLabel(firstFlight.date)}${
    booking.flights.length > 1 ? ` – ${formatDayLabel(lastFlight.date)}` : ''
  } ${lastFlight.date.slice(0, 4)} · ${pluralize(booking.travelers.length, 'traveler')} · ${booking.fareName}, ${booking.cabin}`;

  const addToCalendar = (message: string) => toast.show({ tone: 'success', message });

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.heading}>
          <Breadcrumbs
            items={[
              { label: 'Home', to: paths.home },
              { label: 'My trips', to: paths.trips },
              { label: `${booking.city} · ${booking.reference}` },
            ]}
          />
          <div className={styles.chips}>
            <StatusChip tone={isCancelled ? 'danger' : 'success'} hideDot>
              {isCancelled ? 'Cancelled' : 'Confirmed · ticketed'}
            </StatusChip>
            <StatusChip tone="muted" hideDot>
              REF {booking.reference}
            </StatusChip>
          </div>
          <h1 className={clsx(styles.title, isCancelled && styles.cancelledTitle)}>{booking.city}</h1>
          <p className={styles.tripLine}>{tripLine}</p>
        </div>
        {!isCancelled && (
          <Menu
            open={isCalendarOpen}
            onOpenChange={setIsCalendarOpen}
            label="Add to calendar"
            align="end"
            width={320}
            intro={
              <p className={styles.menuIntro}>
                Adds {booking.flights.length > 1 ? 'both flights' : 'your flight'} with local times, your
                booking reference and check-in opening.
              </p>
            }
            items={[
              {
                id: 'ics',
                label: 'Apple Calendar or Outlook',
                description: 'Download an .ics file',
                icon: 'download',
                iconTile: true,
                onSelect: () =>
                  addToCalendar(
                    `Downloaded ${booking.reference}-flights.ics — open it to add your flights to your calendar`,
                  ),
              },
              {
                id: 'google',
                label: 'Google Calendar',
                description: 'Opens in a new tab',
                icon: 'calendar',
                iconTile: true,
                onSelect: () => addToCalendar('Flights added to Google Calendar'),
              },
              {
                id: 'email',
                label: 'Email me the itinerary',
                description: `To ${booking.contact.email}`,
                icon: 'mail',
                iconTile: true,
                onSelect: () => addToCalendar(`Itinerary emailed to ${booking.contact.email}`),
              },
            ]}
            trigger={(triggerProps) => (
              <Button {...triggerProps} variant="quiet" iconStart="calendarPlus">
                Add to calendar
              </Button>
            )}
          />
        )}
      </header>

      {isCancelled && booking.refund && (
        <Alert tone="info" icon="checkCircle" role="status">
          <strong>Your trip is cancelled.</strong> A refund of {formatPeso(booking.refund.amount)} is on its
          way to{' '}
          {booking.refund.method === 'card'
            ? `your card ending ${booking.cardLast4}`
            : 'your Vela travel credit'}
          . We’ve emailed the details to {booking.contact.email}.
        </Alert>
      )}
      {changeNote && !isCancelled && (
        <Alert
          tone="success"
          icon="checkCircle"
          role="status"
          action={
            <Button variant="quiet" size="small" onClick={() => setDialog({ kind: 'receipt' })}>
              View updated receipt
            </Button>
          }
        >
          <strong>Your flights are changed.</strong> {changeNote}
        </Alert>
      )}

      <ManageActions
        isDisabled={isCancelled}
        seatsSummary={`${joinWithAnd(booking.travelers.map((traveler) => traveler.seats.outbound))} ${
          sameSeatsBothWays && booking.flights.length > 1
            ? 'on both flights'
            : `on ${firstFlight.flightNumber}`
        }`}
        bagsSummary={`${bagCount} × 23 kg booked`}
        assistanceSummary={
          assistanceCount
            ? `${pluralize(assistanceCount, 'request')} · awaiting airline`
            : 'Wheelchair, sight, hearing and more'
        }
        checkInSummary={
          isCheckInOpen
            ? 'Open now · get your boarding passes'
            : booking.checkInReminder
              ? `Opens ${formatDayLabel(checkInOpens)} · reminder set`
              : `Opens ${checkInOpensLabel}`
        }
        onSelect={handleAction}
      />

      <div className={styles.columns}>
        <div className={styles.main}>
          <FlightsCard booking={booking} />
          <TravelersCard
            booking={booking}
            note={travelersNote}
            onRequestNameCorrection={() => setDialog({ kind: 'name' })}
            onEditPassport={(travelerId) => setDialog({ kind: 'passport', travelerId })}
            onEditSeats={(travelerId) => setDialog({ kind: 'seatsFor', travelerId })}
          />
          <ContactCard
            booking={booking}
            isSaved={isContactSaved}
            onEdit={() => setDialog({ kind: 'contact' })}
          />
        </div>
        <aside className={styles.aside} aria-label="Fare and payments">
          <FareRulesCard booking={booking} />
          <PaymentsCard
            booking={booking}
            onViewReceipt={() => {
              setReceiptStatus(undefined);
              setDialog({ kind: 'receipt' });
            }}
            onRequestInvoice={() => setDialog({ kind: 'invoice' })}
          />
        </aside>
      </div>

      {dialog?.kind === 'change' && (
        <ChangeFlightsDialog
          booking={booking}
          travelCredit={customer?.travelCredit ?? 0}
          isSaving={isSaving}
          onClose={close}
          onConfirm={({ choices, amount }) =>
            save(async () => {
              const changes = choices.map((choice) => {
                const option = manageBooking.CHANGE_OPTIONS[choice.segment].flights.find(
                  (flight) => flight.flightNumber === choice.flightNumber,
                );
                return {
                  segment: choice.segment,
                  date: choice.date,
                  flightNumber: choice.flightNumber,
                  departureTime: option?.departureTime ?? '',
                  arrivalTime: option?.arrivalTime ?? '',
                };
              });
              const updated = await manageBooking.changeFlights(booking.reference, changes, amount);
              const first = changes[0];
              setChangeNote(
                `You now ${first.segment === 'outbound' ? 'depart' : 'return'} ${formatDayLabel(first.date)} on ${
                  first.flightNumber
                } at ${first.departureTime}. We charged ${formatPeso(amount)} to card ending ${booking.cardLast4} and emailed new e-tickets to ${booking.contact.email}.`,
              );
              return updated;
            })
          }
        />
      )}

      {(dialog?.kind === 'seats' || dialog?.kind === 'seatsFor') && (
        <ChangeSeatsDialog
          booking={booking}
          initialTravelerId={dialog.kind === 'seatsFor' ? dialog.travelerId : undefined}
          isSaving={isSaving}
          onClose={close}
          onSave={(seats, amount, summary) =>
            save(async () => {
              const updated = await manageBooking.saveSeats(booking.reference, seats, amount);
              setTravelersNote(
                `New seats saved — ${summary}.${
                  amount
                    ? ` We charged ${formatPeso(amount)} to card ending ${booking.cardLast4}.`
                    : ' Your boarding passes will show them.'
                }`,
              );
              return updated;
            })
          }
        />
      )}

      {dialog?.kind === 'bags' && (
        <AddBagsDialog
          booking={booking}
          isSaving={isSaving}
          onClose={close}
          onConfirm={(extraBags, pricePerBag, message) =>
            save(async () => {
              const updated = await manageBooking.addBags(booking.reference, extraBags, pricePerBag);
              toast.show({ tone: 'success', message });
              return updated;
            })
          }
        />
      )}

      {dialog?.kind === 'assist' && (
        <AssistanceDialog
          booking={booking}
          isSaving={isSaving}
          onClose={close}
          onSend={(travelerId, requests) =>
            save(() => manageBooking.requestAssistance(booking.reference, travelerId, requests), true)
          }
        />
      )}

      {dialog?.kind === 'name' && (
        <NameCorrectionDialog
          booking={booking}
          isSaving={isSaving}
          onClose={close}
          onSend={(travelerId, newName) =>
            save(() => manageBooking.requestNameCorrection(booking.reference, travelerId, newName), true)
          }
        />
      )}

      {dialog?.kind === 'passport' && travelerById(dialog.travelerId) && (
        <PassportDialog
          booking={booking}
          traveler={travelerById(dialog.travelerId) as ManagedTraveler}
          isSaving={isSaving}
          onClose={close}
          onSave={(passport) =>
            save(async () => {
              const traveler = travelerById(dialog.travelerId) as ManagedTraveler;
              const updated = await manageBooking.updatePassport(booking.reference, traveler.id, passport);
              setTravelersNote(
                `Passport details saved for ${shortName(traveler)}. We’ve sent them to ${booking.airlineName}.`,
              );
              return updated;
            })
          }
        />
      )}

      {dialog?.kind === 'contact' && (
        <ContactDialog
          booking={booking}
          isSaving={isSaving}
          onClose={close}
          onSave={(contact) =>
            save(async () => {
              const updated = await manageBooking.updateContact(booking.reference, contact);
              setIsContactSaved(true);
              return updated;
            })
          }
        />
      )}

      {dialog?.kind === 'checkin' && (
        <CheckInDialog
          booking={booking}
          opensLabel={checkInOpensLabel}
          isSaving={isSaving}
          onClose={close}
          onSetReminder={(channels) =>
            save(() => manageBooking.setCheckInReminder(booking.reference, channels), true)
          }
        />
      )}

      {dialog?.kind === 'cancel' && (
        <CancelTripDialog
          booking={booking}
          isSaving={isSaving}
          onClose={close}
          onConfirm={(method) => save(() => manageBooking.cancelBooking(booking.reference, method))}
        />
      )}

      {dialog?.kind === 'invoice' && (
        <InvoiceDialog
          booking={booking}
          isSaving={isSaving}
          onClose={close}
          onRequest={async (request) => {
            setIsSaving(true);
            await manageBooking.requestInvoice(booking.reference, request);
            setIsSaving(false);
          }}
        />
      )}

      <ReceiptDialog
        open={dialog?.kind === 'receipt'}
        onClose={close}
        city={booking.city}
        tripLine={`${tripLine.split(' · ')[0]} · ${booking.flights.map((flight) => flight.flightNumber).join(' and ')}`}
        meta={[
          { label: 'Receipt no.', value: booking.receiptNumber },
          { label: 'Booking', value: booking.reference },
          {
            label: 'Billed to',
            value: booking.travelers[0]
              ? `${booking.travelers[0].firstNames} ${booking.travelers[0].lastName}`
              : '',
          },
          { label: 'Booked', value: booking.bookedAt },
        ]}
        lines={booking.receiptLines}
        paidWith={`Card •••• ${booking.cardLast4} · charged ${booking.bookedAt}`}
        airlineName={booking.airlineName}
        statusMessage={receiptStatus}
        onPrint={() => setReceiptStatus('Sent to your printer')}
        onDownload={() =>
          setReceiptStatus(`Downloaded ${booking.reference}-receipt${isCancelled ? '-and-refund' : ''}.pdf`)
        }
      />
    </main>
  );
}

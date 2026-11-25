import { useState } from 'react';

import { paths } from '@/app/paths';
import { useSession } from '@/app/providers';
import { EmailItineraryDialog, ReceiptDialog } from '@/components/booking';
import { Icon } from '@/components/icons';
import { PageContainer, PageLoader } from '@/components/layout';
import { Button, LinkButton, Menu, type MenuEntry, useToast } from '@/components/ui';
import { useAsyncData, useDocumentTitle } from '@/hooks';
import { formatDayLabel, formatDayRange } from '@/lib/date';
import { getConfirmedCheckout } from '@/services/bookingsService';

import { ConfirmationHero } from '../components/confirmation/ConfirmationHero';
import { EntryRequirementsDialog } from '../components/confirmation/EntryRequirementsDialog';
import { ETicketsDialog } from '../components/confirmation/ETicketsDialog';
import { ItineraryCard } from '../components/confirmation/ItineraryCard';
import { NextSteps } from '../components/confirmation/NextSteps';
import { PaymentSummaryCard } from '../components/confirmation/PaymentSummaryCard';
import { TravelerTickets } from '../components/confirmation/TravelerTickets';
import { buildConfirmation, type Confirmation } from '../lib/confirmation';
import { checkoutStore } from '../state/checkoutStore';
import styles from './ConfirmationPage.module.css';

const DEMO_REFERENCE = 'VL7Q2K';

type OpenDialog = 'tickets' | 'email' | 'receipt' | 'entry' | null;

/**
 * "You're going to Tokyo." Shows the booking that was just paid for; opened directly, it shows the
 * demo booking so the page can be reviewed on its own.
 */
export function ConfirmationPage() {
  useDocumentTitle('Booking confirmed');
  const { customer } = useSession();
  const email = customer?.email ?? '';
  const paidCheckout = checkoutStore.getState();
  const checkout = useAsyncData(`confirmed:${DEMO_REFERENCE}`, () =>
    paidCheckout.confirmedReference ? Promise.resolve(paidCheckout) : getConfirmedCheckout(DEMO_REFERENCE),
  );

  const confirmation = checkout.data ? buildConfirmation(checkout.data, email) : null;
  if (!confirmation || !checkout.data?.selection) return <PageLoader />;

  const fareFamily = checkout.data.selection.fareFamily;
  const fareLabel = `${fareFamily.charAt(0).toUpperCase()}${fareFamily.slice(1)}, ${checkout.data.selection.search.cabin}`;
  return <ConfirmationView confirmation={confirmation} fareLabel={fareLabel} />;
}

function ConfirmationView({ confirmation, fareLabel }: { confirmation: Confirmation; fareLabel: string }) {
  const toast = useToast();
  const [openDialog, setOpenDialog] = useState<OpenDialog>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarAdded, setCalendarAdded] = useState(false);
  const [receiptStatus, setReceiptStatus] = useState<string>();
  const close = () => setOpenDialog(null);

  const [outbound, inbound] = confirmation.legs;
  const tripDates = inbound
    ? formatDayRange(outbound.leg.date, inbound.leg.date)
    : formatDayLabel(outbound.leg.date);
  const tripLine = `${confirmation.destinationCity} · ${tripDates} · ${confirmation.reference}`;

  const addToCalendar = (label: string, message?: string) => {
    setCalendarAdded(true);
    toast.show({ tone: 'success', message: message ?? `Both flights added to ${label}` });
  };

  const calendarItems: MenuEntry[] = [
    {
      id: 'google',
      label: 'Google Calendar',
      description: 'Opens in your Google account',
      icon: 'calendarPlus',
      iconTile: true,
      onSelect: () => addToCalendar('Google Calendar'),
    },
    {
      id: 'apple',
      label: 'Apple Calendar',
      description: 'iPhone, iPad and Mac',
      icon: 'calendarPlus',
      iconTile: true,
      onSelect: () => addToCalendar('Apple Calendar'),
    },
    {
      id: 'outlook',
      label: 'Outlook',
      description: 'Outlook.com and Microsoft 365',
      icon: 'calendarPlus',
      iconTile: true,
      onSelect: () => addToCalendar('Outlook'),
    },
    {
      id: 'ics',
      label: 'Download .ics file',
      description: 'Works with any calendar app',
      icon: 'fileDownload',
      iconTile: true,
      onSelect: () =>
        addToCalendar('', `${confirmation.reference}-${confirmation.destinationCity}.ics downloaded`),
    },
  ];

  return (
    <main>
      <ConfirmationHero
        reference={confirmation.reference}
        destinationCity={confirmation.destinationCity}
        email={confirmation.email}
        bookedAt={confirmation.bookedAt}
        airlineReference={confirmation.airlineReference}
      />

      <div className={styles.actionsBar}>
        <div className={styles.actions}>
          <Menu
            open={isCalendarOpen}
            onOpenChange={setIsCalendarOpen}
            label="Add to calendar"
            header="Adds both flights"
            width={300}
            items={calendarItems}
            trigger={(triggerProps) => (
              <Button
                {...triggerProps}
                variant="quiet"
                className={calendarAdded ? styles.added : undefined}
                iconStart={calendarAdded ? 'check' : 'calendar'}
                iconEnd="chevronDown"
              >
                {calendarAdded ? 'Added to calendar' : 'Add to calendar'}
              </Button>
            )}
          />
          <Button variant="quiet" iconStart="download" onClick={() => setOpenDialog('tickets')}>
            Download e-tickets
          </Button>
          <Button variant="quiet" iconStart="mail" onClick={() => setOpenDialog('email')}>
            Email itinerary
          </Button>
          <LinkButton to={paths.trip(confirmation.reference)} variant="quiet" iconStart="edit">
            Manage booking
          </LinkButton>
        </div>
      </div>

      <PageContainer layout="plain" className={styles.layout}>
        <div className={styles.content}>
          <ItineraryCard legs={confirmation.legs} />
          <TravelerTickets travelers={confirmation.travelers} />
          <NextSteps steps={confirmation.timeline} />
        </div>

        <aside className={styles.aside} aria-label="Payment and travel information">
          <PaymentSummaryCard
            confirmation={confirmation}
            onViewReceipt={() => {
              setReceiptStatus(undefined);
              setOpenDialog('receipt');
            }}
          />
          {confirmation.destinationCountry === 'Japan' && (
            <section className={styles.entryCard} aria-labelledby="entry-title">
              <h2 id="entry-title" className={styles.entryTitle}>
                <Icon name="passport" size={18} />
                Before you fly to {confirmation.destinationCountry}
              </h2>
              <p className={styles.entryText}>
                Philippine passport holders generally need a visa to enter Japan. Check requirements for each
                traveler well before departure.
              </p>
              <Button variant="ghost" className={styles.entryLink} onClick={() => setOpenDialog('entry')}>
                Entry requirements
              </Button>
            </section>
          )}
          <section className={styles.helpCard} aria-label="Help">
            <span className={styles.helpIcon}>
              <Icon name="messageCircle" size={20} />
            </span>
            <span className={styles.helpText}>
              <span className={styles.helpTitle}>Need a hand?</span>
              <span className={styles.helpMeta}>Travel specialists, 24/7</span>
            </span>
            <LinkButton to={`${paths.help}#chat`} variant="primary" size="small">
              Chat
            </LinkButton>
          </section>
        </aside>
      </PageContainer>

      <ETicketsDialog
        open={openDialog === 'tickets'}
        onClose={close}
        confirmation={confirmation}
        fareLabel={fareLabel}
      />
      <EmailItineraryDialog
        open={openDialog === 'email'}
        onClose={close}
        tripLine={tripLine}
        defaultRecipient={confirmation.email}
        notePlaceholder={`Here’s our ${confirmation.destinationCity} itinerary — see you at the airport!`}
      />
      <ReceiptDialog
        open={openDialog === 'receipt'}
        onClose={close}
        city={confirmation.destinationCity}
        tripLine={`${outbound.leg.from} ⇄ ${outbound.leg.to} · ${tripDates} · ${confirmation.legs.map(({ leg }) => leg.flightNumber).join(' and ')}`}
        meta={[
          { label: 'Receipt no.', value: confirmation.receiptNumber },
          { label: 'Booking', value: confirmation.reference },
          { label: 'Billed to', value: confirmation.travelers[0]?.name ?? '' },
          { label: 'Booked', value: confirmation.bookedAt },
        ]}
        lines={confirmation.receiptLines}
        paidWith={`Card •••• 4821 · charged ${confirmation.bookedAt}`}
        airlineName={confirmation.airlineName}
        statusMessage={receiptStatus}
        onPrint={() => setReceiptStatus('Sent to printer')}
        onDownload={() => setReceiptStatus('PDF downloaded')}
      />
      <EntryRequirementsDialog
        open={openDialog === 'entry'}
        onClose={close}
        tripLine={`${outbound.fromLabel.split(' · ')[0]} → ${outbound.toLabel.split(' · ')[0]} · arriving ${formatDayLabel(outbound.leg.date)}`}
        travelers={confirmation.travelers}
        manageBookingPath={paths.trip(confirmation.reference)}
      />
    </main>
  );
}

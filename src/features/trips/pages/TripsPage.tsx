import { useState } from 'react';

import { paths } from '@/app/paths';
import { useSession } from '@/app/providers';
import { ReceiptDialog } from '@/components/booking';
import { PageLoader } from '@/components/layout';
import {
  Alert,
  Button,
  EmptyState,
  IconButton,
  LinkButton,
  PageHeader,
  Tabs,
  useToast,
} from '@/components/ui';
import { useAsyncData, useDocumentTitle } from '@/hooks';
import { listPriceAlerts } from '@/services/priceAlertsService';
import { listSavedTravelers } from '@/services/travelersService';
import { listTrips } from '@/services/tripsService';
import { fullNameOf } from '@/types/customer';
import type { Trip, TripStatus } from '@/types/trip';

import { AddBookingDialog } from '../components/AddBookingDialog';
import { BookAgainDialog } from '../components/BookAgainDialog';
import { CancelledTripCard } from '../components/CancelledTripCard';
import { PastTripList } from '../components/PastTripList';
import { PriceAlertsPreview } from '../components/PriceAlertsPreview';
import { RefundDetailsDialog } from '../components/RefundDetailsDialog';
import { UpcomingTripCard } from '../components/UpcomingTripCard';
import { pastTripDateRange } from '../lib/tripDates';
import styles from './TripsPage.module.css';

type TripsDialog =
  | { kind: 'receipt'; trip: Trip }
  | { kind: 'bookAgain'; trip: Trip }
  | { kind: 'refund'; trip: Trip }
  | { kind: 'addBooking' }
  | null;

const TAB_LABELS: Record<TripStatus, string> = { upcoming: 'Upcoming', past: 'Past', cancelled: 'Cancelled' };

export function TripsPage() {
  useDocumentTitle('My trips');
  const toast = useToast();
  const { customer } = useSession();
  const trips = useAsyncData('trips', listTrips);
  const alerts = useAsyncData('price-alerts', listPriceAlerts);
  const savedTravelers = useAsyncData('saved-travelers', listSavedTravelers);

  const [tab, setTab] = useState<TripStatus>('upcoming');
  const [dialog, setDialog] = useState<TripsDialog>(null);
  const [addedTrip, setAddedTrip] = useState<Trip | null>(null);
  const [isBannerVisible, setIsBannerVisible] = useState(false);
  const [receiptStatus, setReceiptStatus] = useState<string>();

  const byStatus = (status: TripStatus) =>
    (trips.data ?? [])
      .filter((trip) => trip.status === status)
      .sort((a, b) =>
        status === 'upcoming'
          ? a.departDate.localeCompare(b.departDate)
          : b.departDate.localeCompare(a.departDate),
      );
  const tabItems = (Object.keys(TAB_LABELS) as TripStatus[]).map((status) => ({
    id: status,
    label: TAB_LABELS[status],
    count: byStatus(status).length,
  }));

  const close = () => setDialog(null);

  const renderTab = () => {
    if (!trips.data) return <PageLoader label="Loading your trips…" />;
    const list = byStatus(tab);
    if (list.length === 0) {
      return (
        <EmptyState
          icon="plane"
          headingLevel={3}
          title={`No ${TAB_LABELS[tab].toLowerCase()} trips`}
          description="Trips you book with this account, or add by reference, appear here."
          actions={
            <LinkButton to={paths.home} variant="primary">
              Search flights
            </LinkButton>
          }
        />
      );
    }
    if (tab === 'upcoming') {
      return (
        <div className={styles.stack}>
          {list.map((trip) => (
            <UpcomingTripCard
              key={trip.reference}
              trip={trip}
              isNew={trip.reference === addedTrip?.reference}
            />
          ))}
        </div>
      );
    }
    if (tab === 'past') {
      return (
        <PastTripList
          trips={list}
          onViewReceipt={(trip) => {
            setReceiptStatus(undefined);
            setDialog({ kind: 'receipt', trip });
          }}
          onBookAgain={(trip) => setDialog({ kind: 'bookAgain', trip })}
        />
      );
    }
    return (
      <div className={styles.stack}>
        {list.map((trip) => (
          <CancelledTripCard
            key={trip.reference}
            trip={trip}
            onViewRefund={() => setDialog({ kind: 'refund', trip })}
            onBookAgain={() => setDialog({ kind: 'bookAgain', trip })}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <PageHeader
        title="My trips"
        breadcrumbs={[
          { label: 'Home', to: paths.home },
          { label: 'Account', to: paths.trips },
          { label: 'My trips' },
        ]}
        description={customer ? `Bookings made with ${customer.email}` : undefined}
        actions={
          <Button variant="quiet" iconStart="plus" onClick={() => setDialog({ kind: 'addBooking' })}>
            Add a booking by reference
          </Button>
        }
      />

      {isBannerVisible && addedTrip && tab === 'upcoming' && (
        <Alert
          tone="success"
          role="status"
          icon="check"
          action={
            <IconButton icon="close" label="Dismiss" size="small" onClick={() => setIsBannerVisible(false)} />
          }
        >
          <strong>
            {addedTrip.city} · {addedTrip.reference} is now in My trips.
          </strong>{' '}
          Updates for this booking will also go to {customer?.email}.
        </Alert>
      )}

      <Tabs label="Trips" items={tabItems} value={tab} onChange={setTab}>
        {renderTab()}
      </Tabs>

      <PriceAlertsPreview alerts={(alerts.data ?? []).filter((alert) => !alert.isPaused).slice(0, 2)} />

      {dialog?.kind === 'receipt' && (
        <ReceiptDialog
          open
          onClose={close}
          city={dialog.trip.city}
          tripLine={`${pastTripDateRange(dialog.trip)} · ${dialog.trip.originCode} ⇄ ${dialog.trip.destinationCode} · ${dialog.trip.flightNumbers}`}
          meta={[
            { label: 'Receipt no.', value: dialog.trip.receipt.number },
            { label: 'Booking', value: dialog.trip.reference },
            { label: 'Billed to', value: customer ? fullNameOf(customer) : '' },
            { label: 'Booked', value: dialog.trip.receipt.bookedAt },
          ]}
          lines={dialog.trip.receipt.lines}
          paidWith={`Card •••• ${dialog.trip.receipt.cardLast4} · charged ${dialog.trip.receipt.bookedAt}`}
          airlineName={dialog.trip.airlineName}
          statusMessage={receiptStatus}
          onPrint={() => setReceiptStatus('Sent to printer')}
          onDownload={() => setReceiptStatus(`Downloaded · ${dialog.trip.reference}-receipt.pdf`)}
        />
      )}

      {dialog?.kind === 'bookAgain' && savedTravelers.data && (
        <BookAgainDialog trip={dialog.trip} savedTravelers={savedTravelers.data} onClose={close} />
      )}

      {dialog?.kind === 'refund' && (
        <RefundDetailsDialog
          trip={dialog.trip}
          onClose={close}
          onDownload={() =>
            toast.show({
              tone: 'success',
              message: `Refund receipt downloaded · ${dialog.trip.reference}-refund.pdf`,
            })
          }
          onBookAgain={() => setDialog({ kind: 'bookAgain', trip: dialog.trip })}
        />
      )}

      <AddBookingDialog
        key={dialog?.kind === 'addBooking' ? 'open' : 'closed'}
        open={dialog?.kind === 'addBooking'}
        onClose={close}
        onAdded={(trip) => {
          close();
          setAddedTrip(trip);
          setIsBannerVisible(true);
          setTab('upcoming');
          trips.reload();
        }}
        onShowExisting={(trip) => {
          close();
          setTab(trip.status);
        }}
      />
    </>
  );
}

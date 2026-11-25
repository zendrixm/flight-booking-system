import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router';

import { paths } from '@/app/paths';
import { PageLoader } from '@/components/layout';
import { Alert, Button, EmptyState, LinkButton, StatusChip, Tabs, useToast } from '@/components/ui';
import { useAsyncData } from '@/hooks';
import { formatPeso } from '@/lib/format';
import * as bookingActions from '@/services/console/bookingDetailService';
import type { BookingActionResult, BookingDetail } from '@/types/console/bookingDetail';

import { ConsolePage } from '../../shared/components/ConsolePage';
import {
  PaymentLinkDialog,
  ReissueDialog,
  ResendItineraryDialog,
} from '../components/detail/BookingActionDialogs';
import {
  ActivityTimeline,
  ContactCard,
  LedgerCard,
  NotesCard,
  PaymentSummaryCard,
  RiskCard,
  SegmentsCard,
  TicketsCard,
  TravelersCard,
} from '../components/detail/DetailCards';
import { RefundDrawer } from '../components/detail/RefundDrawer';
import styles from './BookingDetailPage.module.css';

type DetailTab = 'overview' | 'payments' | 'tickets' | 'activity';
type OpenAction = 'resend' | 'reissue' | 'paymentLink' | 'refund' | null;

const TABS: ReadonlyArray<{ id: DetailTab; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'payments', label: 'Payments' },
  { id: 'tickets', label: 'Tickets' },
  { id: 'activity', label: 'Activity' },
];

export function BookingDetailPage() {
  const { reference = '' } = useParams();
  const result = useAsyncData(`booking-detail-${reference}`, () =>
    bookingActions.getBookingDetail(reference),
  );

  if (result.status === 'error') {
    return (
      <ConsolePage section="bookings" title={reference.toUpperCase()} breadcrumbs={trail(reference)}>
        <Alert
          tone="danger"
          role="alert"
          title="This booking didn’t load"
          action={
            <Button variant="quiet" size="small" onClick={result.reload}>
              Try again
            </Button>
          }
        />
      </ConsolePage>
    );
  }
  if (result.data === undefined) return <PageLoader label="Loading booking…" />;
  if (result.data === null) {
    return (
      <ConsolePage section="bookings" title="Booking not found" breadcrumbs={trail(reference)}>
        <EmptyState
          icon="searchX"
          title={`We couldn’t find booking ${reference.toUpperCase()}`}
          description="It may be older than 30 days, or the reference has a typo. Check it, or search by the traveler’s email."
          actions={
            <LinkButton to={`${paths.console.bookings}?q=${encodeURIComponent(reference)}`} variant="primary">
              Search all bookings
            </LinkButton>
          }
        />
      </ConsolePage>
    );
  }
  // Keyed so local state (tabs, dialogs, revealed phone) resets when moving between bookings.
  return <BookingDetailView key={reference} initialDetail={result.data} />;
}

function trail(reference: string) {
  return [
    { label: 'Operations' },
    { label: 'Bookings', to: paths.console.bookings },
    { label: reference.toUpperCase() },
  ];
}

function BookingDetailView({ initialDetail }: { initialDetail: BookingDetail }) {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [detail, setDetail] = useState(initialDetail);
  const [openAction, setOpenAction] = useState<OpenAction>(null);
  const [revealedPhone, setRevealedPhone] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<'reveal' | 'note' | 'retry' | null>(null);
  const { booking, actions } = detail;
  const reference = booking.reference;

  const tab = TABS.find((candidate) => candidate.id === searchParams.get('tab'))?.id ?? 'overview';
  const setTab = (next: DetailTab) =>
    setSearchParams(next === 'overview' ? {} : { tab: next }, { replace: true, preventScrollReset: true });

  /** Applies an action's result and shows its message. */
  const apply = ({ detail: next, message }: BookingActionResult) => {
    setDetail(next);
    setOpenAction(null);
    toast.show({ tone: 'success', message });
  };

  const run = async (action: 'reveal' | 'note' | 'retry', task: () => Promise<void>) => {
    setBusyAction(action);
    try {
      await task();
    } finally {
      setBusyAction(null);
    }
  };

  const ticketCount = detail.coupons.length ? booking.travelerCount : undefined;

  return (
    <ConsolePage
      section="bookings"
      title={reference}
      breadcrumbs={trail(reference)}
      documentTitle={`${reference} · Bookings`}
      description={
        <span className={styles.header}>
          <span className={styles.chips}>
            <StatusChip tone={detail.status.tone} hideDot size="compact">
              {detail.status.label}
            </StatusChip>
            <StatusChip tone={detail.payment.tone} hideDot size="compact">
              {detail.payment.label}
            </StatusChip>
          </span>
          <span className={styles.summary}>
            {booking.leadTraveler} · {booking.route} · {booking.travelerCount}{' '}
            {booking.travelerCount === 1 ? 'traveler' : 'travelers'} · {formatPeso(booking.total)}
          </span>
          <span>{detail.createdSummary}</span>
        </span>
      }
      actions={
        <>
          <Button
            variant="quiet"
            disabled={!actions.canResend}
            aria-haspopup="dialog"
            onClick={() => setOpenAction('resend')}
          >
            Resend itinerary
          </Button>
          {actions.showReissue && (
            <Button
              variant="quiet"
              disabled={!actions.canReissue}
              aria-haspopup="dialog"
              onClick={() => setOpenAction('reissue')}
            >
              Reissue ticket
            </Button>
          )}
          {actions.showRetryTicketing && (
            <Button
              variant="primary"
              loading={busyAction === 'retry'}
              loadingLabel="Retrying ticketing…"
              onClick={() => run('retry', async () => apply(await bookingActions.retryTicketing(reference)))}
            >
              Retry ticketing
            </Button>
          )}
          {actions.showPaymentLink && (
            <Button
              variant="primary"
              disabled={actions.isPaymentLinkSent}
              aria-haspopup="dialog"
              onClick={() => setOpenAction('paymentLink')}
            >
              {actions.paymentLinkLabel}
            </Button>
          )}
          <Button
            variant="destructive"
            disabled={!actions.canRefund}
            aria-haspopup="dialog"
            onClick={() => setOpenAction('refund')}
          >
            {actions.refundLabel}
          </Button>
        </>
      }
    >
      <Tabs<DetailTab>
        label="Booking sections"
        items={TABS.map((item) => ({ ...item, count: item.id === 'tickets' ? ticketCount : undefined }))}
        value={tab}
        onChange={setTab}
      >
        <div className={styles.panel}>
          {tab === 'overview' && (
            <div className={styles.columns}>
              <div className={styles.main}>
                <SegmentsCard detail={detail} />
                <TravelersCard detail={detail} />
                <ContactCard
                  detail={detail}
                  revealedPhone={revealedPhone}
                  isRevealing={busyAction === 'reveal'}
                  onReveal={() =>
                    run('reveal', async () => {
                      const revealed = await bookingActions.revealCustomerPhone(reference);
                      setRevealedPhone(revealed.phone);
                      setDetail(revealed.detail);
                    })
                  }
                />
              </div>
              <aside className={styles.aside}>
                <PaymentSummaryCard detail={detail} />
                <NotesCard
                  detail={detail}
                  isSaving={busyAction === 'note'}
                  onSave={(text) =>
                    run('note', async () => apply(await bookingActions.addBookingNote(reference, text)))
                  }
                />
              </aside>
            </div>
          )}
          {tab === 'payments' && (
            <div className={styles.columns}>
              <LedgerCard detail={detail} />
              <RiskCard detail={detail} />
            </div>
          )}
          {tab === 'tickets' && <TicketsCard detail={detail} />}
          {tab === 'activity' && <ActivityTimeline detail={detail} />}
        </div>
      </Tabs>

      {openAction === 'resend' && (
        <ResendItineraryDialog
          detail={detail}
          onClose={() => setOpenAction(null)}
          onSubmit={async (request) => apply(await bookingActions.resendBookingItinerary(reference, request))}
        />
      )}
      {openAction === 'reissue' && (
        <ReissueDialog
          detail={detail}
          onClose={() => setOpenAction(null)}
          onSubmit={async (request) => {
            apply(await bookingActions.reissueTickets(reference, request));
            setTab('tickets');
          }}
        />
      )}
      {openAction === 'paymentLink' && (
        <PaymentLinkDialog
          detail={detail}
          onClose={() => setOpenAction(null)}
          onSubmit={async (channels) => apply(await bookingActions.sendPaymentLink(reference, channels))}
        />
      )}
      {openAction === 'refund' && (
        <RefundDrawer
          detail={detail}
          onClose={() => setOpenAction(null)}
          onSubmit={async (request) => apply(await bookingActions.issueRefund(reference, request))}
        />
      )}
    </ConsolePage>
  );
}

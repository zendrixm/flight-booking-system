import { useState } from 'react';

import { useStaffSession } from '@/app/providers';
import { PageLoader } from '@/components/layout';
import { Alert, Button, Tabs, useToast } from '@/components/ui';
import { useAsyncData } from '@/hooks';
import { assignBookingsToMe, listConsoleBookings } from '@/services/console/bookingsService';
import type { BookingFilters, BookingView } from '@/types/console/booking';
import type { WorkspaceCode } from '@/types/console/staff';

import { ConsolePage } from '../../shared/components/ConsolePage';
import { BookingsTable } from '../components/BookingsTable';
import { BookingsToolbar } from '../components/BookingsToolbar';
import { BulkActionsBar } from '../components/BulkActionsBar';
import { ExportBookingsDialog } from '../components/ExportBookingsDialog';
import { ManualBookingDrawer } from '../components/ManualBookingDrawer';
import { Pagination } from '../components/Pagination';
import { ResendItineraryDialog } from '../components/ResendItineraryDialog';
import { PAGE_SIZES, useBookingListQuery } from '../hooks/useBookingListQuery';
import {
  bookingCountLabel,
  FILTER_GROUPS,
  filterChipLabel,
  filterValueOf,
  MARKET_NAMES,
  RANGE_OPTIONS,
  VIEW_TABS,
} from '../lib/bookingPresentation';
import styles from './BookingsPage.module.css';

type OpenPanel =
  { name: 'export'; scope: 'view' | 'selected' } | { name: 'resend' } | { name: 'manual' } | null;

function workspaceFilters(workspace: WorkspaceCode): BookingFilters {
  return workspace === 'ALL' ? {} : { market: workspace };
}

export function BookingsPage() {
  const toast = useToast();
  const { workspace } = useStaffSession();
  const list = useBookingListQuery(workspaceFilters(workspace.code));
  const { query } = list;
  const [refreshCount, setRefreshCount] = useState(0);
  const result = useAsyncData(`console-bookings-${JSON.stringify(query)}-${refreshCount}`, () =>
    listConsoleBookings(query),
  );
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const [openPanel, setOpenPanel] = useState<OpenPanel>(null);
  const [highlightedReference, setHighlightedReference] = useState<string>();

  const refresh = () => setRefreshCount((count) => count + 1);
  const range = RANGE_OPTIONS.find((option) => option.id === query.range) ?? RANGE_OPTIONS[2];
  const viewLabel = VIEW_TABS.find((tab) => tab.id === query.view)?.label ?? 'All';
  const marketText = query.filters.market ? `${MARKET_NAMES[query.filters.market]} market` : 'all markets';
  const filterLabels = FILTER_GROUPS.flatMap((group) => {
    const value = filterValueOf(query.filters, group.key);
    return value === undefined ? [] : [filterChipLabel(group, value)];
  });
  const isNarrowed =
    filterLabels.length -
      (query.filters.market ? 1 : 0) +
      (query.channel !== 'all' ? 1 : 0) +
      (query.search.trim() ? 1 : 0) >
    0;
  const data = result.data;

  const toggleRow = (reference: string) =>
    setSelected((previous) => {
      const next = new Set(previous);
      if (next.has(reference)) next.delete(reference);
      else next.add(reference);
      return next;
    });

  const togglePage = () => {
    if (!data) return;
    const pageReferences = data.rows.map((row) => row.reference);
    const isPageSelected = pageReferences.every((reference) => selected.has(reference));
    setSelected((previous) => {
      const next = new Set(previous);
      pageReferences.forEach((reference) => (isPageSelected ? next.delete(reference) : next.add(reference)));
      return next;
    });
  };

  const assignToMe = async () => {
    const count = await assignBookingsToMe([...selected]);
    setSelected(new Set());
    refresh();
    toast.show({ tone: 'success', message: `${bookingCountLabel(count)} assigned to you` });
  };

  const renderTable = () => {
    if (result.status === 'error') {
      return (
        <Alert
          tone="danger"
          role="alert"
          title="Bookings didn’t load"
          action={
            <Button variant="quiet" size="small" onClick={result.reload}>
              Try again
            </Button>
          }
        />
      );
    }
    if (!data) return <PageLoader label="Loading bookings…" />;
    return (
      <section
        aria-label="Bookings table"
        aria-busy={result.status === 'loading'}
        className={styles.tableCard}
      >
        {data.rows.length > 0 ? (
          <BookingsTable
            rows={data.rows}
            selected={selected}
            highlightedReference={highlightedReference}
            onToggleRow={toggleRow}
            onTogglePage={togglePage}
          />
        ) : (
          <div className={styles.empty}>
            <span className={styles.emptyTitle}>
              {query.search.trim()
                ? `No bookings match “${query.search.trim()}”`
                : 'No bookings in this view'}
            </span>
            <span className={styles.emptyText}>
              {query.search.trim()
                ? `Search covers ${range.period} with the filters above. Check the reference, or search by traveler email.`
                : `Nothing ${viewLabel.toLowerCase()} for ${range.label.toLowerCase()} with these filters.`}
            </span>
            <span className={styles.emptyActions}>
              {query.range !== 'month' && data.hasMatchesInLast30Days && (
                <Button variant="primary" size="small" onClick={() => list.setRange('month')}>
                  Search the last 30 days
                </Button>
              )}
              <Button variant="quiet" size="small" onClick={list.reset}>
                Reset search and filters
              </Button>
            </span>
          </div>
        )}
        <Pagination
          page={query.page}
          pageSize={query.pageSize}
          total={data.total}
          pageSizes={PAGE_SIZES}
          onPageChange={list.setPage}
          onPageSizeChange={list.setPageSize}
        />
      </section>
    );
  };

  return (
    <ConsolePage
      section="bookings"
      title="Bookings"
      description={
        data
          ? `${bookingCountLabel(data.inRange)} ${range.phrase} · ${marketText}${isNarrowed ? ' · filtered' : ''}`
          : 'Loading bookings…'
      }
      actions={
        <>
          <Button
            variant="quiet"
            iconStart="download"
            aria-haspopup="dialog"
            onClick={() => setOpenPanel({ name: 'export', scope: 'view' })}
          >
            Export CSV
          </Button>
          <Button
            variant="primary"
            iconStart="plus"
            aria-haspopup="dialog"
            onClick={() => setOpenPanel({ name: 'manual' })}
          >
            Manual booking
          </Button>
        </>
      }
    >
      <Tabs<BookingView>
        label="Saved views"
        items={VIEW_TABS.map((tab) => ({ id: tab.id, label: tab.label, count: data?.viewCounts[tab.id] }))}
        value={query.view}
        onChange={list.setView}
      >
        <div className={styles.panel}>
          <BookingsToolbar
            search={query.search}
            channel={query.channel}
            range={query.range}
            rangeCounts={data?.rangeCounts}
            filters={query.filters}
            onSearchChange={list.setSearch}
            onChannelChange={list.setChannel}
            onRangeChange={list.setRange}
            onFiltersChange={list.setFilters}
          />
          {selected.size > 0 && (
            <BulkActionsBar
              count={selected.size}
              onResend={() => setOpenPanel({ name: 'resend' })}
              onAssignToMe={assignToMe}
              onExport={() => setOpenPanel({ name: 'export', scope: 'selected' })}
              onClear={() => setSelected(new Set())}
            />
          )}
          {renderTable()}
        </div>
      </Tabs>

      {openPanel?.name === 'export' && (
        <ExportBookingsDialog
          query={query}
          context={`${range.period} · ${marketText} · amounts in PHP`}
          viewTotal={data?.total ?? 0}
          viewDescription={[
            viewLabel,
            range.label.toLowerCase(),
            query.channel !== 'all' ? query.channel : '',
            ...filterLabels,
          ]
            .filter(Boolean)
            .join(' · ')}
          selectedReferences={[...selected]}
          initialScope={openPanel.scope}
          onClose={() => setOpenPanel(null)}
        />
      )}
      {openPanel?.name === 'resend' && (
        <ResendItineraryDialog
          references={[...selected]}
          onClose={() => setOpenPanel(null)}
          onSent={({ sent, skipped }) => {
            setOpenPanel(null);
            toast.show({
              tone: 'success',
              message: `Itinerary resent for ${bookingCountLabel(sent)}${skipped ? ` · ${skipped} skipped (not ticketed)` : ''}`,
            });
          }}
        />
      )}
      {openPanel?.name === 'manual' && (
        <ManualBookingDrawer
          onClose={() => setOpenPanel(null)}
          onCreated={(booking) => {
            setOpenPanel(null);
            list.reset();
            setHighlightedReference(booking.reference);
            refresh();
            toast.show({
              tone: 'success',
              message: `${booking.reference} created · ${
                booking.payment === 'Invoiced' ? 'invoice raised for' : 'payment link sent to'
              } ${booking.email}`,
            });
          }}
        />
      )}
    </ConsolePage>
  );
}

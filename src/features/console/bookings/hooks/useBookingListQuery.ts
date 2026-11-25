import { useState } from 'react';

import { setOrDelete, useUrlQuery } from '@/hooks';
import type {
  BookingChannel,
  BookingFilters,
  BookingListQuery,
  BookingView,
  CreatedRange,
} from '@/types/console/booking';

import { RANGE_OPTIONS, VIEW_TABS } from '../lib/bookingPresentation';

const DEFAULT_RANGE: CreatedRange = 'week';
export const PAGE_SIZES = [10, 25, 50] as const;

/**
 * The bookings list query. View, search and date range live in the URL so a filtered list can be
 * shared (`/console/bookings?view=ticketing&q=VL4TRB`); channel, filters and paging are local.
 */
export function useBookingListQuery(initialFilters: BookingFilters) {
  const [searchParams, updateQuery] = useUrlQuery();
  const [channel, setChannelState] = useState<BookingChannel | 'all'>('all');
  const [filters, setFiltersState] = useState<BookingFilters>(initialFilters);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSizeState] = useState<number>(PAGE_SIZES[0]);

  const view = VIEW_TABS.find((tab) => tab.slug === searchParams.get('view'))?.id ?? 'all';
  const range = RANGE_OPTIONS.find((option) => option.id === searchParams.get('range'))?.id ?? DEFAULT_RANGE;
  const search = searchParams.get('q') ?? '';

  const updateUrl = (patch: { view?: BookingView; range?: CreatedRange; search?: string }) => {
    setPage(0);
    updateQuery((params) => {
      if (patch.view !== undefined) {
        setOrDelete(params, 'view', VIEW_TABS.find((tab) => tab.id === patch.view)?.slug ?? null, 'all');
      }
      if (patch.range !== undefined) setOrDelete(params, 'range', patch.range, DEFAULT_RANGE);
      if (patch.search !== undefined) setOrDelete(params, 'q', patch.search);
    });
  };

  const query: BookingListQuery = { view, range, channel, filters, search, page, pageSize };

  return {
    query,
    setView: (next: BookingView) => updateUrl({ view: next }),
    setRange: (next: CreatedRange) => updateUrl({ range: next }),
    setSearch: (next: string) => updateUrl({ search: next }),
    setChannel: (next: BookingChannel | 'all') => {
      setChannelState(next);
      setPage(0);
    },
    setFilters: (next: BookingFilters) => {
      setFiltersState(next);
      setPage(0);
    },
    setPage,
    setPageSize: (next: number) => {
      setPageSizeState(next);
      setPage(0);
    },
    /** Back to everything in the last 7 days for the workspace's market. */
    reset: () => {
      setChannelState('all');
      setFiltersState(initialFilters);
      setPage(0);
      updateQuery((params) => {
        for (const key of ['view', 'range', 'q']) params.delete(key);
      });
    },
  };
}

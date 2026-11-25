import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

import { paths } from '@/app/paths';
import { PageContainer } from '@/components/layout';
import { Alert, Breadcrumbs, Button, EmptyState, Spinner, useToast } from '@/components/ui';
import { AIRLINES, findAirport } from '@/data/airports';
import { startCheckout } from '@/features/checkout/state/checkoutStore';
import { useAsyncData, useDocumentTitle } from '@/hooks';
import { formatCompactDay, formatDayMonth, formatDayRange, type IsoDate } from '@/lib/date';
import { searchFromQuery, searchToQueryString } from '@/lib/flightSearchUrl';
import { pluralize } from '@/lib/format';
import { searchFlights } from '@/services/flightsService';
import { ApiError } from '@/services/mockApi';
import { createPriceAlert, deletePriceAlert, findPriceAlertForTrip } from '@/services/priceAlertsService';
import type { FareFamilyId, FlightOption } from '@/types/flight';

import { DateFareStrip } from '../components/results/DateFareStrip';
import { FlightResultCard, type ResultTag } from '../components/results/FlightResultCard';
import { ResultsFilterPanel } from '../components/results/ResultsFilterPanel';
import { SearchSummaryBar } from '../components/results/SearchSummaryBar';
import { SortOptions } from '../components/results/SortOptions';
import { StopTrackingDialog } from '../components/results/StopTrackingDialog';
import { TrackPricesDialog } from '../components/results/TrackPricesDialog';
import {
  applyFilters,
  DEFAULT_FILTERS,
  isSortOrder,
  lowestFareOf,
  topOptionFor,
  type ResultsFilters,
  type SortOrder,
} from '../lib/resultsFilters';
import { travelersLabel } from '../lib/searchForm';
import { priceAlertForSearch, type TrackPricesForm } from '../lib/trackPricesForm';
import styles from './ResultsPage.module.css';

const FILTER_PANEL_ID = 'results-filters';

type AlertDialog = 'create' | 'stop' | null;

function tagsFor(option: FlightOption, allOptions: readonly FlightOption[]): ResultTag[] {
  const tags: ResultTag[] = [];
  if (topOptionFor(allOptions, 'best')?.id === option.id) tags.push({ label: 'Best', tone: 'solid' });
  if (topOptionFor(allOptions, 'cheapest')?.id === option.id) {
    tags.push({ label: 'Cheapest', tone: 'success' });
  }
  if (topOptionFor(allOptions, 'fastest')?.id === option.id) tags.push({ label: 'Fastest', tone: 'warning' });
  return tags;
}

export function ResultsPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const search = useMemo(() => searchFromQuery(searchParams), [searchParams]);
  const searchKey = searchToQueryString(search);
  const sortParam = searchParams.get('sort');
  const sortOrder: SortOrder = isSortOrder(sortParam) ? sortParam : 'best';

  const results = useAsyncData(searchKey, () => searchFlights(search));
  const trackedAlert = useAsyncData(`alert:${searchKey}`, () =>
    findPriceAlertForTrip(search.from, search.to, search.departDate, search.returnDate),
  );

  const [filters, setFilters] = useState<ResultsFilters>(DEFAULT_FILTERS);
  /** `undefined` until the person opens or closes a card: the top result starts open. */
  const [expandedId, setExpandedId] = useState<string | null | undefined>(undefined);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [alertDialog, setAlertDialog] = useState<AlertDialog>(null);
  const [isSavingAlert, setIsSavingAlert] = useState(false);

  const originCity = findAirport(search.from)?.city ?? search.from;
  const destinationCity = findAirport(search.to)?.city ?? search.to;
  const routeTitle = `${originCity} to ${destinationCity}`;
  useDocumentTitle(`Flights ${routeTitle}`);

  const options = results.data?.options ?? [];
  const visibleOptions = applyFilters(options, filters, sortOrder);
  const openId = expandedId === undefined ? visibleOptions[0]?.id : expandedId;
  const cheapest = topOptionFor(options, 'cheapest');
  const tripDatesLabel = search.returnDate
    ? `${formatCompactDay(search.departDate)} – ${formatCompactDay(search.returnDate)}`
    : formatCompactDay(search.departDate);
  const isTracking = Boolean(trackedAlert.data);

  const updateParams = (patch: Record<string, string>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([key, value]) => next.set(key, value));
    setSearchParams(next, { replace: true });
  };

  const handleSelectDate = (date: IsoDate) => {
    setFilters((previous) => ({ ...previous, maxPrice: null }));
    setExpandedId(undefined);
    updateParams({ depart: date });
  };

  const handleChooseFare = (offer: FlightOption, fareFamily: FareFamilyId) => {
    startCheckout({ search, offer, fareFamily });
    navigate(paths.checkout.travelers);
  };

  const showAlertsToast = (message: string, withLink: boolean) =>
    toast.show({
      message,
      tone: 'success',
      key: 'price-alert',
      action: withLink
        ? { label: 'Manage alerts', onClick: () => navigate(paths.account.priceAlerts) }
        : undefined,
    });

  const handleCreateAlert = async (form: TrackPricesForm) => {
    setIsSavingAlert(true);
    try {
      await createPriceAlert(priceAlertForSearch(search, form));
      setAlertDialog(null);
      trackedAlert.reload();
      showAlertsToast('Price alert created', true);
    } catch (error) {
      toast.show({
        tone: 'error',
        message: error instanceof ApiError ? error.message : 'Couldn’t create the alert.',
      });
    } finally {
      setIsSavingAlert(false);
    }
  };

  const handleStopTracking = async () => {
    if (!trackedAlert.data) return;
    setIsSavingAlert(true);
    try {
      await deletePriceAlert(trackedAlert.data.id);
      setAlertDialog(null);
      trackedAlert.reload();
      showAlertsToast('Price alert deleted — you won’t get updates for this trip', false);
    } finally {
      setIsSavingAlert(false);
    }
  };

  const renderResults = () => {
    if (results.status === 'error') {
      return (
        <Alert
          tone="danger"
          role="alert"
          title="We couldn’t load flights"
          action={
            <Button variant="quiet" size="small" onClick={results.reload}>
              Try again
            </Button>
          }
        >
          Check your connection and try again.
        </Alert>
      );
    }
    if (!results.data) {
      return (
        <div className={styles.loading} role="status">
          <Spinner size={20} />
          Searching 120+ airlines…
        </div>
      );
    }
    if (visibleOptions.length === 0) {
      return (
        <EmptyState
          icon="searchX"
          headingLevel={3}
          title="No flights match these filters"
          description="Try allowing one stop or raising the price limit. Nearby dates may also have more options."
          actions={
            <Button variant="primary" onClick={() => setFilters(DEFAULT_FILTERS)}>
              Reset filters
            </Button>
          }
        />
      );
    }
    return visibleOptions.map((option) => (
      <FlightResultCard
        key={option.id}
        option={option}
        fareFamilies={results.data?.fareFamilies ?? []}
        tags={tagsFor(option, options)}
        travelerCount={search.adults + search.children + search.infants}
        isExpanded={openId === option.id}
        onToggle={() => setExpandedId(openId === option.id ? null : option.id)}
        onChooseFare={(fareFamily) => handleChooseFare(option, fareFamily)}
      />
    ));
  };

  return (
    <>
      <SearchSummaryBar search={search} />
      <PageContainer as="main" layout="plain" className={styles.layout}>
        <ResultsFilterPanel
          id={FILTER_PANEL_ID}
          options={options}
          filters={filters}
          onChange={setFilters}
          originCity={originCity}
          matchCount={visibleOptions.length}
          isSheetOpen={isFilterSheetOpen}
          onCloseSheet={() => setIsFilterSheetOpen(false)}
        />

        <section className={styles.results} aria-labelledby="results-title">
          <div className={styles.header}>
            <div className={styles.heading}>
              <Breadcrumbs
                items={[
                  { label: 'Home', to: paths.home },
                  { label: 'Flights', to: paths.home },
                  { label: routeTitle },
                ]}
              />
              <h1 id="results-title" className={styles.title}>
                {routeTitle}
              </h1>
              <p className={styles.subtitle}>
                Departing {formatCompactDay(search.departDate)}
                {search.returnDate && `, returning ${formatCompactDay(search.returnDate)}`} ·{' '}
                {search.returnDate ? 'round-trip' : 'one-way'} prices per traveler, including taxes and fees.
              </p>
            </div>
            <div className={styles.actions}>
              <Button
                variant="quiet"
                iconStart="sliders"
                className={styles.filterButton}
                aria-expanded={isFilterSheetOpen}
                aria-controls={FILTER_PANEL_ID}
                onClick={() => setIsFilterSheetOpen(true)}
              >
                Filters
              </Button>
              <Button
                variant="quiet"
                iconStart={isTracking ? 'check' : 'bell'}
                aria-pressed={isTracking}
                className={isTracking ? styles.tracking : undefined}
                disabled={trackedAlert.status === 'loading' && !trackedAlert.data}
                onClick={() => setAlertDialog(isTracking ? 'stop' : 'create')}
              >
                {isTracking ? 'Tracking prices' : 'Track prices'}
              </Button>
            </div>
          </div>

          {results.data && (
            <>
              <DateFareStrip
                dateFares={results.data.dateFares}
                selectedDate={search.departDate}
                onSelectDate={handleSelectDate}
              />
              <SortOptions
                options={options}
                value={sortOrder}
                onChange={(order) => {
                  setExpandedId(undefined);
                  updateParams({ sort: order });
                }}
              />
              <div className={styles.meta}>
                <span role="status">
                  Showing {visibleOptions.length} of {pluralize(options.length, 'flight')}
                </span>
                <span>Times shown are local to each airport</span>
              </div>
            </>
          )}

          {renderResults()}
        </section>
      </PageContainer>

      {cheapest && alertDialog === 'create' && (
        <TrackPricesDialog
          open
          onClose={() => setAlertDialog(null)}
          tripLabel={`${originCity} → ${destinationCity} · ${search.returnDate ? 'round trip' : 'one way'} · ${travelersLabel(search)}`}
          lowestFare={lowestFareOf(cheapest)}
          lowestFareLabel={`${AIRLINES[cheapest.airlineId].name} · ${cheapest.outbound.stops ? '1 stop' : 'Nonstop'} · ${tripDatesLabel}`}
          isSaving={isSavingAlert}
          onCreate={handleCreateAlert}
        />
      )}
      <StopTrackingDialog
        open={alertDialog === 'stop'}
        onClose={() => setAlertDialog(null)}
        onConfirm={handleStopTracking}
        isDeleting={isSavingAlert}
        tripLabel={`${originCity} → ${destinationCity}, ${search.returnDate ? formatDayRange(search.departDate, search.returnDate) : formatDayMonth(search.departDate)}`}
      />
    </>
  );
}

import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';

import { paths } from '@/app/paths';
import { useSession } from '@/app/providers';
import { Icon } from '@/components/icons';
import { Button, Dialog, EmptyState, IconButton, useToast } from '@/components/ui';
import { AIRLINES, findAirport } from '@/data/airports';
import {
  applyFilters,
  DEFAULT_FILTERS,
  isSortOrder,
  lowestFareOf,
  topOptionFor,
  totalDurationOf,
  type ResultsFilters,
  type SortOrder,
} from '@/features/booking/lib/resultsFilters';
import { searchFormFromParams } from '@/features/booking/lib/searchForm';
import { priceAlertForSearch, type TrackPricesForm } from '@/features/booking/lib/trackPricesForm';
import { startCheckout } from '@/features/checkout/state/checkoutStore';
import { useAsyncData, useDocumentTitle } from '@/hooks';
import { formatCompactDay, formatDayLabel, formatDayRange, type IsoDate } from '@/lib/date';
import { searchFromQuery, searchToQueryString } from '@/lib/flightSearchUrl';
import { formatDuration, formatPeso, pluralize, travelerCountLabel } from '@/lib/format';
import { searchFlights } from '@/services/flightsService';
import { ApiError } from '@/services/mockApi';
import { createPriceAlert, deletePriceAlert, findPriceAlertForTrip } from '@/services/priceAlertsService';
import type { FlightOption } from '@/types/flight';

import { phoneSearchStore } from '../../search/state/phoneSearchStore';
import { PhoneDataState } from '../../shared/components/PhoneDataState';
import { FiltersSheet } from '../components/FiltersSheet';
import { PhoneDateStrip } from '../components/PhoneDateStrip';
import { PhoneFlightCard } from '../components/PhoneFlightCard';
import { SortSheet } from '../components/SortSheet';
import { TrackPricesSheet } from '../components/TrackPricesSheet';
import {
  activeFilterCount,
  isNonstopOnly,
  resultTagOf,
  SORT_LABELS,
  withNonstopOnly,
} from '../lib/phoneResults';
import styles from './PhoneResultsPage.module.css';

type ResultsOverlay = 'sort' | 'filters' | 'track' | 'stopTracking' | null;

export function PhoneResultsPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { customer } = useSession();
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
  const [overlay, setOverlay] = useState<ResultsOverlay>(null);
  const [isSavingAlert, setIsSavingAlert] = useState(false);

  const originCity = findAirport(search.from)?.city ?? search.from;
  const destinationCity = findAirport(search.to)?.city ?? search.to;
  useDocumentTitle(`Flights ${originCity} to ${destinationCity}`);

  const datesLabel = search.returnDate
    ? formatDayRange(search.departDate, search.returnDate)
    : formatDayLabel(search.departDate);
  const options = results.data?.options ?? [];
  const visibleOptions = applyFilters(options, filters, sortOrder);
  const filterCount = activeFilterCount(filters);
  const cheapest = topOptionFor(options, 'cheapest');
  const fastest = topOptionFor(options, 'fastest');
  const isTracking = Boolean(trackedAlert.data);
  const closeOverlay = () => setOverlay(null);

  const updateParams = (patch: Record<string, string>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([key, value]) => next.set(key, value));
    setSearchParams(next, { replace: true });
  };

  const editSearch = () => {
    phoneSearchStore.setState(searchFormFromParams(search));
    navigate(paths.phone.search);
  };

  const chooseFlight = (option: FlightOption) => {
    startCheckout({ search, offer: option, fareFamily: 'saver' });
    navigate(paths.checkout.travelers);
  };

  const createAlert = async (form: TrackPricesForm) => {
    setIsSavingAlert(true);
    try {
      await createPriceAlert(priceAlertForSearch(search, form));
      closeOverlay();
      trackedAlert.reload();
      toast.show({ tone: 'success', message: 'Price alert created' });
    } catch (error) {
      toast.show({
        tone: 'error',
        message: error instanceof ApiError ? error.message : 'Couldn’t create the alert.',
      });
    } finally {
      setIsSavingAlert(false);
    }
  };

  const stopTracking = async () => {
    if (!trackedAlert.data) return;
    setIsSavingAlert(true);
    try {
      await deletePriceAlert(trackedAlert.data.id);
      closeOverlay();
      trackedAlert.reload();
      toast.show({ tone: 'success', message: 'Price alert deleted' });
    } catch (error) {
      toast.show({
        tone: 'error',
        message: error instanceof ApiError ? error.message : 'Couldn’t delete the alert.',
      });
    } finally {
      setIsSavingAlert(false);
    }
  };

  const tripLabel = `${originCity} → ${destinationCity} · ${datesLabel} · ${travelerCountLabel(search)}`;

  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <Link to={paths.phone.search} aria-label="Back to search" className={styles.headerButton}>
          <Icon name="chevronLeft" size={22} />
        </Link>
        <div className={styles.headerText}>
          <h1 className={styles.route}>
            {originCity} → {destinationCity}
          </h1>
          <span className={styles.tripDetails}>
            {datesLabel} · {travelerCountLabel(search)} · {search.cabin}
          </span>
        </div>
        <IconButton icon="pencil" label="Edit search" onClick={editSearch} />
      </header>

      <main className={styles.content}>
        {results.data && (
          <PhoneDateStrip
            dateFares={results.data.dateFares}
            selectedDate={search.departDate}
            onSelect={(date: IsoDate) => updateParams({ depart: date })}
          />
        )}

        <div className={styles.toolbar}>
          <Button
            variant="quiet"
            size="small"
            iconEnd="chevronDown"
            aria-haspopup="dialog"
            onClick={() => setOverlay('sort')}
          >
            Sort: {SORT_LABELS[sortOrder]}
          </Button>
          <Button
            variant="quiet"
            size="small"
            aria-pressed={isNonstopOnly(filters)}
            onClick={() => setFilters(withNonstopOnly(filters, !isNonstopOnly(filters)))}
          >
            Nonstop only
          </Button>
          <Button
            variant="quiet"
            size="small"
            iconStart="sliders"
            aria-haspopup="dialog"
            aria-pressed={filterCount > 0}
            onClick={() => setOverlay('filters')}
          >
            {filterCount ? `Filters · ${filterCount}` : 'Filters'}
          </Button>
        </div>

        {results.data ? (
          <>
            <p className={styles.count} aria-live="polite">
              {pluralize(visibleOptions.length, 'flight')} · {search.returnDate ? 'round trip' : 'one way'}{' '}
              per traveler
            </p>
            {visibleOptions.length > 0 ? (
              <ul className={styles.list}>
                {visibleOptions.map((option) => (
                  <li key={option.id}>
                    <PhoneFlightCard
                      option={option}
                      tag={resultTagOf(option, options)}
                      onSelect={chooseFlight}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                variant="dashed"
                title="No flights match these filters"
                description="Try another departure time or airline."
                actions={
                  <Button variant="quiet" size="small" onClick={() => setFilters(DEFAULT_FILTERS)}>
                    Clear filters
                  </Button>
                }
              />
            )}
          </>
        ) : (
          <PhoneDataState status={results.status} subject="flights" onRetry={results.reload} />
        )}
      </main>

      {results.data && (
        <div className={styles.trackBar} data-bottom-bar="">
          <Button
            className={isTracking ? styles.tracking : undefined}
            iconStart={isTracking ? 'check' : 'bell'}
            aria-haspopup="dialog"
            onClick={() => setOverlay(isTracking ? 'stopTracking' : 'track')}
          >
            {isTracking ? 'Tracking this route' : 'Track prices'}
          </Button>
        </div>
      )}

      {overlay === 'sort' && (
        <SortSheet
          value={sortOrder}
          descriptions={{
            best: 'Balances price, duration and stops',
            cheapest: cheapest ? `From ${formatPeso(lowestFareOf(cheapest))}` : '',
            fastest: fastest ? `From ${formatDuration(totalDurationOf(fastest))} total` : '',
          }}
          onClose={closeOverlay}
          onChange={(order) => {
            updateParams({ sort: order });
            closeOverlay();
          }}
        />
      )}
      {overlay === 'filters' && (
        <FiltersSheet
          options={options}
          filters={filters}
          matchCount={visibleOptions.length}
          originCity={originCity}
          onChange={setFilters}
          onClose={closeOverlay}
        />
      )}
      {overlay === 'track' && cheapest && (
        <TrackPricesSheet
          tripLabel={tripLabel}
          lowestFare={lowestFareOf(cheapest)}
          lowestFareDetail={[
            AIRLINES[cheapest.airlineId].name,
            cheapest.outbound.stops ? pluralize(cheapest.outbound.stops, 'stop') : 'Nonstop',
            search.returnDate
              ? `${formatCompactDay(search.departDate)} – ${formatCompactDay(search.returnDate)}`
              : formatCompactDay(search.departDate),
          ].join(' · ')}
          email={customer?.email ?? 'the email on your account'}
          isSaving={isSavingAlert}
          onClose={closeOverlay}
          onCreate={(form) => void createAlert(form)}
        />
      )}
      <Dialog
        open={overlay === 'stopTracking'}
        onClose={closeOverlay}
        role="alertdialog"
        size="small"
        icon="bellOff"
        iconTone="danger"
        title="Stop tracking this trip?"
        description={`We’ll delete your price alert for ${originCity} → ${destinationCity}, ${datesLabel}, and stop sending updates. You can start tracking again at any time.`}
        busy={isSavingAlert}
        footer={
          <>
            <Button variant="quiet" onClick={closeOverlay}>
              Keep tracking
            </Button>
            <Button variant="destructive" loading={isSavingAlert} onClick={() => void stopTracking()}>
              Stop tracking
            </Button>
          </>
        }
      />
    </div>
  );
}

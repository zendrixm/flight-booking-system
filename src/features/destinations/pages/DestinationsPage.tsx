import { useState } from 'react';
import { useNavigate } from 'react-router';

import { paths } from '@/app/paths';
import { PageContainer, PageLoader } from '@/components/layout';
import { Alert, Button, EmptyState, LinkButton, SegmentedControl, Tabs, useToast } from '@/components/ui';
import { useAsyncData, useDocumentTitle } from '@/hooks';
import { formatPeso } from '@/lib/format';
import { FARES_CHECKED_AT } from '@/mocks/destinations';
import { listDestinations, listTravelIdeas } from '@/services/destinationsService';
import { ApiError } from '@/services/mockApi';
import { createPriceAlert, deletePriceAlert, listPriceAlerts } from '@/services/priceAlertsService';
import type { Destination, TravelIdea } from '@/types/destination';
import type { PriceAlert } from '@/types/priceAlert';

import { DestinationCard } from '../components/DestinationCard';
import { DestinationsHero } from '../components/DestinationsHero';
import { TravelIdeas } from '../components/TravelIdeas';
import { useDestinationFilters } from '../hooks/useDestinationFilters';
import {
  BUDGET_LIMIT,
  cheapestIn,
  filterDestinations,
  formatFlightTime,
  REGION_FILTERS,
  regionCount,
  regionLabel,
  resultsSummary,
  SORT_OPTIONS,
  type DestinationSort,
} from '../lib/destinationFilters';
import { destinationResultsUrl, fareWatchesByCode, fareWatchFor } from '../lib/fareWatch';
import styles from './DestinationsPage.module.css';

interface DestinationsData {
  destinations: Destination[];
  ideas: TravelIdea[];
  alerts: PriceAlert[];
}

async function loadDestinationsPage(): Promise<DestinationsData> {
  const [destinations, ideas, alerts] = await Promise.all([
    listDestinations(),
    listTravelIdeas(),
    listPriceAlerts(),
  ]);
  return { destinations, ideas, alerts };
}

export function DestinationsPage() {
  useDocumentTitle('Destinations from Manila');
  const result = useAsyncData('destinations-page', loadDestinationsPage);

  if (result.status === 'error') {
    return (
      <PageContainer as="main">
        <Alert
          tone="danger"
          role="alert"
          title="We couldn’t load destinations"
          action={
            <Button variant="quiet" size="small" onClick={result.reload}>
              Try again
            </Button>
          }
        />
      </PageContainer>
    );
  }
  if (!result.data) return <PageLoader label="Loading destinations…" />;
  return <DestinationsView {...result.data} />;
}

function DestinationsView({ destinations, ideas, alerts }: DestinationsData) {
  const navigate = useNavigate();
  const toast = useToast();
  const [filters, updateFilters] = useDestinationFilters();
  const [highlightedCode, setHighlightedCode] = useState<string | null>(null);
  const [watchedAlertIds, setWatchedAlertIds] = useState(() => fareWatchesByCode(alerts));
  const [savingCode, setSavingCode] = useState<string | null>(null);

  const visible = filterDestinations(destinations, filters);
  const visibleCodes = new Set(visible.map((destination) => destination.code));
  const lowestFare = Math.min(...visible.map((destination) => destination.lowestFare));
  const highlighted = destinations.find((destination) => destination.code === highlightedCode);
  const isUnfiltered = filters.region === 'all' && !filters.isUnderBudget;
  const mapNote = highlighted
    ? `${highlighted.city} · ${formatFlightTime(highlighted.flightMinutes)}`
    : isUnfiltered
      ? `All ${destinations.length} destinations`
      : `${visible.length} shown below`;

  const toggleWatch = async (destination: Destination) => {
    const alertId = watchedAlertIds[destination.code];
    setSavingCode(destination.code);
    try {
      if (alertId) {
        await deletePriceAlert(alertId);
        setWatchedAlertIds(({ [destination.code]: _removed, ...rest }) => rest);
        toast.show({ tone: 'success', key: 'fare-watch', message: `Stopped watching ${destination.city}.` });
      } else {
        const alert = await createPriceAlert(fareWatchFor(destination));
        setWatchedAlertIds((previous) => ({ ...previous, [destination.code]: alert.id }));
        toast.show({
          tone: 'success',
          key: 'fare-watch',
          message: `Watching ${destination.city} — we’ll tell you when the ${formatPeso(destination.lowestFare)} fare drops.`,
          action: { label: 'Manage alerts', onClick: () => navigate(paths.account.priceAlerts) },
        });
      }
    } catch (error) {
      toast.show({
        tone: 'error',
        message: error instanceof ApiError ? error.message : 'Couldn’t update the fare watch. Try again.',
      });
    } finally {
      setSavingCode(null);
    }
  };

  const renderList = () => {
    if (visible.length === 0) {
      const cheapest = cheapestIn(destinations, filters.region);
      return (
        <EmptyState
          icon="tag"
          title={`Nothing in ${regionLabel(filters.region)} under ${formatPeso(BUDGET_LIMIT)} right now`}
          description={
            cheapest &&
            `The lowest fare there is ${cheapest.city} from ${formatPeso(cheapest.lowestFare)} round trip. Set a price alert and we’ll email you if it drops.`
          }
          actions={
            <>
              <Button variant="primary" onClick={() => updateFilters({ isUnderBudget: false })}>
                Show all prices
              </Button>
              <LinkButton variant="quiet" to={paths.account.priceAlerts}>
                Create a price alert
              </LinkButton>
            </>
          }
        />
      );
    }
    return (
      <ul className={styles.grid}>
        {visible.map((destination) => (
          <DestinationCard
            key={destination.code}
            destination={destination}
            resultsUrl={destinationResultsUrl(destination.code)}
            isLowest={visible.length > 1 && destination.lowestFare === lowestFare}
            isWatching={Boolean(watchedAlertIds[destination.code])}
            isSavingWatch={savingCode === destination.code}
            onToggleWatch={toggleWatch}
            onHighlight={setHighlightedCode}
          />
        ))}
      </ul>
    );
  };

  return (
    <main>
      <DestinationsHero
        destinations={destinations}
        visibleCodes={visibleCodes}
        highlightedCode={highlightedCode}
        mapNote={mapNote}
        faresCheckedAt={FARES_CHECKED_AT}
      />

      <PageContainer layout="stack">
        <Tabs
          label="Regions"
          items={REGION_FILTERS.map((region) => ({
            ...region,
            count: regionCount(destinations, region.id, filters.isUnderBudget),
          }))}
          value={filters.region}
          onChange={(region) => updateFilters({ region })}
        >
          <div className={styles.panel}>
            <div className={styles.toolbar}>
              <p className={styles.summary} aria-live="polite">
                {resultsSummary(visible.length, filters)}
              </p>
              <div className={styles.controls}>
                <Button
                  variant="quiet"
                  iconStart={filters.isUnderBudget ? 'check' : 'tag'}
                  aria-pressed={filters.isUnderBudget}
                  onClick={() => updateFilters({ isUnderBudget: !filters.isUnderBudget })}
                >
                  Under {formatPeso(BUDGET_LIMIT)}
                </Button>
                <SegmentedControl<DestinationSort>
                  label="Sort destinations"
                  appearance="soft"
                  value={filters.sort}
                  onChange={(sort) => updateFilters({ sort })}
                  options={SORT_OPTIONS.map((option) => ({ value: option.id, label: option.label }))}
                />
              </div>
            </div>
            {renderList()}
          </div>
        </Tabs>

        <p className={styles.footnote}>
          Fares are the lowest round-trip prices per traveler found in the last 24 hours for travel in the
          next six months, in economy, with taxes, carrier fees and a personal item included. They can change
          until you book.
        </p>

        <TravelIdeas ideas={ideas} resultsUrlFor={destinationResultsUrl} />
      </PageContainer>
    </main>
  );
}

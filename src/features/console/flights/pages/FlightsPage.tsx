import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';

import { PageLoader } from '@/components/layout';
import { Alert, Button } from '@/components/ui';
import { DEMO_TODAY } from '@/config/demo';
import { useAsyncData } from '@/hooks';
import { getFlightBoard, updateFlightStatus } from '@/services/console/flightOpsService';
import type { FlightOpsBoard, FlightOpsRecord, FlightStatusUpdate } from '@/types/console/flightOps';

import { ConsolePage } from '../../shared/components/ConsolePage';
import { FilterChips } from '../../shared/components/FilterChips';
import { DayPager } from '../components/DayPager';
import { FlightDetailsDrawer } from '../components/FlightDetailsDrawer';
import { FlightsTable } from '../components/FlightsTable';
import { FlightStatusPanel } from '../components/FlightStatusPanel';
import { useFlightOpsQuery, type FlightOpsQuery } from '../hooks/useFlightOpsQuery';
import {
  countMatching,
  defaultFlightId,
  emptyFilterMessage,
  matchesFilter,
  operatingDayLabel,
  STATUS_FILTERS,
} from '../lib/flightOpsPresentation';
import styles from './FlightsPage.module.css';

const PAGE_TITLE = 'Flight operations';

export function FlightsPage() {
  const query = useFlightOpsQuery();
  const board = useAsyncData(`flight-board:${query.boardKey}`, () =>
    getFlightBoard({ date: query.requestedDate, flightId: query.drawerFlightId }),
  );

  if (!board.data) {
    if (board.status !== 'error') return <PageLoader label="Loading flights…" />;
    return (
      <ConsolePage section="flights" title={PAGE_TITLE}>
        <Alert
          tone="danger"
          role="alert"
          title="Flights didn’t load"
          action={<RetryButton onClick={board.reload} />}
        >
          The airline feeds may be catching up. Try again in a moment.
        </Alert>
      </ConsolePage>
    );
  }

  return (
    <FlightBoard
      query={query}
      board={board.data}
      isSwitchingDay={
        board.status === 'loading' && query.requestedDate !== null && query.requestedDate !== board.data.date
      }
      loadError={board.status === 'error'}
      onReload={board.reload}
      onBoardChange={board.mutate}
    />
  );
}

function RetryButton({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="quiet" size="small" onClick={onClick}>
      Try again
    </Button>
  );
}

interface FlightBoardProps {
  query: FlightOpsQuery;
  board: FlightOpsBoard;
  /** A different day is loading; the current one stays on screen, dimmed. */
  isSwitchingDay: boolean;
  loadError: boolean;
  onReload: () => void;
  onBoardChange: (board: FlightOpsBoard) => void;
}

function FlightBoard({ query, board, isSwitchingDay, loadError, onReload, onBoardChange }: FlightBoardProps) {
  const { drawerFlightId, filter, update } = query;
  const [selectedId, setSelectedId] = useState<string | null>(drawerFlightId);
  const [isPanelHighlighted, setIsPanelHighlighted] = useState(false);
  const panelRef = useRef<HTMLElement>(null);
  const revealFormOnClose = useRef(false);

  const { records, date, availableDates } = board;
  const findRecord = (flightId: string | null | undefined) =>
    records.find((record) => record.flight.id === flightId);
  const drawerRecord = findRecord(drawerFlightId) ?? null;
  const selected = findRecord(drawerRecord?.flight.id ?? selectedId) ?? findRecord(defaultFlightId(records));
  const visibleRecords = records.filter((record) => matchesFilter(record.flight, filter));
  const dayIndex = availableDates.indexOf(date);

  const goToDay = (offset: number) => {
    const day = availableDates[dayIndex + offset];
    if (!day) return;
    // Stay on the same flight when it also operates that day.
    setSelectedId(selected?.flight.id ?? null);
    update(date, { day, flight: null });
  };
  const openDetails = (flightId: string) => {
    setSelectedId(flightId);
    update(date, { flight: flightId });
  };
  const closeDetails = () => {
    if (drawerRecord) setSelectedId(drawerRecord.flight.id);
    update(date, { flight: null });
  };
  const revealStatusForm = () => {
    revealFormOnClose.current = true;
    setIsPanelHighlighted(true);
    closeDetails();
  };
  const saveStatus = async (record: FlightOpsRecord, statusUpdate: FlightStatusUpdate) => {
    const result = await updateFlightStatus(date, record.flight.id, statusUpdate);
    onBoardChange(result.board);
    return result.message;
  };

  // After "Update status" in the drawer: once it has closed (and handed focus back), move to the form.
  useEffect(() => {
    if (drawerFlightId || !revealFormOnClose.current) return;
    revealFormOnClose.current = false;
    const panel = panelRef.current;
    if (!panel) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    panel.scrollIntoView({ block: 'start', behavior: reduceMotion ? 'auto' : 'smooth' });
    panel.querySelector<HTMLElement>('select:not(:disabled)')?.focus({ preventScroll: true });
  }, [drawerFlightId]);

  return (
    <ConsolePage
      section="flights"
      title={PAGE_TITLE}
      description={
        <span className={styles.description}>
          Flights carrying Vela travelers · times local to departure airport
          <span className={styles.feed}>
            <span aria-hidden="true" className={styles.feedDot} />
            Airline feeds live · synced {board.feedSyncedAt}
          </span>
        </span>
      }
      actions={
        <DayPager
          label={operatingDayLabel(date, DEMO_TODAY)}
          canGoBack={dayIndex > 0}
          canGoForward={dayIndex < availableDates.length - 1}
          onPrevious={() => goToDay(-1)}
          onNext={() => goToDay(1)}
        />
      }
    >
      {loadError && (
        <Alert
          tone="danger"
          role="alert"
          title="That day didn’t load"
          action={<RetryButton onClick={onReload} />}
        >
          Still showing {operatingDayLabel(date, DEMO_TODAY)}.
        </Alert>
      )}
      {drawerFlightId && !drawerRecord && !isSwitchingDay && (
        <Alert tone="attention" role="status" title={`${drawerFlightId} isn’t in the airline feeds`}>
          It may operate outside the days shown here, or the flight number has a typo.
        </Alert>
      )}

      <FilterChips
        label="Filter by status"
        options={STATUS_FILTERS.map((option) => ({
          value: option.id,
          label: option.label,
          dot: option.dot,
          count: countMatching(records, option.id),
        }))}
        value={filter}
        onChange={(next) => update(date, { filter: next })}
      />

      <div
        className={clsx(styles.layout, isSwitchingDay && styles.switching)}
        aria-busy={isSwitchingDay || undefined}
      >
        <section aria-label="Flights" className={styles.tableCard}>
          {visibleRecords.length > 0 ? (
            <FlightsTable
              records={visibleRecords}
              selectedId={selected?.flight.id}
              onSelect={setSelectedId}
              onOpenDetails={openDetails}
            />
          ) : (
            <div className={styles.empty}>
              <p>{emptyFilterMessage(filter, date)}</p>
              <Button variant="quiet" onClick={() => update(date, { filter: 'all' })}>
                Show all flights
              </Button>
            </div>
          )}
        </section>

        {selected && (
          <FlightStatusPanel
            // A fresh form for each flight and day.
            key={`${date}:${selected.flight.id}`}
            ref={panelRef}
            record={selected}
            date={date}
            isHighlighted={isPanelHighlighted}
            onHighlightEnd={() => setIsPanelHighlighted(false)}
            onOpenDetails={() => openDetails(selected.flight.id)}
            onSave={(statusUpdate) => saveStatus(selected, statusUpdate)}
          />
        )}
      </div>

      <FlightDetailsDrawer
        record={drawerRecord}
        date={date}
        onClose={closeDetails}
        onUpdateStatus={revealStatusForm}
      />
    </ConsolePage>
  );
}

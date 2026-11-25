import clsx from 'clsx';

import { AirlineMark } from '@/components/flight';
import { StatusChip, Table } from '@/components/ui';
import { AIRLINE_IDS } from '@/data/airlineDesignators';
import type { FlightOpsRecord } from '@/types/console/flightOps';

import { loadLabel } from '../lib/flightOpsPresentation';
import styles from './FlightsTable.module.css';

interface FlightsTableProps {
  records: readonly FlightOpsRecord[];
  selectedId: string | undefined;
  /** Shows the flight in the status panel. */
  onSelect: (flightId: string) => void;
  /** Opens travelers and timeline in the details drawer. */
  onOpenDetails: (flightId: string) => void;
}

export function FlightsTable({ records, selectedId, onSelect, onOpenDetails }: FlightsTableProps) {
  return (
    <Table minWidth={760} className={styles.table}>
      <thead>
        <tr>
          <th scope="col">Flight</th>
          <th scope="col">Route</th>
          <th scope="col">Departure</th>
          <th scope="col">Gate</th>
          <th scope="col">Vela pax</th>
          <th scope="col">Load</th>
          <th scope="col">Status</th>
        </tr>
      </thead>
      <tbody>
        {records.map(({ flight }) => {
          const isSelected = flight.id === selectedId;
          const isLate = flight.phase === 'delayed' || flight.phase === 'cancelled';
          return (
            // Row clicks are a mouse shortcut; the reference link or button in the row is the keyboard path.
            <tr
              key={flight.id}
              aria-current={isSelected || undefined}
              className={clsx(
                styles.row,
                isSelected && styles.selected,
                flight.phase === 'departed' && styles.departed,
              )}
              // Clicking anywhere on the row shows it in the status panel; the flight number opens details.
              onClick={(event) => {
                if ((event.target as HTMLElement).closest('button, a')) return;
                onSelect(flight.id);
              }}
            >
              <td>
                <span className={styles.flight}>
                  <AirlineMark airlineId={AIRLINE_IDS[flight.airline]} size="small" />
                  <button
                    type="button"
                    className={styles.flightButton}
                    aria-haspopup="dialog"
                    aria-label={`${flight.flightNumber} · travelers and timeline`}
                    onClick={() => onOpenDetails(flight.id)}
                  >
                    {flight.flightNumber}
                  </button>
                </span>
              </td>
              <td className={styles.nowrap}>{flight.route}</td>
              <td>
                <span className={styles.times}>
                  <span className={isLate ? styles.replacedTime : styles.scheduledTime}>
                    {flight.scheduledTime}
                  </span>
                  <span
                    className={clsx(
                      styles.estimate,
                      flight.phase === 'delayed' && styles.estimateDelayed,
                      flight.phase === 'cancelled' && styles.estimateCancelled,
                    )}
                  >
                    {flight.estimateNote}
                  </span>
                </span>
              </td>
              <td>{flight.gate}</td>
              <td>{flight.velaTravelers}</td>
              <td>
                <span className={styles.load}>
                  <span className={styles.loadTrack} aria-hidden="true">
                    <span className={styles.loadFill} style={{ width: `${flight.loadPercent}%` }} />
                  </span>
                  <span className={styles.loadValue}>{loadLabel(flight)}</span>
                </span>
              </td>
              <td>
                <StatusChip tone={flight.status.tone} hideDot size="compact">
                  {flight.status.label}
                </StatusChip>
              </td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
}

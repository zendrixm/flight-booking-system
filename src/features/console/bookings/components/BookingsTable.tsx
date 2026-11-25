import clsx from 'clsx';
import { Link, useNavigate } from 'react-router';

import { paths } from '@/app/paths';
import { Icon } from '@/components/icons';
import { StatusChip, Table } from '@/components/ui';
import { AIRLINE_NAMES } from '@/data/airlineDesignators';
import { formatDayMonth } from '@/lib/date';
import { formatPeso } from '@/lib/format';
import type { ConsoleBooking } from '@/types/console/booking';

import { formatCreated, PAYMENT_TONE, STATUS_TONE } from '../lib/bookingPresentation';
import styles from './BookingsTable.module.css';

interface BookingsTableProps {
  rows: readonly ConsoleBooking[];
  selected: ReadonlySet<string>;
  /** A just-created booking, marked with a Brass edge. */
  highlightedReference?: string;
  onToggleRow: (reference: string) => void;
  onTogglePage: () => void;
}

export function BookingsTable({
  rows,
  selected,
  highlightedReference,
  onToggleRow,
  onTogglePage,
}: BookingsTableProps) {
  const navigate = useNavigate();
  const isPageSelected = rows.length > 0 && rows.every((row) => selected.has(row.reference));

  return (
    <Table minWidth={980} className={styles.table}>
      <thead>
        <tr>
          <th scope="col" className={styles.checkCell}>
            <input
              type="checkbox"
              className={styles.checkbox}
              aria-label="Select all rows on this page"
              checked={isPageSelected}
              onChange={onTogglePage}
            />
          </th>
          <th scope="col">Reference</th>
          <th scope="col">Lead traveler</th>
          <th scope="col">Itinerary</th>
          <th scope="col" className={styles.number}>
            Pax
          </th>
          <th scope="col">Channel</th>
          <th scope="col" className={styles.number}>
            Total
          </th>
          <th scope="col">Payment</th>
          <th scope="col">Status</th>
          <th scope="col">
            <span className="visually-hidden">Open</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((booking) => {
          const isSelected = selected.has(booking.reference);
          const detailUrl = paths.console.booking(booking.reference);
          return (
            // Row clicks are a mouse shortcut; the reference link or button in the row is the keyboard path.
            <tr
              key={booking.reference}
              className={clsx(
                styles.row,
                isSelected && styles.selected,
                booking.reference === highlightedReference && styles.highlighted,
              )}
              // The whole row opens the booking; links, buttons and the checkbox keep their own clicks.
              onClick={(event) => {
                if ((event.target as HTMLElement).closest('a, button, input, label')) return;
                navigate(detailUrl);
              }}
            >
              <td className={styles.checkCell}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  aria-label={`Select booking ${booking.reference}`}
                  checked={isSelected}
                  onChange={() => onToggleRow(booking.reference)}
                />
              </td>
              <td>
                <span className={styles.stack}>
                  <Link to={detailUrl} className={styles.reference}>
                    {booking.reference}
                  </Link>
                  <span className={styles.secondary}>{formatCreated(booking.createdAt)}</span>
                </span>
              </td>
              <td>
                <span className={styles.stack}>
                  <span className={styles.primary}>{booking.leadTraveler}</span>
                  <span className={styles.secondary}>{booking.email}</span>
                  {booking.isAssignedToMe && <span className={styles.assigned}>Assigned to you</span>}
                </span>
              </td>
              <td>
                <span className={styles.stack}>
                  <span className={styles.primary}>{booking.route}</span>
                  <span className={styles.secondary}>
                    {AIRLINE_NAMES[booking.airline]} · departs {formatDayMonth(booking.departureDate)}
                  </span>
                </span>
              </td>
              <td className={styles.number}>{booking.travelerCount}</td>
              <td>{booking.channel}</td>
              <td className={clsx(styles.number, styles.total)}>{formatPeso(booking.total)}</td>
              <td>
                <span
                  className={clsx(
                    styles.payment,
                    PAYMENT_TONE[booking.payment] === 'danger' && styles.paymentBad,
                  )}
                >
                  <span
                    className={clsx(styles.dot, styles[PAYMENT_TONE[booking.payment]])}
                    aria-hidden="true"
                  />
                  {booking.payment}
                </span>
              </td>
              <td>
                <StatusChip tone={STATUS_TONE[booking.status]} hideDot size="compact">
                  {booking.status}
                </StatusChip>
              </td>
              <td className={styles.openCell}>
                <Link to={detailUrl} className={styles.open} aria-label={`Open booking ${booking.reference}`}>
                  <Icon name="chevronRight" size={18} />
                </Link>
              </td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
}

import clsx from 'clsx';
import { Link } from 'react-router';

import { paths } from '@/app/paths';
import { Icon } from '@/components/icons';
import { LinkButton, StatusChip, Table } from '@/components/ui';
import { formatPeso } from '@/lib/format';
import type { Disruption, RecentBooking, WorkQueue } from '@/types/console/dashboard';

import { ConsolePanel } from '../../shared/components/ConsolePanel';
import styles from './ActivityPanels.module.css';

export function LiveDisruptions({ disruptions }: { disruptions: readonly Disruption[] }) {
  return (
    <ConsolePanel
      title="Live disruptions"
      layout="flush"
      aside={<Link to={paths.console.flights}>Flight operations</Link>}
    >
      <ul className={styles.rows}>
        {disruptions.map((disruption) => (
          <li key={disruption.flightId} className={styles.row}>
            <StatusChip tone={disruption.status.tone} hideDot size="compact">
              {disruption.status.label}
            </StatusChip>
            <span className={styles.text}>
              <span className={styles.title}>{disruption.flight}</span>
              <span className={styles.detail}>{disruption.detail}</span>
            </span>
            <LinkButton
              to={paths.console.flight(disruption.flightId)}
              variant="quiet"
              size="small"
              aria-label={`${disruption.actionLabel}: ${disruption.flight}`}
            >
              {disruption.actionLabel}
            </LinkButton>
          </li>
        ))}
      </ul>
    </ConsolePanel>
  );
}

const QUEUE_PATH: Record<WorkQueue['id'], string> = {
  refunds: paths.console.refunds,
  ticketing: `${paths.console.bookings}?view=ticketing`,
  disputes: `${paths.console.bookings}?view=needs-action`,
};

export function NeedsAttention({ queues }: { queues: readonly WorkQueue[] }) {
  return (
    <ConsolePanel title="Needs attention" layout="flush" aside="Assigned to Operations">
      <ul className={styles.rows}>
        {queues.map((queue) => (
          <li key={queue.id}>
            <Link to={QUEUE_PATH[queue.id]} className={clsx(styles.row, styles.linkRow)}>
              <span className={clsx(styles.count, styles[queue.severity])}>{queue.count}</span>
              <span className={styles.text}>
                <span className={styles.title}>{queue.label}</span>
                <span className={clsx(styles.detail, queue.severity === 'critical' && styles.detailCritical)}>
                  {queue.detail}
                </span>
              </span>
              <Icon name="chevronRight" size={18} className={styles.chevron} />
            </Link>
          </li>
        ))}
      </ul>
    </ConsolePanel>
  );
}

export function LatestBookings({ bookings }: { bookings: readonly RecentBooking[] }) {
  return (
    <ConsolePanel
      title="Latest bookings"
      layout="flush"
      aside={<Link to={paths.console.bookings}>View all bookings</Link>}
    >
      <Table minWidth={760} className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Reference</th>
            <th scope="col">Lead traveler</th>
            <th scope="col">Route</th>
            <th scope="col">Created</th>
            <th scope="col" className={styles.number}>
              Total
            </th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.reference}>
              <th scope="row">
                <Link to={paths.console.booking(booking.reference)} className={styles.reference}>
                  {booking.reference}
                </Link>
              </th>
              <td>{booking.leadTraveler}</td>
              <td>{booking.route}</td>
              <td className={styles.muted}>{booking.createdLabel}</td>
              <td className={clsx(styles.number, styles.total)}>{formatPeso(booking.total)}</td>
              <td>
                <StatusChip tone={booking.status.tone} hideDot size="compact">
                  {booking.status.label}
                </StatusChip>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </ConsolePanel>
  );
}

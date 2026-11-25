import clsx from 'clsx';

import { Avatar, StatusChip, Table } from '@/components/ui';
import { formatPeso } from '@/lib/format';
import type { RefundRequest } from '@/types/console/refund';

import { shownAmount, waitLabel } from '../lib/refundReview';
import styles from './RefundRequestsTable.module.css';

interface RefundRequestsTableProps {
  requests: readonly RefundRequest[];
  /** Pending requests show what was asked for and how long it has waited; decided ones what was refunded and when. */
  isPendingView: boolean;
  selectedReference: string | undefined;
  /** The id of the review panel the row buttons control. */
  panelId: string;
  onSelect: (reference: string) => void;
}

export function RefundRequestsTable({
  requests,
  isPendingView,
  selectedReference,
  panelId,
  onSelect,
}: RefundRequestsTableProps) {
  return (
    <Table minWidth={720} className={styles.table}>
      <thead>
        <tr>
          <th scope="col">Booking</th>
          <th scope="col">Reason</th>
          <th scope="col" className={styles.number}>
            {isPendingView ? 'Requested' : 'Refunded'}
          </th>
          <th scope="col">Policy check</th>
          <th scope="col">{isPendingView ? 'Age' : 'Decided'}</th>
          <th scope="col">Owner</th>
        </tr>
      </thead>
      <tbody>
        {requests.map((request) => {
          const isSelected = request.bookingReference === selectedReference;
          return (
            // Row clicks are a mouse shortcut; the reference link or button in the row is the keyboard path.
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
            <tr
              key={request.bookingReference}
              className={clsx(styles.row, isSelected && styles.selected)}
              onClick={(event) => {
                if ((event.target as HTMLElement).closest('button, a')) return;
                onSelect(request.bookingReference);
              }}
            >
              <td>
                <span className={styles.booking}>
                  <button
                    type="button"
                    className={styles.reference}
                    aria-current={isSelected || undefined}
                    aria-controls={panelId}
                    aria-label={`Review refund ${request.bookingReference} · ${request.customerName}`}
                    onClick={() => onSelect(request.bookingReference)}
                  >
                    {request.bookingReference}
                  </button>
                  <span className={styles.customer}>{request.customerName}</span>
                </span>
              </td>
              <td>{request.reason}</td>
              <td className={clsx(styles.number, styles.amount)}>{formatPeso(shownAmount(request))}</td>
              <td>
                <StatusChip tone={request.policy.tone} hideDot size="compact">
                  {request.policy.label}
                </StatusChip>
              </td>
              <td className={clsx(styles.wait, isPendingView && request.isOverdue && styles.overdue)}>
                {waitLabel(request)}
              </td>
              <td>
                {request.owner ? (
                  <span className={styles.owner}>
                    <Avatar
                      initials={request.owner.initials}
                      size={28}
                      tone={request.owner.isYou ? 'midnight' : 'neutral'}
                    />
                    <span className="visually-hidden">{request.owner.fullName}</span>
                  </span>
                ) : (
                  <span className={styles.unassigned}>
                    <span aria-hidden="true">—</span>
                    <span className="visually-hidden">Unassigned</span>
                  </span>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
}

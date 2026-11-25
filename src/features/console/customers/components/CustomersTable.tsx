import clsx from 'clsx';

import { Icon } from '@/components/icons';
import { Avatar, StatusChip, Table } from '@/components/ui';
import type { CustomerSummary } from '@/types/console/customer';

import { customerStatusChip, formatCreditBalance, formatLifetimeValue } from '../lib/customerPresentation';
import styles from './CustomersTable.module.css';
import { TierBadge } from './TierBadge';

interface CustomersTableProps {
  customers: readonly CustomerSummary[];
  openCustomerId: string | null;
  onOpen: (customerId: string) => void;
}

export function CustomersTable({ customers, openCustomerId, onOpen }: CustomersTableProps) {
  return (
    <Table minWidth={900} className={styles.table}>
      <thead>
        <tr>
          <th scope="col">Customer</th>
          <th scope="col">Member no.</th>
          <th scope="col">Tier</th>
          <th scope="col" className={styles.number}>
            Trips
          </th>
          <th scope="col" className={styles.number}>
            Lifetime value
          </th>
          <th scope="col" className={styles.number}>
            Travel credit
          </th>
          <th scope="col">Status</th>
          <th scope="col">
            <span className="visually-hidden">Open</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {customers.map((customer) => {
          const chip = customerStatusChip(customer.status);
          return (
            // Row clicks are a mouse shortcut; the reference link or button in the row is the keyboard path.
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
            <tr
              key={customer.id}
              className={clsx(
                styles.row,
                customer.id === openCustomerId && styles.open,
                customer.status === 'suspended' && styles.suspended,
              )}
              onClick={(event) => {
                if ((event.target as HTMLElement).closest('button, a')) return;
                onOpen(customer.id);
              }}
            >
              <td>
                <span className={styles.customer}>
                  <Avatar initials={customer.initials} size={36} tone="neutral" />
                  <span className={styles.identity}>
                    <button
                      type="button"
                      className={styles.name}
                      aria-haspopup="dialog"
                      onClick={() => onOpen(customer.id)}
                    >
                      {customer.fullName}
                    </button>
                    <span className={styles.email}>{customer.maskedEmail}</span>
                  </span>
                </span>
              </td>
              <td className={styles.member}>{customer.memberNumber}</td>
              <td>
                <TierBadge tier={customer.tier} />
              </td>
              <td className={styles.number}>{customer.trips}</td>
              <td className={clsx(styles.number, styles.value)}>
                {formatLifetimeValue(customer.lifetimeValue)}
              </td>
              <td className={clsx(styles.number, styles.credit)}>
                {formatCreditBalance(customer.creditBalance)}
              </td>
              <td>
                <StatusChip tone={chip.tone} hideDot size="compact">
                  {chip.label}
                </StatusChip>
              </td>
              <td className={styles.chevron}>
                <Icon name="chevronRight" size={16} />
              </td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
}

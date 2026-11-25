import type { ReactNode } from 'react';

import { paths } from '@/app/paths';
import { VelaMark } from '@/components/icons';
import { Avatar, CountBadge, Menu, type MenuEntry, type PopoverTriggerProps } from '@/components/ui';
import { formatPeso, initialsOf } from '@/lib/format';
import { fullNameOf, type Customer } from '@/types/customer';

import styles from './AccountMenu.module.css';

interface AccountMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer;
  trigger: (props: PopoverTriggerProps) => ReactNode;
}

const ACCOUNT_LINKS: MenuEntry[] = [
  {
    id: 'trips',
    label: 'My trips',
    icon: 'ticket',
    to: paths.trips,
    trailing: <CountBadge count={2} label="2 upcoming" />,
  },
  { id: 'travelers', label: 'Saved travelers', icon: 'users', to: paths.account.travelers },
  { id: 'payment', label: 'Payment methods', icon: 'creditCard', to: paths.account.paymentMethods },
  {
    id: 'alerts',
    label: 'Price alerts',
    icon: 'bell',
    to: paths.account.priceAlerts,
    trailing: <CountBadge count={1} tone="attention" label="1 price drop" />,
  },
  { id: 'settings', label: 'Account settings', icon: 'user', to: paths.account.settings },
  { kind: 'separator', id: 'separator' },
  { id: 'sign-out', label: 'Sign out', icon: 'logOut', to: paths.signOut },
];

export function AccountMenu({ open, onOpenChange, customer, trigger }: AccountMenuProps) {
  return (
    <Menu
      open={open}
      onOpenChange={onOpenChange}
      trigger={trigger}
      label="Account"
      align="end"
      width={300}
      items={ACCOUNT_LINKS}
      intro={
        <>
          <div className={styles.profile}>
            <Avatar initials={initialsOf(`${customer.firstName} ${customer.lastName}`)} size={40} />
            <span className={styles.profileText}>
              <span className={styles.name}>{fullNameOf(customer)}</span>
              <span className={styles.email}>{customer.email}</span>
            </span>
          </div>
          <div className={styles.membership}>
            <span className={styles.tier}>
              <VelaMark size={14} />
              {customer.memberTier} member · {customer.tripCount} trips
            </span>
            <span className={styles.credit}>{formatPeso(customer.travelCredit)} credit</span>
          </div>
        </>
      }
    />
  );
}

import { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router';

import { paths } from '@/app/paths';
import { useSession } from '@/app/providers';
import { Icon, type IconName } from '@/components/icons';
import { Avatar, CountBadge } from '@/components/ui';
import { useAsyncData } from '@/hooks';
import { initialsOf } from '@/lib/format';
import { getAccountSummary } from '@/services/accountService';

import styles from './AccountNav.module.css';

interface AccountNavItem {
  to: string;
  label: string;
  icon: IconName;
  badge?: { count: number; label: string; tone: 'neutral' | 'attention' };
  isSeparated?: boolean;
}

/** Account navigation: a sidebar on wide screens, a scrollable strip when it gets the full width. */
export function AccountNav() {
  const { pathname } = useLocation();
  const { customer } = useSession();
  // Re-read the counts on every navigation so they follow changes made on account pages.
  const summary = useAsyncData(`account-summary:${pathname}`, getAccountSummary);
  const navRef = useRef<HTMLElement>(null);

  const items: AccountNavItem[] = [
    {
      to: paths.trips,
      label: 'Trips',
      icon: 'ticket',
      badge: summary.data?.upcomingTripCount
        ? {
            count: summary.data.upcomingTripCount,
            label: `${summary.data.upcomingTripCount} upcoming`,
            tone: 'neutral',
          }
        : undefined,
    },
    { to: paths.account.travelers, label: 'Saved travelers', icon: 'users' },
    { to: paths.account.paymentMethods, label: 'Payment methods', icon: 'creditCard' },
    {
      to: paths.account.priceAlerts,
      label: 'Price alerts',
      icon: 'bell',
      badge: summary.data?.priceDropCount
        ? {
            count: summary.data.priceDropCount,
            label: `${summary.data.priceDropCount} price drop`,
            tone: 'attention',
          }
        : undefined,
    },
    { to: paths.account.settings, label: 'Account settings', icon: 'user' },
    { to: paths.signOut, label: 'Sign out', icon: 'logOut', isSeparated: true },
  ];

  // As a horizontal strip, keep the current page's tab in view.
  useEffect(() => {
    const nav = navRef.current;
    const current = nav?.querySelector<HTMLElement>('[aria-current="page"]');
    if (nav && current && nav.scrollWidth > nav.clientWidth) {
      nav.scrollLeft = Math.max(0, current.offsetLeft - nav.offsetLeft - 56);
    }
  }, [pathname]);

  const fullName = customer ? `${customer.firstName} ${customer.lastName}` : '';

  return (
    <div className={styles.container}>
      <nav ref={navRef} className={styles.nav} aria-label="Account">
        {customer && (
          <div className={styles.profile}>
            <Avatar initials={initialsOf(fullName)} size={44} />
            <span className={styles.profileText}>
              <span className={styles.name}>{fullName}</span>
              <span className={styles.tier}>
                {customer.memberTier} member · {customer.tripCount} trips
              </span>
            </span>
          </div>
        )}
        {items.map((item) => {
          const isCurrent =
            pathname === item.to || (item.to === paths.trips && pathname.startsWith(`${paths.trips}/`));
          return (
            <div key={item.to} className={styles.itemWrap}>
              {item.isSeparated && <span className={styles.separator} aria-hidden="true" />}
              <Link to={item.to} className={styles.link} aria-current={isCurrent ? 'page' : undefined}>
                <Icon name={item.icon} size={18} className={styles.icon} />
                <span className={styles.label}>{item.label}</span>
                {item.badge && (
                  <CountBadge count={item.badge.count} tone={item.badge.tone} label={item.badge.label} />
                )}
              </Link>
            </div>
          );
        })}
      </nav>
    </div>
  );
}

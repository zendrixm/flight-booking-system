import clsx from 'clsx';

import { paths } from '@/app/paths';
import { Icon } from '@/components/icons';
import { Logo } from '@/components/ui';
import { DEMO_CLOCK_LABEL } from '@/config/demo';

import { ConsoleSearch } from './ConsoleSearch';
import styles from './ConsoleTopbar.module.css';
import { NotificationBell } from './NotificationBell';

interface ConsoleTopbarProps {
  sidebarId: string;
  /** Desktop: the sidebar is a rail. Phone: the navigation drawer is open. */
  isNavCollapsed: boolean;
  isPhone: boolean;
  isDrawerOpen: boolean;
  onToggleNav: () => void;
}

export function ConsoleTopbar({
  sidebarId,
  isNavCollapsed,
  isPhone,
  isDrawerOpen,
  onToggleNav,
}: ConsoleTopbarProps) {
  const menuLabel = isPhone
    ? isDrawerOpen
      ? 'Close navigation'
      : 'Open navigation'
    : isNavCollapsed
      ? 'Expand sidebar'
      : 'Collapse sidebar';
  const isRail = isNavCollapsed && !isPhone;

  return (
    <header className={styles.topbar}>
      {/* As wide as the sidebar below it, so the search lines up with the page content. */}
      <div className={clsx(styles.brand, isRail && styles.brandRail)}>
        <button
          type="button"
          className={styles.menuButton}
          aria-label={menuLabel}
          title={menuLabel}
          aria-controls={sidebarId}
          aria-expanded={isPhone ? isDrawerOpen : !isNavCollapsed}
          onClick={onToggleNav}
        >
          <Icon name={isPhone && isDrawerOpen ? 'close' : 'menu'} size={18} />
        </button>
        {!isRail && (
          <Logo
            to={paths.console.dashboard}
            label="Vela Console home"
            size={26}
            product="Console"
            productClassName={styles.product}
          />
        )}
      </div>

      <div className={styles.search}>
        <ConsoleSearch />
      </div>

      <span className={styles.spacer} />

      <span className={styles.environment}>
        <span className={styles.environmentDot} aria-hidden="true" />
        Production
      </span>
      <span className={styles.clock}>{DEMO_CLOCK_LABEL}</span>
      <NotificationBell />
    </header>
  );
}

import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { Navigate, Outlet, ScrollRestoration, useLocation } from 'react-router';

import { paths } from '@/app/paths';
import { useStaffSession } from '@/app/providers';
import { scrollRestorationKey } from '@/app/scrollRestoration';
import { useAsyncData, useEscapeKey, useMediaQuery } from '@/hooks';
import { readStoredValue, writeStoredValue } from '@/lib/storage';
import { getNavCounts } from '@/services/console/consoleShellService';

import styles from './ConsoleLayout.module.css';
import { ConsoleSidebar } from './ConsoleSidebar';
import { ConsoleTopbar } from './ConsoleTopbar';

const SIDEBAR_ID = 'console-sidebar';
const RAIL_KEY = 'vela.console.sidebarRail';
const PHONE_QUERY = '(max-width: 860px)';

/**
 * Vela Console chrome: Midnight app bar, a sidebar that collapses to a rail on desktop and becomes a
 * drawer on phones, and the page content. Signed-out staff are sent to the console sign-in page.
 */
export function ConsoleLayout() {
  const { isSignedIn } = useStaffSession();
  const location = useLocation();
  const isPhone = useMediaQuery(PHONE_QUERY);
  const [isRail, setIsRail] = useState(() => readStoredValue('local', RAIL_KEY, false));
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const navCounts = useAsyncData('console-nav-counts', getNavCounts);

  // Close the drawer after navigating from it.
  useEffect(() => setIsDrawerOpen(false), [location.pathname]);
  useEscapeKey(() => setIsDrawerOpen(false), isPhone && isDrawerOpen);

  if (!isSignedIn) {
    const redirect = `${location.pathname}${location.search}`;
    return <Navigate to={`${paths.console.login}?redirect=${encodeURIComponent(redirect)}`} replace />;
  }

  const toggleNav = () => {
    if (isPhone) {
      setIsDrawerOpen((open) => !open);
      return;
    }
    setIsRail((rail) => {
      writeStoredValue('local', RAIL_KEY, !rail);
      return !rail;
    });
  };

  const showRail = isRail && !isPhone;

  return (
    <div className={styles.shell} data-density="compact">
      <ConsoleTopbar
        sidebarId={SIDEBAR_ID}
        isNavCollapsed={isRail}
        isPhone={isPhone}
        isDrawerOpen={isDrawerOpen}
        onToggleNav={toggleNav}
      />
      <div className={styles.body}>
        <div
          className={clsx(styles.sidebarSlot, showRail && styles.rail, isDrawerOpen && styles.drawerOpen)}
          // The drawer is out of the tab order while closed on phones.
          inert={isPhone && !isDrawerOpen ? true : undefined}
        >
          <ConsoleSidebar id={SIDEBAR_ID} isRail={showRail} counts={navCounts.data} />
        </div>
        {isPhone && isDrawerOpen && (
          <div className={styles.scrim} aria-hidden="true" onClick={() => setIsDrawerOpen(false)} />
        )}
        <div className={styles.content}>
          <Outlet />
        </div>
      </div>
      <ScrollRestoration getKey={scrollRestorationKey} />
    </div>
  );
}

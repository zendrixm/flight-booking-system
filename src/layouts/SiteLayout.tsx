import { Outlet, ScrollRestoration } from 'react-router';

import { useRouteHandle } from '@/app/routeHandle';
import { scrollRestorationKey } from '@/app/scrollRestoration';
import { useScrollToHash } from '@/hooks';

import { SiteFooter } from './site/SiteFooter';
import { SiteHeader } from './site/SiteHeader';
import styles from './SiteLayout.module.css';

/** Customer site chrome: Midnight app bar, page content and the matching Midnight footer. */
export function SiteLayout() {
  const { hideFooter } = useRouteHandle();
  useScrollToHash();

  return (
    <div className={styles.shell}>
      <SiteHeader />
      <div className={styles.content}>
        <Outlet />
      </div>
      {!hideFooter && <SiteFooter />}
      <ScrollRestoration getKey={scrollRestorationKey} />
    </div>
  );
}

import { Outlet, ScrollRestoration } from 'react-router';

import { scrollRestorationKey } from '@/app/scrollRestoration';

import styles from './PhoneAppLayout.module.css';

/**
 * The phone app as a web app: one column with 16px gaps (`data-platform="phone"`). On wider
 * screens it stays phone-width and centred, so it reads as the app rather than a stretched page.
 */
export function PhoneAppLayout() {
  return (
    <div data-platform="phone" className={styles.backdrop}>
      <div className={styles.app}>
        <Outlet />
      </div>
      <ScrollRestoration getKey={scrollRestorationKey} />
    </div>
  );
}

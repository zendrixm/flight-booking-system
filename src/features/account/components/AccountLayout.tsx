import type { ReactNode } from 'react';
import { Outlet } from 'react-router';

import { PageContainer } from '@/components/layout';

import styles from './AccountLayout.module.css';
import { AccountNav } from './AccountNav';

/**
 * Account pages: the account navigation beside the page content. Used as a route layout, or
 * with `children` by pages that live outside the signed-in routes (sign out).
 */
export function AccountLayout({ children }: { children?: ReactNode }) {
  return (
    <PageContainer as="main" layout="plain" className={styles.layout}>
      <div className={styles.nav}>
        <AccountNav />
      </div>
      <div className={styles.content}>{children ?? <Outlet />}</div>
    </PageContainer>
  );
}

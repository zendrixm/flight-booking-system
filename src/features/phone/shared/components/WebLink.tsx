import type { ReactNode } from 'react';
import { Link } from 'react-router';

import styles from './WebLink.module.css';

/** An underlined link from the app to a page on the website, e.g. "Receipts and cancelled trips on the web". */
export function WebLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className={styles.link}>
      {children}
    </Link>
  );
}

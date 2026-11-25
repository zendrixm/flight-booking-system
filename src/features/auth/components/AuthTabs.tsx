import { NavLink } from 'react-router';

import { paths } from '@/app/paths';

import styles from './AuthTabs.module.css';

/** Switches between signing in and creating an account. */
export function AuthTabs() {
  return (
    <nav aria-label="Account" className={styles.tabs}>
      <NavLink to={paths.signIn} className={styles.tab} end>
        Sign in
      </NavLink>
      <NavLink to={paths.createAccount} className={styles.tab} end>
        Create account
      </NavLink>
    </nav>
  );
}

import type { ReactNode } from 'react';
import { Link } from 'react-router';

import { paths } from '@/app/paths';
import { Icon, type IconName, VelaMark } from '@/components/icons';

import styles from './AuthLayout.module.css';

export interface AuthPerk {
  icon: IconName;
  title: string;
  detail?: string;
}

interface AuthLayoutProps {
  /** The art panel headline; wrap the second half in <em> for the Brass italic. */
  headline: ReactNode;
  perks: AuthPerk[];
  children: ReactNode;
}

/** Sign-in and sign-up: a Midnight panel selling the account beside the form. The panel hides on small screens. */
export function AuthLayout({ headline, perks, children }: AuthLayoutProps) {
  return (
    <div className={styles.layout}>
      <section className={styles.art} aria-hidden="true">
        <svg className={styles.globe} width="720" height="720" viewBox="0 0 720 720">
          <g fill="none" stroke="currentColor">
            <circle cx="360" cy="360" r="340" />
            <ellipse cx="360" cy="360" rx="250" ry="340" />
            <ellipse cx="360" cy="360" rx="130" ry="340" />
            <ellipse cx="360" cy="230" rx="300" ry="50" />
            <ellipse cx="360" cy="360" rx="340" ry="60" />
          </g>
          <circle cx="200" cy="420" r="6" className={styles.pin} />
          <circle cx="560" cy="200" r="5" className={styles.pin} />
        </svg>
        <Link to={paths.home} tabIndex={-1} className={styles.brand}>
          <VelaMark size={22} />
          <span className={styles.wordmark}>Vela</span>
        </Link>
        <div className={styles.pitch}>
          <h2 className={styles.headline}>{headline}</h2>
          <ul className={styles.perks}>
            {perks.map((perk) => (
              <li key={perk.title} className={styles.perk}>
                <Icon name={perk.icon} size={20} strokeWidth={1.8} className={styles.perkIcon} />
                <span className={styles.perkText}>
                  <span className={perk.detail ? styles.perkTitle : undefined}>{perk.title}</span>
                  {perk.detail && <span className={styles.perkDetail}>{perk.detail}</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <span className={styles.copyright}>© 2026 Vela Travel, Inc.</span>
      </section>
      <main className={styles.main}>
        <div className={styles.panel}>{children}</div>
      </main>
    </div>
  );
}

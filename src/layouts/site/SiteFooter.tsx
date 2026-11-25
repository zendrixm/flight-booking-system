import { Link } from 'react-router';

import { paths } from '@/app/paths';
import { Logo } from '@/components/ui';

import styles from './SiteFooter.module.css';

const FOOTER_COLUMNS = [
  {
    title: 'Travel',
    links: [
      { label: 'Search flights', to: paths.home },
      { label: 'Price alerts', to: paths.account.priceAlerts },
      { label: 'Destinations', to: paths.destinations },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Manage booking', to: paths.findBooking },
      { label: 'Online check-in', to: paths.findBooking },
      { label: 'Help centre', to: paths.help },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Vela', to: paths.about },
      { label: 'Privacy', to: paths.legal('privacy') },
      { label: 'Terms of carriage', to: paths.legal('carriage') },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.columns}>
          <div className={styles.brand}>
            <Logo to={paths.home} label="Vela home" />
            <p className={styles.tagline}>
              Flights from 120+ airlines, priced with every tax and fee included.
            </p>
          </div>
          {FOOTER_COLUMNS.map((column) => (
            <nav key={column.title} aria-label={column.title} className={styles.column}>
              <span className={styles.columnTitle}>{column.title}</span>
              {column.links.map((link) => (
                <Link key={link.label} to={link.to} className={styles.link}>
                  {link.label}
                </Link>
              ))}
            </nav>
          ))}
        </div>
        <div className={styles.legal}>
          <span>© 2026 Vela Travel, Inc.</span>
          <span>All prices in Philippine peso, per traveler, taxes and fees included.</span>
        </div>
      </div>
    </footer>
  );
}

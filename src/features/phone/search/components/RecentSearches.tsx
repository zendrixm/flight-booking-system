import { Link } from 'react-router';

import { paths } from '@/app/paths';
import { searchToQueryString } from '@/lib/flightSearchUrl';
import type { FlightSearchParams } from '@/types/flight';

import { describeSearch } from '../lib/recentSearches';
import styles from './RecentSearches.module.css';

/** Earlier searches on this phone, one tap from their results. Scrolls sideways. */
export function RecentSearches({ searches }: { searches: readonly FlightSearchParams[] }) {
  return (
    <ul className={styles.list}>
      {searches.map((search) => {
        const query = searchToQueryString(search);
        const { route, detail } = describeSearch(search);
        return (
          <li key={query}>
            <Link to={paths.phone.results(query)} className={styles.search}>
              <span className={styles.route}>{route}</span>
              <span className={styles.detail}>{detail}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

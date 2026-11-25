import { Fragment } from 'react';

import { paths } from '@/app/paths';
import { Icon } from '@/components/icons';
import { LinkButton } from '@/components/ui';
import { findAirport } from '@/data/airports';
import { formatDateRange } from '@/lib/date';
import { searchToQueryString } from '@/lib/flightSearchUrl';
import type { FlightSearchParams } from '@/types/flight';

import { travelersLabel } from '../../lib/searchForm';
import styles from './SearchSummaryBar.module.css';

interface SearchSummaryBarProps {
  search: FlightSearchParams;
}

/** The current search in one line, with a link back to the search form to change it. */
export function SearchSummaryBar({ search }: SearchSummaryBarProps) {
  const items = [formatDateRange(search.departDate, search.returnDate), travelersLabel(search)];

  return (
    <div className={styles.bar}>
      <div className={styles.inner}>
        <p className={styles.summary}>
          <span className={styles.route}>
            {findAirport(search.from)?.city ?? search.from} <span className={styles.code}>{search.from}</span>
            <Icon
              name={search.tripType === 'round' ? 'arrowsSwap' : 'arrowRight'}
              size={16}
              label={search.tripType === 'round' ? 'round trip to' : 'to'}
            />
            {findAirport(search.to)?.city ?? search.to} <span className={styles.code}>{search.to}</span>
          </span>
          {items.map((item) => (
            <Fragment key={item}>
              <span className={styles.divider} aria-hidden="true" />
              <span>{item}</span>
            </Fragment>
          ))}
        </p>
        <LinkButton to={`${paths.home}?${searchToQueryString(search)}`} variant="quiet" iconStart="pencil">
          Modify search
        </LinkButton>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Link } from 'react-router';

import { paths } from '@/app/paths';
import { findAirport } from '@/data/airports';
import { DEFAULT_SEARCH, searchToQueryString } from '@/lib/flightSearchUrl';
import { formatPeso } from '@/lib/format';
import { getOriginDeals } from '@/services/flightsService';

import { OriginPicker } from './OriginPicker';
import styles from './TrendingDeals.module.css';

const DEFAULT_ORIGIN = 'MNL';
const FEATURED_BLURB = 'Autumn colour in the city peaks late November.';

function resultsLinkFor(from: string, to: string): string {
  return `${paths.flights}?${searchToQueryString({ ...DEFAULT_SEARCH, from, to })}`;
}

/** "Trending from Manila": a featured Tokyo fare and three more routes for the chosen origin. */
export function TrendingDeals() {
  const [originCode, setOriginCode] = useState(DEFAULT_ORIGIN);
  const origin = findAirport(originCode);
  const [featured, ...others] = getOriginDeals(originCode);

  return (
    <section className={styles.section} aria-labelledby="trending-title">
      <div className={styles.header}>
        <div className={styles.heading}>
          <h2 id="trending-title" className={styles.title}>
            Trending from {origin?.city}
          </h2>
          <p className={styles.description}>
            Lowest round-trip fares from {origin?.name} ({originCode}) in the last 24 hours, per traveler.
          </p>
        </div>
        <OriginPicker value={originCode} onChange={setOriginCode} />
      </div>

      <div className={styles.grid}>
        {featured && (
          <Link className={styles.featured} to={resultsLinkFor(originCode, featured.destination)}>
            <svg
              className={styles.featuredArt}
              width="420"
              height="260"
              viewBox="0 0 420 260"
              aria-hidden="true"
            >
              <path
                d="M20 230 C 140 40, 300 20, 400 60"
                fill="none"
                stroke="var(--color-brass)"
                strokeWidth="1.5"
                strokeDasharray="2 7"
                strokeLinecap="round"
              />
              <circle cx="20" cy="230" r="5" fill="var(--color-brass)" />
              <circle cx="400" cy="60" r="7" fill="none" stroke="var(--color-brass)" strokeWidth="1.5" />
              <circle cx="400" cy="60" r="3" fill="var(--color-brass)" />
            </svg>
            <div className={styles.tags}>
              <span className={styles.tag}>
                {originCode} → {featured.destination}
              </span>
              <span className={styles.tagAccent}>{featured.summary}</span>
            </div>
            <div className={styles.featuredFooter}>
              <div className={styles.featuredPlace}>
                <span className={styles.featuredCity}>{findAirport(featured.destination)?.city}</span>
                <span className={styles.featuredBlurb}>{FEATURED_BLURB}</span>
              </div>
              <div className={styles.price}>
                <span className={styles.priceLabel}>Round trip from</span>
                <span className={styles.featuredPrice}>{formatPeso(featured.price)}</span>
              </div>
            </div>
          </Link>
        )}

        <div className={styles.routes}>
          {others.map((deal) => (
            <Link
              key={deal.destination}
              className={styles.route}
              to={resultsLinkFor(originCode, deal.destination)}
            >
              <div className={styles.routePlace}>
                <span className={styles.routeCodes}>
                  {originCode} → {deal.destination}
                </span>
                <span className={styles.routeCity}>{findAirport(deal.destination)?.city}</span>
                <span className={styles.routeSummary}>{deal.summary}</span>
              </div>
              <div className={styles.price}>
                <span className={styles.priceLabel}>Round trip from</span>
                <span className={styles.routePrice}>{formatPeso(deal.price)}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

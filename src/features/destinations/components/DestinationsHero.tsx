import { paths } from '@/app/paths';
import { Breadcrumbs } from '@/components/ui';
import type { Destination } from '@/types/destination';

import { destinationStats } from '../lib/destinationStats';
import styles from './DestinationsHero.module.css';
import { RouteMap } from './RouteMap';

const BREADCRUMBS = [{ label: 'Home', to: paths.home }, { label: 'Destinations' }];

interface DestinationsHeroProps {
  destinations: readonly Destination[];
  visibleCodes: ReadonlySet<string>;
  highlightedCode: string | null;
  mapNote: string;
  faresCheckedAt: string;
}

export function DestinationsHero({
  destinations,
  visibleCodes,
  highlightedCode,
  mapNote,
  faresCheckedAt,
}: DestinationsHeroProps) {
  return (
    <section aria-labelledby="destinations-heading" className={styles.hero}>
      <div className={styles.intro}>
        <Breadcrumbs items={BREADCRUMBS} className={styles.breadcrumbs} />
        <span className={styles.eyebrow}>
          <span className={styles.rule} aria-hidden="true" />
          Destinations from Manila
        </span>
        <h1 id="destinations-heading" className={styles.title}>
          Where to <em>next?</em>
        </h1>
        <p className={styles.lead}>
          Round-trip fares from Manila, per traveler, with every tax and fee already in. Updated hourly — last
          checked at {faresCheckedAt} today.
        </p>
        <dl className={styles.stats}>
          {destinationStats(destinations).map((stat) => (
            <div key={stat.label} className={styles.stat}>
              <dt className={styles.statLabel}>{stat.label}</dt>
              <dd className={styles.statValue}>{stat.value}</dd>
              <dd className={styles.statDetail}>{stat.detail}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className={styles.map}>
        <RouteMap
          destinations={destinations}
          visibleCodes={visibleCodes}
          highlightedCode={highlightedCode}
          caption="Flight time from Manila, nonstop"
          note={mapNote}
        />
      </div>
    </section>
  );
}

import { Link } from 'react-router';

import { Icon } from '@/components/icons';
import { Button } from '@/components/ui';
import { formatPeso } from '@/lib/format';
import type { Destination } from '@/types/destination';

import { formatFlightTime } from '../lib/destinationFilters';
import { DestinationArt } from './DestinationArt';
import styles from './DestinationCard.module.css';

interface DestinationCardProps {
  destination: Destination;
  resultsUrl: string;
  /** The cheapest destination in the current list. */
  isLowest: boolean;
  isWatching: boolean;
  isSavingWatch: boolean;
  onToggleWatch: (destination: Destination) => void;
  /** Called with the code on hover or focus, and `null` when the pointer or focus leaves. */
  onHighlight: (code: string | null) => void;
}

export function DestinationCard({
  destination,
  resultsUrl,
  isLowest,
  isWatching,
  isSavingWatch,
  onToggleWatch,
  onHighlight,
}: DestinationCardProps) {
  const { city, code } = destination;

  return (
    <li
      className={styles.card}
      onMouseEnter={() => onHighlight(code)}
      onMouseLeave={() => onHighlight(null)}
      onFocus={() => onHighlight(code)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) onHighlight(null);
      }}
    >
      <div className={styles.artFrame}>
        <DestinationArt destinationCode={code} />
        <span className={styles.tag}>{destination.tag}</span>
        {isLowest && (
          <span className={styles.lowest}>
            <span className={styles.lowestDot} aria-hidden="true" />
            Lowest here
          </span>
        )}
      </div>

      <div className={styles.body}>
        <div className={styles.heading}>
          <span className={styles.country}>
            {destination.country} · {code}
          </span>
          <h3 className={styles.city}>
            {/* Stretched over the whole card; the watch button sits above it. */}
            <Link to={resultsUrl} className={styles.cityLink}>
              {city}
            </Link>
          </h3>
        </div>

        <div className={styles.facts}>
          <span className={styles.fact}>
            <Icon name="clock" size={16} strokeWidth={1.6} />
            {formatFlightTime(destination.flightMinutes)} nonstop
          </span>
          <span className={styles.fact}>
            <Icon name="calendar" size={16} strokeWidth={1.6} />
            Best {destination.bestMonths}
          </span>
        </div>

        <div className={styles.footer}>
          <span className={styles.price}>
            <span className={styles.priceFrom}>from</span>
            <span className={styles.priceLine}>
              <span className={styles.priceAmount}>{formatPeso(destination.lowestFare)}</span>
              <span className={styles.priceNote}>round trip</span>
            </span>
          </span>
          <Button
            variant="quiet"
            className={styles.watch}
            iconStart="bell"
            aria-pressed={isWatching}
            aria-label={isWatching ? `Stop watching ${city} fares` : `Watch ${city} fares`}
            loading={isSavingWatch}
            onClick={() => onToggleWatch(destination)}
          >
            {isWatching ? 'Watching' : 'Watch fare'}
          </Button>
        </div>
      </div>
    </li>
  );
}

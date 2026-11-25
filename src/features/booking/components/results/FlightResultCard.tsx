import clsx from 'clsx';
import { useId } from 'react';

import { AirlineMark, LegTimeline } from '@/components/flight';
import { Icon } from '@/components/icons';
import { Button, StatusChip, type StatusTone } from '@/components/ui';
import { AIRLINES } from '@/data/airports';
import { formatDayMonth } from '@/lib/date';
import { formatPeso, pluralize } from '@/lib/format';
import type { FareFamily, FareFamilyId, FlightLeg, FlightOption } from '@/types/flight';

import { lowestFareOf } from '../../lib/resultsFilters';
import { FareFamilyCard } from './FareFamilyCard';
import styles from './FlightResultCard.module.css';

export interface ResultTag {
  label: string;
  tone: StatusTone;
}

interface FlightResultCardProps {
  option: FlightOption;
  fareFamilies: readonly FareFamily[];
  tags: readonly ResultTag[];
  travelerCount: number;
  isExpanded: boolean;
  onToggle: () => void;
  onChooseFare: (fareFamily: FareFamilyId) => void;
}

export function FlightResultCard({
  option,
  fareFamilies,
  tags,
  travelerCount,
  isExpanded,
  onToggle,
  onChooseFare,
}: FlightResultCardProps) {
  const faresId = useId();
  const airline = AIRLINES[option.airlineId];
  const price = lowestFareOf(option);
  const flightLabel = `${airline.name} ${option.outbound.flightNumber}`;

  const renderLeg = (leg: FlightLeg) => (
    <div key={leg.flightNumber} className={styles.leg}>
      <div className={styles.airline}>
        <AirlineMark airlineId={option.airlineId} />
        <span className={styles.airlineText}>
          <span className={styles.airlineName}>{airline.name}</span>
          <span className={styles.flightMeta}>
            {leg.flightNumber} · {formatDayMonth(leg.date)}
          </span>
        </span>
      </div>
      <LegTimeline
        departureTime={leg.departureTime}
        departureAirport={leg.from}
        arrivalTime={leg.arrivalTime}
        arrivalAirport={leg.to}
        durationMinutes={leg.durationMinutes}
        stops={leg.stops}
        via={leg.via}
        arrivesNextDay={leg.arrivesNextDay}
      />
    </div>
  );

  return (
    <article className={clsx(styles.card, isExpanded && styles.expanded)} aria-label={flightLabel}>
      <div className={styles.summary}>
        <div className={styles.legs}>{[option.outbound, option.inbound].map(renderLeg)}</div>
        <div className={styles.pricing}>
          <div className={styles.tags}>
            {tags.map((tag) => (
              <StatusChip key={tag.label} tone={tag.tone} hideDot size="compact">
                {tag.label}
              </StatusChip>
            ))}
          </div>
          <div className={styles.price}>
            <span className={styles.from}>from</span>
            <span className={styles.amount}>{formatPeso(price)}</span>
            <span className={styles.total}>
              {formatPeso(price * travelerCount)} for {pluralize(travelerCount, 'traveler')}
            </span>
          </div>
          <Button
            variant={isExpanded ? 'ghost' : 'secondary'}
            className={clsx(isExpanded && styles.hideButton)}
            iconEnd={isExpanded ? 'chevronUp' : 'chevronDown'}
            aria-expanded={isExpanded}
            aria-controls={faresId}
            onClick={onToggle}
          >
            {isExpanded ? 'Hide fares' : 'View fares'}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div id={faresId} className={styles.fares}>
          <ul className={styles.details}>
            {[option.outbound, option.inbound].map((leg) => (
              <li key={leg.flightNumber} className={styles.detail}>
                <Icon name="plane" size={16} />
                {leg.details}
              </li>
            ))}
          </ul>
          <div role="group" aria-label={`Fares for ${flightLabel}`} className={styles.fareGrid}>
            {fareFamilies.map((fare) => (
              <FareFamilyCard
                key={fare.id}
                fare={fare}
                price={option.fares[fare.id]}
                flightLabel={flightLabel}
                onChoose={() => onChooseFare(fare.id)}
              />
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

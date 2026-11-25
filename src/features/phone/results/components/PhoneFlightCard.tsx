import { AirlineMark } from '@/components/flight';
import { StatusChip, type StatusTone } from '@/components/ui';
import { AIRLINES } from '@/data/airports';
import { lowestFareOf } from '@/features/booking/lib/resultsFilters';
import { formatDuration, formatPeso } from '@/lib/format';
import type { FlightLeg, FlightOption } from '@/types/flight';

import styles from './PhoneFlightCard.module.css';

interface PhoneFlightCardProps {
  option: FlightOption;
  tag: { label: string; tone: StatusTone } | null;
  onSelect: (option: FlightOption) => void;
}

/** One round trip: both legs at a glance and the lowest fare. Tapping it starts checkout on Saver. */
export function PhoneFlightCard({ option, tag, onSelect }: PhoneFlightCardProps) {
  const airline = AIRLINES[option.airlineId];
  const price = formatPeso(lowestFareOf(option));

  return (
    <button
      type="button"
      className={styles.card}
      aria-label={`${airline.name}, ${legSummary(option.outbound)}, returning ${legSummary(option.inbound)}, Saver from ${price}`}
      onClick={() => onSelect(option)}
    >
      <span className={styles.header}>
        <span className={styles.airline}>
          <AirlineMark airlineId={option.airlineId} size="small" />
          {airline.name}
        </span>
        {tag && (
          <StatusChip tone={tag.tone} hideDot size="compact">
            {tag.label}
          </StatusChip>
        )}
      </span>
      <Leg leg={option.outbound} />
      <Leg leg={option.inbound} />
      <span className={styles.footer}>
        <span className={styles.fareName}>Saver · from</span>
        <span className={styles.price}>{price}</span>
      </span>
    </button>
  );
}

function stopsLabel(leg: FlightLeg): string {
  if (leg.stops === 0) return 'Nonstop';
  return `${leg.stops} ${leg.stops === 1 ? 'stop' : 'stops'}${leg.via ? ` · ${leg.via}` : ''}`;
}

function legSummary(leg: FlightLeg): string {
  return `${leg.from} ${leg.departureTime} to ${leg.to} ${leg.arrivalTime}, ${stopsLabel(leg)}`;
}

function Leg({ leg }: { leg: FlightLeg }) {
  return (
    <span className={styles.leg} aria-hidden="true">
      <span className={styles.endpoint}>
        <span className={styles.time}>{leg.departureTime}</span>
        <span className={styles.code}>{leg.from}</span>
      </span>
      <span className={styles.path}>
        <span className={styles.duration}>{formatDuration(leg.durationMinutes)}</span>
        <span className={styles.line} />
        <span className={leg.stops === 0 ? styles.nonstop : styles.stops}>{stopsLabel(leg)}</span>
      </span>
      <span className={styles.endpointEnd}>
        <span className={styles.time}>
          {leg.arrivalTime}
          {leg.arrivesNextDay && <sup className={styles.nextDay}>+1</sup>}
        </span>
        <span className={styles.code}>{leg.to}</span>
      </span>
    </span>
  );
}

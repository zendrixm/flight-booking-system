import clsx from 'clsx';

import type { Destination } from '@/types/destination';

import {
  MAP_CENTER,
  MAP_SIZE,
  RING_HOURS,
  radiusForMinutes,
  ringLabelPercent,
  routeGeometry,
} from '../lib/routeMap';
import styles from './RouteMap.module.css';

interface RouteMapProps {
  destinations: readonly Destination[];
  /** Destinations in the current filter; the rest are drawn faintly. */
  visibleCodes: ReadonlySet<string>;
  /** The destination whose card is hovered or focused. */
  highlightedCode: string | null;
  caption: string;
  note: string;
}

const LABEL_SIDE_CLASS: Record<Destination['labelSide'], string> = {
  right: styles.right,
  left: styles.left,
  below: styles.below,
  above: styles.above,
};

/** Every route from Manila, placed by bearing and flight time. The cards below carry the same facts in text. */
export function RouteMap({ destinations, visibleCodes, highlightedCode, caption, note }: RouteMapProps) {
  const routes = destinations.map((destination) => ({
    destination,
    geometry: routeGeometry(destination),
    isVisible: visibleCodes.has(destination.code),
    isHighlighted: destination.code === highlightedCode,
  }));

  return (
    <figure className={styles.figure}>
      <div className={styles.map}>
        <svg viewBox={`0 0 ${MAP_SIZE} ${MAP_SIZE}`} className={styles.svg} aria-hidden="true">
          <g className={styles.grid}>
            {RING_HOURS.map((hours) => (
              <circle
                key={hours}
                cx={MAP_CENTER}
                cy={MAP_CENTER}
                r={radiusForMinutes(hours * 60)}
                strokeDasharray={hours === 6 ? '2 6' : undefined}
              />
            ))}
            <line className={styles.axis} x1={MAP_CENTER} y1={20} x2={MAP_CENTER} y2={MAP_SIZE - 20} />
            <line className={styles.axis} x1={20} y1={MAP_CENTER} x2={MAP_SIZE - 20} y2={MAP_CENTER} />
          </g>
          {routes.map(({ destination, geometry, isVisible, isHighlighted }) => (
            <path
              key={destination.code}
              d={geometry.path}
              className={clsx(
                styles.route,
                isVisible && styles.routeVisible,
                isHighlighted && styles.routeHighlighted,
              )}
            />
          ))}
          {routes.map(({ destination, geometry, isVisible, isHighlighted }) => (
            <g key={destination.code}>
              {isHighlighted && <circle className={styles.halo} cx={geometry.x} cy={geometry.y} r={16} />}
              <circle
                className={clsx(styles.dot, isVisible && styles.dotVisible)}
                cx={geometry.x}
                cy={geometry.y}
                r={isHighlighted ? 7 : isVisible ? 5 : 3.5}
              />
            </g>
          ))}
          <circle className={styles.originHalo} cx={MAP_CENTER} cy={MAP_CENTER} r={14} />
          <circle className={styles.origin} cx={MAP_CENTER} cy={MAP_CENTER} r={6} />
        </svg>

        {RING_HOURS.map((hours) => (
          <span
            key={hours}
            className={styles.ringLabel}
            style={{ left: `${ringLabelPercent(hours)}%` }}
            aria-hidden="true"
          >
            {hours}h
          </span>
        ))}
        {routes.map(({ destination, geometry, isVisible, isHighlighted }) => (
          <span
            key={destination.code}
            className={clsx(
              styles.label,
              LABEL_SIDE_CLASS[destination.labelSide],
              isVisible ? styles.labelVisible : styles.labelDim,
              isHighlighted && styles.labelHighlighted,
            )}
            style={{ left: `${geometry.leftPercent}%`, top: `${geometry.topPercent}%` }}
            aria-hidden="true"
          >
            {destination.code}
          </span>
        ))}
        <span className={styles.originLabel} aria-hidden="true">
          MNL
        </span>
      </div>
      <figcaption className={styles.caption}>
        <span>{caption}</span>
        <span className={styles.note} aria-live="polite">
          <span className={styles.noteDot} aria-hidden="true" />
          {note}
        </span>
      </figcaption>
    </figure>
  );
}

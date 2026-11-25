import type { Destination } from '@/types/destination';

/** The route map is drawn in a square view box with Manila at the centre. */
export const MAP_SIZE = 560;
export const MAP_CENTER = MAP_SIZE / 2;

/** Hours marked by the rings. */
export const RING_HOURS = [2, 4, 6, 8] as const;

/** Distance from Manila for a flight time; 20 units of padding keep short hops off the centre dot. */
export function radiusForMinutes(minutes: number): number {
  return 20 + minutes * 0.47;
}

export interface RouteGeometry {
  x: number;
  y: number;
  /** A gentle arc from Manila to the destination. */
  path: string;
  /** Position as a percentage of the map, for HTML labels that stay crisp at any size. */
  leftPercent: number;
  topPercent: number;
}

const toPercent = (value: number) => Number(((value / MAP_SIZE) * 100).toFixed(2));

export function routeGeometry(destination: Pick<Destination, 'flightMinutes' | 'bearing'>): RouteGeometry {
  const radius = radiusForMinutes(destination.flightMinutes);
  const angle = (destination.bearing * Math.PI) / 180;
  const x = MAP_CENTER + radius * Math.sin(angle);
  const y = MAP_CENTER - radius * Math.cos(angle);

  // Bend the route sideways by 14% of its length, perpendicular to the straight line.
  const midX = (MAP_CENTER + x) / 2;
  const midY = (MAP_CENTER + y) / 2;
  const normalX = -(y - MAP_CENTER);
  const normalY = x - MAP_CENTER;
  const length = Math.hypot(normalX, normalY) || 1;
  const bend = radius * 0.14;
  const controlX = midX + (normalX / length) * bend;
  const controlY = midY + (normalY / length) * bend;

  return {
    x,
    y,
    path: `M${MAP_CENTER} ${MAP_CENTER}Q${controlX.toFixed(1)} ${controlY.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`,
    leftPercent: toPercent(x),
    topPercent: toPercent(y),
  };
}

/** Where a ring's hour label sits, as a percentage from the left edge. */
export function ringLabelPercent(hours: number): number {
  return toPercent(MAP_CENTER + radiusForMinutes(hours * 60));
}

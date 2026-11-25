export type RegionId = 'ph' | 'eastAsia' | 'southeastAsia' | 'oceania';

export interface Destination {
  code: string;
  city: string;
  country: string;
  region: RegionId;
  /** Nonstop flight time from Manila. */
  flightMinutes: number;
  /** Lowest round-trip fare per traveler in the last 24 hours. */
  lowestFare: number;
  bestMonths: string;
  tag: string;
  /** Compass bearing from Manila, used to place the destination on the route map. */
  bearing: number;
  /** Which side of its dot the map label sits on, so labels don't collide. */
  labelSide: 'left' | 'right' | 'below' | 'above';
}

export interface TravelIdea {
  title: string;
  detail: string;
  fromFare: number;
  /** Destination the idea links to. */
  destinationCode: string;
}

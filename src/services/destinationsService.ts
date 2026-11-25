import { DESTINATIONS, TRAVEL_IDEAS } from '@/mocks/destinations';
import type { Destination, TravelIdea } from '@/types/destination';

import { mockRequest } from './mockApi';

export function listDestinations(): Promise<Destination[]> {
  return mockRequest(() => [...DESTINATIONS]);
}

export function listTravelIdeas(): Promise<TravelIdea[]> {
  return mockRequest(() => [...TRAVEL_IDEAS]);
}

import { SAVED_TRAVELERS } from '@/mocks/savedTravelers';
import type { SavedTraveler } from '@/types/traveler';

import { ApiError, mockRequest } from './mockApi';

let travelers: SavedTraveler[] = structuredClone([...SAVED_TRAVELERS]);
let nextId = 1;

export function listSavedTravelers(): Promise<SavedTraveler[]> {
  return mockRequest(() => travelers);
}

export function saveTraveler(traveler: SavedTraveler): Promise<SavedTraveler> {
  return mockRequest(() => {
    const exists = travelers.some((candidate) => candidate.id === traveler.id);
    const saved = exists ? traveler : { ...traveler, id: `trv_new_${nextId++}` };
    travelers = exists
      ? travelers.map((candidate) => (candidate.id === traveler.id ? saved : candidate))
      : [...travelers, saved];
    return saved;
  });
}

export function removeTraveler(id: string): Promise<void> {
  return mockRequest(() => {
    const traveler = travelers.find((candidate) => candidate.id === id);
    if (!traveler) throw new ApiError('not_found', 'That traveler is no longer saved.');
    if (traveler.isAccountHolder) throw new ApiError('forbidden', 'The account holder can’t be removed.');
    travelers = travelers.filter((candidate) => candidate.id !== id);
  });
}

import type { AssistanceRequest, PersonTitle, SeatPreference } from '@/types/traveler';

export const PERSON_TITLES: readonly PersonTitle[] = ['Ms', 'Mr', 'Mx'];

export const COUNTRIES = ['Philippines', 'Japan', 'Singapore', 'United States', 'Other'] as const;

export const PHONE_COUNTRY_CODES = ['PH +63', 'JP +81', 'SG +65', 'US +1'] as const;

export const LOYALTY_PROGRAMS = ['Meridian Miles', 'Pacific Crest Club', 'Halcyon Rewards'] as const;

export const ASSISTANCE_REQUESTS: readonly AssistanceRequest[] = [
  'None',
  'Wheelchair to the gate',
  'Wheelchair to the seat',
  'Visual or hearing support',
  'Travelling with a service animal',
];

export const SEAT_PREFERENCES: readonly SeatPreference[] = ['Window', 'Aisle', 'No preference'];

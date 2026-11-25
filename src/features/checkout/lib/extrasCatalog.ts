import type { IconName } from '@/components/icons';
import type { AddOnId, BagOptionId } from '@/types/checkout';

export interface BagOption {
  id: BagOptionId;
  label: string;
  description: string;
  /** Round-trip price per traveler. */
  price: number;
  /** Shown in summaries, e.g. "23 kg + 23 kg". */
  allowance: string;
}

/** Checked baggage on a Classic fare: one 23 kg bag is included, more can be added. */
export const BAG_OPTIONS: readonly BagOption[] = [
  { id: 'included', label: 'Included only', description: '1 × 23 kg each way', price: 0, allowance: '23 kg' },
  {
    id: 'extra23',
    label: '+1 bag, 23 kg',
    description: '2 × 23 kg each way',
    price: 2400,
    allowance: '23 kg + 23 kg',
  },
  {
    id: 'extra32',
    label: '+1 bag, 32 kg',
    description: '23 kg + 32 kg each way',
    price: 3400,
    allowance: '23 kg + 32 kg',
  },
];

export function bagOptionById(id: BagOptionId): BagOption {
  return BAG_OPTIONS.find((option) => option.id === id) ?? BAG_OPTIONS[0];
}

export interface AddOn {
  id: AddOnId;
  label: string;
  description: string;
  /** For the whole booking (both flights, every traveler). */
  price: number;
  icon: IconName;
  isAvailable: boolean;
}

export const ADD_ONS: readonly AddOn[] = [
  {
    id: 'priority',
    label: 'Priority boarding',
    description: 'Board early and keep your carry-on close. Both flights, both travelers.',
    price: 1400,
    icon: 'zap',
    isAvailable: true,
  },
  {
    id: 'meal',
    label: 'Pre-order a hot meal',
    description: 'Chef-selected Filipino or Japanese menu, served first. Both flights.',
    price: 1920,
    icon: 'utensils',
    isAvailable: true,
  },
  {
    id: 'lounge',
    label: 'Lounge access in Manila',
    description: 'Not available for departures before 09:00 at Terminal 1.',
    price: 1900,
    icon: 'building',
    isAvailable: false,
  },
];

/** Vela Protect travel cover, per traveler, for every flight on the booking. */
export const PROTECTION_PRICE_PER_TRAVELER = 645;

export const PROTECTION_COVERAGE = [
  'Cancellation for covered reasons, including illness',
  'Emergency medical care while abroad',
  'Delayed or lost baggage reimbursement',
] as const;

export const PROTECTION_LIMITS: ReadonlyArray<{ benefit: string; detail: string; limit: string }> = [
  {
    benefit: 'Trip cancellation or cutting short',
    detail: 'Illness, injury, jury duty, or a close relative’s emergency',
    limit: 'up to ₱60,000',
  },
  {
    benefit: 'Emergency medical and evacuation',
    detail: 'Hospital, doctor and medicine costs abroad',
    limit: 'up to ₱2,500,000',
  },
  { benefit: 'Delayed baggage', detail: 'Essentials if your bag is 12+ hours late', limit: 'up to ₱6,000' },
  { benefit: 'Lost or damaged baggage', detail: 'Per traveler, ₱10,000 per item', limit: 'up to ₱30,000' },
  { benefit: 'Flight delay', detail: 'For each 6 hours of delay', limit: '₱1,500' },
];

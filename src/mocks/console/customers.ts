import type { StatusTone } from '@/components/ui';
import type { CustomerNote, CustomerStatus, CustomerTier, TravelCreditEntry } from '@/types/console/customer';

/** Whole customer base, beyond the recently active accounts the demo lists. */
export const CUSTOMER_BASE_TOTALS = { all: 82_410, gold: 6_912, new: 1_204 };

/** Bookings that open in the console, with what the customer drawer shows for each. */
export const CUSTOMER_BOOKINGS: Readonly<
  Record<
    string,
    { destination: string; summary: string; status: string; tone: StatusTone; isFlown?: boolean }
  >
> = {
  VL3MZ8: {
    destination: 'Singapore',
    summary: 'Sat 10 Oct · 1 traveler',
    status: 'Checked in',
    tone: 'muted',
  },
  VL7Q2K: {
    destination: 'Tokyo Haneda',
    summary: 'Thu 12 Nov · 2 travelers',
    status: 'Ticketed',
    tone: 'success',
  },
  VL4TRB: {
    destination: 'Singapore',
    summary: 'Wed 14 Oct · 1 traveler',
    status: 'Ticketing',
    tone: 'warning',
  },
  VL9XCA: { destination: 'Cebu', summary: 'Thu 3 Dec · 3 travelers', status: 'Ticketed', tone: 'success' },
  VL2MPE: {
    destination: 'Seoul Incheon',
    summary: 'Tue 22 Dec · 2 travelers',
    status: 'Payment failed',
    tone: 'danger',
  },
  VL6HWD: { destination: 'Bangkok', summary: 'Fri 30 Oct · 1 traveler', status: 'Ticketed', tone: 'success' },
  VL8KQN: {
    destination: 'Tokyo Narita',
    summary: 'Wed 18 Nov · 4 travelers',
    status: 'Schedule change',
    tone: 'warning',
  },
  VL1FJS: {
    destination: 'Taipei',
    summary: 'Sat 7 Nov · 2 travelers',
    status: 'Refund requested',
    tone: 'warning',
  },
  VL2WZX: {
    destination: 'Bangkok',
    summary: 'Sun 4 Oct · 2 travelers · flown',
    status: 'Refund requested',
    tone: 'warning',
    isFlown: true,
  },
  VL6TQP: {
    destination: 'Taipei',
    summary: 'Fri 20 Nov · 1 traveler',
    status: 'Refund requested',
    tone: 'warning',
  },
};

export interface CustomerSeed {
  id: string;
  fullName: string;
  maskedEmail: string;
  /** Email and phone, shown only after an audited reveal. */
  fullContact: string;
  phoneLastFour: string;
  tier: CustomerTier;
  trips: number;
  lifetimeValue: number;
  status: CustomerStatus;
  statusNote?: string;
  memberSince: string;
  memberNumber: string;
  tierProgress: { trips: number; tripsForNextTier: number; nextTier: CustomerTier };
  bookingReferences: string[];
  pastTrips: Array<{ destination: string; summary: string }>;
  credits: TravelCreditEntry[];
  notes: CustomerNote[];
  isNewThisWeek: boolean;
}

export const CUSTOMER_SEEDS: readonly CustomerSeed[] = [
  {
    id: 'andrea',
    fullName: 'Andrea Reyes',
    maskedEmail: 'an••••@example.com',
    fullContact: 'andrea.reyes@example.com · +63 917 123 4567',
    phoneLastFour: '4567',
    tier: 'Gold',
    trips: 9,
    lifetimeValue: 312_480,
    status: 'active',
    memberSince: 'Mar 2023',
    memberNumber: 'VL-0042187',
    tierProgress: { trips: 7, tripsForNextTier: 10, nextTier: 'Platinum' },
    bookingReferences: ['VL3MZ8', 'VL7Q2K'],
    pastTrips: [
      { destination: 'Bangkok', summary: 'Jun 2026 · flown' },
      { destination: 'Seoul', summary: 'Feb 2026 · flown' },
    ],
    credits: [
      {
        title: 'Schedule change on MR 441',
        detail: 'Issued 14 Aug 2026 · expires 14 Aug 2027',
        amount: 2450,
      },
    ],
    notes: [
      {
        author: 'Ramon Diaz',
        when: '9 Oct, 00:44',
        text: 'Asked for a visa letter for Miguel (VL7Q2K). Template sent.',
      },
    ],
    isNewThisWeek: false,
  },
  {
    id: 'joseph',
    fullName: 'Joseph Tan',
    maskedEmail: 'jo••••@example.com',
    fullContact: 'joseph.tan@example.com · +63 918 220 1043',
    phoneLastFour: '1043',
    tier: 'Member',
    trips: 1,
    lifetimeValue: 8_960,
    status: 'active',
    memberSince: 'Oct 2026',
    memberNumber: 'VL-0091552',
    tierProgress: { trips: 1, tripsForNextTier: 3, nextTier: 'Silver' },
    bookingReferences: ['VL4TRB'],
    pastTrips: [],
    credits: [],
    notes: [],
    isNewThisWeek: true,
  },
  {
    id: 'hana',
    fullName: 'Hana Watanabe',
    maskedEmail: 'ha••••@example.com',
    fullContact: 'hana.w@example.com · +81 90 1234 5678',
    phoneLastFour: '5678',
    tier: 'Platinum',
    trips: 24,
    lifetimeValue: 1_182_300,
    status: 'active',
    memberSince: 'Jun 2021',
    memberNumber: 'VL-0003318',
    tierProgress: { trips: 24, tripsForNextTier: 24, nextTier: 'Platinum' },
    bookingReferences: ['VL9XCA'],
    pastTrips: [
      { destination: 'Manila', summary: 'Aug 2026 · flown' },
      { destination: 'Singapore', summary: 'Jul 2026 · flown' },
    ],
    credits: [
      { title: 'Platinum anniversary', detail: 'Issued 1 Jun 2026 · expires 1 Jun 2027', amount: 5000 },
    ],
    notes: [],
    isNewThisWeek: false,
  },
  {
    id: 'carlo',
    fullName: 'Carlo Mendoza',
    maskedEmail: 'ca••••@example.com',
    fullContact: 'carlo.m@example.com · +63 917 555 0199',
    phoneLastFour: '0199',
    tier: 'Silver',
    trips: 4,
    lifetimeValue: 86_200,
    status: 'flagged',
    statusNote: '3 declined cards in 24 hours on VL2MPE. Bookings stay on hold until payment clears.',
    memberSince: 'Jan 2024',
    memberNumber: 'VL-0061230',
    tierProgress: { trips: 4, tripsForNextTier: 7, nextTier: 'Gold' },
    bookingReferences: ['VL2MPE'],
    pastTrips: [{ destination: 'Cebu', summary: 'Apr 2026 · flown' }],
    credits: [],
    notes: [
      { author: 'System', when: '9 Oct, 00:20', text: 'Flagged automatically: 3 card declines in 24 hours.' },
    ],
    isNewThisWeek: false,
  },
  {
    id: 'priya',
    fullName: 'Priya Raman',
    maskedEmail: 'pr••••@example.com',
    fullContact: 'priya.raman@example.com · +65 8123 4567',
    phoneLastFour: '4567',
    tier: 'Silver',
    trips: 5,
    lifetimeValue: 64_900,
    status: 'active',
    memberSince: 'Aug 2024',
    memberNumber: 'VL-0070114',
    tierProgress: { trips: 5, tripsForNextTier: 7, nextTier: 'Gold' },
    bookingReferences: ['VL6HWD'],
    pastTrips: [{ destination: 'Tokyo', summary: 'May 2026 · flown' }],
    credits: [],
    notes: [],
    isNewThisWeek: false,
  },
  {
    id: 'marco',
    fullName: 'Marco Villanueva',
    maskedEmail: 'ma••••@example.com',
    fullContact: 'marco.v@example.com · +63 932 410 8820',
    phoneLastFour: '8820',
    tier: 'Gold',
    trips: 12,
    lifetimeValue: 402_350,
    status: 'active',
    memberSince: 'Feb 2022',
    memberNumber: 'VL-0018806',
    tierProgress: { trips: 12, tripsForNextTier: 15, nextTier: 'Platinum' },
    bookingReferences: ['VL8KQN'],
    pastTrips: [
      { destination: 'Seoul', summary: 'Jul 2026 · flown' },
      { destination: 'Singapore', summary: 'Mar 2026 · flown' },
    ],
    credits: [],
    notes: [
      {
        author: 'Ramon Diaz',
        when: '8 Oct, 09:41',
        text: 'Kestrel retimed KS 388 by 5 hours; refund for all four travelers requested.',
      },
    ],
    isNewThisWeek: false,
  },
  {
    id: 'sophie',
    fullName: 'Sophie Laurent',
    maskedEmail: 'so••••@example.com',
    fullContact: 'sophie.l@example.com · +33 6 12 34 56 78',
    phoneLastFour: '5678',
    tier: 'Member',
    trips: 2,
    lifetimeValue: 29_920,
    status: 'active',
    memberSince: 'Sep 2026',
    memberNumber: 'VL-0089901',
    tierProgress: { trips: 2, tripsForNextTier: 3, nextTier: 'Silver' },
    bookingReferences: ['VL1FJS'],
    pastTrips: [],
    credits: [],
    notes: [],
    isNewThisWeek: true,
  },
  {
    id: 'ken',
    fullName: 'Ken Aquino',
    maskedEmail: 'ke••••@example.com',
    fullContact: 'ken.aquino@example.com · +63 919 402 7715',
    phoneLastFour: '7715',
    tier: 'Member',
    trips: 3,
    lifetimeValue: 27_410,
    status: 'flagged',
    statusNote: '3 duplicate bookings in 30 days. Check before approving the refund on VL6TQP.',
    memberSince: 'Jul 2025',
    memberNumber: 'VL-0081277',
    tierProgress: { trips: 3, tripsForNextTier: 3, nextTier: 'Silver' },
    bookingReferences: ['VL6TQP'],
    pastTrips: [{ destination: 'Davao', summary: 'Sep 2026 · flown' }],
    credits: [],
    notes: [],
    isNewThisWeek: false,
  },
  {
    id: 'lara',
    fullName: 'Lara Santos',
    maskedEmail: 'la••••@example.com',
    fullContact: 'lara.santos@example.com · +63 945 300 2210',
    phoneLastFour: '2210',
    tier: 'Member',
    trips: 3,
    lifetimeValue: 41_600,
    status: 'suspended',
    statusNote: 'Suspended 2 Oct by Ian Cruz after a chargeback on a flown trip.',
    memberSince: 'May 2025',
    memberNumber: 'VL-0077342',
    tierProgress: { trips: 3, tripsForNextTier: 3, nextTier: 'Silver' },
    bookingReferences: ['VL2WZX'],
    pastTrips: [],
    credits: [],
    notes: [
      {
        author: 'Ian Cruz',
        when: '2 Oct, 16:05',
        text: 'Chargeback filed on a trip she flew. Suspended pending the dispute.',
      },
    ],
    isNewThisWeek: false,
  },
];

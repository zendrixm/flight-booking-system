import type { ConsoleNavCounts, StaffMember, StaffSessionDetails, Workspace } from '@/types/console/staff';

export const DEMO_STAFF_MEMBER: StaffMember = {
  id: 'staff_lea',
  fullName: 'Lea Navarro',
  email: 'lea.navarro@vela.travel',
  jobTitle: 'Operations manager',
  accessLevel: 'Admin',
};

export const DEMO_STAFF_SESSION: StaffSessionDetails = {
  signedInAt: '00:12 PHT',
  location: 'Manila, PH',
  ipAddress: '112.198.xx.xx',
};

export const WORKSPACES: readonly Workspace[] = [
  { code: 'PH', name: 'Vela Philippines', description: 'PHP · Asia/Manila' },
  { code: 'SG', name: 'Vela Singapore', description: 'SGD · Asia/Singapore' },
  { code: 'JP', name: 'Vela Japan', description: 'JPY · Asia/Tokyo' },
  { code: 'ALL', name: 'All markets', description: 'Combined view · PHP' },
];

export const NAV_COUNTS: ConsoleNavCounts = {
  bookingsNeedingAction: 18,
  flightDisruptions: 3,
  refundsToReview: 12,
};

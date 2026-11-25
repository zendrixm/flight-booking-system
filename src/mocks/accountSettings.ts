import type { AccountSettings } from '@/types/accountSettings';

export const ACCOUNT_SETTINGS: AccountSettings = {
  profile: { dateOfBirth: '1991-03-14', memberSince: 2022, pendingEmail: null },
  searchDefaults: { homeAirport: 'MNL', cabin: 'Economy', seat: 'Window' },
  security: {
    passwordNote: 'Last changed 14 Jun 2026',
    isTwoStepOn: true,
    authenticatorSetUpOn: '2026-06-14',
    backupCodesLeft: 8,
  },
  devices: [
    {
      id: 'dev_mac',
      kind: 'laptop',
      name: 'Chrome on macOS',
      detail: 'Makati City, Philippines · Active now',
      isCurrent: true,
    },
    {
      id: 'dev_iphone',
      kind: 'phone',
      name: 'Vela app on iPhone',
      detail: 'Makati City, Philippines · 2 hours ago',
      isCurrent: false,
    },
    {
      id: 'dev_windows',
      kind: 'laptop',
      name: 'Edge on Windows',
      detail: 'Cebu City, Philippines · 3 Oct 2026',
      isCurrent: false,
    },
  ],
  emails: { tripUpdates: true, deals: true, partnerOffers: false },
  isDataExportPending: false,
};

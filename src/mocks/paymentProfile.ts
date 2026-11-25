import type { BankAccountOption, PaymentProfile } from '@/types/payment';
import type { TravelCredit } from '@/types/travelCredit';

export const PAYMENT_PROFILE: PaymentProfile = {
  cards: [
    {
      id: 'card_4821',
      last4: '4821',
      kind: 'Credit',
      holderName: 'ANDREA L REYES',
      expiry: '08/29',
      usageNote: 'Added Mar 2023 · used 9 times',
    },
    {
      id: 'card_3318',
      last4: '3318',
      kind: 'Debit',
      holderName: 'ANDREA L REYES',
      expiry: '11/28',
      usageNote: 'Added Jan 2025 · used twice',
    },
    {
      id: 'card_0937',
      last4: '0937',
      kind: 'Credit',
      holderName: 'ANDREA REYES',
      expiry: '05/26',
      usageNote: 'Expired in May 2026',
    },
  ],
  defaultCardId: 'card_4821',
  wallet: { mobileNumber: '+63 917 482 4567', linkedOn: '2026-03-12' },
  bankAccount: null,
  billingAddress: {
    line1: 'Unit 12B, 88 Rizal Avenue',
    city: 'Makati City',
    postalCode: '1200',
    country: 'Philippines',
  },
  company: null,
  travelCredit: 2450,
};

/** What a bank returns once the customer signs in to link an account. */
export const BANK_ACCOUNTS_FOR_LINKING: readonly BankAccountOption[] = [
  { id: 'acct_savings', label: 'Savings •••• 2290', holderName: 'Andrea Lim Reyes' },
  { id: 'acct_checking', label: 'Checking •••• 7731', holderName: 'Andrea Lim Reyes' },
];

export const TRAVEL_CREDIT: TravelCredit = {
  balance: 2450,
  lots: [
    {
      id: 'lot_addon',
      label: 'Unused add-on refunded',
      detail: 'Booking VL2KQB',
      amount: 950,
      expiresOn: '2027-03-31',
    },
    {
      id: 'lot_goodwill',
      label: 'Goodwill credit',
      detail: 'Delayed flight MR 214 · ₱500 already used',
      amount: 1500,
      expiresOn: '2027-08-02',
    },
  ],
  activity: [
    {
      id: 'act_used',
      label: 'Used at checkout',
      detail: 'Booking VL3MZ8 · Singapore',
      amount: -500,
      date: '2026-09-18',
    },
    {
      id: 'act_goodwill',
      label: 'Goodwill credit',
      detail: 'Delayed flight MR 214',
      amount: 2000,
      date: '2026-08-02',
    },
    {
      id: 'act_addon',
      label: 'Unused add-on refunded',
      detail: 'Booking VL2KQB',
      amount: 950,
      date: '2026-06-21',
    },
  ],
};

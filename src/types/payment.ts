import type { IsoDate } from '@/lib/date';

export type CardKind = 'Credit' | 'Debit';

export interface SavedCard {
  id: string;
  last4: string;
  kind: CardKind;
  holderName: string;
  /** "08/29" */
  expiry: string;
  /** "Added Mar 2023 · used 9 times" */
  usageNote: string;
}

export interface LinkedWallet {
  /** "+63 917 482 4567" */
  mobileNumber: string;
  linkedOn: IsoDate;
}

export interface LinkedBankAccount {
  bankId: string;
  bankName: string;
  /** "Savings •••• 2290" */
  accountLabel: string;
  accountName: string;
  linkedOn: IsoDate;
}

/** An account offered by the bank during linking; the bank never shares more than this. */
export interface BankAccountOption {
  id: string;
  /** "Savings •••• 2290" */
  label: string;
  holderName: string;
}

export interface BillingAddress {
  line1: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface CompanyBillingDetails {
  name: string;
  tin: string;
  address: string;
}

export interface PaymentProfile {
  cards: SavedCard[];
  defaultCardId: string | null;
  wallet: LinkedWallet | null;
  bankAccount: LinkedBankAccount | null;
  billingAddress: BillingAddress;
  company: CompanyBillingDetails | null;
  travelCredit: number;
}

export type PaymentMethodKind = 'card' | 'wallet' | 'bank';

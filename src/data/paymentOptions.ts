export interface WalletProvider {
  id: string;
  name: string;
  monogram: string;
  approveHint: string;
}

export const WALLET_PROVIDERS: readonly WalletProvider[] = [
  { id: 'gcash', name: 'GCash', monogram: 'G', approveHint: 'Approve in the GCash app' },
  { id: 'maya', name: 'Maya', monogram: 'M', approveHint: 'Approve in the Maya app' },
  { id: 'grabpay', name: 'GrabPay', monogram: 'GP', approveHint: 'Approve in the Grab app' },
  { id: 'shopeepay', name: 'ShopeePay', monogram: 'SP', approveHint: 'Approve in the Shopee app' },
];

export interface OnlineBank {
  id: string;
  name: string;
}

export const ONLINE_BANKS: readonly OnlineBank[] = [
  { id: 'bdo', name: 'BDO' },
  { id: 'bpi', name: 'BPI' },
  { id: 'metrobank', name: 'Metrobank' },
  { id: 'unionbank', name: 'UnionBank' },
  { id: 'landbank', name: 'Landbank' },
  { id: 'security', name: 'Security Bank' },
];

/** Banks that support linking an account for direct debits, as shown in Payment methods. */
export interface LinkableBank {
  id: string;
  name: string;
  /** "Bayview Trust" for buttons such as "Authorise with Bayview Trust". */
  shortName: string;
  monogram: string;
  note: string;
}

export const LINKABLE_BANKS: readonly LinkableBank[] = [
  {
    id: 'bayview',
    name: 'Bayview Trust Bank',
    shortName: 'Bayview Trust',
    monogram: 'BT',
    note: 'Instant · savings and checking',
  },
  {
    id: 'islas',
    name: 'Islas Savings Bank',
    shortName: 'Islas Savings',
    monogram: 'IS',
    note: 'Instant · savings',
  },
  {
    id: 'capitol',
    name: 'Capitol Commerce Bank',
    shortName: 'Capitol Commerce',
    monogram: 'CC',
    note: 'Instant · savings and checking',
  },
  {
    id: 'mindanao',
    name: 'Mindanao Union Bank',
    shortName: 'Mindanao Union',
    monogram: 'MU',
    note: 'Takes 1 working day to verify',
  },
  {
    id: 'northpoint',
    name: 'Northpoint Digital Bank',
    shortName: 'Northpoint Digital',
    monogram: 'ND',
    note: 'Instant · digital accounts',
  },
];

export const BILLING_COUNTRIES = ['Philippines', 'Japan', 'Singapore', 'United States', 'Other'] as const;

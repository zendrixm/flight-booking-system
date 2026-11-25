import type {
  AirlineConnection,
  PaymentProvider,
  PayoutForecast,
  PayoutSchedule,
  SettingsAuditEntry,
  Webhook,
  WorkspaceSettings,
} from '@/types/console/settings';

/** The demo's network and clock. */
export const YOUR_IP_ADDRESS = '203.0.113.48';
export const ACTIVE_STAFF_COUNT = 6;
export const BREAK_GLASS_ADMIN = 'Ian Cruz';
export const SETTLEMENT_APPROVER = 'Bea Santos';

export const SAVED_SETTINGS: WorkspaceSettings = {
  general: {
    workspaceName: 'Vela Philippines',
    legalEntity: 'Vela Travel, Inc.',
    market: 'PH',
    currency: 'PHP',
    timeZone: 'Asia/Manila',
    supportEmail: 'support@vela.travel',
    supportPhone: '+63 2 8835 2000',
    supportHours: '24h',
    logo: 'primary',
  },
  payments: {
    methods: { card: true, wallet: true, bank: true, cash: false },
    payoutSchedule: 'weekly',
    minimumPayout: 10_000,
    autoApproveRefunds: true,
    autoApproveLimit: 5_000,
    refundTargetHours: '72',
    refundTo: 'original',
  },
  notifications: {
    alerts: {
      disruption: { email: true, sms: true, inApp: true },
      refundSla: { email: true, sms: false, inApp: true },
      promoBudget: { email: true, sms: false, inApp: true },
      staffInvite: { email: true, sms: false, inApp: false },
      failedPayout: { email: true, sms: true, inApp: true },
    },
    quietHours: true,
    quietFrom: '22:00',
    quietUntil: '07:00',
    disruptionsBreakThrough: true,
  },
  security: {
    requireTwoStep: true,
    requireSso: false,
    sessionTimeoutMinutes: '30',
    enforceIpAllowlist: true,
    ipAllowlist: [
      { cidr: '203.0.113.0/24', label: 'Makati office', addedBy: 'Added by Ian Cruz · 3 Mar 2026' },
      { cidr: '198.51.100.24', label: 'Cebu support hub', addedBy: 'Added by Ian Cruz · 3 Mar 2026' },
      { cidr: '192.0.2.0/28', label: 'Staff VPN egress', addedBy: 'Added by Lea Navarro · 18 Aug 2026' },
    ],
    minPasswordLength: '12',
    passwordExpiry: 'never',
    blockReusedPasswords: true,
    rejectBreachedPasswords: true,
  },
};

export const PAYMENT_PROVIDERS: readonly PaymentProvider[] = [
  {
    id: 'card',
    name: 'Card acquirer',
    description: 'Visa, Mastercard, JCB and American Express · 3-D Secure',
    health: { label: 'Operational', tone: 'success' },
    fee: '2.4% + ₱15',
    successRate: '97.8%',
  },
  {
    id: 'wallet',
    name: 'E-wallet gateway',
    description: 'Mobile wallets and QR Ph',
    health: { label: 'Operational', tone: 'success' },
    fee: '1.8%',
    successRate: '99.1%',
  },
  {
    id: 'bank',
    name: 'Online banking',
    description: 'Direct debit from 9 local banks · 2 in maintenance until 06:00',
    health: { label: 'Degraded', tone: 'warning' },
    fee: '₱25 per payment',
    successRate: '91.4%',
  },
  {
    id: 'cash',
    name: 'Over-the-counter cash',
    description: 'Pay at partner outlets within 24 hours of booking',
    health: { label: 'Operational', tone: 'success' },
    fee: '₱30 per payment',
    successRate: '—',
  },
];

export const PAYOUT_FORECASTS: Record<PayoutSchedule, PayoutForecast> = {
  daily: {
    description: 'Every business day at 17:00 PHT, for payments settled the day before',
    amount: '₱6,412,880.40',
    when: 'Today, Fri 9 Oct at 17:00',
  },
  weekly: {
    description: 'Every Monday at 09:00 PHT, for the previous Monday to Sunday',
    amount: '₱44,870,215.65',
    when: 'Mon 12 Oct at 09:00',
  },
  monthly: {
    description: 'First business day of the month at 09:00 PHT',
    amount: '₱192,334,960.10',
    when: 'Mon 2 Nov at 09:00',
  },
};

export const AIRLINE_CONNECTIONS: readonly AirlineConnection[] = [
  {
    code: 'MR',
    name: 'Meridian Air',
    protocol: 'NDC 21.3 · fares, seats and bags',
    status: 'connected',
    lastSync: '2 min ago',
    note: 'Healthy · median response 420 ms',
    noteTone: 'neutral',
  },
  {
    code: 'PQ',
    name: 'Pacific Crest',
    protocol: 'NDC 18.2 · fares and bags',
    status: 'connected',
    lastSync: '4 min ago',
    note: 'Healthy · median response 560 ms',
    noteTone: 'neutral',
  },
  {
    code: 'HC',
    name: 'Halcyon',
    protocol: 'GDS · fares and schedules',
    status: 'degraded',
    lastSync: '11 min ago',
    note: 'Slow responses · median 2.8 s over the last hour',
    noteTone: 'neutral',
  },
  {
    code: 'SJ',
    name: 'Solenne',
    protocol: 'NDC 21.3 · fares and seats',
    status: 'connected',
    lastSync: '1 min ago',
    note: 'Healthy · median response 390 ms',
    noteTone: 'neutral',
  },
  {
    code: 'KS',
    name: 'Kestrel Airways',
    protocol: 'Direct connect · fares and schedules',
    status: 'disconnected',
    lastSync: 'Tue 6 Oct, 23:14',
    note: 'Credentials expired on Tue 6 Oct',
    noteTone: 'danger',
  },
];

/** What a connection test reports for each airline in the demo. */
export const CONNECTION_TESTS: Readonly<
  Record<string, { outcome: 'success' | 'warning' | 'danger'; message: string; note: string }>
> = {
  MR: {
    outcome: 'success',
    message: 'Meridian Air connection OK · responded in 412 ms',
    note: 'Tested just now · 412 ms',
  },
  PQ: {
    outcome: 'success',
    message: 'Pacific Crest connection OK · responded in 538 ms',
    note: 'Tested just now · 538 ms',
  },
  HC: {
    outcome: 'warning',
    message: 'Halcyon is still slow · responded in 2.6 s (target 1.5 s)',
    note: 'Tested just now · 2.6 s, still above the 1.5 s target',
  },
  SJ: {
    outcome: 'success',
    message: 'Solenne connection OK · responded in 389 ms',
    note: 'Tested just now · 389 ms',
  },
  KS: {
    outcome: 'danger',
    message: 'Kestrel Airways rejected the credentials (401) · ask Kestrel to reissue access',
    note: 'Test failed just now · 401 Unauthorized',
  },
};

export interface ApiKeySeed {
  id: string;
  name: string;
  scope: 'Full access' | 'Read-only';
  secret: string;
  detail: string;
  usedBy: string;
}

export const API_KEYS: readonly ApiKeySeed[] = [
  {
    id: 'prod',
    name: 'Production server',
    scope: 'Full access',
    secret: 'vela_live_8Qe2Lm4Rt7WzN5pX3f9a',
    detail: 'Created 12 Mar 2026 by Ian Cruz · last used 2 min ago',
    usedBy: 'Used by Vela’s booking and payment services',
  },
  {
    id: 'report',
    name: 'Reporting',
    scope: 'Read-only',
    secret: 'vela_live_Hc5Tn0Vb2Kq8Ys6G7c21',
    detail: 'Created Tue 6 Oct by Ian Cruz · last used Thu 8 Oct, 23:00',
    usedBy: 'Used by the nightly reporting export',
  },
];

/** Secrets handed out when keys are rotated in the demo, in order. */
export const ROTATED_SECRETS = [
  'vela_live_Rm3Jx9Fa1Pw6Ze4Lub84e',
  'vela_live_Ty7Gc2Nd5Qs8Hb1Vk9e06',
  'vela_live_Pa4Wq7Lc0Xe3Nj8Df51d',
  'vela_live_Zu2Hk6Bm9Rv1Tc5Gy7a3',
];

export const KEY_RETIREMENT_TIMES = {
  now: 'stopped working just now',
  '24h': 'stops working Sat 10 Oct, 00:58',
  '7d': 'stops working Fri 16 Oct, 00:58',
} as const;

export const WEBHOOKS: readonly Webhook[] = [
  {
    id: 'h1',
    url: 'https://ops.vela.travel/hooks/disruptions',
    events: ['flight.disrupted', 'flight.cancelled'],
    status: 'active',
    detail: 'Last delivery 6 min ago · 200 OK',
  },
  {
    id: 'h2',
    url: 'https://finance.vela.travel/hooks/refunds',
    events: ['refund.approved', 'payout.failed'],
    status: 'active',
    detail: 'Last delivery 38 min ago · 200 OK',
  },
  {
    id: 'h3',
    url: 'https://partners.example.com/vela/bookings',
    events: ['booking.ticketed'],
    status: 'failing',
    detail: '3 failed deliveries since 00:10 · 503 Service Unavailable',
  },
];

export const WEBHOOK_EVENTS = [
  { name: 'booking.ticketed', description: 'A booking is paid and ticketed' },
  { name: 'booking.cancelled', description: 'A booking is cancelled by the customer or airline' },
  { name: 'flight.disrupted', description: 'A delay, cancellation or schedule change' },
  { name: 'refund.approved', description: 'A refund is approved, manually or automatically' },
  { name: 'payout.failed', description: 'A settlement payout is rejected by the bank' },
] as const;

export const SETTINGS_AUDIT: readonly SettingsAuditEntry[] = [
  {
    id: 's8',
    time: 'Today, 00:58',
    actor: 'Lea Navarro',
    action: 'Revealed customer phone number',
    target: 'Booking VL7Q2K',
  },
  {
    id: 's7',
    time: 'Today, 00:46',
    actor: 'Ian Cruz',
    action: 'Changed role to Finance',
    target: 'Bea Santos',
  },
  {
    id: 's6',
    time: 'Today, 00:31',
    actor: 'Ramon Diaz',
    action: 'Signed in from a new device',
    target: 'Manila, PH',
  },
  {
    id: 's5',
    time: 'Thu 8 Oct, 22:10',
    actor: 'System',
    action: 'Blocked 3 failed sign-ins',
    target: 'paolo.reyes@vela.travel',
  },
  {
    id: 's4',
    time: 'Wed 7 Oct, 15:20',
    actor: 'Ian Cruz',
    action: 'Invited staff member as Support agent',
    target: 'mika.tan@vela.travel',
  },
  {
    id: 's3',
    time: 'Tue 6 Oct, 23:14',
    actor: 'System',
    action: 'Airline credentials expired',
    target: 'Kestrel Airways',
  },
  {
    id: 's2',
    time: 'Tue 6 Oct, 11:05',
    actor: 'Ian Cruz',
    action: 'Created API key',
    target: 'Reporting (read-only)',
  },
  {
    id: 's1',
    time: 'Wed 2 Sep, 09:30',
    actor: 'Ian Cruz',
    action: 'Deactivated staff member',
    target: 'Paolo Reyes',
  },
];

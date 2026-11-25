import type { StatusTone } from '@/components/ui';

export type SettingsTab = 'general' | 'payments' | 'notifications' | 'integrations' | 'security';
/** Tabs whose fields are edited together and saved with one button. Integrations act immediately. */
export type SettingsSection = Exclude<SettingsTab, 'integrations'>;

export type MarketCode = 'PH' | 'SG' | 'JP';
export type CurrencyCode = 'PHP' | 'SGD' | 'JPY' | 'USD';
export type TimeZone = 'Asia/Manila' | 'Asia/Singapore' | 'Asia/Tokyo';
export type SupportHours = '24h' | 'day' | 'week';
export type LogoVariant = 'primary' | 'mono' | 'reversed';

export interface GeneralSettings {
  workspaceName: string;
  legalEntity: string;
  market: MarketCode;
  currency: CurrencyCode;
  timeZone: TimeZone;
  supportEmail: string;
  supportPhone: string;
  supportHours: SupportHours;
  logo: LogoVariant;
}

export type PaymentMethodId = 'card' | 'wallet' | 'bank' | 'cash';
export type PayoutSchedule = 'daily' | 'weekly' | 'monthly';

export interface PaymentSettings {
  /** Which methods are offered at checkout. */
  methods: Record<PaymentMethodId, boolean>;
  payoutSchedule: PayoutSchedule;
  /** Pesos; smaller balances roll over. */
  minimumPayout: number;
  autoApproveRefunds: boolean;
  /** Pesos per booking. */
  autoApproveLimit: number;
  refundTargetHours: '48' | '72' | '120';
  refundTo: 'original' | 'credit';
}

export type AlertEventId = 'disruption' | 'refundSla' | 'promoBudget' | 'staffInvite' | 'failedPayout';
export type AlertChannel = 'email' | 'sms' | 'inApp';

export interface NotificationSettings {
  alerts: Record<AlertEventId, Record<AlertChannel, boolean>>;
  quietHours: boolean;
  quietFrom: string;
  quietUntil: string;
  /** Disruption SMS still arrive during quiet hours. */
  disruptionsBreakThrough: boolean;
}

export interface AllowedNetwork {
  /** "203.0.113.0/24" or a single address. */
  cidr: string;
  label: string;
  /** "Added by Ian Cruz · 3 Mar 2026" */
  addedBy: string;
}

export interface SecuritySettings {
  requireTwoStep: boolean;
  requireSso: boolean;
  sessionTimeoutMinutes: '15' | '30' | '60' | '240' | '480';
  enforceIpAllowlist: boolean;
  ipAllowlist: AllowedNetwork[];
  minPasswordLength: '10' | '12' | '14' | '16';
  passwordExpiry: 'never' | '90' | '180';
  blockReusedPasswords: boolean;
  rejectBreachedPasswords: boolean;
}

/** Everything saved with "Save changes". */
export interface WorkspaceSettings {
  general: GeneralSettings;
  payments: PaymentSettings;
  notifications: NotificationSettings;
  security: SecuritySettings;
}

export interface PaymentProvider {
  id: PaymentMethodId;
  name: string;
  description: string;
  health: { label: string; tone: StatusTone };
  fee: string;
  /** Payments that succeeded in the last 24 hours, "97.8%". */
  successRate: string;
}

export interface PayoutForecast {
  description: string;
  /** "₱44,870,215.65" */
  amount: string;
  /** "Mon 12 Oct at 09:00" */
  when: string;
}

export interface SettlementAccount {
  name: string;
  /** "Vela Travel, Inc. · PHP · verified 14 Jan 2026 by Bea Santos" */
  detail: string;
  approver: string;
  isChangeRequested: boolean;
}

export type ConnectionStatus = 'connected' | 'degraded' | 'disconnected';

export interface AirlineConnection {
  code: string;
  name: string;
  /** "NDC 21.3 · fares, seats and bags" */
  protocol: string;
  status: ConnectionStatus;
  lastSync: string;
  note: string;
  /** How the note should read: a problem, good news, or plain detail. */
  noteTone: 'neutral' | 'success' | 'danger' | 'warning';
}

export interface ApiKey {
  id: string;
  name: string;
  scope: 'Full access' | 'Read-only';
  /** First 10 and last 4 characters, e.g. "vela_live_••••••••3f9a". */
  maskedKey: string;
  detail: string;
  /** Which services depend on it, shown before revoking. */
  usage: string;
  isRevoked: boolean;
}

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  status: 'active' | 'failing';
  detail: string;
}

export interface SettingsAuditEntry {
  id: string;
  time: string;
  actor: string;
  action: string;
  target: string;
}

export interface SettingsOverview {
  settings: WorkspaceSettings;
  /** "Last saved by Ian Cruz · Tue 6 Oct, 11:05" */
  lastSaved: string;
  logoUpdated: string;
  providers: PaymentProvider[];
  payoutForecasts: Record<PayoutSchedule, PayoutForecast>;
  settlementAccount: SettlementAccount;
  airlines: AirlineConnection[];
  apiKeys: ApiKey[];
  webhooks: Webhook[];
  webhookEvents: ReadonlyArray<{ name: string; description: string }>;
  audit: SettingsAuditEntry[];
  /** The network the signed-in staff member is on. */
  yourIpAddress: string;
  activeStaffCount: number;
  /** The Admin who can still sign in with a password when SSO is required. */
  breakGlassAdmin: string;
}

export interface SettingsResult {
  overview: SettingsOverview;
  message: string;
  /** How the confirmation should read. */
  tone?: 'success' | 'warning' | 'error';
}

export type KeyRetirement = 'now' | '24h' | '7d';

export interface AirlineCredentials {
  clientId: string;
  clientSecret: string;
  environment: 'production' | 'sandbox';
}

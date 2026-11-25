import { formatNumber } from '@/lib/format';
import type {
  AlertChannel,
  AlertEventId,
  CurrencyCode,
  LogoVariant,
  MarketCode,
  PayoutSchedule,
  SecuritySettings,
  SupportHours,
  TimeZone,
} from '@/types/console/settings';

import { parsePesos, type PaymentsDraft } from './settingsForm';

/** Options and the plain-language notes under each setting. */

export const MARKETS: ReadonlyArray<{ value: MarketCode; label: string; help: string }> = [
  {
    value: 'PH',
    label: 'Philippines',
    help: 'Sets the home page, search defaults and tax rules · 12% VAT on service fees',
  },
  {
    value: 'SG',
    label: 'Singapore',
    help: 'Sets the home page, search defaults and tax rules · 9% GST on service fees',
  },
  {
    value: 'JP',
    label: 'Japan',
    help: 'Sets the home page, search defaults and tax rules · 10% consumption tax',
  },
];

export const CURRENCIES: ReadonlyArray<{ value: CurrencyCode; label: string; sample: string }> = [
  { value: 'PHP', label: 'PHP · Philippine peso (₱)', sample: '₱39,862' },
  { value: 'SGD', label: 'SGD · Singapore dollar (S$)', sample: 'S$957' },
  { value: 'JPY', label: 'JPY · Japanese yen (¥)', sample: '¥106,480' },
  { value: 'USD', label: 'USD · US dollar ($)', sample: '$712' },
];

export const TIME_ZONES: ReadonlyArray<{ value: TimeZone; label: string; now: string; short: string }> = [
  { value: 'Asia/Manila', label: 'Asia/Manila (GMT+8)', now: 'Fri 9 Oct, 00:58', short: 'Manila time' },
  {
    value: 'Asia/Singapore',
    label: 'Asia/Singapore (GMT+8)',
    now: 'Fri 9 Oct, 00:58',
    short: 'Singapore time',
  },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (GMT+9)', now: 'Fri 9 Oct, 01:58', short: 'Tokyo time' },
];

export const SUPPORT_HOURS: ReadonlyArray<{ value: SupportHours; label: string; help: string }> = [
  { value: '24h', label: '24 hours, every day', help: 'Shown as “Call us any time”' },
  {
    value: 'day',
    label: '06:00–22:00, every day',
    help: 'Calls outside these hours go to voicemail and are returned by 09:00',
  },
  {
    value: 'week',
    label: 'Weekdays, 08:00–20:00',
    help: 'Weekend callers are asked to use chat or email instead',
  },
];

export const helpFor = <T extends string>(options: ReadonlyArray<{ value: T; help: string }>, value: T) =>
  options.find((option) => option.value === value)?.help ?? '';

export function currencyHelp(currency: CurrencyCode): string {
  const sample = CURRENCIES.find((option) => option.value === currency)?.sample ?? '';
  return `Reports and checkout show amounts like ${sample}${currency === 'PHP' ? '' : ' · customers can still pay in PHP'}`;
}

export function timeZoneHelp(timeZone: TimeZone): string {
  const zone = TIME_ZONES.find((option) => option.value === timeZone);
  return `Local time now: ${zone?.now ?? ''} · used for reports, payout cut-offs and quiet hours`;
}

export const LOGO_VARIANTS: ReadonlyArray<{
  value: LogoVariant;
  label: string;
  description: string;
  fileName: string;
}> = [
  {
    value: 'primary',
    label: 'Primary',
    description: 'Brass mark with midnight wordmark · for light backgrounds',
    fileName: 'vela-logo-primary.svg',
  },
  {
    value: 'mono',
    label: 'Monochrome',
    description: 'All midnight · for printed and faxed documents',
    fileName: 'vela-logo-mono.svg',
  },
  {
    value: 'reversed',
    label: 'Reversed',
    description: 'Porcelain wordmark on midnight · for dark email headers',
    fileName: 'vela-logo-reversed.svg',
  },
];

export const logoVariant = (value: LogoVariant) =>
  LOGO_VARIANTS.find((option) => option.value === value) ?? LOGO_VARIANTS[0];

export const PAYOUT_SCHEDULES: ReadonlyArray<{ value: PayoutSchedule; label: string }> = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

export const REFUND_TARGETS: ReadonlyArray<{ value: PaymentsDraft['refundTargetHours']; label: string }> = [
  { value: '48', label: '48 hours' },
  { value: '72', label: '72 hours' },
  { value: '120', label: '5 days' },
];

export const refundTargetLabel = (hours: PaymentsDraft['refundTargetHours']) =>
  REFUND_TARGETS.find((option) => option.value === hours)?.label ?? `${hours} hours`;

export const REFUND_DESTINATIONS: ReadonlyArray<{
  value: PaymentsDraft['refundTo'];
  label: string;
  help: string;
}> = [
  {
    value: 'original',
    label: 'Original payment method',
    help: 'Cards in 5–10 banking days, e-wallets within 24 hours',
  },
  {
    value: 'credit',
    label: 'Travel credit, cash on request',
    help: 'Credit is instant and never expires; customers can ask for cash instead',
  },
];

export function autoApproveHelp(payments: PaymentsDraft): string {
  if (!payments.autoApproveRefunds) return 'Turned off · every refund waits for review';
  const limit = parsePesos(payments.autoApproveLimit);
  return Number.isNaN(limit)
    ? 'Per booking, within fare rules'
    : `Refunds under ₱${formatNumber(limit)} per booking skip the review queue`;
}

export const ALERT_EVENTS: ReadonlyArray<{ id: AlertEventId; label: string; description: string }> = [
  {
    id: 'disruption',
    label: 'Flight disruption',
    description: 'Delays over 60 minutes, cancellations and schedule changes',
  },
  { id: 'refundSla', label: 'Refund past service target', description: '' },
  { id: 'promoBudget', label: 'Promo budget at 80%', description: 'A promotion has used 80% of its budget' },
  { id: 'staffInvite', label: 'New staff invite', description: 'Someone is invited to the console' },
  { id: 'failedPayout', label: 'Failed payout', description: 'The bank rejected a settlement payout' },
];

export const ALERT_CHANNELS: ReadonlyArray<{ id: AlertChannel; label: string }> = [
  { id: 'email', label: 'Email' },
  { id: 'sms', label: 'SMS' },
  { id: 'inApp', label: 'In-app' },
];

export const QUIET_FROM_OPTIONS = ['21:00', '22:00', '23:00', '00:00'];
export const QUIET_UNTIL_OPTIONS = ['05:00', '06:00', '07:00', '08:00'];

export const SESSION_TIMEOUTS: ReadonlyArray<{
  value: SecuritySettings['sessionTimeoutMinutes'];
  label: string;
}> = [
  { value: '15', label: '15 minutes' },
  { value: '30', label: '30 minutes' },
  { value: '60', label: '1 hour' },
  { value: '240', label: '4 hours' },
  { value: '480', label: '8 hours' },
];

export const PASSWORD_LENGTHS: ReadonlyArray<{
  value: SecuritySettings['minPasswordLength'];
  label: string;
}> = [
  { value: '10', label: '10 characters' },
  { value: '12', label: '12 characters' },
  { value: '14', label: '14 characters' },
  { value: '16', label: '16 characters' },
];

export const PASSWORD_EXPIRY: ReadonlyArray<{
  value: SecuritySettings['passwordExpiry'];
  label: string;
  help: string;
}> = [
  {
    value: 'never',
    label: 'Only if a breach is suspected',
    help: 'Recommended · forced changes tend to make passwords weaker',
  },
  { value: '90', label: 'Every 90 days', help: 'Staff get a reminder 7 days before' },
  { value: '180', label: 'Every 180 days', help: 'Staff get a reminder 7 days before' },
];

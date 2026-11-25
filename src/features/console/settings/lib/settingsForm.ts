import { formatNumber } from '@/lib/format';
import {
  isInternationalPhone,
  isValidEmail,
  MAX_AUTO_APPROVE,
  MIN_PAYOUT,
  networkCovers,
} from '@/services/console/settingsRules';
import type {
  GeneralSettings,
  NotificationSettings,
  PaymentSettings,
  SecuritySettings,
  SettingsSection,
  SettingsTab,
  WorkspaceSettings,
} from '@/types/console/settings';

export const SETTINGS_TABS: ReadonlyArray<{ id: SettingsTab; label: string }> = [
  { id: 'general', label: 'General' },
  { id: 'payments', label: 'Payments & payouts' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'integrations', label: 'Integrations' },
  { id: 'security', label: 'Security' },
];

export const tabLabel = (tab: SettingsTab) => SETTINGS_TABS.find((item) => item.id === tab)?.label ?? tab;

export function tabFromParam(value: string | null): SettingsTab {
  return SETTINGS_TABS.find((tab) => tab.id === value)?.id ?? 'general';
}

/** Payment amounts are edited as text ("10,000") and parsed on save. */
export type PaymentsDraft = Omit<PaymentSettings, 'minimumPayout' | 'autoApproveLimit'> & {
  minimumPayout: string;
  autoApproveLimit: string;
};

export interface SettingsDraft {
  general: GeneralSettings;
  payments: PaymentsDraft;
  notifications: NotificationSettings;
  security: SecuritySettings;
}

export function toDraft(settings: WorkspaceSettings): SettingsDraft {
  return {
    ...structuredClone(settings),
    payments: {
      ...structuredClone(settings.payments),
      minimumPayout: formatNumber(settings.payments.minimumPayout),
      autoApproveLimit: formatNumber(settings.payments.autoApproveLimit),
    },
  };
}

/** Whole pesos typed as "10,000"; NaN when the text isn't a whole number. */
export function parsePesos(text: string): number {
  const digits = text.replace(/[,\s₱]/g, '');
  return /^\d+$/.test(digits) ? Number(digits) : Number.NaN;
}

export function fromDraft(draft: SettingsDraft): WorkspaceSettings {
  return {
    ...structuredClone(draft),
    payments: {
      ...structuredClone(draft.payments),
      minimumPayout: parsePesos(draft.payments.minimumPayout),
      autoApproveLimit: parsePesos(draft.payments.autoApproveLimit),
    },
  };
}

export type SettingsField =
  | 'workspaceName'
  | 'legalEntity'
  | 'supportEmail'
  | 'supportPhone'
  | 'paymentMethods'
  | 'minimumPayout'
  | 'autoApproveLimit';

const FIELD_SECTIONS: Record<SettingsField, SettingsSection> = {
  workspaceName: 'general',
  legalEntity: 'general',
  supportEmail: 'general',
  supportPhone: 'general',
  paymentMethods: 'payments',
  minimumPayout: 'payments',
  autoApproveLimit: 'payments',
};

export type SettingsErrors = Partial<Record<SettingsField, string>>;

/** Shown as soon as a field goes wrong: every setting starts valid, so errors only follow edits. */
export function draftErrors({ general, payments }: SettingsDraft): SettingsErrors {
  const errors: SettingsErrors = {};
  if (!general.workspaceName.trim()) errors.workspaceName = 'Enter a workspace name';
  if (!general.legalEntity.trim()) errors.legalEntity = 'Enter the registered company name';
  if (!isValidEmail(general.supportEmail)) {
    errors.supportEmail = 'Enter an email address like support@vela.travel';
  }
  if (!isInternationalPhone(general.supportPhone)) {
    errors.supportPhone = 'Include the country code, like +63 2 8835 2000';
  }
  if (!Object.values(payments.methods).some(Boolean)) {
    errors.paymentMethods = 'Keep at least one payment method on, or customers can’t pay at checkout.';
  }
  const minimumPayout = parsePesos(payments.minimumPayout);
  if (Number.isNaN(minimumPayout) || minimumPayout < MIN_PAYOUT) {
    errors.minimumPayout = `Enter a whole amount of at least ₱${formatNumber(MIN_PAYOUT)}`;
  }
  const autoLimit = parsePesos(payments.autoApproveLimit);
  if (
    payments.autoApproveRefunds &&
    (Number.isNaN(autoLimit) || autoLimit < 1 || autoLimit > MAX_AUTO_APPROVE)
  ) {
    errors.autoApproveLimit = `Enter an amount up to ₱${formatNumber(MAX_AUTO_APPROVE)} · bigger refunds always need a second approval`;
  }
  return errors;
}

export function sectionsWithErrors(errors: SettingsErrors): SettingsSection[] {
  return [...new Set((Object.keys(errors) as SettingsField[]).map((field) => FIELD_SECTIONS[field]))];
}

const differs = (a: unknown, b: unknown) => (JSON.stringify(a) === JSON.stringify(b) ? 0 : 1);

function countFieldChanges<T extends object>(saved: T, draft: T, skip: ReadonlyArray<keyof T> = []): number {
  return (Object.keys(saved) as Array<keyof T>)
    .filter((key) => !skip.includes(key))
    .reduce((total, key) => total + differs(saved[key], draft[key]), 0);
}

/** Edited settings per section: one per field, one per alert switch, one per network added or removed. */
export function changeCounts(saved: SettingsDraft, draft: SettingsDraft): Record<SettingsSection, number> {
  const alertChanges = (
    Object.keys(saved.notifications.alerts) as Array<keyof NotificationSettings['alerts']>
  ).reduce(
    (total, event) =>
      total + countFieldChanges(saved.notifications.alerts[event], draft.notifications.alerts[event]),
    0,
  );
  const savedNetworks = saved.security.ipAllowlist.map((network) => network.cidr);
  const draftNetworks = draft.security.ipAllowlist.map((network) => network.cidr);
  const networkChanges =
    draftNetworks.filter((cidr) => !savedNetworks.includes(cidr)).length +
    savedNetworks.filter((cidr) => !draftNetworks.includes(cidr)).length;
  const methodChanges = countFieldChanges(saved.payments.methods, draft.payments.methods);

  return {
    general: countFieldChanges(saved.general, draft.general),
    payments: countFieldChanges(saved.payments, draft.payments, ['methods']) + methodChanges,
    notifications: countFieldChanges(saved.notifications, draft.notifications, ['alerts']) + alertChanges,
    security: countFieldChanges(saved.security, draft.security, ['ipAllowlist']) + networkChanges,
  };
}

/** Saving would leave the signed-in staff member's network off an enforced allowlist. */
export function locksYouOut(security: SecuritySettings, yourIpAddress: string): boolean {
  return (
    security.enforceIpAllowlist &&
    !security.ipAllowlist.some((network) => networkCovers(network.cidr, yourIpAddress))
  );
}

/** Security changes that weaken protection or can lock people out; each needs a second look before saving. */
export function securityRisks(
  saved: SecuritySettings,
  draft: SecuritySettings,
  context: { yourIpAddress: string; breakGlassAdmin: string },
): string[] {
  const risks: string[] = [];
  if (saved.requireTwoStep && !draft.requireTwoStep) {
    risks.push('2-step verification turns off · staff can sign in with a password alone');
  }
  if (!saved.requireSso && draft.requireSso) {
    risks.push(
      `SSO becomes required · password sign-in stops for everyone except ${context.breakGlassAdmin} (break-glass Admin)`,
    );
  }
  if (saved.enforceIpAllowlist && !draft.enforceIpAllowlist) {
    risks.push('The IP allowlist stops being enforced · the console opens from any network');
  }
  if (locksYouOut(draft, context.yourIpAddress)) {
    risks.push(
      `Your network (${context.yourIpAddress}) isn’t on the allowlist · you’ll be signed out as soon as you save`,
    );
  }
  const timeout = Number(draft.sessionTimeoutMinutes);
  if (timeout > Number(saved.sessionTimeoutMinutes) && timeout >= 240) {
    risks.push(`Idle sessions stay signed in for ${timeout / 60} hours`);
  }
  return risks;
}

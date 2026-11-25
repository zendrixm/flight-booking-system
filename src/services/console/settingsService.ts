import {
  ACTIVE_STAFF_COUNT,
  AIRLINE_CONNECTIONS,
  API_KEYS,
  BREAK_GLASS_ADMIN,
  CONNECTION_TESTS,
  KEY_RETIREMENT_TIMES,
  PAYMENT_PROVIDERS,
  PAYOUT_FORECASTS,
  ROTATED_SECRETS,
  SAVED_SETTINGS,
  SETTINGS_AUDIT,
  SETTLEMENT_APPROVER,
  WEBHOOK_EVENTS,
  WEBHOOKS,
  YOUR_IP_ADDRESS,
  type ApiKeySeed,
} from '@/mocks/console/settings';
import { DEMO_STAFF_MEMBER } from '@/mocks/console/staff';
import type {
  AirlineConnection,
  AirlineCredentials,
  KeyRetirement,
  SettingsAuditEntry,
  SettingsOverview,
  SettingsResult,
  Webhook,
  WorkspaceSettings,
} from '@/types/console/settings';

import { ApiError, mockRequest } from '../mockApi';
import {
  isHttpsUrl,
  isInternationalPhone,
  isValidEmail,
  MAX_AUTO_APPROVE,
  MIN_PAYOUT,
  networkCovers,
} from './settingsRules';

const YOU = DEMO_STAFF_MEMBER.fullName;

/** Server-side state for the session. */
let settings: WorkspaceSettings = structuredClone(SAVED_SETTINGS);
let lastSaved = 'Last saved by Ian Cruz · Tue 6 Oct, 11:05';
let logoUpdated = 'Updated 3 Mar 2026 by Ian Cruz';
let isSettlementChangeRequested = false;
let airlines: AirlineConnection[] = structuredClone([...AIRLINE_CONNECTIONS]);
let apiKeys: Array<ApiKeySeed & { isRevoked: boolean }> = API_KEYS.map((key) => ({
  ...key,
  isRevoked: false,
}));
let webhooks: Webhook[] = structuredClone([...WEBHOOKS]);
const audit: SettingsAuditEntry[] = [...SETTINGS_AUDIT];
let rotations = 0;
let changeCount = 0;

function log(action: string, target: string) {
  changeCount += 1;
  audit.unshift({ id: `session-${changeCount}`, time: 'Just now', actor: YOU, action, target });
}

const maskKey = (secret: string) => `${secret.slice(0, 10)}••••••••••••••••${secret.slice(-4)}`;

function overview(): SettingsOverview {
  return {
    settings: structuredClone(settings),
    lastSaved,
    logoUpdated,
    providers: [...PAYMENT_PROVIDERS],
    payoutForecasts: PAYOUT_FORECASTS,
    settlementAccount: {
      name: 'Corporate current account ···· 8812',
      detail: 'Vela Travel, Inc. · PHP · verified 14 Jan 2026 by Bea Santos',
      approver: SETTLEMENT_APPROVER,
      isChangeRequested: isSettlementChangeRequested,
    },
    airlines: structuredClone(airlines),
    apiKeys: apiKeys.map(({ id, name, scope, secret, detail, usedBy, isRevoked }) => ({
      id,
      name,
      scope,
      maskedKey: maskKey(secret),
      detail,
      usage: usedBy,
      isRevoked,
    })),
    webhooks: structuredClone(webhooks),
    webhookEvents: WEBHOOK_EVENTS,
    audit: [...audit],
    yourIpAddress: YOUR_IP_ADDRESS,
    activeStaffCount: ACTIVE_STAFF_COUNT,
    breakGlassAdmin: BREAK_GLASS_ADMIN,
  };
}

const result = (message: string, tone: SettingsResult['tone'] = 'success'): SettingsResult => ({
  overview: overview(),
  message,
  tone,
});

function validate(next: WorkspaceSettings) {
  const { general, payments } = next;
  const problems = [
    !general.workspaceName.trim() && 'Enter a workspace name.',
    !general.legalEntity.trim() && 'Enter the registered company name.',
    !isValidEmail(general.supportEmail) && 'Enter a valid support email.',
    !isInternationalPhone(general.supportPhone) && 'Include the country code in the support phone.',
    !Object.values(payments.methods).some(Boolean) && 'Keep at least one payment method on.',
    payments.minimumPayout < MIN_PAYOUT && 'The minimum payout is at least ₱1,000.',
    payments.autoApproveRefunds &&
      (payments.autoApproveLimit < 1 || payments.autoApproveLimit > MAX_AUTO_APPROVE) &&
      'Auto-approve up to ₱50,000.',
  ].filter(Boolean);
  if (problems.length) throw new ApiError('invalid_settings', String(problems[0]));
}

export function getSettings(): Promise<SettingsOverview> {
  return mockRequest(overview);
}

/**
 * Saves every edited section at once. When the allowlist no longer covers the signed-in
 * staff member's network, the save still goes through and the result says they'll be signed out.
 */
export function saveSettings(
  next: WorkspaceSettings,
  changedSections: readonly string[],
): Promise<SettingsResult & { signsYouOut: boolean }> {
  return mockRequest(() => {
    validate(next);
    const logoChanged = next.general.logo !== settings.general.logo;
    settings = structuredClone(next);
    settings.security.ipAllowlist = settings.security.ipAllowlist.map((network) =>
      network.addedBy.includes('not saved yet')
        ? { ...network, addedBy: `Added by ${YOU} · just now` }
        : network,
    );
    lastSaved = `Last saved just now by ${YOU}`;
    if (logoChanged) logoUpdated = `Updated just now by ${YOU}`;
    log('Updated settings', changedSections.join(', '));
    const { enforceIpAllowlist, ipAllowlist } = settings.security;
    const signsYouOut =
      enforceIpAllowlist && !ipAllowlist.some((network) => networkCovers(network.cidr, YOUR_IP_ADDRESS));
    return {
      ...result(
        signsYouOut ? 'Settings saved · signing you out' : 'Settings saved',
        signsYouOut ? 'warning' : 'success',
      ),
      signsYouOut,
    };
  }, 600);
}

/** Finance verifies the new account with the bank before payouts move. */
export function requestSettlementChange(reason: string): Promise<SettingsResult> {
  return mockRequest(() => {
    if (reason.trim().length < 10) {
      throw new ApiError('reason_too_short', 'Add a short reason (at least 10 characters).');
    }
    isSettlementChangeRequested = true;
    log('Requested settlement account change', `Approver: ${SETTLEMENT_APPROVER}`);
    return result(`Request sent to ${SETTLEMENT_APPROVER} for approval`);
  });
}

export function sendTestAlert(): Promise<SettingsResult> {
  return mockRequest(() =>
    result(`Test alert sent to ${DEMO_STAFF_MEMBER.email}, +63 917 ••• 2210 and in-app`),
  );
}

function findAirline(code: string): AirlineConnection {
  const airline = airlines.find((candidate) => candidate.code === code);
  if (!airline) throw new ApiError('not_found', 'That airline connection doesn’t exist.');
  return airline;
}

export function testAirlineConnection(code: string): Promise<SettingsResult> {
  return mockRequest(() => {
    const airline = findAirline(code);
    const test = CONNECTION_TESTS[code];
    airline.note = test.note;
    airline.noteTone = test.outcome;
    if (test.outcome !== 'danger') airline.lastSync = 'just now';
    return result(test.message, test.outcome === 'danger' ? 'error' : test.outcome);
  }, 1200);
}

/** Hides the airline's fares from search right away. Existing bookings keep their tickets. */
export function disconnectAirline(code: string): Promise<SettingsResult> {
  return mockRequest(() => {
    const airline = findAirline(code);
    Object.assign(airline, {
      status: 'disconnected',
      lastSync: 'just now',
      note: `Disconnected by ${YOU} · hidden from search`,
      noteTone: 'danger',
    });
    log('Disconnected airline', airline.name);
    return result(`${airline.name} disconnected · its flights are hidden from search`, 'warning');
  });
}

/** Tests the new credentials before saving them. */
export function reconnectAirline(code: string, credentials: AirlineCredentials): Promise<SettingsResult> {
  return mockRequest(() => {
    const airline = findAirline(code);
    if (!credentials.clientId.trim() || credentials.clientSecret.trim().length < 32) {
      throw new ApiError('invalid_credentials', `${airline.name} rejected those credentials.`);
    }
    const isSandbox = credentials.environment === 'sandbox';
    Object.assign(
      airline,
      isSandbox
        ? {
            status: 'connected',
            lastSync: 'just now',
            note: 'Sandbox · test fares only, not shown to customers',
            noteTone: 'neutral',
          }
        : {
            status: 'connected',
            lastSync: 'just now',
            note: `Reconnected by ${YOU} · median response 610 ms`,
            noteTone: 'success',
          },
    );
    log('Reconnected airline', airline.name);
    return result(
      `${airline.name} reconnected · ${isSandbox ? 'sandbox fares only' : 'fares are back in search'}`,
    );
  });
}

function findKey(id: string) {
  const key = apiKeys.find((candidate) => candidate.id === id);
  if (!key) throw new ApiError('not_found', 'That API key doesn’t exist.');
  return key;
}

/** The full secret. Reveals are only allowed for keys that still work. */
export function revealApiKey(id: string): Promise<string> {
  return mockRequest(() => {
    const key = findKey(id);
    if (key.isRevoked) throw new ApiError('revoked', 'Revoked keys can’t be shown.');
    return key.secret;
  }, 150);
}

/** Issues a new secret now; the old one keeps working until `retire`. */
export function rotateApiKey(
  id: string,
  retire: KeyRetirement,
): Promise<SettingsResult & { secret: string }> {
  return mockRequest(() => {
    const key = findKey(id);
    key.secret = ROTATED_SECRETS[rotations % ROTATED_SECRETS.length];
    rotations += 1;
    key.detail = `Created just now by ${YOU} · old key ${KEY_RETIREMENT_TIMES[retire]}`;
    log('Rotated API key', key.scope === 'Read-only' ? `${key.name} (read-only)` : key.name);
    return {
      ...result(
        `New ${key.name} key created · old key ${KEY_RETIREMENT_TIMES[retire]}`,
        retire === 'now' ? 'warning' : 'success',
      ),
      secret: key.secret,
    };
  });
}

export function revokeApiKey(id: string): Promise<SettingsResult> {
  return mockRequest(() => {
    const key = findKey(id);
    key.isRevoked = true;
    key.detail = `Revoked just now by ${YOU} · requests with this key now fail`;
    log('Revoked API key', key.scope === 'Read-only' ? `${key.name} (read-only)` : key.name);
    return result(`${key.name} key revoked`, 'warning');
  });
}

export function addWebhook({ url, events }: { url: string; events: string[] }): Promise<SettingsResult> {
  return mockRequest(() => {
    if (!isHttpsUrl(url)) throw new ApiError('invalid_url', 'Use a full https:// address.');
    if (!events.length) throw new ApiError('no_events', 'Choose at least one event.');
    webhooks = [
      ...webhooks,
      {
        id: `h${webhooks.length + changeCount + 1}`,
        url: url.trim(),
        events,
        status: 'active',
        detail: `Added just now by ${YOU} · test ping 200 OK`,
      },
    ];
    log('Added webhook', url.trim());
    return result('Webhook added · test ping delivered');
  });
}

export function retryWebhook(id: string): Promise<SettingsResult> {
  return mockRequest(() => {
    webhooks = webhooks.map((hook) =>
      hook.id === id
        ? {
            ...hook,
            status: 'active',
            detail: 'Last delivery just now · 200 OK · 3 retried deliveries succeeded',
          }
        : hook,
    );
    return result('3 deliveries resent · all succeeded');
  }, 800);
}

export function deleteWebhook(id: string): Promise<SettingsResult> {
  return mockRequest(() => {
    const hook = webhooks.find((candidate) => candidate.id === id);
    webhooks = webhooks.filter((candidate) => candidate.id !== id);
    if (hook) log('Deleted webhook', hook.url);
    return result('Webhook deleted');
  });
}

/** The CSV is emailed, since a full export can be large. */
export function exportSettingsAudit(actor: string | null): Promise<SettingsResult> {
  return mockRequest(() => {
    const count = audit.filter((entry) => !actor || entry.actor === actor).length;
    return result(`Exporting ${count} audit events · the CSV will be emailed to ${DEMO_STAFF_MEMBER.email}`);
  });
}

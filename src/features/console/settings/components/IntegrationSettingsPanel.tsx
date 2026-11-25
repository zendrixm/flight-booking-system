import clsx from 'clsx';
import { useState } from 'react';

import { AirlineMark } from '@/components/flight';
import { Button, IconButton, StatusChip, useToast, type StatusTone } from '@/components/ui';
import { AIRLINE_IDS } from '@/data/airlineDesignators';
import * as settingsActions from '@/services/console/settingsService';
import type { AirlineCode } from '@/types/console/booking';
import type {
  AirlineConnection,
  ApiKey,
  ConnectionStatus,
  SettingsOverview,
  SettingsResult,
  Webhook,
} from '@/types/console/settings';

import { ConfirmDialog, type ConfirmDialogContent } from '../../shared/components/ConfirmDialog';
import { ReconnectAirlineDialog, RotateKeyDialog, WebhookDialog } from './IntegrationDialogs';
import { SettingsCard, SettingsRow, SettingText } from './SettingsLayout';
import styles from './SettingsPanels.module.css';

const CONNECTION_CHIPS: Record<ConnectionStatus, { label: string; tone: StatusTone }> = {
  connected: { label: 'Connected', tone: 'success' },
  degraded: { label: 'Degraded', tone: 'warning' },
  disconnected: { label: 'Disconnected', tone: 'danger' },
};

type OpenDialog =
  | { kind: 'disconnect'; airline: AirlineConnection }
  | { kind: 'reconnect'; airline: AirlineConnection }
  | { kind: 'rotate'; apiKey: ApiKey }
  | { kind: 'revoke'; apiKey: ApiKey }
  | { kind: 'addWebhook' }
  | { kind: 'deleteWebhook'; webhook: Webhook };

interface IntegrationSettingsPanelProps {
  overview: Pick<SettingsOverview, 'airlines' | 'apiKeys' | 'webhooks' | 'webhookEvents'>;
  /** Runs a change, applies its result and announces it. Resolves true when it worked. */
  run: (task: () => Promise<SettingsResult>) => Promise<boolean>;
}

/** Airline connections, API keys and webhooks. Unlike the other tabs, these act immediately. */
export function IntegrationSettingsPanel({ overview, run }: IntegrationSettingsPanelProps) {
  const toast = useToast();
  const [dialog, setDialog] = useState<OpenDialog | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [testing, setTesting] = useState<ReadonlySet<string>>(new Set());
  const [revealed, setRevealed] = useState<Record<string, string>>({});
  const connectedCount = overview.airlines.filter((airline) => airline.status === 'connected').length;

  const runInDialog = async (task: () => Promise<SettingsResult>) => {
    setIsBusy(true);
    const succeeded = await run(task);
    setIsBusy(false);
    if (succeeded) setDialog(null);
    return succeeded;
  };

  const testConnection = async (code: string) => {
    setTesting((current) => new Set(current).add(code));
    await run(() => settingsActions.testAirlineConnection(code));
    setTesting((current) => {
      const next = new Set(current);
      next.delete(code);
      return next;
    });
  };

  const toggleReveal = async (apiKey: ApiKey) => {
    if (revealed[apiKey.id]) {
      setRevealed(({ [apiKey.id]: _hidden, ...rest }) => rest);
      return;
    }
    const secret = await settingsActions.revealApiKey(apiKey.id);
    setRevealed((current) => ({ ...current, [apiKey.id]: secret }));
  };

  const copyKey = async (apiKey: ApiKey) => {
    const secret = revealed[apiKey.id] ?? (await settingsActions.revealApiKey(apiKey.id));
    try {
      await navigator.clipboard.writeText(secret);
      toast.show({ tone: 'success', message: `${apiKey.name} key copied to clipboard` });
    } catch {
      toast.show({
        tone: 'error',
        message: 'Your browser blocked the clipboard. Reveal the key and copy it by hand.',
      });
    }
  };

  const confirmContent = confirmContentFor(dialog);

  return (
    <>
      <SettingsCard
        title="Airline content connections"
        description="Live fares, schedules and seat maps. A degraded connection slows search; a disconnected one hides that airline."
        aside={
          <StatusChip
            tone={connectedCount === overview.airlines.length ? 'success' : 'warning'}
            size="compact"
          >
            {connectedCount} of {overview.airlines.length} connected
          </StatusChip>
        }
      >
        {overview.airlines.map((airline) => {
          const chip = CONNECTION_CHIPS[airline.status];
          const isTesting = testing.has(airline.code);
          return (
            <SettingsRow key={airline.code}>
              <AirlineMark airlineId={AIRLINE_IDS[airline.code as AirlineCode]} />
              <SettingText title={airline.name} description={airline.protocol} />
              <span className={styles.chipSlot}>
                <StatusChip tone={chip.tone} size="compact">
                  {chip.label}
                </StatusChip>
              </span>
              <span className={styles.syncText}>
                <span className={styles.meta}>
                  <span className={styles.figureLabel}>Last sync</span> {airline.lastSync}
                </span>
                <span className={clsx(styles.note, styles[`note_${airline.noteTone}`])}>{airline.note}</span>
              </span>
              <span className={clsx(styles.actions, styles.connectionActions)}>
                <Button
                  variant="quiet"
                  loading={isTesting}
                  loadingLabel="Testing…"
                  aria-label={`${isTesting ? 'Testing connection to' : 'Test connection to'} ${airline.name}`}
                  onClick={() => void testConnection(airline.code)}
                >
                  Test connection
                </Button>
                {airline.status === 'disconnected' ? (
                  <Button
                    variant="primary"
                    aria-haspopup="dialog"
                    aria-label={`Reconnect ${airline.name}`}
                    onClick={() => setDialog({ kind: 'reconnect', airline })}
                  >
                    Reconnect
                  </Button>
                ) : (
                  <Button
                    variant="quiet"
                    aria-haspopup="dialog"
                    aria-label={`Disconnect ${airline.name}`}
                    onClick={() => setDialog({ kind: 'disconnect', airline })}
                  >
                    Disconnect
                  </Button>
                )}
              </span>
            </SettingsRow>
          );
        })}
      </SettingsCard>

      <SettingsCard
        title="API keys"
        description="For Vela’s own back-end services. Keep keys in a secrets manager, never in apps or web pages."
      >
        {overview.apiKeys.map((apiKey) => {
          const secret = revealed[apiKey.id];
          return (
            <SettingsRow key={apiKey.id} align="start">
              <span className={styles.keyText}>
                <span className={styles.keyTitle}>
                  <span className={styles.strong}>{apiKey.name}</span>
                  <StatusChip
                    tone={apiKey.scope === 'Read-only' ? 'muted' : 'warning'}
                    hideDot
                    size="compact"
                  >
                    {apiKey.scope}
                  </StatusChip>
                  {apiKey.isRevoked && (
                    <StatusChip tone="danger" hideDot size="compact">
                      Revoked
                    </StatusChip>
                  )}
                </span>
                <code
                  className={clsx(
                    styles.secret,
                    secret && styles.secretShown,
                    apiKey.isRevoked && styles.secretRevoked,
                  )}
                >
                  {secret ?? apiKey.maskedKey}
                </code>
                <span className={styles.meta}>{apiKey.detail}</span>
              </span>
              {!apiKey.isRevoked && (
                <span className={styles.actions}>
                  <Button
                    variant="quiet"
                    size="small"
                    iconStart={secret ? 'eyeOff' : 'eye'}
                    aria-label={`${secret ? 'Hide' : 'Reveal'} ${apiKey.name} key`}
                    onClick={() => void toggleReveal(apiKey)}
                  >
                    {secret ? 'Hide' : 'Reveal'}
                  </Button>
                  <Button
                    variant="quiet"
                    size="small"
                    iconStart="copy"
                    aria-label={`Copy ${apiKey.name} key`}
                    onClick={() => void copyKey(apiKey)}
                  >
                    Copy
                  </Button>
                  <Button
                    variant="quiet"
                    size="small"
                    iconStart="refresh"
                    aria-haspopup="dialog"
                    aria-label={`Rotate ${apiKey.name} key`}
                    onClick={() => setDialog({ kind: 'rotate', apiKey })}
                  >
                    Rotate
                  </Button>
                  <Button
                    variant="destructiveQuiet"
                    size="small"
                    aria-haspopup="dialog"
                    aria-label={`Revoke ${apiKey.name} key`}
                    onClick={() => setDialog({ kind: 'revoke', apiKey })}
                  >
                    Revoke
                  </Button>
                </span>
              )}
            </SettingsRow>
          );
        })}
      </SettingsCard>

      <SettingsCard
        title="Webhooks"
        description="Vela posts these events to your endpoints as signed JSON. Failed deliveries are retried for 24 hours."
        aside={
          <Button
            variant="quiet"
            iconStart="plus"
            aria-haspopup="dialog"
            onClick={() => setDialog({ kind: 'addWebhook' })}
          >
            Add webhook
          </Button>
        }
      >
        {overview.webhooks.map((webhook) => (
          <SettingsRow key={webhook.id} align="start">
            <span className={styles.keyText}>
              <code className={clsx(styles.mono, styles.endpoint)}>{webhook.url}</code>
              <span className={styles.eventList}>
                {webhook.events.map((event) => (
                  <span key={event} className={styles.eventChip}>
                    {event}
                  </span>
                ))}
              </span>
              <span className={styles.meta}>{webhook.detail}</span>
            </span>
            <StatusChip tone={webhook.status === 'failing' ? 'danger' : 'success'} size="compact">
              {webhook.status === 'failing' ? 'Failing' : 'Active'}
            </StatusChip>
            <span className={styles.actions}>
              {webhook.status === 'failing' && (
                <Button
                  variant="quiet"
                  size="small"
                  aria-label={`Retry failed deliveries to ${webhook.url}`}
                  onClick={() => void run(() => settingsActions.retryWebhook(webhook.id))}
                >
                  Retry deliveries
                </Button>
              )}
              <IconButton
                icon="trash"
                label={`Delete webhook ${webhook.url}`}
                variant="outline"
                shape="square"
                aria-haspopup="dialog"
                onClick={() => setDialog({ kind: 'deleteWebhook', webhook })}
              />
            </span>
          </SettingsRow>
        ))}
      </SettingsCard>

      <ConfirmDialog
        content={confirmContent}
        isBusy={isBusy}
        onClose={() => setDialog(null)}
        onConfirm={() => {
          if (dialog?.kind === 'disconnect') {
            void runInDialog(() => settingsActions.disconnectAirline(dialog.airline.code));
          }
          if (dialog?.kind === 'revoke') {
            const { id } = dialog.apiKey;
            setRevealed(({ [id]: _hidden, ...rest }) => rest);
            void runInDialog(() => settingsActions.revokeApiKey(id));
          }
          if (dialog?.kind === 'deleteWebhook') {
            void runInDialog(() => settingsActions.deleteWebhook(dialog.webhook.id));
          }
        }}
      >
        {dialog?.kind === 'disconnect' && (
          <ul className={styles.points}>
            <li>Search stops showing {dialog.airline.name} flights in all markets</li>
            <li>Changes and refunds on {dialog.airline.name} bookings go through their service desk</li>
            <li>To reconnect, you’ll need a client ID and secret from {dialog.airline.name}</li>
          </ul>
        )}
        {dialog?.kind === 'revoke' && (
          <ul className={styles.points}>
            <li>{dialog.apiKey.detail}</li>
            <li>{dialog.apiKey.usage}</li>
          </ul>
        )}
      </ConfirmDialog>

      {dialog?.kind === 'reconnect' && (
        <ReconnectAirlineDialog
          airline={dialog.airline}
          isBusy={isBusy}
          onClose={() => setDialog(null)}
          onConnect={(credentials) =>
            void runInDialog(() => settingsActions.reconnectAirline(dialog.airline.code, credentials))
          }
        />
      )}
      {dialog?.kind === 'rotate' && (
        <RotateKeyDialog
          apiKey={dialog.apiKey}
          isBusy={isBusy}
          onClose={() => setDialog(null)}
          onRotate={(retire) =>
            void runInDialog(async () => {
              const rotated = await settingsActions.rotateApiKey(dialog.apiKey.id, retire);
              // Show the new secret straight away so it can be copied into the services that use it.
              setRevealed((current) => ({ ...current, [dialog.apiKey.id]: rotated.secret }));
              return rotated;
            })
          }
        />
      )}
      {dialog?.kind === 'addWebhook' && (
        <WebhookDialog
          events={overview.webhookEvents}
          isBusy={isBusy}
          onClose={() => setDialog(null)}
          onAdd={(webhook) => void runInDialog(() => settingsActions.addWebhook(webhook))}
        />
      )}
    </>
  );
}

function confirmContentFor(dialog: OpenDialog | null): ConfirmDialogContent | null {
  switch (dialog?.kind) {
    case 'disconnect':
      return {
        role: 'alertdialog',
        title: `Disconnect ${dialog.airline.name}?`,
        subtitle: dialog.airline.protocol,
        body: `${dialog.airline.name} fares, schedules and seat maps disappear from search for every customer right away. Existing bookings keep their tickets.`,
        cancelLabel: 'Keep connected',
        confirmLabel: `Disconnect ${dialog.airline.name}`,
        isDestructive: true,
      };
    case 'revoke':
      return {
        role: 'alertdialog',
        title: `Revoke the ${dialog.apiKey.name} key?`,
        subtitle: `${dialog.apiKey.scope} · ${dialog.apiKey.maskedKey}`,
        body: 'Every request that uses this key fails straight away. This can’t be undone — you’d create a new key and update the services that use it.',
        cancelLabel: 'Keep key',
        confirmLabel: 'Revoke key',
        isDestructive: true,
      };
    case 'deleteWebhook':
      return {
        role: 'alertdialog',
        title: 'Delete this webhook?',
        subtitle: dialog.webhook.url,
        body: `Vela stops posting ${dialog.webhook.events.join(' and ')} events to this endpoint right away. Deliveries waiting for a retry are dropped.`,
        cancelLabel: 'Keep webhook',
        confirmLabel: 'Delete webhook',
        isDestructive: true,
      };
    default:
      return null;
  }
}

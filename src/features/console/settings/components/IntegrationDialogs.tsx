import { useState } from 'react';

import { AirlineMark } from '@/components/flight';
import { Button, Checkbox, ChoiceCard, Dialog, SelectField, TextField } from '@/components/ui';
import { AIRLINE_IDS } from '@/data/airlineDesignators';
import { isHttpsUrl } from '@/services/console/settingsRules';
import type { AirlineCode } from '@/types/console/booking';
import type { AirlineConnection, AirlineCredentials, ApiKey, KeyRetirement } from '@/types/console/settings';

import styles from './SettingsPanels.module.css';

/** Airline secrets are 40 characters; anything under 32 is certainly cut short. */
const MIN_SECRET_LENGTH = 32;

const ENVIRONMENTS: ReadonlyArray<{ value: AirlineCredentials['environment']; label: string }> = [
  { value: 'production', label: 'Production · live fares and ticketing' },
  { value: 'sandbox', label: 'Sandbox · test fares only, no ticketing' },
];

interface ReconnectAirlineDialogProps {
  airline: AirlineConnection;
  isBusy: boolean;
  onClose: () => void;
  onConnect: (credentials: AirlineCredentials) => void;
}

export function ReconnectAirlineDialog({ airline, isBusy, onClose, onConnect }: ReconnectAirlineDialogProps) {
  const [credentials, setCredentials] = useState<AirlineCredentials>({
    clientId: '',
    clientSecret: '',
    environment: 'production',
  });
  const [hasTried, setHasTried] = useState(false);
  const edit = (change: Partial<AirlineCredentials>) =>
    setCredentials((current) => ({ ...current, ...change }));
  const secret = credentials.clientSecret.trim();
  const errors = {
    clientId: credentials.clientId.trim() ? undefined : `Enter the client ID from ${airline.name}`,
    clientSecret:
      secret.length >= MIN_SECRET_LENGTH
        ? undefined
        : secret
          ? `That secret is too short · ${airline.name} secrets are 40 characters`
          : 'Paste the client secret',
  };

  const submit = () => {
    setHasTried(true);
    if (!errors.clientId && !errors.clientSecret) onConnect(credentials);
  };

  return (
    <Dialog
      open
      onClose={onClose}
      size="medium"
      iconSlot={<AirlineMark airlineId={AIRLINE_IDS[airline.code as AirlineCode]} />}
      title={`Reconnect ${airline.name}`}
      busy={isBusy}
      footer={
        <>
          <Button variant="quiet" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" loading={isBusy} loadingLabel="Testing connection…" onClick={submit}>
            Connect and test
          </Button>
        </>
      }
    >
      <form
        noValidate
        className={styles.dialogForm}
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <p className={styles.dialogText}>
          {airline.protocol}. {airline.name} issues new credentials from its partner portal. Paste them here —
          we test the connection before saving.
        </p>
        <TextField
          label="Client ID"
          required
          autoComplete="off"
          placeholder="e.g. vela-ph-prod"
          inputClassName={styles.mono}
          value={credentials.clientId}
          error={hasTried ? errors.clientId : undefined}
          onChange={(event) => edit({ clientId: event.target.value })}
        />
        <TextField
          label="Client secret"
          required
          type="password"
          autoComplete="off"
          placeholder="Paste the secret"
          inputClassName={styles.mono}
          value={credentials.clientSecret}
          error={hasTried ? errors.clientSecret : undefined}
          helpText="Stored encrypted · only the last 4 characters are shown after saving"
          onChange={(event) => edit({ clientSecret: event.target.value })}
        />
        <SelectField
          label="Environment"
          required
          value={credentials.environment}
          options={ENVIRONMENTS}
          onChange={(event) => edit({ environment: event.target.value as AirlineCredentials['environment'] })}
        />
      </form>
    </Dialog>
  );
}

const RETIREMENTS: ReadonlyArray<{ value: KeyRetirement; label: string; description: string }> = [
  { value: 'now', label: 'Immediately', description: 'Use only if the key may have leaked' },
  { value: '24h', label: 'In 24 hours', description: 'Recommended · time to update your services' },
  { value: '7d', label: 'In 7 days', description: 'For services that deploy weekly' },
];

interface RotateKeyDialogProps {
  apiKey: ApiKey;
  isBusy: boolean;
  onClose: () => void;
  onRotate: (retire: KeyRetirement) => void;
}

export function RotateKeyDialog({ apiKey, isBusy, onClose, onRotate }: RotateKeyDialogProps) {
  const [retire, setRetire] = useState<KeyRetirement>('24h');
  return (
    <Dialog
      open
      onClose={onClose}
      role="alertdialog"
      size="medium"
      title={`Rotate the ${apiKey.name} key?`}
      description="A new key is created now. The current key keeps working until the time you choose, then stops for good. Update every service that uses it first."
      busy={isBusy}
      footer={
        <>
          <Button variant="quiet" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" loading={isBusy} onClick={() => onRotate(retire)}>
            Rotate key
          </Button>
        </>
      }
    >
      <fieldset className={styles.choices}>
        <legend className={styles.fieldLabel}>Current key stops working</legend>
        {RETIREMENTS.map((option) => (
          <ChoiceCard
            key={option.value}
            name="key-retirement"
            title={option.label}
            description={option.description}
            checked={retire === option.value}
            onChange={() => setRetire(option.value)}
          />
        ))}
      </fieldset>
    </Dialog>
  );
}

interface WebhookDialogProps {
  events: ReadonlyArray<{ name: string; description: string }>;
  isBusy: boolean;
  onClose: () => void;
  onAdd: (webhook: { url: string; events: string[] }) => void;
}

export function WebhookDialog({ events, isBusy, onClose, onAdd }: WebhookDialogProps) {
  const [url, setUrl] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [hasTried, setHasTried] = useState(false);
  const urlError = isHttpsUrl(url)
    ? undefined
    : 'Use a full https:// address, like https://ops.vela.travel/hooks/bookings';
  const eventsError = selected.length ? undefined : 'Choose at least one event';
  const toggle = (name: string) =>
    setSelected((current) =>
      current.includes(name) ? current.filter((item) => item !== name) : [...current, name],
    );

  const submit = () => {
    setHasTried(true);
    if (!urlError && !eventsError) {
      onAdd({
        url: url.trim(),
        events: events.map((event) => event.name).filter((name) => selected.includes(name)),
      });
    }
  };

  return (
    <Dialog
      open
      onClose={onClose}
      size="medium"
      title="Add webhook"
      description="We’ll send a test ping as soon as it’s added."
      busy={isBusy}
      footer={
        <>
          <Button variant="quiet" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" loading={isBusy} onClick={submit}>
            Add webhook
          </Button>
        </>
      }
    >
      <form
        noValidate
        className={styles.dialogForm}
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <TextField
          label="Endpoint URL"
          required
          type="url"
          placeholder="https://ops.vela.travel/hooks/…"
          inputClassName={styles.mono}
          value={url}
          error={hasTried ? urlError : undefined}
          onChange={(event) => setUrl(event.target.value)}
        />
        <fieldset className={styles.choices}>
          <legend className={styles.fieldLabel}>Events to send</legend>
          {events.map((event) => (
            <Checkbox
              key={event.name}
              label={<span className={styles.mono}>{event.name}</span>}
              description={event.description}
              checked={selected.includes(event.name)}
              onChange={() => toggle(event.name)}
            />
          ))}
          {hasTried && eventsError && (
            <p role="alert" className={styles.inlineError}>
              {eventsError}
            </p>
          )}
        </fieldset>
      </form>
    </Dialog>
  );
}

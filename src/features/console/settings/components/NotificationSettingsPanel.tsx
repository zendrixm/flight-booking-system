import { Button, SelectField, Switch, Table } from '@/components/ui';
import type { AlertChannel, AlertEventId, NotificationSettings, TimeZone } from '@/types/console/settings';

import {
  ALERT_CHANNELS,
  ALERT_EVENTS,
  QUIET_FROM_OPTIONS,
  QUIET_UNTIL_OPTIONS,
  refundTargetLabel,
  TIME_ZONES,
} from '../lib/settingsCopy';
import type { PaymentsDraft } from '../lib/settingsForm';
import { SettingsCard, SettingsGrid, SettingsRow } from './SettingsLayout';
import styles from './SettingsPanels.module.css';

interface NotificationSettingsPanelProps {
  draft: NotificationSettings;
  /** The refund service target, quoted in the refund alert's description. */
  refundTargetHours: PaymentsDraft['refundTargetHours'];
  timeZone: TimeZone;
  isSendingTest: boolean;
  onChange: (change: Partial<NotificationSettings>) => void;
  onSendTest: () => void;
}

const toOptions = (times: readonly string[]) => times.map((time) => ({ value: time, label: time }));

export function NotificationSettingsPanel({
  draft,
  refundTargetHours,
  timeZone,
  isSendingTest,
  onChange,
  onSendTest,
}: NotificationSettingsPanelProps) {
  const enabledCount = Object.values(draft.alerts).reduce(
    (total, channels) => total + Object.values(channels).filter(Boolean).length,
    0,
  );
  const totalCount = ALERT_EVENTS.length * ALERT_CHANNELS.length;
  const zoneName = TIME_ZONES.find((zone) => zone.value === timeZone)?.short ?? timeZone;

  const toggleAlert = (event: AlertEventId, channel: AlertChannel) =>
    onChange({
      alerts: {
        ...draft.alerts,
        [event]: { ...draft.alerts[event], [channel]: !draft.alerts[event][channel] },
      },
    });

  return (
    <>
      <SettingsCard
        title="Operations alerts"
        description="Who hears about what, and how. Sent to the 4 active Operations staff, including you."
        aside={
          <>
            <span>
              {enabledCount} of {totalCount} alerts on
            </span>
            <Button variant="quiet" loading={isSendingTest} onClick={onSendTest}>
              Send test alert
            </Button>
          </>
        }
      >
        <Table minWidth={560} className={styles.alertTable}>
          <thead>
            <tr>
              <th scope="col">Event</th>
              {ALERT_CHANNELS.map((channel) => (
                <th key={channel.id} scope="col" className={styles.center}>
                  {channel.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ALERT_EVENTS.map((event) => (
              <tr key={event.id}>
                <th scope="row" className={styles.eventCell}>
                  <span className={styles.stack}>
                    <span className={styles.strong}>{event.label}</span>
                    <span className={styles.meta}>
                      {event.id === 'refundSla'
                        ? `A request has waited longer than ${refundTargetLabel(refundTargetHours)} (your service target)`
                        : event.description}
                    </span>
                  </span>
                </th>
                {ALERT_CHANNELS.map((channel) => (
                  <td key={channel.id} className={styles.center}>
                    <Switch
                      label={`${event.label} by ${channel.label.toLowerCase()}`}
                      labelHidden
                      className={styles.inlineSwitch}
                      checked={draft.alerts[event.id][channel.id]}
                      onChange={() => toggleAlert(event.id, channel.id)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </Table>
      </SettingsCard>

      <SettingsCard
        title="Quiet hours"
        description="Hold SMS alerts overnight. Email and in-app alerts still arrive and wait for the morning shift."
        aside={
          <span className={styles.switchWithText}>
            <span aria-hidden="true">{draft.quietHours ? 'On' : 'Off'}</span>
            <Switch
              label="Quiet hours"
              labelHidden
              checked={draft.quietHours}
              onChange={(quietHours) => onChange({ quietHours })}
            />
          </span>
        }
      >
        <SettingsGrid>
          <SelectField
            label="From"
            value={draft.quietFrom}
            options={toOptions(QUIET_FROM_OPTIONS)}
            disabled={!draft.quietHours}
            onChange={(event) => onChange({ quietFrom: event.target.value })}
          />
          <SelectField
            label="Until"
            value={draft.quietUntil}
            options={toOptions(QUIET_UNTIL_OPTIONS)}
            disabled={!draft.quietHours}
            onChange={(event) => onChange({ quietUntil: event.target.value })}
          />
          <p className={styles.quietNote}>
            {draft.quietHours
              ? `SMS alerts pause from ${draft.quietFrom} to ${draft.quietUntil}, ${zoneName}${
                  draft.disruptionsBreakThrough
                    ? ' · disruptions still come through'
                    : ' · including disruptions'
                }`
              : 'Off · SMS alerts are sent at any hour'}
          </p>
        </SettingsGrid>
        <SettingsRow>
          <Switch
            className={styles.wideSwitch}
            label="Flight disruptions break through"
            description="Cancellations and delays over 60 minutes are sent by SMS at any hour."
            placement="end"
            checked={draft.disruptionsBreakThrough}
            disabled={!draft.quietHours}
            onChange={(disruptionsBreakThrough) => onChange({ disruptionsBreakThrough })}
          />
        </SettingsRow>
      </SettingsCard>
    </>
  );
}

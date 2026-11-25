import { useState } from 'react';
import { Link } from 'react-router';

import { paths } from '@/app/paths';
import { Icon, type IconName } from '@/components/icons';
import {
  Button,
  Dialog,
  SegmentedControl,
  SelectField,
  StatusChip,
  Switch,
  TextAreaField,
  TextField,
} from '@/components/ui';
import type { PaymentMethodId, PayoutSchedule, SettingsOverview } from '@/types/console/settings';

import {
  autoApproveHelp,
  helpFor,
  PAYOUT_SCHEDULES,
  REFUND_DESTINATIONS,
  REFUND_TARGETS,
  refundTargetLabel,
} from '../lib/settingsCopy';
import type { PaymentsDraft, SettingsErrors } from '../lib/settingsForm';
import { SettingsCard, SettingsGrid, SettingsMediaRow, SettingsRow, SettingText } from './SettingsLayout';
import styles from './SettingsPanels.module.css';

const METHOD_ICONS: Record<PaymentMethodId, IconName> = {
  card: 'creditCard',
  wallet: 'wallet',
  bank: 'bank',
  cash: 'cash',
};
const MIN_REASON_LENGTH = 10;

interface PaymentSettingsPanelProps {
  draft: PaymentsDraft;
  overview: Pick<SettingsOverview, 'providers' | 'payoutForecasts' | 'settlementAccount'>;
  errors: SettingsErrors;
  isBusy: boolean;
  onChange: (change: Partial<PaymentsDraft>) => void;
  /** Resolves true once the request is sent. */
  onRequestSettlementChange: (reason: string) => Promise<boolean>;
}

export function PaymentSettingsPanel({
  draft,
  overview,
  errors,
  isBusy,
  onChange,
  onRequestSettlementChange,
}: PaymentSettingsPanelProps) {
  const [isSettlementOpen, setIsSettlementOpen] = useState(false);
  const { providers, payoutForecasts, settlementAccount } = overview;
  const enabledCount = providers.filter((provider) => draft.methods[provider.id]).length;
  const forecast = payoutForecasts[draft.payoutSchedule];

  return (
    <>
      <SettingsCard
        title="Payment methods at checkout"
        description="Providers that take customer payments in this market. Turning one off hides it at checkout straight away after saving."
        aside={`${enabledCount} of ${providers.length} on at checkout`}
      >
        {providers.map((provider) => {
          const isOn = draft.methods[provider.id];
          return (
            <SettingsMediaRow
              key={provider.id}
              media={
                <span className={styles.iconTile} aria-hidden="true">
                  <Icon name={METHOD_ICONS[provider.id]} size={18} />
                </span>
              }
              title={provider.name}
              description={provider.description}
              facts={
                <>
                  <span className={styles.chipSlot}>
                    <StatusChip tone={isOn ? provider.health.tone : 'muted'} size="compact">
                      {isOn ? provider.health.label : 'Off at checkout'}
                    </StatusChip>
                  </span>
                  <span className={styles.figure}>
                    <span className={styles.figureLabel}>Fee</span>
                    {provider.fee}
                  </span>
                  <span className={styles.figure}>
                    <span className={styles.figureLabel}>Success, 24 h</span>
                    {isOn ? provider.successRate : '—'}
                  </span>
                </>
              }
              control={
                <span className={styles.switchWithText}>
                  <span aria-hidden="true">{isOn ? 'On' : 'Off'}</span>
                  <Switch
                    label={`${provider.name} at checkout`}
                    labelHidden
                    checked={isOn}
                    onChange={(checked) =>
                      onChange({ methods: { ...draft.methods, [provider.id]: checked } })
                    }
                  />
                </span>
              }
            />
          );
        })}
        {errors.paymentMethods && (
          <SettingsRow className={styles.errorRow}>
            <p role="alert">{errors.paymentMethods}</p>
          </SettingsRow>
        )}
      </SettingsCard>

      <SettingsCard
        title="Payouts"
        description="When settled customer payments are paid into the settlement account."
      >
        <SettingsGrid>
          <div className={styles.field}>
            <span className={styles.fieldLabel} aria-hidden="true">
              Payout schedule
            </span>
            <SegmentedControl<PayoutSchedule>
              label="Payout schedule"
              appearance="soft"
              fullWidth
              options={PAYOUT_SCHEDULES}
              value={draft.payoutSchedule}
              onChange={(payoutSchedule) => onChange({ payoutSchedule })}
            />
            <span className={styles.help}>{forecast.description}</span>
          </div>
          <TextField
            label="Minimum payout"
            required
            prefix="₱"
            inputMode="numeric"
            value={draft.minimumPayout}
            error={errors.minimumPayout}
            helpText="Smaller balances roll over to the next payout"
            onChange={(event) => onChange({ minimumPayout: event.target.value })}
          />
          <div className={styles.forecast}>
            <span className={styles.meta}>Next payout · estimated</span>
            <span className={styles.forecastAmount}>{forecast.amount}</span>
            <span className={styles.meta}>{forecast.when} · after provider fees</span>
          </div>
        </SettingsGrid>
        <SettingsRow>
          <span className={styles.iconTile} aria-hidden="true">
            <Icon name="bank" size={18} />
          </span>
          <SettingText
            title="Settlement account"
            description={
              <>
                <span className={styles.strongLine}>{settlementAccount.name}</span>
                {settlementAccount.detail}
              </>
            }
          />
          {settlementAccount.isChangeRequested ? (
            <StatusChip tone="warning" hideDot size="compact">
              Change requested · waiting for {settlementAccount.approver}
            </StatusChip>
          ) : (
            <Button variant="quiet" aria-haspopup="dialog" onClick={() => setIsSettlementOpen(true)}>
              Request change
            </Button>
          )}
        </SettingsRow>
      </SettingsCard>

      <SettingsCard
        title="Refund defaults"
        description="How new refund requests are handled before anyone reviews them."
        aside={<Link to={paths.console.refunds}>Open refunds queue</Link>}
      >
        <SettingsRow>
          <Switch
            className={styles.wideSwitch}
            label="Auto-approve small refunds"
            description="Requests within fare rules and under the limit are refunded without review."
            placement="end"
            checked={draft.autoApproveRefunds}
            onChange={(autoApproveRefunds) => onChange({ autoApproveRefunds })}
          />
        </SettingsRow>
        <SettingsGrid>
          <TextField
            label="Auto-approve under"
            required
            prefix="₱"
            inputMode="numeric"
            value={draft.autoApproveLimit}
            disabled={!draft.autoApproveRefunds}
            error={errors.autoApproveLimit}
            helpText={autoApproveHelp(draft)}
            onChange={(event) => onChange({ autoApproveLimit: event.target.value })}
          />
          <SelectField
            label="Service target"
            required
            value={draft.refundTargetHours}
            options={REFUND_TARGETS}
            helpText={`Requests older than ${refundTargetLabel(draft.refundTargetHours)} are flagged on the Refunds queue and alert Operations`}
            onChange={(event) =>
              onChange({ refundTargetHours: event.target.value as PaymentsDraft['refundTargetHours'] })
            }
          />
          <SelectField
            label="Refund to"
            required
            value={draft.refundTo}
            options={REFUND_DESTINATIONS}
            helpText={helpFor(REFUND_DESTINATIONS, draft.refundTo)}
            onChange={(event) => onChange({ refundTo: event.target.value as PaymentsDraft['refundTo'] })}
          />
        </SettingsGrid>
      </SettingsCard>

      {isSettlementOpen && (
        <SettlementChangeDialog
          approver={settlementAccount.approver}
          isBusy={isBusy}
          onClose={() => setIsSettlementOpen(false)}
          onSend={async (reason) => {
            if (await onRequestSettlementChange(reason)) setIsSettlementOpen(false);
          }}
        />
      )}
    </>
  );
}

function SettlementChangeDialog({
  approver,
  isBusy,
  onClose,
  onSend,
}: {
  approver: string;
  isBusy: boolean;
  onClose: () => void;
  onSend: (reason: string) => void;
}) {
  const [reason, setReason] = useState('');
  const [hasTried, setHasTried] = useState(false);
  const isLongEnough = reason.trim().length >= MIN_REASON_LENGTH;

  return (
    <Dialog
      open
      onClose={onClose}
      size="medium"
      title="Request a settlement account change"
      description="For security, Finance makes this change after verifying the new account with the bank. Payouts keep going to ···· 8812 until then."
      busy={isBusy}
      footer={
        <>
          <Button variant="quiet" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            loading={isBusy}
            onClick={() => {
              setHasTried(true);
              if (isLongEnough) onSend(reason.trim());
            }}
          >
            Send request
          </Button>
        </>
      }
    >
      <TextAreaField
        label="What should change, and why?"
        required
        rows={3}
        placeholder="e.g. Moving payouts to the new peso operating account opened in September"
        value={reason}
        error={
          hasTried && !isLongEnough
            ? `Add a short reason (at least ${MIN_REASON_LENGTH} characters)`
            : undefined
        }
        helpText={
          isLongEnough
            ? `${approver} gets an email and a task in the console`
            : `Add a short reason (at least ${MIN_REASON_LENGTH} characters)`
        }
        onChange={(event) => setReason(event.target.value)}
      />
    </Dialog>
  );
}

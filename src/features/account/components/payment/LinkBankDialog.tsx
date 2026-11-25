import clsx from 'clsx';
import { useState } from 'react';

import { Icon } from '@/components/icons';
import { Button, Checkbox, ChoiceCard, Dialog, TextField } from '@/components/ui';
import { DEMO_TODAY } from '@/config/demo';
import { LINKABLE_BANKS } from '@/data/paymentOptions';
import { formatDayLabel } from '@/lib/date';
import { linkBankAccount, listBankAccounts } from '@/services/paymentMethodsService';
import type { BankAccountOption, PaymentProfile } from '@/types/payment';

import styles from './LinkDialogs.module.css';

const STEPS = ['Choose bank', 'Authorise', 'Linked'] as const;

type BankStep = 'choose' | 'authorise' | 'linked';
const STEP_INDEX: Record<BankStep, number> = { choose: 0, authorise: 1, linked: 2 };

interface LinkBankDialogProps {
  onClose: () => void;
  onLinked: (profile: PaymentProfile) => void;
}

/** Choose a bank, pick the account and consent, then confirm. The bank handles sign-in in its own app. */
export function LinkBankDialog({ onClose, onLinked }: LinkBankDialogProps) {
  const [step, setStep] = useState<BankStep>('choose');
  const [query, setQuery] = useState('');
  const [bankId, setBankId] = useState<string>();
  const [accounts, setAccounts] = useState<BankAccountOption[]>([]);
  const [accountId, setAccountId] = useState<string>();
  const [hasConsented, setHasConsented] = useState(false);
  const [hasTried, setHasTried] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [linkedProfile, setLinkedProfile] = useState<PaymentProfile>();

  const stepIndex = STEP_INDEX[step];
  const bank = LINKABLE_BANKS.find((candidate) => candidate.id === bankId);
  const account = accounts.find((candidate) => candidate.id === accountId);
  const search = query.trim().toLowerCase();
  const matchingBanks = LINKABLE_BANKS.filter(
    (candidate) => !search || candidate.name.toLowerCase().includes(search),
  );

  const continueToAuthorise = async () => {
    if (!bank) return;
    setIsBusy(true);
    try {
      const options = await listBankAccounts(bank.id);
      setAccounts(options);
      setAccountId((current) => current ?? options[0]?.id);
      setHasTried(false);
      setStep('authorise');
    } finally {
      setIsBusy(false);
    }
  };

  const authorise = async () => {
    if (!bank || !account) return;
    if (!hasConsented) {
      setHasTried(true);
      return;
    }
    setIsBusy(true);
    try {
      setLinkedProfile(await linkBankAccount(bank.id, account.id));
      setStep('linked');
    } finally {
      setIsBusy(false);
    }
  };

  const close = () => (linkedProfile ? onLinked(linkedProfile) : onClose());

  const titles: Record<BankStep, { title: string; description: string }> = {
    choose: {
      title: 'Choose your bank',
      description: 'Pay straight from your account at checkout — no card needed.',
    },
    authorise: {
      title: 'Authorise Vela',
      description: 'Pick the account and review what Vela can and can’t do.',
    },
    linked: { title: 'Bank linked', description: 'You can pay with it on your next booking.' },
  };

  const footer = {
    choose: (
      <>
        <Button variant="quiet" onClick={close}>
          Cancel
        </Button>
        <Button variant="primary" disabled={!bank} loading={isBusy} onClick={continueToAuthorise}>
          Continue
        </Button>
      </>
    ),
    authorise: (
      <>
        <Button variant="quiet" onClick={() => setStep('choose')}>
          Back
        </Button>
        <Button variant="primary" loading={isBusy} onClick={authorise}>
          Authorise with {bank?.shortName ?? 'your bank'}
        </Button>
      </>
    ),
    linked: (
      <Button variant="primary" onClick={close}>
        Done
      </Button>
    ),
  }[step];

  return (
    <Dialog
      open
      onClose={close}
      size="large"
      eyebrow={`Link a bank · step ${stepIndex + 1} of 3`}
      title={titles[step].title}
      description={titles[step].description}
      footer={footer}
    >
      <ol aria-label="Steps" className={styles.progress}>
        {STEPS.map((label, index) => (
          <li
            key={label}
            aria-current={index === stepIndex ? 'step' : undefined}
            className={styles.progressItem}
          >
            <span
              className={clsx(
                styles.bar,
                index < stepIndex && styles.barDone,
                index === stepIndex && styles.barCurrent,
              )}
            />
            <span
              className={clsx(
                styles.progressLabel,
                index < stepIndex && styles.labelDone,
                index === stepIndex && styles.labelCurrent,
              )}
            >
              {label}
            </span>
          </li>
        ))}
      </ol>

      {step === 'choose' && (
        <>
          <TextField
            label="Search banks"
            labelHidden
            leadingIcon="search"
            placeholder="Search banks"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <fieldset className={styles.options}>
            <legend className="visually-hidden">Bank</legend>
            {matchingBanks.map((candidate) => (
              <ChoiceCard
                key={candidate.id}
                name="link-bank"
                indicator="end"
                checked={bankId === candidate.id}
                onChange={() => setBankId(candidate.id)}
                leading={
                  <span className={styles.monogram} aria-hidden="true">
                    {candidate.monogram}
                  </span>
                }
                title={candidate.name}
                description={candidate.note}
              />
            ))}
            {matchingBanks.length === 0 && (
              <p className={styles.empty}>
                No banks match “{query.trim()}”. We support 40+ Philippine banks — try the bank’s short name.
              </p>
            )}
          </fieldset>
        </>
      )}

      {step === 'authorise' && bank && (
        <>
          <fieldset className={styles.accountGroup}>
            <legend className={styles.groupLabel}>Account to link</legend>
            <div className={styles.accounts}>
              {accounts.map((candidate) => (
                <ChoiceCard
                  key={candidate.id}
                  name="link-account"
                  checked={accountId === candidate.id}
                  onChange={() => setAccountId(candidate.id)}
                  title={candidate.label}
                  description={candidate.holderName}
                />
              ))}
            </div>
          </fieldset>
          <div className={styles.permissions}>
            <div className={styles.can}>
              <span className={styles.canTitle}>Vela can</span>
              <span>See the account name and last 4 digits</span>
              <span>Request payments you approve, one at a time</span>
            </div>
            <div className={styles.cannot}>
              <span className={styles.cannotTitle}>Vela can’t</span>
              <span>See your balance or transactions</span>
              <span>Move money without your approval</span>
            </div>
          </div>
          <div className={styles.consent}>
            <Checkbox
              className={clsx(styles.consentBox, hasTried && !hasConsented && styles.consentInvalid)}
              label="I allow Vela Travel to request payments from this account. I can unlink it any time in Payment methods."
              checked={hasConsented}
              aria-invalid={hasTried && !hasConsented ? true : undefined}
              onChange={(event) => setHasConsented(event.target.checked)}
            />
            {hasTried && !hasConsented && (
              <span role="alert" className={styles.error}>
                Tick the box to allow payment requests — we can’t link the account without it.
              </span>
            )}
          </div>
          <p className={styles.handoff}>
            <Icon name="lock" size={16} strokeWidth={1.8} className={styles.factIcon} />
            {bank.name} will ask you to sign in and confirm in its app. Vela never sees your banking password.
          </p>
        </>
      )}

      {step === 'linked' && bank && account && (
        <div role="status" className={styles.linked}>
          <div className={styles.linkedBanner}>
            <span className={styles.linkedIcon} aria-hidden="true">
              <Icon name="check" size={20} strokeWidth={2.4} />
            </span>
            <span className={styles.waitingText}>
              <span className={styles.linkedTitle}>{bank.name} is linked</span>
              <span className={styles.waitingDetail}>Choose Online banking at checkout to pay from it.</span>
            </span>
          </div>
          <dl className={styles.rows}>
            {[
              { label: 'Account', value: account.label },
              { label: 'Account name', value: account.holderName },
              { label: 'Linked', value: `${formatDayLabel(DEMO_TODAY)} ${DEMO_TODAY.slice(0, 4)}` },
            ].map((row) => (
              <div key={row.label} className={styles.rowItem}>
                <dt className={styles.rowLabel}>{row.label}</dt>
                <dd className={styles.rowValue}>{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </Dialog>
  );
}

import clsx from 'clsx';

import { Icon, type IconName } from '@/components/icons';
import { Alert, Checkbox, ChoiceCard, SelectField, TextField } from '@/components/ui';
import { BILLING_COUNTRIES, ONLINE_BANKS, WALLET_PROVIDERS } from '@/data/paymentOptions';
import { detectCardBrand, formatCardNumberInput, formatExpiryInput, digitsOnly } from '@/lib/validation';
import type { PaymentMethodKind, SavedCard } from '@/types/payment';

import type { NewCardErrors, NewCardField, NewCardForm, PaymentChoice } from '../../lib/paymentForm';
import styles from './PaymentMethodSection.module.css';

const METHODS: ReadonlyArray<{ id: PaymentMethodKind; label: string; icon: IconName }> = [
  { id: 'card', label: 'Card', icon: 'creditCard' },
  { id: 'wallet', label: 'E-wallet', icon: 'smartphone' },
  { id: 'bank', label: 'Online banking', icon: 'bank' },
];

interface PaymentMethodSectionProps {
  choice: PaymentChoice;
  onChoiceChange: (patch: Partial<PaymentChoice>) => void;
  savedCard: SavedCard | undefined;
  newCard: NewCardForm;
  newCardErrors: NewCardErrors;
  onNewCardChange: (patch: Partial<NewCardForm>) => void;
  showBankError: boolean;
  totalLabel: string;
}

export function PaymentMethodSection({
  choice,
  onChoiceChange,
  savedCard,
  newCard,
  newCardErrors,
  onNewCardChange,
  showBankError,
  totalLabel,
}: PaymentMethodSectionProps) {
  const wallet = WALLET_PROVIDERS.find((provider) => provider.id === choice.walletId) ?? WALLET_PROVIDERS[0];
  const cardField = (field: NewCardField) => ({
    error: newCardErrors[field],
    required: true,
    value: newCard[field],
  });

  return (
    <section className={styles.section} aria-labelledby="payment-method-title">
      <h2 id="payment-method-title" className={styles.title}>
        Payment method
      </h2>

      <fieldset className={styles.methods}>
        <legend className="visually-hidden">Payment method</legend>
        {METHODS.map((method) => (
          <label key={method.id} className={styles.method}>
            <input
              type="radio"
              name="payment-method"
              className="visually-hidden"
              checked={choice.method === method.id}
              onChange={() => onChoiceChange({ method: method.id })}
            />
            <Icon name={method.icon} size={20} />
            {method.label}
          </label>
        ))}
      </fieldset>

      {choice.method === 'card' && (
        <div className={styles.panel}>
          <fieldset className={styles.list}>
            <legend className="visually-hidden">Card</legend>
            {savedCard && (
              <ChoiceCard
                name="card-source"
                checked={choice.cardSource === 'saved'}
                onChange={() => onChoiceChange({ cardSource: 'saved' })}
                leading={
                  <span className={styles.cardTile} aria-hidden="true">
                    <span className={styles.cardChip} />
                  </span>
                }
                title={`Card ending ${savedCard.last4}`}
                description={`Andrea L. Reyes · expires ${savedCard.expiry}`}
                meta={<span className={styles.defaultBadge}>Default</span>}
              />
            )}
            <ChoiceCard
              name="card-source"
              title="Use a different card"
              checked={choice.cardSource === 'new' || !savedCard}
              onChange={() => onChoiceChange({ cardSource: 'new' })}
            />
          </fieldset>

          {(choice.cardSource === 'new' || !savedCard) && (
            <div className={styles.cardForm}>
              <TextField
                className={styles.fullRow}
                label="Name on card"
                placeholder="As printed on the card"
                autoComplete="cc-name"
                {...cardField('holderName')}
                onChange={(event) => onNewCardChange({ holderName: event.target.value })}
              />
              <TextField
                className={styles.fullRow}
                label="Card number"
                placeholder="1234 5678 9012 3456"
                inputMode="numeric"
                autoComplete="cc-number"
                inputClassName={styles.cardNumber}
                trailing={
                  <span className={styles.brand}>
                    {detectCardBrand(digitsOnly(newCard.number)) ?? <Icon name="creditCard" size={18} />}
                  </span>
                }
                {...cardField('number')}
                onChange={(event) => onNewCardChange({ number: formatCardNumberInput(event.target.value) })}
              />
              <TextField
                label="Expiry"
                placeholder="MM / YY"
                inputMode="numeric"
                autoComplete="cc-exp"
                {...cardField('expiry')}
                onChange={(event) => onNewCardChange({ expiry: formatExpiryInput(event.target.value) })}
              />
              <TextField
                label="Security code"
                placeholder="3 or 4 digits"
                inputMode="numeric"
                autoComplete="cc-csc"
                maxLength={4}
                {...cardField('securityCode')}
                onChange={(event) =>
                  onNewCardChange({ securityCode: digitsOnly(event.target.value).slice(0, 4) })
                }
              />
              <SelectField
                label="Billing country"
                required
                options={BILLING_COUNTRIES.map((country) => ({ value: country, label: country }))}
                value={newCard.billingCountry}
                onChange={(event) => onNewCardChange({ billingCountry: event.target.value })}
              />
              <Checkbox
                className={clsx(styles.fullRow, styles.saveCard)}
                label="Save this card to my Vela account for next time"
                checked={newCard.saveToAccount}
                onChange={(event) => onNewCardChange({ saveToAccount: event.target.checked })}
              />
            </div>
          )}
        </div>
      )}

      {choice.method === 'wallet' && (
        <div className={styles.panel}>
          <fieldset className={styles.walletGrid}>
            <legend className="visually-hidden">E-wallet</legend>
            {WALLET_PROVIDERS.map((provider) => (
              <ChoiceCard
                key={provider.id}
                name="wallet"
                indicator="end"
                checked={choice.walletId === provider.id}
                onChange={() => onChoiceChange({ walletId: provider.id })}
                leading={
                  <span
                    className={clsx(styles.monogram, choice.walletId === provider.id && styles.monogramOn)}
                    aria-hidden="true"
                  >
                    {provider.monogram}
                  </span>
                }
                title={provider.name}
                description={provider.approveHint}
              />
            ))}
          </fieldset>
          <Alert tone="info" icon="smartphone">
            After you confirm, we’ll open {wallet.name} so you can approve <strong>{totalLabel}</strong>. Keep
            this page open until you’re returned here.
          </Alert>
        </div>
      )}

      {choice.method === 'bank' && (
        <div className={styles.panel}>
          <fieldset
            className={clsx(styles.bankGrid, showBankError && styles.invalid)}
            aria-invalid={showBankError}
            aria-describedby={showBankError ? 'bank-error' : undefined}
          >
            <legend className={styles.legend}>Choose your bank</legend>
            {ONLINE_BANKS.map((bank) => (
              <ChoiceCard
                key={bank.id}
                name="bank"
                indicator="end"
                checked={choice.bankId === bank.id}
                onChange={() => onChoiceChange({ bankId: bank.id })}
                leading={
                  <span
                    className={clsx(styles.bankIcon, choice.bankId === bank.id && styles.monogramOn)}
                    aria-hidden="true"
                  >
                    <Icon name="bank" size={16} />
                  </span>
                }
                title={bank.name}
              />
            ))}
          </fieldset>
          {showBankError && (
            <p id="bank-error" role="alert" className={styles.error}>
              Choose the bank you’ll pay from to continue.
            </p>
          )}
          <Alert tone="info" icon="clock">
            We’ll hold your booking for <strong>3 hours</strong> while you pay through online banking. Fares
            aren’t guaranteed until payment is received, and seats are released if the hold expires.
          </Alert>
        </div>
      )}
    </section>
  );
}

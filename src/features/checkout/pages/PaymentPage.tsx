import clsx from 'clsx';
import { useCallback, useState } from 'react';
import { Link } from 'react-router';

import { paths } from '@/app/paths';
import { useSession } from '@/app/providers';
import { Icon } from '@/components/icons';
import { Button, useToast } from '@/components/ui';
import { DEMO_TODAY_PARTS } from '@/config/demo';
import { AIRLINES } from '@/data/airports';
import { ONLINE_BANKS, WALLET_PROVIDERS } from '@/data/paymentOptions';
import { useAsyncData, useDocumentTitle, useNow } from '@/hooks';
import { formatPeso } from '@/lib/format';
import { digitsOnly } from '@/lib/validation';
import { getFareFamily } from '@/services/flightsService';
import { getPaymentProfile } from '@/services/paymentsService';

import { FareRulesDialog } from '../components/payment/FareRulesDialog';
import { PaymentFlowDialogs } from '../components/payment/PaymentFlowDialogs';
import { PaymentMethodSection } from '../components/payment/PaymentMethodSection';
import { PromoCodeSection } from '../components/payment/PromoCodeSection';
import { TravelerReview } from '../components/payment/TravelerReview';
import { StepIntro } from '../components/StepIntro';
import { useCheckoutContext } from '../hooks/useCheckoutContext';
import { usePaymentFlow } from '../hooks/usePaymentFlow';
import {
  EMPTY_NEW_CARD,
  getNewCardErrors,
  isNewCardComplete,
  type NewCardForm,
  type PaymentChoice,
} from '../lib/paymentForm';
import { findPromoCode } from '../lib/promoCodes';
import { confirmCheckout, setPromoCode } from '../state/checkoutStore';
import styles from './PaymentPage.module.css';

export function PaymentPage() {
  useDocumentTitle('Review and pay');
  const toast = useToast();
  const { customer } = useSession();
  const { checkout, selection, price } = useCheckoutContext();
  const profile = useAsyncData('payment-profile', getPaymentProfile);
  const now = useNow(30_000);

  const savedCard = profile.data?.cards.find((card) => card.id === profile.data?.defaultCardId);
  const [choice, setChoice] = useState<PaymentChoice>({
    method: 'card',
    cardSource: 'saved',
    walletId: 'gcash',
    bankId: null,
  });
  const [newCard, setNewCard] = useState<NewCardForm>(EMPTY_NEW_CARD);
  const [hasTriedCard, setHasTriedCard] = useState(false);
  const [hasTriedBank, setHasTriedBank] = useState(false);
  const [hasAgreed, setHasAgreed] = useState(false);
  const [hasTriedAgree, setHasTriedAgree] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);

  const flow = usePaymentFlow(useCallback((reference: string) => confirmCheckout(reference), []));

  const airline = AIRLINES[selection.offer.airlineId];
  const fare = getFareFamily(selection.fareFamily);
  const totalLabel = formatPeso(price.total);
  const appliedPromo = checkout.promoCode ? findPromoCode(checkout.promoCode) : undefined;
  const usesNewCard = choice.method === 'card' && (choice.cardSource === 'new' || !savedCard);
  const newCardDigits = digitsOnly(newCard.number);
  const cardLast4 = usesNewCard ? newCardDigits.slice(-4) : (savedCard?.last4 ?? '');
  const wallet = WALLET_PROVIDERS.find((provider) => provider.id === choice.walletId) ?? WALLET_PROVIDERS[0];
  const bank = ONLINE_BANKS.find((candidate) => candidate.id === choice.bankId);
  const needsCardDetails = usesNewCard && !isNewCardComplete(newCard, DEMO_TODAY_PARTS);
  const needsBank = choice.method === 'bank' && !bank;
  const holdMinutesLeft = checkout.holdExpiresAt
    ? Math.max(0, Math.round((checkout.holdExpiresAt - now) / 60_000))
    : 0;

  const payVia =
    choice.method === 'wallet'
      ? wallet.name
      : choice.method === 'bank'
        ? `${bank?.name ?? 'Your bank'} online banking`
        : `Card ending ${cardLast4}`;

  const payLabel =
    choice.method === 'wallet'
      ? `Pay with ${wallet.name} · ${totalLabel}`
      : choice.method === 'bank'
        ? `Hold and pay ${totalLabel}`
        : `Pay ${totalLabel}`;

  const hint = !hasAgreed
    ? 'Accept the fare rules above to continue.'
    : needsCardDetails
      ? hasTriedCard
        ? 'Check the highlighted card details.'
        : 'Complete your new card details to continue.'
      : needsBank
        ? hasTriedBank
          ? 'Choose your bank above.'
          : 'Choose your bank to continue.'
        : choice.method === 'wallet'
          ? `You’ll approve the payment in ${wallet.name}.`
          : choice.method === 'bank'
            ? `We’ll hold your booking while you pay at ${bank?.name}.`
            : 'Your bank may ask you to verify this payment.';
  const isHintError =
    (needsCardDetails && hasTriedCard) || (needsBank && hasTriedBank) || (!hasAgreed && hasTriedAgree);

  const handlePay = () => {
    if (!hasAgreed) return setHasTriedAgree(true);
    if (needsCardDetails) return setHasTriedCard(true);
    if (needsBank) return setHasTriedBank(true);
    void flow.start({ method: choice.method, amount: price.total, cardLast4 });
  };

  return (
    <>
      <StepIntro title="Review and pay">
        Check the details below. Your tickets are issued the moment payment goes through.
      </StepIntro>

      <TravelerReview travelers={checkout.travelers} seats={checkout.seats} extras={checkout.extras} />

      <PaymentMethodSection
        choice={choice}
        onChoiceChange={(patch) => setChoice((previous) => ({ ...previous, ...patch }))}
        savedCard={savedCard}
        newCard={newCard}
        newCardErrors={getNewCardErrors(newCard, DEMO_TODAY_PARTS, hasTriedCard)}
        onNewCardChange={(patch) => setNewCard((previous) => ({ ...previous, ...patch }))}
        showBankError={needsBank && hasTriedBank}
        totalLabel={totalLabel}
      />

      <PromoCodeSection
        applied={appliedPromo}
        onApply={(code) => setPromoCode(code)}
        onRemove={() => setPromoCode(null)}
      />

      <div className={styles.agreement}>
        <label className={clsx(styles.agreeLabel, !hasAgreed && hasTriedAgree && styles.agreeInvalid)}>
          <input
            type="checkbox"
            className={styles.agreeInput}
            checked={hasAgreed}
            aria-invalid={!hasAgreed && hasTriedAgree}
            aria-describedby={!hasAgreed && hasTriedAgree ? 'agree-error' : undefined}
            onChange={(event) => {
              setHasAgreed(event.target.checked);
              setHasTriedAgree(true);
            }}
          />
          <span>
            I’ve read the{' '}
            <button
              type="button"
              className={styles.inlineButton}
              aria-haspopup="dialog"
              onClick={() => setIsRulesOpen(true)}
            >
              {fare?.name} fare rules
            </button>
            , Vela’s <Link to={paths.legal('terms')}>terms of service</Link> and {airline.name}’s{' '}
            <Link to={paths.legal('carriage')}>conditions of carriage</Link>, and I confirm the traveler names
            match their passports.
          </span>
        </label>
        {!hasAgreed && hasTriedAgree && (
          <p id="agree-error" role="alert" className={styles.agreeError}>
            <Icon name="alertCircle" size={16} strokeWidth={1.8} />
            Tick the box to accept the fare rules and terms — we can’t take payment without it.
          </p>
        )}
      </div>

      <div className={styles.actions}>
        <Link to={paths.checkout.extras} className={styles.back}>
          <Icon name="chevronLeft" size={16} strokeWidth={1.8} />
          Back to extras
        </Link>
        <div className={styles.pay}>
          <Button variant="primary" size="large" iconStart="lock" onClick={handlePay}>
            {payLabel}
          </Button>
          <span className={isHintError ? styles.hintError : styles.hint} role="status">
            {hint}
          </span>
        </div>
      </div>

      <FareRulesDialog
        open={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
        fareName={fare?.name ?? 'Fare'}
        context={`${airline.name} · ${selection.offer.outbound.flightNumber}${
          selection.search.returnDate ? ` and ${selection.offer.inbound.flightNumber}` : ''
        } · ${checkout.travelers.length === 2 ? 'both travelers' : 'all travelers'}`}
        hasAccepted={hasAgreed}
        onAccept={() => {
          setHasAgreed(true);
          setHasTriedAgree(true);
          setIsRulesOpen(false);
        }}
      />

      <PaymentFlowDialogs
        state={flow.state}
        method={choice.method}
        totalLabel={totalLabel}
        payVia={payVia}
        providerName={choice.method === 'wallet' ? wallet.name : (bank?.name ?? 'your bank')}
        cardLast4={cardLast4}
        email={customer?.email ?? checkout.contact?.email ?? ''}
        holdMinutesLeft={holdMinutesLeft}
        onVerify={(code) => void flow.verify(code)}
        onResendCode={flow.resendCode}
        onCancel={() => {
          flow.cancel();
          toast.show({ tone: 'info', message: 'Payment cancelled — you haven’t been charged' });
        }}
        onRetry={() => void flow.start({ method: choice.method, amount: price.total, cardLast4 })}
        onUseAnotherMethod={() => {
          flow.cancel();
          setChoice((previous) => ({ ...previous, method: 'card', cardSource: 'new' }));
        }}
        onConfirmExternal={() => void flow.confirmExternal()}
        onReopenWallet={() => toast.show({ tone: 'info', message: `${wallet.name} opened in a new tab` })}
      />
    </>
  );
}

import { useState } from 'react';

import { paths } from '@/app/paths';
import { useSession } from '@/app/providers';
import { Icon } from '@/components/icons';
import { PageLoader } from '@/components/layout';
import { Alert, Button, PageHeader, useToast } from '@/components/ui';
import { DEMO_TODAY_PARTS } from '@/config/demo';
import { useAsyncData, useDocumentTitle } from '@/hooks';
import { formatShortDate } from '@/lib/date';
import { ApiError } from '@/services/mockApi';
import * as paymentMethods from '@/services/paymentMethodsService';
import { getPaymentProfile } from '@/services/paymentsService';
import { fullNameOf } from '@/types/customer';
import type { PaymentProfile } from '@/types/payment';
import type { TravelCredit } from '@/types/travelCredit';

import { ConfirmActionDialog, type ConfirmAction } from '../components/ConfirmActionDialog';
import { AddCardForm } from '../components/payment/AddCardForm';
import { BillingCard } from '../components/payment/BillingCard';
import { LinkBankDialog } from '../components/payment/LinkBankDialog';
import { LinkedAccountsCard } from '../components/payment/LinkedAccountsCard';
import { LinkWalletDialog } from '../components/payment/LinkWalletDialog';
import { SavedCardTile } from '../components/payment/SavedCardTile';
import { TravelCreditCard } from '../components/payment/TravelCreditCard';
import { TravelCreditDialog } from '../components/payment/TravelCreditDialog';
import { isSavedCardExpired, maskMobileNumber } from '../lib/paymentMethodForms';
import styles from './PaymentMethodsPage.module.css';

const BREADCRUMBS = [
  { label: 'Home', to: paths.home },
  { label: 'Account', to: paths.trips },
  { label: 'Payment methods' },
];

type PaymentDialog =
  | { kind: 'removeCard'; cardId: string }
  | { kind: 'unlinkWallet' }
  | { kind: 'unlinkBank' }
  | { kind: 'linkWallet' }
  | { kind: 'linkBank' }
  | { kind: 'credit' }
  | null;

export function PaymentMethodsPage() {
  useDocumentTitle('Payment methods');
  const profile = useAsyncData('payment-profile', getPaymentProfile);
  const credit = useAsyncData('travel-credit', paymentMethods.getTravelCredit);

  if (profile.status === 'error' || credit.status === 'error') {
    return (
      <>
        <PageHeader title="Payment methods" breadcrumbs={BREADCRUMBS} />
        <Alert
          tone="danger"
          role="alert"
          title="We couldn’t load your payment methods"
          action={
            <Button
              variant="quiet"
              size="small"
              onClick={() => {
                profile.reload();
                credit.reload();
              }}
            >
              Try again
            </Button>
          }
        />
      </>
    );
  }
  if (!profile.data || !credit.data) return <PageLoader label="Loading payment methods…" />;
  return <PaymentMethodsView initialProfile={profile.data} credit={credit.data} />;
}

function PaymentMethodsView({
  initialProfile,
  credit,
}: {
  initialProfile: PaymentProfile;
  credit: TravelCredit;
}) {
  const toast = useToast();
  const { customer } = useSession();
  const [profile, setProfile] = useState(initialProfile);
  const [dialog, setDialog] = useState<PaymentDialog>(null);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmation, setConfirmation] = useState<string>();

  const accountName = customer ? fullNameOf(customer) : '';
  const close = () => setDialog(null);

  /** Runs a change, swaps in the updated profile and shows `message`. Resolves `false` on failure. */
  const save = async (operation: () => Promise<PaymentProfile>, message?: string): Promise<boolean> => {
    setIsSaving(true);
    try {
      setProfile(await operation());
      setDialog(null);
      setConfirmation(message);
      return true;
    } catch (error) {
      toast.show({
        tone: 'error',
        message: error instanceof ApiError ? error.message : 'That didn’t save. Please try again.',
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const removalAction = (): ConfirmAction | null => {
    if (dialog?.kind === 'removeCard') {
      const card = profile.cards.find((candidate) => candidate.id === dialog.cardId);
      if (!card) return null;
      return {
        title: `Remove card ending ${card.last4}?`,
        body: 'You won’t be able to pay with it on Vela until you add it again. Trips already paid with this card aren’t affected, and their refunds still go back to it.',
        icon: 'trash',
        items: [
          {
            icon: 'creditCard',
            label: `${card.kind} •••• ${card.last4}`,
            detail: `${card.holderName} · expires ${card.expiry}`,
          },
        ],
        keepLabel: 'Keep card',
        confirmLabel: 'Remove card',
      };
    }
    if (dialog?.kind === 'unlinkWallet' && profile.wallet) {
      return {
        title: 'Unlink your e-wallet?',
        body: 'It won’t be offered at checkout any more. Refunds for trips you paid with it still go back to the e-wallet. You can link it again any time.',
        icon: 'unlink',
        items: [
          {
            icon: 'smartphone',
            label: 'Mobile e-wallet',
            detail: `${maskMobileNumber(profile.wallet.mobileNumber)} · linked ${formatShortDate(profile.wallet.linkedOn)}`,
          },
        ],
        keepLabel: 'Keep it linked',
        confirmLabel: 'Unlink e-wallet',
      };
    }
    if (dialog?.kind === 'unlinkBank' && profile.bankAccount) {
      return {
        title: `Unlink ${profile.bankAccount.bankName}?`,
        body: 'You won’t be able to pay from this account at checkout. Payments already made aren’t affected, and Vela loses all access to the account straight away.',
        icon: 'unlink',
        items: [
          {
            icon: 'bank',
            label: profile.bankAccount.bankName,
            detail: `${profile.bankAccount.accountLabel} · linked ${formatShortDate(profile.bankAccount.linkedOn)}`,
          },
        ],
        keepLabel: 'Keep it linked',
        confirmLabel: 'Unlink account',
      };
    }
    return null;
  };

  const confirmRemoval = () => {
    if (dialog?.kind === 'removeCard') {
      const card = profile.cards.find((candidate) => candidate.id === dialog.cardId);
      void save(() => paymentMethods.removeCard(dialog.cardId), `Card ending ${card?.last4} was removed.`);
    } else if (dialog?.kind === 'unlinkWallet') {
      void save(paymentMethods.unlinkWallet, 'E-wallet unlinked. It won’t be offered at checkout any more.');
    } else if (dialog?.kind === 'unlinkBank') {
      void save(paymentMethods.unlinkBankAccount, 'Bank account unlinked.');
    }
  };

  const removal = removalAction();

  return (
    <>
      <PageHeader
        title="Payment methods"
        breadcrumbs={BREADCRUMBS}
        description={
          <span className={styles.description}>
            <Icon name="lock" size={16} strokeWidth={1.8} />
            Stored by our payment provider. Vela never sees your full card number.
          </span>
        }
        actions={
          <Button
            variant="primary"
            iconStart="plus"
            disabled={isAddingCard}
            onClick={() => {
              setIsAddingCard(true);
              setConfirmation(undefined);
            }}
          >
            Add a card
          </Button>
        }
      />

      {confirmation && (
        <Alert tone="success" role="status" icon="checkCircle">
          {confirmation}
        </Alert>
      )}

      <section aria-labelledby="cards-title" className={styles.section}>
        <h2 id="cards-title" className={styles.sectionTitle}>
          Cards
        </h2>
        <div className={styles.cardGrid}>
          {profile.cards.map((card) => (
            <SavedCardTile
              key={card.id}
              card={card}
              isDefault={card.id === profile.defaultCardId}
              isExpired={isSavedCardExpired(card, DEMO_TODAY_PARTS)}
              onMakeDefault={() =>
                save(
                  () => paymentMethods.setDefaultCard(card.id),
                  `Card ending ${card.last4} is now your default.`,
                )
              }
              onRemove={() => {
                setConfirmation(undefined);
                setDialog({ kind: 'removeCard', cardId: card.id });
              }}
            />
          ))}
        </div>
        {isAddingCard ? (
          <AddCardForm
            defaultHolderName={accountName}
            isSaving={isSaving}
            onCancel={() => setIsAddingCard(false)}
            onSave={async (draft) => {
              const last4 = draft.number.replace(/\D/g, '').slice(-4);
              if (await save(() => paymentMethods.addCard(draft), `Card ending ${last4} is saved.`)) {
                setIsAddingCard(false);
              }
            }}
          />
        ) : (
          <button type="button" className={styles.addTile} onClick={() => setIsAddingCard(true)}>
            <span className={styles.addIcon} aria-hidden="true">
              <Icon name="plus" size={16} strokeWidth={2} />
            </span>
            Add a credit or debit card
            <span className={styles.brands}>Visa, Mastercard, JCB, Amex</span>
          </button>
        )}
      </section>

      <section aria-labelledby="linked-title" className={styles.sectionTight}>
        <h2 id="linked-title" className={styles.sectionTitle}>
          E-wallets and banking
        </h2>
        <LinkedAccountsCard
          wallet={profile.wallet}
          bankAccount={profile.bankAccount}
          onLinkWallet={() => setDialog({ kind: 'linkWallet' })}
          onUnlinkWallet={() => setDialog({ kind: 'unlinkWallet' })}
          onLinkBank={() => setDialog({ kind: 'linkBank' })}
          onUnlinkBank={() => setDialog({ kind: 'unlinkBank' })}
        />
      </section>

      <div className={styles.twoUp}>
        <TravelCreditCard credit={credit} onShowDetails={() => setDialog({ kind: 'credit' })} />
        <BillingCard
          accountName={accountName}
          receiptEmail={customer?.email ?? ''}
          address={profile.billingAddress}
          company={profile.company}
          isSaving={isSaving}
          onSaveAddress={(address) => save(() => paymentMethods.updateBillingAddress(address))}
          onSaveCompany={(company) => save(() => paymentMethods.updateCompanyDetails(company))}
        />
      </div>

      {removal && (
        <ConfirmActionDialog action={removal} isBusy={isSaving} onClose={close} onConfirm={confirmRemoval} />
      )}
      {dialog?.kind === 'linkWallet' && (
        <LinkWalletDialog
          defaultNumber={customer?.mobile.replace(/^\+63\s*/, '') ?? ''}
          onClose={close}
          onLinked={(next) => {
            setProfile(next);
            close();
            setConfirmation('E-wallet linked. Choose it at checkout and approve in your app.');
          }}
        />
      )}
      {dialog?.kind === 'linkBank' && (
        <LinkBankDialog
          onClose={close}
          onLinked={(next) => {
            setProfile(next);
            close();
            setConfirmation(
              `${next.bankAccount?.bankName ?? 'Your bank'} is linked. Choose Online banking at checkout.`,
            );
          }}
        />
      )}
      {dialog?.kind === 'credit' && <TravelCreditDialog credit={credit} onClose={close} />}
    </>
  );
}

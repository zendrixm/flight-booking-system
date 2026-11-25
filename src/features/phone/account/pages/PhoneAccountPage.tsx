import { useState } from 'react';
import { useNavigate } from 'react-router';

import { paths } from '@/app/paths';
import { languageOf, usePreferences, useSession } from '@/app/providers';
import { Avatar, Button, Dialog, useToast } from '@/components/ui';
import { useAsyncData, useDocumentTitle } from '@/hooks';
import { initialsOf, pluralize } from '@/lib/format';
import { readStoredValue, writeStoredValue } from '@/lib/storage';
import { getPaymentProfile } from '@/services/paymentsService';
import { listPriceAlerts } from '@/services/priceAlertsService';
import { listSavedTravelers } from '@/services/travelersService';
import { fullNameOf } from '@/types/customer';

import { PhoneScreen } from '../../shared/components/PhoneScreen';
import { AccountLinkRow, AccountMenuGroup, AccountSwitchRow } from '../components/AccountMenu';
import styles from './PhoneAccountPage.module.css';

const APP_VERSION = '4.12.0';
/** Push permission belongs to this phone, not the account. */
const PUSH_STORAGE_KEY = 'vela.phone.pushNotifications';

async function loadAccountSummary() {
  const [travelers, paymentProfile, alerts] = await Promise.all([
    listSavedTravelers(),
    getPaymentProfile(),
    listPriceAlerts(),
  ]);
  const defaultCard = paymentProfile.cards.find((card) => card.id === paymentProfile.defaultCardId);
  return {
    travelerCount: travelers.length,
    cardLast4: defaultCard?.last4 ?? null,
    alertCount: alerts.length,
  };
}

export function PhoneAccountPage() {
  useDocumentTitle('Account');
  const navigate = useNavigate();
  const toast = useToast();
  const { customer, signOut } = useSession();
  const { currency, language } = usePreferences();
  const summary = useAsyncData('phone-account-summary', loadAccountSummary).data;
  const [hasPush, setHasPush] = useState(() => readStoredValue('local', PUSH_STORAGE_KEY, true));
  const [isSigningOut, setIsSigningOut] = useState(false);

  // The route is behind RequireAuth; this only guards the moment of signing out.
  if (!customer) return null;

  const togglePush = (next: boolean) => {
    setHasPush(next);
    writeStoredValue('local', PUSH_STORAGE_KEY, next);
    toast.show({ tone: 'success', message: next ? 'Push notifications on' : 'Push notifications off' });
  };

  const confirmSignOut = () => {
    setIsSigningOut(false);
    navigate(paths.phone.search, { replace: true });
    signOut();
    toast.show({ tone: 'success', message: 'You’re signed out' });
  };

  const fullName = fullNameOf(customer);

  return (
    <PhoneScreen
      header={
        <div className={styles.profile}>
          <Avatar
            initials={initialsOf(`${customer.firstName} ${customer.lastName}`)}
            size={56}
            tone="brass"
          />
          <span className={styles.profileText}>
            <h1 className={styles.name}>{fullName}</h1>
            <span className={styles.profileMeta}>
              {customer.memberTier} member · {pluralize(customer.tripCount, 'trip')} · {customer.email}
            </span>
          </span>
        </div>
      }
    >
      <AccountMenuGroup title="Account">
        <AccountLinkRow icon="user" label="Personal details" to={paths.account.settings} />
        <AccountLinkRow
          icon="users"
          label="Saved travelers"
          meta={summary && pluralize(summary.travelerCount, 'person', 'people')}
          to={paths.account.travelers}
        />
        <AccountLinkRow
          icon="creditCard"
          label="Payment methods"
          meta={summary?.cardLast4 ? `•••• ${summary.cardLast4}` : undefined}
          to={paths.account.paymentMethods}
        />
        <AccountLinkRow
          icon="bell"
          label="Price alerts"
          meta={summary && pluralize(summary.alertCount, 'route')}
          to={paths.phone.alerts}
        />
      </AccountMenuGroup>

      <AccountMenuGroup title="Preferences">
        <AccountSwitchRow
          icon="bell"
          label="Push notifications"
          description={hasPush ? 'Gate changes, check-in and price drops' : 'Off — you’ll only get emails'}
          checked={hasPush}
          onChange={togglePush}
        />
        <AccountLinkRow
          icon="globe"
          label="Currency and language"
          meta={`${currency} · ${languageOf(language).name}`}
          to={paths.account.settings}
        />
      </AccountMenuGroup>

      <AccountMenuGroup title="Support">
        <AccountLinkRow icon="helpCircle" label="Help centre" to={paths.help} />
        <AccountLinkRow icon="messageCircle" label="Chat with us" meta="24/7" to={paths.help} />
      </AccountMenuGroup>

      <Button
        variant="destructiveQuiet"
        size="large"
        fullWidth
        iconStart="logOut"
        aria-haspopup="dialog"
        onClick={() => setIsSigningOut(true)}
      >
        Sign out
      </Button>
      <p className={styles.version}>Vela app · version {APP_VERSION}</p>

      <Dialog
        open={isSigningOut}
        onClose={() => setIsSigningOut(false)}
        role="alertdialog"
        size="small"
        icon="logOut"
        iconTone="danger"
        title="Sign out of Vela?"
        description="Boarding passes stay in your phone’s wallet, but you won’t get gate or price-alert notifications on this phone until you sign in again."
        footer={
          <>
            <Button variant="quiet" onClick={() => setIsSigningOut(false)}>
              Stay signed in
            </Button>
            <Button variant="destructive" onClick={confirmSignOut}>
              Sign out
            </Button>
          </>
        }
      />
    </PhoneScreen>
  );
}

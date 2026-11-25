import { useState } from 'react';
import { Link, Navigate } from 'react-router';

import { paths } from '@/app/paths';
import { useSession } from '@/app/providers';
import { Icon } from '@/components/icons';
import { PageContainer } from '@/components/layout';
import { Button, Checkbox, ChoiceCard, LinkButton, PageHeader } from '@/components/ui';
import { DEMO_TODAY } from '@/config/demo';
import { AccountLayout } from '@/features/account/components/AccountLayout';
import { useAsyncData, useDocumentTitle } from '@/hooks';
import { daysBetween, formatDayLabel } from '@/lib/date';
import { getAccountSettings, signOutOtherDevices } from '@/services/accountSettingsService';
import { listTrips } from '@/services/tripsService';
import { fullNameOf } from '@/types/customer';
import type { Trip } from '@/types/trip';

import { forgetRememberedEmail } from '../lib/rememberedEmail';
import styles from './SignOutPage.module.css';

type SignOutScope = 'thisDevice' | 'allDevices';

interface SignedOutSummary {
  scope: SignOutScope;
  deviceCount: number;
  forgotEmail: boolean;
  firstName: string;
  nextTrip: Trip | undefined;
}

/** A trip departing within this many days gets a reminder about boarding passes. */
const SOON_DAYS = 7;

function whenLabel(trip: Trip): string {
  const days = daysBetween(DEMO_TODAY, trip.departDate);
  return days === 0 ? 'today' : days === 1 ? 'tomorrow' : `on ${formatDayLabel(trip.departDate)}`;
}

async function loadSignOutContext() {
  const [settings, trips] = await Promise.all([getAccountSettings(), listTrips()]);
  const nextTrip = trips
    .filter((trip) => trip.status === 'upcoming' && daysBetween(DEMO_TODAY, trip.departDate) <= SOON_DAYS)
    .sort((a, b) => a.departDate.localeCompare(b.departDate))[0];
  return { devices: settings.devices, nextTrip };
}

export function SignOutPage() {
  useDocumentTitle('Sign out');
  const { isSignedIn } = useSession();
  const [summary, setSummary] = useState<SignedOutSummary | null>(null);

  if (summary) return <SignedOutView summary={summary} />;
  if (!isSignedIn) return <Navigate to={paths.signIn} replace />;
  return (
    <AccountLayout>
      <SignOutConfirm onSignedOut={setSummary} />
    </AccountLayout>
  );
}

function SignOutConfirm({ onSignedOut }: { onSignedOut: (summary: SignedOutSummary) => void }) {
  const { customer, signOut } = useSession();
  const context = useAsyncData('sign-out-context', loadSignOutContext);
  const [scope, setScope] = useState<SignOutScope>('thisDevice');
  const [forgetEmail, setForgetEmail] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const devices = context.data?.devices ?? [];
  const currentDevice = devices.find((device) => device.isCurrent);
  const nextTrip = context.data?.nextTrip;
  const otherDevicesNote = devices.some((device) => device.kind === 'phone' && !device.isCurrent)
    ? 'including the Vela app on your phone'
    : 'every browser and app';

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      if (scope === 'allDevices') await signOutOtherDevices();
      if (forgetEmail) forgetRememberedEmail();
      onSignedOut({
        scope,
        deviceCount: scope === 'allDevices' ? Math.max(devices.length, 1) : 1,
        forgotEmail: forgetEmail,
        firstName: customer?.firstName ?? '',
        nextTrip,
      });
      signOut();
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Sign out"
        breadcrumbs={[
          { label: 'Home', to: paths.home },
          { label: 'Account', to: paths.trips },
          { label: 'Sign out' },
        ]}
        description={
          customer
            ? `You’re signed in as ${fullNameOf({ ...customer, middleName: undefined })} · ${customer.email}`
            : undefined
        }
      />
      <section aria-labelledby="sign-out-scope" className={styles.card}>
        <h2 id="sign-out-scope" className={styles.cardTitle}>
          Where should we sign you out?
        </h2>
        <fieldset className={styles.scopes}>
          <legend className="visually-hidden">Where should we sign you out?</legend>
          <ChoiceCard
            name="sign-out-scope"
            checked={scope === 'thisDevice'}
            onChange={() => setScope('thisDevice')}
            title="Just this device"
            description={`${currentDevice ? `${currentDevice.name} · ${currentDevice.detail.split(' · ')[0]}. ` : ''}Your phone and other devices stay signed in.`}
          />
          <ChoiceCard
            name="sign-out-scope"
            checked={scope === 'allDevices'}
            onChange={() => setScope('allDevices')}
            title="All devices"
            description={`${devices.length || 'All'} devices, ${otherDevicesNote}. Use this if you signed in somewhere you no longer trust.`}
          />
        </fieldset>

        {nextTrip && (
          <div className={styles.tripNote}>
            <Icon name="plane" size={20} strokeWidth={1.6} className={styles.tripIcon} />
            <span className={styles.tripText}>
              <span className={styles.tripTitle}>
                You fly to {nextTrip.city} {whenLabel(nextTrip)}, {nextTrip.outbound.departure.time}
              </span>
              <span className={styles.tripBody}>
                Your boarding pass stays in your email and your phone’s wallet. You can also open it from{' '}
                <Link to={paths.trip(nextTrip.reference)}>Manage booking</Link> with ref {nextTrip.reference}{' '}
                — no sign-in needed.
              </span>
            </span>
          </div>
        )}

        <Checkbox
          label="Forget my email on this device"
          checked={forgetEmail}
          onChange={(event) => setForgetEmail(event.target.checked)}
        />

        <div className={styles.actions}>
          <Button
            variant="primary"
            size="large"
            iconStart="logOut"
            loading={isSigningOut}
            onClick={handleSignOut}
          >
            {scope === 'allDevices' ? 'Sign out everywhere' : 'Sign out'}
          </Button>
          <LinkButton to={paths.trips} variant="quiet" size="large">
            Stay signed in
          </LinkButton>
        </div>
      </section>
    </>
  );
}

function SignedOutView({ summary }: { summary: SignedOutSummary }) {
  const message = [
    summary.scope === 'allDevices'
      ? `We signed you out on all ${summary.deviceCount} devices.`
      : 'We signed you out on this device.',
    summary.forgotEmail ? 'Your email won’t be remembered here.' : null,
    summary.nextTrip
      ? `Have a smooth flight to ${summary.nextTrip.city} ${whenLabel(summary.nextTrip)}${summary.firstName ? `, ${summary.firstName}` : ''}.`
      : null,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <PageContainer as="main" layout="plain" className={styles.signedOut}>
      <div role="status" className={styles.done}>
        <span className={styles.doneIcon} aria-hidden="true">
          <Icon name="logOut" size={28} strokeWidth={1.6} />
        </span>
        <h1 className={styles.doneTitle}>You’re signed out</h1>
        <p className={styles.doneText}>{message}</p>
        <div className={styles.doneActions}>
          <LinkButton to={paths.signIn} variant="primary" size="large">
            Sign in again
          </LinkButton>
          <LinkButton to={paths.home} variant="quiet" size="large">
            Search flights
          </LinkButton>
        </div>
      </div>
      <div className={styles.helpCards}>
        <Link to={paths.findBooking} className={styles.helpCard}>
          <Icon name="ticket" size={22} strokeWidth={1.6} />
          <span className={styles.helpTitle}>Find a booking without signing in</span>
          <span className={styles.helpBody}>
            Use your booking reference and last name to check in, change seats or get your boarding pass.
          </span>
        </Link>
        <Link to={`${paths.help}#chat`} className={styles.helpCard}>
          <Icon name="lock" size={22} strokeWidth={1.6} />
          <span className={styles.helpTitle}>Didn’t sign out yourself?</span>
          <span className={styles.helpBody}>
            If you see a sign-out you don’t recognize, reset your password and contact us — we’re here 24/7.
          </span>
        </Link>
      </div>
    </PageContainer>
  );
}

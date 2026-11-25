import { useState } from 'react';
import { Link } from 'react-router';

import { paths } from '@/app/paths';
import { usePreferences, useSession } from '@/app/providers';
import { PageLoader } from '@/components/layout';
import { Alert, Button, PageHeader, useToast } from '@/components/ui';
import { useAsyncData, useDocumentTitle } from '@/hooks';
import { formatDayMonth, formatShortDate } from '@/lib/date';
import { joinWithAnd } from '@/lib/format';
import * as accountSettings from '@/services/accountSettingsService';
import { ApiError } from '@/services/mockApi';
import type { AccountSettings, SignedInDevice } from '@/types/accountSettings';
import type { Customer } from '@/types/customer';
import type { Trip } from '@/types/trip';

import { ConfirmActionDialog, type ConfirmAction } from '../components/ConfirmActionDialog';
import { DeleteAccountDialog } from '../components/settings/DeleteAccountDialog';
import { EmailPreferencesCard } from '../components/settings/EmailPreferencesCard';
import { PreferencesCard } from '../components/settings/PreferencesCard';
import { PrivacyCard } from '../components/settings/PrivacyCard';
import { ProfileCard } from '../components/settings/ProfileCard';
import { SecurityCard } from '../components/settings/SecurityCard';
import { SettingsSection } from '../components/settings/SettingsSection';
import { TwoStepOnDialog } from '../components/settings/TwoStepOnDialog';
import styles from './AccountSettingsPage.module.css';

const BREADCRUMBS = [
  { label: 'Home', to: paths.home },
  { label: 'Account', to: paths.trips },
  { label: 'Account settings' },
];

const SECTIONS = [
  { id: 'profile', label: 'Profile' },
  { id: 'preferences', label: 'Preferences' },
  { id: 'security', label: 'Sign-in & security' },
  { id: 'emails', label: 'Emails' },
  { id: 'privacy', label: 'Privacy & data' },
] as const;

type SettingsDialog =
  | { kind: 'twoStepOff' }
  | { kind: 'twoStepOn' }
  | { kind: 'signOutDevice'; device: SignedInDevice }
  | { kind: 'signOutOthers' }
  | { kind: 'deleteAccount' }
  | null;

interface SettingsData {
  settings: AccountSettings;
  upcomingTrips: Trip[];
}

async function loadSettings(): Promise<SettingsData> {
  const [settings, upcomingTrips] = await Promise.all([
    accountSettings.getAccountSettings(),
    accountSettings.getAccountDeletionBlockers(),
  ]);
  return { settings, upcomingTrips };
}

export function AccountSettingsPage() {
  useDocumentTitle('Account settings');
  const { customer } = useSession();
  const result = useAsyncData('account-settings', loadSettings);

  if (result.status === 'error') {
    return (
      <>
        <PageHeader title="Account settings" breadcrumbs={BREADCRUMBS} />
        <Alert
          tone="danger"
          role="alert"
          title="We couldn’t load your settings"
          action={
            <Button variant="quiet" size="small" onClick={result.reload}>
              Try again
            </Button>
          }
        />
      </>
    );
  }
  if (!result.data || !customer) return <PageLoader label="Loading your settings…" />;
  return <AccountSettingsView customer={customer} initialData={result.data} />;
}

function AccountSettingsView({ customer, initialData }: { customer: Customer; initialData: SettingsData }) {
  const toast = useToast();
  const { updateCustomer } = useSession();
  const preferences = usePreferences();
  const [settings, setSettings] = useState(initialData.settings);
  const [dialog, setDialog] = useState<SettingsDialog>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { upcomingTrips } = initialData;
  const close = () => setDialog(null);

  const success = (message: string) => toast.show({ tone: 'success', message });
  const failure = (error: unknown) =>
    toast.show({
      tone: 'error',
      message: error instanceof ApiError ? error.message : 'That didn’t save. Please try again.',
    });

  /** Runs a settings change and reports it; resolves `false` when it failed. */
  const save = async (operation: () => Promise<AccountSettings>, message?: string): Promise<boolean> => {
    setIsSaving(true);
    try {
      setSettings(await operation());
      setDialog(null);
      if (message) success(message);
      return true;
    } catch (error) {
      failure(error);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const confirmAction = (): ConfirmAction | null => {
    if (dialog?.kind === 'twoStepOff') {
      return {
        title: 'Turn off two-step verification?',
        body: `Anyone who gets your password could sign in, see your trips and pay with your saved cards. We’ll email ${customer.email} to confirm the change.`,
        icon: 'alertTriangle',
        items: [
          {
            icon: 'lock',
            label: 'Authenticator app',
            detail: `Set up ${formatShortDate(settings.security.authenticatorSetUpOn)} · ${settings.security.backupCodesLeft} backup codes left`,
          },
        ],
        keepLabel: 'Keep it on',
        confirmLabel: 'Turn off',
      };
    }
    if (dialog?.kind === 'signOutDevice') {
      return {
        title: `Sign out of ${dialog.device.name}?`,
        body: `Anyone using Vela on that device will need your password${
          settings.security.isTwoStepOn ? ' and a code' : ''
        } to get back in. If you don’t recognise it, change your password too.`,
        icon: 'logOut',
        items: [
          {
            icon: dialog.device.kind === 'phone' ? 'smartphone' : 'laptop',
            label: dialog.device.name,
            detail: dialog.device.detail,
          },
        ],
        keepLabel: 'Cancel',
        confirmLabel: 'Sign out device',
      };
    }
    if (dialog?.kind === 'signOutOthers') {
      const others = settings.devices.filter((device) => !device.isCurrent);
      const count = others.length === 1 ? '1 other device' : `${others.length} other devices`;
      return {
        title: `Sign out of ${count}?`,
        body: 'You’ll stay signed in here. Apps on your other devices will ask you to sign in again — your boarding passes stay in your phone’s wallet.',
        icon: 'logOut',
        items: others.map((device) => ({
          icon: device.kind === 'phone' ? 'smartphone' : 'laptop',
          label: device.name,
          detail: device.detail,
        })),
        keepLabel: 'Cancel',
        confirmLabel: others.length === 1 ? 'Sign out 1 device' : `Sign out ${others.length} devices`,
      };
    }
    return null;
  };

  const runConfirmedAction = () => {
    if (dialog?.kind === 'twoStepOff') {
      void save(accountSettings.turnOffTwoStep, 'Two-step verification is off.');
    } else if (dialog?.kind === 'signOutDevice') {
      void save(
        () => accountSettings.signOutDevice(dialog.device.id),
        `Signed out of ${dialog.device.name}.`,
      );
    } else if (dialog?.kind === 'signOutOthers') {
      const count = settings.devices.filter((device) => !device.isCurrent).length;
      void save(
        accountSettings.signOutOtherDevices,
        `Signed out of ${count === 1 ? '1 other device' : `${count} other devices`}.`,
      );
    }
  };

  const action = confirmAction();

  return (
    <>
      <PageHeader
        title="Account settings"
        breadcrumbs={BREADCRUMBS}
        description="Your profile, preferences, sign-in and privacy in one place."
        actions={
          <nav aria-label="On this page" className={styles.jumpLinks}>
            {SECTIONS.map((section) => (
              <a key={section.id} href={`#${section.id}`} className={styles.jumpLink}>
                {section.label}
              </a>
            ))}
          </nav>
        }
      />

      <SettingsSection
        id="profile"
        title="Profile"
        description={
          <>
            Used on bookings and receipts. Traveler names for flights live in{' '}
            <Link to={paths.account.travelers}>Saved travelers</Link>.
          </>
        }
      >
        <ProfileCard
          customer={customer}
          details={settings.profile}
          isSaving={isSaving}
          onSave={async (update) => {
            setIsSaving(true);
            try {
              const result = await accountSettings.updateProfile(update, customer.email);
              updateCustomer(result.customer);
              setSettings(result.settings);
              success(
                result.settings.profile.pendingEmail && update.email.trim() !== customer.email
                  ? `Profile saved. Check ${update.email.trim()} to confirm your new email.`
                  : 'Profile saved.',
              );
              return true;
            } catch (error) {
              failure(error);
              return false;
            } finally {
              setIsSaving(false);
            }
          }}
          onCancelEmailChange={() =>
            save(accountSettings.cancelEmailChange, `Email change cancelled. Keep using ${customer.email}.`)
          }
        />
      </SettingsSection>

      <SettingsSection
        id="preferences"
        title="Preferences"
        description="We use these to pre-fill searches. Changes save automatically."
      >
        <PreferencesCard
          currency={preferences.currency}
          language={preferences.language}
          searchDefaults={settings.searchDefaults}
          onDisplayChange={(patch) => {
            preferences.setPreferences({
              currency: preferences.currency,
              language: preferences.language,
              ...patch,
            });
            success('Preferences saved.');
          }}
          onSearchDefaultsChange={(patch) =>
            save(() => accountSettings.updateSearchDefaults(patch), 'Preferences saved.')
          }
        />
      </SettingsSection>

      <SettingsSection
        id="security"
        title="Sign-in & security"
        description="Keep your trips and saved cards safe."
      >
        <SecurityCard
          security={settings.security}
          devices={settings.devices}
          isSaving={isSaving}
          onChangePassword={async (form) => {
            setIsSaving(true);
            try {
              setSettings(await accountSettings.changePassword(form.current, form.next));
              success('Password updated. We signed you out everywhere else.');
              return null;
            } catch (error) {
              return error instanceof ApiError
                ? error.message
                : 'We couldn’t update your password. Try again.';
            } finally {
              setIsSaving(false);
            }
          }}
          onToggleTwoStep={() =>
            setDialog({ kind: settings.security.isTwoStepOn ? 'twoStepOff' : 'twoStepOn' })
          }
          onSignOutDevice={(device) => setDialog({ kind: 'signOutDevice', device })}
          onSignOutOthers={() => setDialog({ kind: 'signOutOthers' })}
        />
      </SettingsSection>

      <SettingsSection
        id="emails"
        title="Emails from Vela"
        description={
          <>
            Fare alerts are set up in <Link to={paths.account.priceAlerts}>Price alerts</Link>.
          </>
        }
      >
        <EmailPreferencesCard
          preferences={settings.emails}
          upcomingTripsLabel={joinWithAnd(
            upcomingTrips.map((trip) => `${trip.city} on ${formatDayMonth(trip.departDate)}`),
          )}
          onChange={(patch) =>
            save(
              () => accountSettings.updateEmailPreferences(patch),
              patch.deals !== undefined
                ? patch.deals
                  ? 'Deal emails turned on.'
                  : 'You won’t get deal emails any more.'
                : patch.partnerOffers
                  ? 'Partner offers turned on.'
                  : 'Partner offers turned off.',
            )
          }
        />
      </SettingsSection>

      <SettingsSection
        id="privacy"
        title="Privacy & data"
        description="Under the Data Privacy Act you can get a copy of your data or ask us to delete it."
      >
        <PrivacyCard
          email={customer.email}
          travelCredit={customer.travelCredit}
          isExportPending={settings.isDataExportPending}
          isSaving={isSaving}
          onRequestExport={() => save(accountSettings.requestDataExport, 'Data export requested.')}
          onDeleteAccount={() => setDialog({ kind: 'deleteAccount' })}
        />
      </SettingsSection>

      {action && (
        <ConfirmActionDialog
          action={action}
          isBusy={isSaving}
          onClose={close}
          onConfirm={runConfirmedAction}
        />
      )}
      {dialog?.kind === 'twoStepOn' && (
        <TwoStepOnDialog
          authenticatorSetUpOn={settings.security.authenticatorSetUpOn}
          backupCodesLeft={settings.security.backupCodesLeft}
          isSaving={isSaving}
          onClose={close}
          onConfirm={async (code) => {
            setIsSaving(true);
            try {
              setSettings(await accountSettings.turnOnTwoStep(code));
              setDialog(null);
              success('Two-step verification is on.');
              return null;
            } catch (error) {
              return error instanceof ApiError
                ? error.message
                : 'That code didn’t work. Try the one showing now.';
            } finally {
              setIsSaving(false);
            }
          }}
        />
      )}
      {dialog?.kind === 'deleteAccount' && (
        <DeleteAccountDialog
          upcomingTrips={upcomingTrips}
          travelCredit={customer.travelCredit}
          onClose={close}
        />
      )}
    </>
  );
}

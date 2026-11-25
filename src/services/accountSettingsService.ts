import { ACCOUNT_SETTINGS } from '@/mocks/accountSettings';
import type {
  AccountSettings,
  EmailPreferences,
  ProfileUpdate,
  SearchDefaults,
} from '@/types/accountSettings';
import type { Customer } from '@/types/customer';
import type { Trip } from '@/types/trip';

import { ApiError, mockRequest } from './mockApi';
import { listTrips } from './tripsService';

let settings: AccountSettings = structuredClone(ACCOUNT_SETTINGS);

/** Demo rule: any current password of 8 or more characters is accepted. */
const MIN_PASSWORD_LENGTH = 8;
const AUTHENTICATOR_CODE_LENGTH = 6;

function patch(next: Partial<AccountSettings>): AccountSettings {
  settings = { ...settings, ...next };
  return settings;
}

export function getAccountSettings(): Promise<AccountSettings> {
  return mockRequest(() => settings);
}

/**
 * Saves names and mobile straight away. A new email only takes over once it's confirmed,
 * so it comes back as `pendingEmail` and the customer keeps their current address.
 */
export function updateProfile(
  update: ProfileUpdate,
  currentEmail: string,
): Promise<{ customer: Partial<Customer>; settings: AccountSettings }> {
  return mockRequest(() => {
    const isNewEmail = update.email.trim().toLowerCase() !== currentEmail.toLowerCase();
    const next = patch({
      profile: {
        ...settings.profile,
        pendingEmail: isNewEmail ? update.email.trim() : settings.profile.pendingEmail,
      },
    });
    return {
      customer: {
        firstName: update.firstName.trim(),
        middleName: update.middleName.trim() || undefined,
        lastName: update.lastName.trim(),
        mobile: update.mobile.trim(),
      },
      settings: next,
    };
  });
}

export function cancelEmailChange(): Promise<AccountSettings> {
  return mockRequest(() => patch({ profile: { ...settings.profile, pendingEmail: null } }));
}

export function updateSearchDefaults(defaults: Partial<SearchDefaults>): Promise<AccountSettings> {
  return mockRequest(() => patch({ searchDefaults: { ...settings.searchDefaults, ...defaults } }));
}

/** Changing the password signs out every other device. */
export function changePassword(currentPassword: string, newPassword: string): Promise<AccountSettings> {
  return mockRequest(() => {
    if (currentPassword.length < MIN_PASSWORD_LENGTH) {
      throw new ApiError('wrong_password', 'That’s not your current password.');
    }
    if (newPassword === currentPassword) {
      throw new ApiError('same_password', 'Choose a password you haven’t used here.');
    }
    return patch({
      security: { ...settings.security, passwordNote: 'Changed just now · other devices were signed out' },
      devices: settings.devices.filter((device) => device.isCurrent),
    });
  });
}

export function turnOffTwoStep(): Promise<AccountSettings> {
  return mockRequest(() => patch({ security: { ...settings.security, isTwoStepOn: false } }));
}

/** Turning it back on needs a current code from the authenticator app. */
export function turnOnTwoStep(code: string): Promise<AccountSettings> {
  return mockRequest(() => {
    if (code.replace(/\D/g, '').length !== AUTHENTICATOR_CODE_LENGTH) {
      throw new ApiError('invalid_code', 'Enter all 6 digits from your authenticator app.');
    }
    return patch({ security: { ...settings.security, isTwoStepOn: true } });
  });
}

export function signOutDevice(deviceId: string): Promise<AccountSettings> {
  return mockRequest(() => patch({ devices: settings.devices.filter((device) => device.id !== deviceId) }));
}

export function signOutOtherDevices(): Promise<AccountSettings> {
  return mockRequest(() => patch({ devices: settings.devices.filter((device) => device.isCurrent) }));
}

export function updateEmailPreferences(preferences: Partial<EmailPreferences>): Promise<AccountSettings> {
  return mockRequest(() => {
    if (preferences.tripUpdates === false) {
      throw new ApiError('trip_updates_required', 'Trip updates stay on while you have upcoming bookings.');
    }
    return patch({ emails: { ...settings.emails, ...preferences } });
  });
}

export function requestDataExport(): Promise<AccountSettings> {
  return mockRequest(() => patch({ isDataExportPending: true }));
}

/** An account with upcoming trips can't be deleted; those trips are returned so they can be shown. */
export async function getAccountDeletionBlockers(): Promise<Trip[]> {
  const trips = await listTrips();
  return trips.filter((trip) => trip.status === 'upcoming');
}

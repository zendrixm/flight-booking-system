import type { ReactNode } from 'react';

import { ToastProvider } from '@/components/ui';

import { PreferencesProvider } from './PreferencesProvider';
import { SessionProvider } from './SessionProvider';
import { StaffSessionProvider } from './StaffSessionProvider';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <StaffSessionProvider>
        <PreferencesProvider>
          <ToastProvider>{children}</ToastProvider>
        </PreferencesProvider>
      </StaffSessionProvider>
    </SessionProvider>
  );
}

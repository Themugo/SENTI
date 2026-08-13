/**
 * SENTI Combined Providers
 * Single wrapper that mounts all context providers in the correct order.
 */

'use client';

import type { ReactNode } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { QueryProvider } from '@/components/query-provider';
import { AuthProvider } from '@/features/identity/auth-context';
import { WalletProvider } from '@/features/wallet/wallet-context';
import { NotificationsProvider } from '@/features/notifications/notifications-context';
import { Toaster } from '@/components/ui/sonner';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <QueryProvider>
        <AuthProvider>
          <WalletProvider>
            <NotificationsProvider>
              {children}
              <Toaster />
            </NotificationsProvider>
          </WalletProvider>
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}

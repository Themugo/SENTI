/**
 * Route Guards — Client-side auth protection.
 * When backend is ready: add server-side middleware for double protection.
 */

'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/identity/auth-context';
import { LoadingScreen } from '@/components/ui/loading-screen';

export function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return null;

  return <>{children}</>;
}

export function RoleGuard({
  children,
  roles,
}: {
  children: ReactNode;
  roles: ('user' | 'merchant' | 'admin')[];
}) {
  const { hasAnyRole, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !hasAnyRole(roles))) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isLoading, hasAnyRole, roles, router]);

  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated || !hasAnyRole(roles)) return null;

  return <>{children}</>;
}

export function AdminGuard({ children }: { children: ReactNode }) {
  return <RoleGuard roles={['admin']}>{children}</RoleGuard>;
}

export function MerchantGuard({ children }: { children: ReactNode }) {
  return <RoleGuard roles={['merchant', 'admin']}>{children}</RoleGuard>;
}

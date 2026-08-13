/**
 * SENTI Auth Context
 * Centralized authentication state with mock tokens.
 * When backend is ready: swap authService mock calls for real API calls.
 */

'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { authService, type AuthUser } from '@/services/auth.service';
import { setAuthTokens, getAuthTokens, isTokenExpired } from '@/api/interceptors';
import type { AuthTokens } from '@/api/types';

type UserRole = 'user' | 'merchant' | 'admin';

interface AuthState {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    tokens: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Restore session from localStorage on mount
  useEffect(() => {
    const tokens = getAuthTokens();
    if (tokens && !isTokenExpired()) {
      const userJson = typeof window !== 'undefined' ? localStorage.getItem('senti_user') : null;
      const user = userJson ? JSON.parse(userJson) : null;
      setState({ user, tokens, isLoading: false, isAuthenticated: true });
    } else {
      setState({ user: null, tokens: null, isLoading: false, isAuthenticated: false });
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await authService.login({ email, password });
    setAuthTokens(result.tokens);
    if (typeof window !== 'undefined') {
      localStorage.setItem('senti_user', JSON.stringify(result.user));
    }
    setState({ user: result.user, tokens: result.tokens, isLoading: false, isAuthenticated: true });
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    const result = await authService.signup({ name, email, password });
    setAuthTokens(result.tokens);
    if (typeof window !== 'undefined') {
      localStorage.setItem('senti_user', JSON.stringify(result.user));
    }
    setState({ user: result.user, tokens: result.tokens, isLoading: false, isAuthenticated: true });
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setAuthTokens(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('senti_user');
    }
    setState({ user: null, tokens: null, isLoading: false, isAuthenticated: false });
  }, []);

  const hasRole = useCallback(
    (role: UserRole) => state.user?.role === role,
    [state.user],
  );

  const hasAnyRole = useCallback(
    (roles: UserRole[]) => roles.some((r) => state.user?.role === r),
    [state.user],
  );

  return (
    <AuthContext.Provider
      value={{ ...state, login, signup, logout, hasRole, hasAnyRole }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

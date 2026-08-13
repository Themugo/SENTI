/**
 * Auth Service — Mock implementation
 * Returns mock tokens and simulates network delay.
 * When backend is ready: replace with api.post calls to /auth/* routes.
 */

import type { AuthTokens } from '@/api/types';

function delay<T>(data: T, ms = 500): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

const MOCK_TOKEN: AuthTokens = {
  accessToken: 'mock_access_token_senti_2026',
  refreshToken: 'mock_refresh_token_senti_2026',
  expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
};

export interface LoginInput {
  email: string;
  password: string;
}

export interface SignupInput {
  name: string;
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'merchant' | 'admin';
  avatar?: string;
}

export interface AuthResult {
  user: AuthUser;
  tokens: AuthTokens;
}

export const authService = {
  async login(input: LoginInput): Promise<AuthResult> {
    return delay({
      user: {
        id: 'usr_001',
        name: 'SENTI User',
        email: input.email,
        role: 'merchant',
      },
      tokens: MOCK_TOKEN,
    });
  },

  async signup(input: SignupInput): Promise<AuthResult> {
    return delay({
      user: {
        id: `usr_${Date.now()}`,
        name: input.name,
        email: input.email,
        role: 'user',
      },
      tokens: MOCK_TOKEN,
    });
  },

  async logout(): Promise<void> {
    return delay(undefined);
  },

  async forgotPassword(email: string): Promise<{ success: boolean }> {
    return delay({ success: true });
  },

  async resetPassword(token: string, password: string): Promise<{ success: boolean }> {
    return delay({ success: true });
  },

  async verifyOtp(code: string): Promise<{ success: boolean }> {
    return delay({ success: true });
  },

  async enable2fa(): Promise<{ qrCode: string; secret: string }> {
    return delay({
      qrCode: 'data:image/png;base64,mock_qr_code',
      secret: 'JBSWY3DPEHPK3PXP',
    });
  },

  async verify2fa(code: string): Promise<{ success: boolean }> {
    return delay({ success: true });
  },

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    return delay(MOCK_TOKEN);
  },
};

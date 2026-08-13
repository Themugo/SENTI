/**
 * Identity Service
 * Manages user identity profiles, account types, and preferences.
 * All data is mocked but structured for production swap.
 */

import type {
  Identity,
  AccountType,
  NotificationPreferences,
  PrivacySettings,
  CurrencyCode,
  Address,
} from '@/types';
import { auditService } from './audit.service';

const MOCK_IDENTITIES: Identity[] = [
  {
    id: 'id-001',
    userId: 'usr_001',
    firstName: 'SENTI',
    lastName: 'User',
    email: 'user@senti.com',
    phone: '+254 712 345 678',
    dateOfBirth: '1990-01-15',
    nationality: 'Kenya',
    country: 'Kenya',
    language: 'en',
    timezone: 'Africa/Nairobi',
    preferredCurrency: 'KES',
    accountType: 'business',
    avatar: undefined,
    notificationPreferences: {
      email: true,
      push: true,
      sms: false,
      transactionAlerts: true,
      securityAlerts: true,
      marketingUpdates: false,
      weeklySummary: true,
      productUpdates: true,
    },
    privacySettings: {
      profileVisibility: 'private',
      showTransactionHistory: false,
      shareAnalytics: true,
      twoFactorRequired: true,
    },
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-08-01T00:00:00Z',
  },
  {
    id: 'id-002',
    userId: 'usr_002',
    firstName: 'Amara',
    lastName: 'Okafor',
    email: 'amora@merchant.com',
    phone: '+234 803 555 0123',
    nationality: 'Nigeria',
    country: 'Nigeria',
    language: 'en',
    timezone: 'Africa/Lagos',
    preferredCurrency: 'NGN',
    accountType: 'business',
    notificationPreferences: {
      email: true, push: true, sms: true, transactionAlerts: true,
      securityAlerts: true, marketingUpdates: false, weeklySummary: true, productUpdates: false,
    },
    privacySettings: {
      profileVisibility: 'private', showTransactionHistory: false, shareAnalytics: false, twoFactorRequired: true,
    },
    createdAt: '2026-02-14T00:00:00Z',
    updatedAt: '2026-07-28T00:00:00Z',
  },
  {
    id: 'id-003',
    userId: 'usr_003',
    firstName: 'James',
    lastName: 'Mwangi',
    email: 'james@dev.io',
    phone: '+254 700 111 222',
    nationality: 'Kenya',
    country: 'Kenya',
    language: 'en',
    timezone: 'Africa/Nairobi',
    preferredCurrency: 'USD',
    accountType: 'developer',
    notificationPreferences: {
      email: true, push: false, sms: false, transactionAlerts: true,
      securityAlerts: true, marketingUpdates: false, weeklySummary: false, productUpdates: true,
    },
    privacySettings: {
      profileVisibility: 'public', showTransactionHistory: true, shareAnalytics: true, twoFactorRequired: true,
    },
    createdAt: '2026-03-10T00:00:00Z',
    updatedAt: '2026-07-30T00:00:00Z',
  },
  {
    id: 'id-004',
    userId: 'usr_004',
    firstName: 'Sarah',
    lastName: 'Chen',
    email: 'sarah@enterprise.com',
    phone: '+1 415 555 0199',
    nationality: 'United States',
    country: 'United States',
    language: 'en',
    timezone: 'America/Los_Angeles',
    preferredCurrency: 'USD',
    accountType: 'business',
    notificationPreferences: {
      email: true, push: true, sms: false, transactionAlerts: true,
      securityAlerts: true, marketingUpdates: false, weeklySummary: true, productUpdates: false,
    },
    privacySettings: {
      profileVisibility: 'private', showTransactionHistory: false, shareAnalytics: false, twoFactorRequired: true,
    },
    createdAt: '2026-01-20T00:00:00Z',
    updatedAt: '2026-08-01T00:00:00Z',
  },
  {
    id: 'id-005',
    userId: 'usr_005',
    firstName: 'Compliance',
    lastName: 'Officer',
    email: 'compliance@senti.com',
    phone: '+254 700 999 000',
    nationality: 'Kenya',
    country: 'Kenya',
    language: 'en',
    timezone: 'Africa/Nairobi',
    preferredCurrency: 'USD',
    accountType: 'compliance_officer',
    notificationPreferences: {
      email: true, push: true, sms: true, transactionAlerts: true,
      securityAlerts: true, marketingUpdates: false, weeklySummary: true, productUpdates: false,
    },
    privacySettings: {
      profileVisibility: 'private', showTransactionHistory: false, shareAnalytics: false, twoFactorRequired: true,
    },
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-08-01T00:00:00Z',
  },
];

let identities: Identity[] = [...MOCK_IDENTITIES];

export const identityService = {
  /** Get identity for a user. */
  getByUserId(userId: string): Identity | undefined {
    return identities.find((i) => i.userId === userId);
  },

  /** Get current user's identity (defaults to usr_001). */
  getCurrent(): Identity {
    return identities.find((i) => i.userId === 'usr_001') ?? identities[0];
  },

  /** Get all identities. */
  getAll(): Identity[] {
    return [...identities];
  },

  /** Create a new identity. */
  create(params: {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    accountType: AccountType;
    country: string;
    language: string;
    preferredCurrency: CurrencyCode;
  }): Identity {
    const now = new Date().toISOString();
    const identity: Identity = {
      id: `id-${Date.now()}`,
      userId: params.userId,
      firstName: params.firstName,
      lastName: params.lastName,
      email: params.email,
      phone: params.phone,
      nationality: params.country,
      country: params.country,
      language: params.language,
      timezone: 'UTC',
      preferredCurrency: params.preferredCurrency,
      accountType: params.accountType,
      notificationPreferences: {
        email: true, push: true, sms: false, transactionAlerts: true,
        securityAlerts: true, marketingUpdates: false, weeklySummary: true, productUpdates: true,
      },
      privacySettings: {
        profileVisibility: 'private', showTransactionHistory: false, shareAnalytics: true, twoFactorRequired: true,
      },
      createdAt: now,
      updatedAt: now,
    };
    identities.push(identity);
    auditService.log({
      type: 'settings_change',
      actorId: params.userId,
      actorName: `${params.firstName} ${params.lastName}`,
      actorRole: 'customer',
      action: 'Identity created',
      resourceType: 'identity',
      resourceId: identity.id,
    });
    return identity;
  },

  /** Update profile information. */
  updateProfile(userId: string, updates: Partial<Pick<Identity, 'firstName' | 'lastName' | 'email' | 'phone' | 'dateOfBirth' | 'nationality' | 'country' | 'language' | 'timezone' | 'preferredCurrency'>>): Identity | undefined {
    const identity = identities.find((i) => i.userId === userId);
    if (!identity) return undefined;
    Object.assign(identity, updates, { updatedAt: new Date().toISOString() });
    auditService.log({
      type: 'email_change',
      actorId: userId,
      actorName: `${identity.firstName} ${identity.lastName}`,
      actorRole: 'customer',
      action: 'Profile updated',
      resourceType: 'identity',
      resourceId: identity.id,
    });
    return identity;
  },

  /** Update notification preferences. */
  updateNotificationPreferences(userId: string, prefs: Partial<NotificationPreferences>): Identity | undefined {
    const identity = identities.find((i) => i.userId === userId);
    if (!identity) return undefined;
    identity.notificationPreferences = { ...identity.notificationPreferences, ...prefs };
    identity.updatedAt = new Date().toISOString();
    return identity;
  },

  /** Update privacy settings. */
  updatePrivacySettings(userId: string, settings: Partial<PrivacySettings>): Identity | undefined {
    const identity = identities.find((i) => i.userId === userId);
    if (!identity) return undefined;
    identity.privacySettings = { ...identity.privacySettings, ...settings };
    identity.updatedAt = new Date().toISOString();
    return identity;
  },

  /** Get identities by account type. */
  getByAccountType(type: AccountType): Identity[] {
    return identities.filter((i) => i.accountType === type);
  },

  /** Count identities. */
  count(): number {
    return identities.length;
  },

  /** Get account type display label. */
  getAccountTypeLabel(type: AccountType): string {
    const labels: Record<AccountType, string> = {
      personal: 'Personal',
      business: 'Business',
      non_profit: 'Non-Profit / NGO',
      government: 'Government',
      developer: 'Developer',
      marketplace: 'Marketplace',
      administrator: 'Administrator',
      support_agent: 'Support Agent',
      compliance_officer: 'Compliance Officer',
    };
    return labels[type];
  },
};

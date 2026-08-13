/**
 * Developer Service — Mock implementation
 */

import { mockApiKeys, mockWebhooks } from '@/services/mock-data';
import type { ApiKey, Webhook } from '@/types';

function delay<T>(data: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

export const developerService = {
  async getApiKeys(): Promise<ApiKey[]> {
    return delay([...mockApiKeys]);
  },

  async createApiKey(name: string, environment: 'live' | 'test'): Promise<ApiKey> {
    const key: ApiKey = {
      id: `key_${Date.now()}`,
      name,
      key: `sk_${environment === 'live' ? 'live' : 'test'}_${Math.random().toString(36).substring(2, 34)}`,
      environment,
      createdAt: new Date().toISOString(),
      permissions: ['read', 'write', 'payments'],
    };
    return delay(key);
  },

  async deleteApiKey(id: string): Promise<{ success: boolean }> {
    return delay({ success: true });
  },

  async getWebhooks(): Promise<Webhook[]> {
    return delay([...mockWebhooks]);
  },

  async createWebhook(url: string, events: string[]): Promise<Webhook> {
    const webhook: Webhook = {
      id: `wh_${Date.now()}`,
      url,
      events,
      status: 'active',
      successRate: 100,
    };
    return delay(webhook);
  },

  async getLogs(): Promise<{ method: string; path: string; status: number; time: string; ts: string }[]> {
    return delay([
      { method: 'POST', path: '/v1/payments', status: 200, time: '142ms', ts: '2 min ago' },
      { method: 'GET', path: '/v1/balances', status: 200, time: '28ms', ts: '5 min ago' },
      { method: 'POST', path: '/v1/transfers', status: 201, time: '156ms', ts: '12 min ago' },
      { method: 'GET', path: '/v1/transactions', status: 200, time: '45ms', ts: '18 min ago' },
      { method: 'POST', path: '/v1/refunds', status: 400, time: '89ms', ts: '25 min ago' },
      { method: 'GET', path: '/v1/webhooks', status: 200, time: '32ms', ts: '1 hour ago' },
    ]);
  },
};

/**
 * Cards Service — Mock implementation
 */

import { mockCards } from '@/services/mock-data';
import type { Card } from '@/types';

function delay<T>(data: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

export const cardsService = {
  async getAll(): Promise<Card[]> {
    return delay([...mockCards]);
  },

  async getById(id: string): Promise<Card | undefined> {
    return delay(mockCards.find((c) => c.id === id));
  },

  async freeze(id: string): Promise<{ success: boolean }> {
    return delay({ success: true });
  },

  async unfreeze(id: string): Promise<{ success: boolean }> {
    return delay({ success: true });
  },

  async delete(id: string): Promise<{ success: boolean }> {
    return delay({ success: true });
  },

  async create(input: { type: 'virtual' | 'physical'; spendingLimit: number }): Promise<Card> {
    const card: Card = {
      id: `card_${Date.now()}`,
      type: input.type,
      brand: 'visa',
      last4: String(Math.floor(1000 + Math.random() * 9000)),
      expiry: '08/29',
      holder: 'SENTI USER',
      status: 'active',
      color: 'emerald',
      spendingLimit: input.spendingLimit,
      spent: 0,
    };
    return delay(card);
  },
};

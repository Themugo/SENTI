/**
 * Transactions Service — Mock implementation
 */

import { mockTransactions } from '@/services/mock-data';
import type { LegacyTransaction, TransactionStatus, TransactionType } from '@/types';

function delay<T>(data: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

export interface TransactionFilters {
  search?: string;
  status?: TransactionStatus | 'all';
  type?: TransactionType | 'all';
  limit?: number;
}

export const transactionsService = {
  async getAll(filters?: TransactionFilters): Promise<LegacyTransaction[]> {
    let result = [...mockTransactions];
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (t) =>
          t.counterparty.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.reference.toLowerCase().includes(q),
      );
    }
    if (filters?.status && filters.status !== 'all') {
      result = result.filter((t) => t.status === filters.status);
    }
    if (filters?.type && filters.type !== 'all') {
      result = result.filter((t) => t.type === filters.type);
    }
    if (filters?.limit) {
      result = result.slice(0, filters.limit);
    }
    return delay(result);
  },

  async getById(id: string): Promise<LegacyTransaction | undefined> {
    return delay(mockTransactions.find((t) => t.id === id));
  },

  async export(): Promise<{ url: string }> {
    return delay({ url: 'mock://export.csv' });
  },
};

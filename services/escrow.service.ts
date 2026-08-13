/**
 * Escrow Service — Mock implementation
 */

import { mockEscrow } from '@/services/mock-data';
import type { EscrowTransaction } from '@/types';

function delay<T>(data: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

export const escrowService = {
  async getAll(): Promise<EscrowTransaction[]> {
    return delay([...mockEscrow]);
  },

  async getById(id: string): Promise<EscrowTransaction | undefined> {
    return delay(mockEscrow.find((e) => e.id === id));
  },

  async releaseMilestone(escrowId: string, milestoneId: string): Promise<{ success: boolean }> {
    return delay({ success: true });
  },

  async createDispute(escrowId: string, reason: string): Promise<{ success: boolean }> {
    return delay({ success: true });
  },
};

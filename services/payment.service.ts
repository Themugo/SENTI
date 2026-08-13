/**
 * Payment Service — Mock implementation
 */

import { mockPaymentLinks, mockTransactions } from '@/services/legacy-mock-data';
import type { PaymentLink, LegacyTransaction, CurrencyCode } from '@/types';

function delay<T>(data: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

export interface SendPaymentInput {
  recipient: string;
  email: string;
  amount: number;
  currency: CurrencyCode;
  note?: string;
}

export interface CreatePaymentLinkInput {
  name: string;
  amount: number;
  currency: CurrencyCode;
}

export const paymentService = {
  async sendPayment(input: SendPaymentInput): Promise<{ success: boolean; reference: string }> {
    return delay({ success: true, reference: `TXN-${Date.now().toString(36).toUpperCase()}` });
  },

  async getPaymentLinks(): Promise<PaymentLink[]> {
    return delay([...mockPaymentLinks]);
  },

  async createPaymentLink(input: CreatePaymentLinkInput): Promise<PaymentLink> {
    const link: PaymentLink = {
      id: `pl_${Date.now()}`,
      name: input.name,
      url: `senti.pay/c/${input.name.toLowerCase().replace(/\s+/g, '-')}`,
      amount: input.amount,
      currency: input.currency,
      status: 'active',
      payments: 0,
      totalCollected: 0,
      createdAt: new Date().toISOString(),
    };
    return delay(link);
  },

  async getPayments(): Promise<LegacyTransaction[]> {
    return delay(mockTransactions.filter((t) => t.category === 'card_payment' || t.category === 'mpesa' || t.category === 'bank_transfer'));
  },
};

/**
 * Refund Engine Service
 * Manages full and partial refunds with timeline and ledger integration.
 */

import type { Refund, RefundStatus, RefundType, CurrencyCode } from '@/types';
import { auditService } from './audit.service';

let refunds: Refund[] = [];
let counter = 0;

function nextId(): string {
  counter++;
  return `RFD-${Date.now().toString(36).toUpperCase()}-${counter.toString().padStart(6, '0')}`;
}

function genRef(): string {
  return `REF-RFD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

export const refundService = {
  /** Create a refund. */
  create(params: {
    paymentIntentId: string;
    merchantId: string;
    amount: number;
    currency: CurrencyCode;
    type: RefundType;
    reason: string;
  }): Refund {
    const now = new Date().toISOString();
    const refund: Refund = {
      id: nextId(),
      reference: genRef(),
      paymentIntentId: params.paymentIntentId,
      merchantId: params.merchantId,
      amount: params.amount,
      currency: params.currency,
      type: params.type,
      status: 'pending',
      reason: params.reason,
      timeline: [{ status: 'pending', timestamp: now, note: 'Refund initiated' }],
      createdAt: now,
    };
    refunds.push(refund);

    auditService.log({
      type: 'settings_change',
      actorId: params.merchantId,
      actorName: 'Merchant',
      actorRole: 'merchant',
      action: `Refund created: ${refund.reference} (${params.type})`,
      resourceType: 'refund',
      resourceId: refund.id,
      metadata: { amount: params.amount, currency: params.currency },
    });

    return refund;
  },

  /** Process a refund. */
  process(id: string): Refund | undefined {
    const refund = refunds.find((r) => r.id === id);
    if (!refund) return undefined;
    refund.status = 'processing';
    refund.timeline.push({ status: 'processing', timestamp: new Date().toISOString(), note: 'Processing via provider' });
    return refund;
  },

  /** Complete a refund. */
  complete(id: string): Refund | undefined {
    const refund = refunds.find((r) => r.id === id);
    if (!refund) return undefined;
    refund.status = 'succeeded';
    refund.processedAt = new Date().toISOString();
    refund.timeline.push({ status: 'succeeded', timestamp: refund.processedAt, note: 'Refund completed' });
    return refund;
  },

  /** Fail a refund. */
  fail(id: string, reason: string): Refund | undefined {
    const refund = refunds.find((r) => r.id === id);
    if (!refund) return undefined;
    refund.status = 'failed';
    refund.timeline.push({ status: 'failed', timestamp: new Date().toISOString(), note: reason });
    return refund;
  },

  /** Get refund by ID. */
  getById(id: string): Refund | undefined {
    return refunds.find((r) => r.id === id);
  },

  /** Get refunds by merchant. */
  getByMerchant(merchantId: string): Refund[] {
    return refunds.filter((r) => r.merchantId === merchantId);
  },

  /** Get refunds by payment intent. */
  getByPaymentIntent(paymentIntentId: string): Refund[] {
    return refunds.filter((r) => r.paymentIntentId === paymentIntentId);
  },

  /** Get all refunds. */
  getAll(): Refund[] {
    return [...refunds].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  /** Get by status. */
  getByStatus(status: RefundStatus): Refund[] {
    return refunds.filter((r) => r.status === status);
  },

  /** Get stats. */
  getStats(): { total: number; pending: number; processing: number; succeeded: number; failed: number; totalAmount: number } {
    return {
      total: refunds.length,
      pending: refunds.filter((r) => r.status === 'pending').length,
      processing: refunds.filter((r) => r.status === 'processing').length,
      succeeded: refunds.filter((r) => r.status === 'succeeded').length,
      failed: refunds.filter((r) => r.status === 'failed').length,
      totalAmount: refunds.filter((r) => r.status === 'succeeded').reduce((s, r) => s + r.amount, 0),
    };
  },

  /** Seed mock data. */
  _seed(data: Refund[]): void {
    refunds = data;
    counter = data.length;
  },
};

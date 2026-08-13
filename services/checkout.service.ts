/**
 * Checkout Service
 * Manages checkout sessions: embedded, hosted, express, guest, business.
 */

import type { CheckoutSession, CheckoutMode, CurrencyCode, PaymentMethod } from '@/types';
import { auditService } from './audit.service';

let sessions: CheckoutSession[] = [];
let counter = 0;

function nextId(): string {
  counter++;
  return `CS-${Date.now().toString(36).toUpperCase()}-${counter.toString().padStart(6, '0')}`;
}

export const checkoutService = {
  /** Create a checkout session. */
  create(params: {
    merchantId: string;
    amount: number;
    currency: CurrencyCode;
    mode?: CheckoutMode;
    paymentMethods?: PaymentMethod[];
    customerEmail?: string;
    customerName?: string;
    description?: string;
    successUrl?: string;
    cancelUrl?: string;
    webhookUrl?: string;
    expiresIn?: number;
  }): CheckoutSession {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (params.expiresIn ?? 30) * 60 * 1000);
    const session: CheckoutSession = {
      id: nextId(),
      merchantId: params.merchantId,
      amount: params.amount,
      currency: params.currency,
      status: 'open',
      mode: params.mode ?? 'embedded',
      paymentMethods: params.paymentMethods ?? ['card', 'mpesa', 'bank', 'apple_pay', 'google_pay'],
      customerEmail: params.customerEmail,
      customerName: params.customerName,
      description: params.description,
      successUrl: params.successUrl,
      cancelUrl: params.cancelUrl,
      webhookUrl: params.webhookUrl,
      expiresAt: expiresAt.toISOString(),
      createdAt: now.toISOString(),
    };
    sessions.push(session);

    auditService.log({
      type: 'settings_change',
      actorId: params.merchantId,
      actorName: 'Merchant',
      actorRole: 'merchant',
      action: `Checkout session created: ${session.id}`,
      resourceType: 'checkout_session',
      resourceId: session.id,
    });

    return session;
  },

  /** Get a session by ID. */
  getById(id: string): CheckoutSession | undefined {
    return sessions.find((s) => s.id === id);
  },

  /** Get sessions by merchant. */
  getByMerchant(merchantId: string): CheckoutSession[] {
    return sessions.filter((s) => s.merchantId === merchantId);
  },

  /** Complete a session. */
  complete(id: string, paymentIntentId: string): CheckoutSession | undefined {
    const session = sessions.find((s) => s.id === id);
    if (!session) return undefined;
    session.status = 'completed';
    session.completedAt = new Date().toISOString();
    session.paymentIntentId = paymentIntentId;
    return session;
  },

  /** Expire a session. */
  expire(id: string): CheckoutSession | undefined {
    const session = sessions.find((s) => s.id === id);
    if (!session) return undefined;
    session.status = 'expired';
    return session;
  },

  /** Get all sessions. */
  getAll(): CheckoutSession[] {
    return [...sessions];
  },

  /** Get stats. */
  getStats(): { total: number; completed: number; open: number; expired: number; abandoned: number; conversionRate: number } {
    const completed = sessions.filter((s) => s.status === 'completed').length;
    const open = sessions.filter((s) => s.status === 'open').length;
    const expired = sessions.filter((s) => s.status === 'expired').length;
    const abandoned = sessions.filter((s) => s.status === 'abandoned').length;
    return {
      total: sessions.length,
      completed, open, expired, abandoned,
      conversionRate: sessions.length > 0 ? (completed / sessions.length) * 100 : 0,
    };
  },

  /** Seed mock data. */
  _seed(data: CheckoutSession[]): void {
    sessions = data;
    counter = data.length;
  },
};

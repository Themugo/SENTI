/**
 * Payment Gateway Service
 * The core gateway that orchestrates payment processing through providers.
 * This is the ONLY entry point for payment operations — the Core never touches providers directly.
 */

import type {
  PaymentIntent, PaymentIntentStatus, CurrencyCode, PaymentMethod, ProviderId,
  Refund, RefundStatus,
} from '@/types';
import { providerService } from './provider.service';
import { routerService, type RoutingInput } from './router.service';
import { feesService } from './fees.service';
import { auditService } from './audit.service';
import type { InitializePaymentInput } from './providers/provider.interface';

let intents: PaymentIntent[] = [];
let intentCounter = 0;

function nextIntentId(): string {
  intentCounter++;
  return `PI-${Date.now().toString(36).toUpperCase()}-${intentCounter.toString().padStart(6, '0')}`;
}

function genReference(): string {
  return `REF-PAY-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

export const gatewayService = {
  /**
   * Create a payment intent and route to the best provider.
   * This is the primary entry point for all payments.
   */
  async createPaymentIntent(input: {
    merchantId: string;
    amount: number;
    currency: CurrencyCode;
    paymentMethod: PaymentMethod;
    customerEmail?: string;
    description?: string;
    country?: string;
    metadata?: Record<string, string>;
  }): Promise<PaymentIntent> {
    // Route to best provider
    const routingResult = routerService.route({
      currency: input.currency,
      paymentMethod: input.paymentMethod,
      merchantId: input.merchantId,
      country: input.country,
      amount: input.amount,
    });

    const provider = providerService.getById(routingResult.providerId);
    if (!provider) throw new Error(`Provider ${routingResult.providerId} not found`);

    // Initialize with provider
    const initResult = await provider.initializePayment({
      amount: input.amount,
      currency: input.currency,
      paymentMethod: input.paymentMethod,
      merchantId: input.merchantId,
      customerEmail: input.customerEmail,
      description: input.description,
      metadata: input.metadata,
    });

    // Calculate fees
    const fee = feesService.calculate(input.amount, input.currency, input.paymentMethod as never);

    const now = new Date().toISOString();
    const intent: PaymentIntent = {
      id: nextIntentId(),
      reference: genReference(),
      merchantId: input.merchantId,
      amount: input.amount,
      currency: input.currency,
      status: initResult.status,
      paymentMethod: input.paymentMethod,
      providerId: routingResult.providerId,
      customerEmail: input.customerEmail,
      description: input.description,
      metadata: { ...input.metadata, providerReference: initResult.providerReference, routingReason: routingResult.reason },
      fee: fee.total,
      netAmount: input.amount - fee.total,
      createdAt: now,
      updatedAt: now,
      timeline: [{ status: initResult.status, timestamp: now, note: `Routed to ${provider.name}` }],
    };

    intents.push(intent);

    auditService.log({
      type: 'settings_change',
      actorId: input.merchantId,
      actorName: 'Merchant',
      actorRole: 'merchant',
      action: `Payment intent created: ${intent.reference} via ${provider.name}`,
      resourceType: 'payment_intent',
      resourceId: intent.id,
      metadata: { amount: input.amount, currency: input.currency, provider: routingResult.providerId },
    });

    return intent;
  },

  /** Authorize a payment. */
  async authorizePayment(intentId: string): Promise<PaymentIntent | undefined> {
    const intent = intents.find((i) => i.id === intentId);
    if (!intent || !intent.providerId) return undefined;
    const provider = providerService.getById(intent.providerId);
    if (!provider) return undefined;

    const result = await provider.authorizePayment(intentId);
    intent.status = result.status;
    intent.updatedAt = new Date().toISOString();
    intent.timeline.push({ status: result.status, timestamp: intent.updatedAt, note: result.authorized ? 'Authorized' : 'Authorization failed' });

    return intent;
  },

  /** Capture a payment. */
  async capturePayment(intentId: string): Promise<PaymentIntent | undefined> {
    const intent = intents.find((i) => i.id === intentId);
    if (!intent || !intent.providerId) return undefined;
    const provider = providerService.getById(intent.providerId);
    if (!provider) return undefined;

    const result = await provider.capturePayment(intentId);
    intent.status = result.status;
    intent.updatedAt = new Date().toISOString();
    intent.timeline.push({ status: result.status, timestamp: intent.updatedAt, note: result.captured ? 'Captured' : 'Capture failed' });

    return intent;
  },

  /** Cancel a payment. */
  async cancelPayment(intentId: string): Promise<PaymentIntent | undefined> {
    const intent = intents.find((i) => i.id === intentId);
    if (!intent || !intent.providerId) return undefined;
    const provider = providerService.getById(intent.providerId);
    if (!provider) return undefined;

    const result = await provider.cancelPayment(intentId);
    intent.status = result.status;
    intent.updatedAt = new Date().toISOString();
    intent.timeline.push({ status: result.status, timestamp: intent.updatedAt, note: 'Cancelled' });

    return intent;
  },

  /** Process a full payment (initialize → authorize → capture). */
  async processPayment(input: {
    merchantId: string;
    amount: number;
    currency: CurrencyCode;
    paymentMethod: PaymentMethod;
    customerEmail?: string;
    description?: string;
    country?: string;
  }): Promise<PaymentIntent> {
    const intent = await this.createPaymentIntent(input);
    await this.authorizePayment(intent.id);
    const captured = await this.capturePayment(intent.id);
    return captured ?? intent;
  },

  /** Get an intent by ID. */
  getIntent(id: string): PaymentIntent | undefined {
    return intents.find((i) => i.id === id);
  },

  /** Get intents by merchant. */
  getByMerchant(merchantId: string): PaymentIntent[] {
    return intents.filter((i) => i.merchantId === merchantId);
  },

  /** Get all intents. */
  getAll(): PaymentIntent[] {
    return [...intents];
  },

  /** Get intents by status. */
  getByStatus(status: PaymentIntentStatus): PaymentIntent[] {
    return intents.filter((i) => i.status === status);
  },

  /** Get gateway stats. */
  getStats(): {
    total: number;
    succeeded: number;
    failed: number;
    processing: number;
    totalVolume: number;
    totalFees: number;
    successRate: number;
  } {
    const succeeded = intents.filter((i) => i.status === 'succeeded');
    const failed = intents.filter((i) => i.status === 'failed');
    const totalVolume = succeeded.reduce((sum, i) => sum + i.amount, 0);
    const totalFees = succeeded.reduce((sum, i) => sum + i.fee, 0);
    return {
      total: intents.length,
      succeeded: succeeded.length,
      failed: failed.length,
      processing: intents.filter((i) => i.status === 'processing').length,
      totalVolume,
      totalFees,
      successRate: intents.length > 0 ? (succeeded.length / intents.length) * 100 : 0,
    };
  },

  /** Seed mock data. */
  _seed(data: PaymentIntent[]): void {
    intents = data;
    intentCounter = data.length;
  },
};

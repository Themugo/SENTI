/**
 * Subscription Service
 * Manages subscription plans, active subscriptions, trials, coupons, billing cycles.
 */

import type { SubscriptionPlan, SubscriptionV2, SubscriptionStatus, SubscriptionInterval, BillingType, CurrencyCode } from '@/types';
import { auditService } from './audit.service';

let plans: SubscriptionPlan[] = [];
let subscriptions: SubscriptionV2[] = [];
let subCounter = 0;

function nextSubId(): string {
  subCounter++;
  return `SUB-${Date.now().toString(36).toUpperCase()}-${subCounter.toString().padStart(6, '0')}`;
}

function genRef(): string {
  return `REF-SUB-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

const DEFAULT_PLANS: SubscriptionPlan[] = [
  { id: 'plan-001', name: 'Starter', description: 'For small businesses getting started', amount: 0, currency: 'USD', interval: 'monthly', billingType: 'fixed', features: ['Up to 100 transactions/mo', 'Basic analytics', 'Email support'], active: true },
  { id: 'plan-002', name: 'Growth', description: 'For scaling businesses', amount: 49, currency: 'USD', interval: 'monthly', billingType: 'fixed', trialDays: 14, features: ['Up to 10,000 transactions/mo', 'Advanced analytics', 'Priority support', 'API access', 'Webhooks'], active: true },
  { id: 'plan-003', name: 'Business Pro', description: 'For established businesses', amount: 199, currency: 'USD', interval: 'monthly', billingType: 'fixed', trialDays: 14, features: ['Unlimited transactions', 'Custom integrations', 'Dedicated support', 'Advanced fraud detection', 'Team seats (10)'], active: true },
  { id: 'plan-004', name: 'Enterprise', description: 'For large enterprises', amount: 999, currency: 'USD', interval: 'yearly', billingType: 'fixed', features: ['Everything in Business Pro', 'Custom SLAs', 'Dedicated account manager', 'On-premise deployment', 'White-label option'], active: true },
  { id: 'plan-005', name: 'Usage-Based', description: 'Pay per transaction', amount: 0, currency: 'USD', interval: 'monthly', billingType: 'usage_based', features: ['$0.10 per transaction', 'No monthly fee', 'Volume discounts', 'Real-time usage dashboard'], active: true },
  { id: 'plan-006', name: 'Quarterly Pro', description: 'Quarterly billing cycle', amount: 399, currency: 'USD', interval: 'quarterly', billingType: 'fixed', features: ['All Growth features', 'Quarterly billing', '10% savings vs monthly'], active: true },
];

export const subscriptionService = {
  /** Get all plans. */
  getPlans(): SubscriptionPlan[] {
    return plans.length > 0 ? [...plans] : [...DEFAULT_PLANS];
  },

  /** Get plan by ID. */
  getPlan(id: string): SubscriptionPlan | undefined {
    return this.getPlans().find((p) => p.id === id);
  },

  /** Create a plan. */
  createPlan(params: Omit<SubscriptionPlan, 'id'>): SubscriptionPlan {
    const plan: SubscriptionPlan = { ...params, id: `plan-${Date.now()}` };
    plans.push(plan);
    return plan;
  },

  /** Subscribe a customer to a plan. */
  subscribe(params: {
    customerId: string;
    customerName: string;
    customerEmail: string;
    planId: string;
  }): SubscriptionV2 {
    const plan = this.getPlan(params.planId);
    if (!plan) throw new Error('Plan not found');

    const now = new Date();
    const periodEnd = new Date(now);
    if (plan.interval === 'monthly') periodEnd.setMonth(periodEnd.getMonth() + 1);
    else if (plan.interval === 'quarterly') periodEnd.setMonth(periodEnd.getMonth() + 3);
    else if (plan.interval === 'yearly') periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    else if (plan.interval === 'weekly') periodEnd.setDate(periodEnd.getDate() + 7);

    const trialEnds = plan.trialDays ? new Date(now.getTime() + plan.trialDays * 24 * 60 * 60 * 1000).toISOString() : undefined;

    const sub: SubscriptionV2 = {
      id: nextSubId(),
      reference: genRef(),
      customerId: params.customerId,
      customerName: params.customerName,
      customerEmail: params.customerEmail,
      planId: plan.id,
      planName: plan.name,
      amount: plan.amount,
      currency: plan.currency,
      interval: plan.interval,
      billingType: plan.billingType,
      status: trialEnds ? 'trialing' : 'active',
      trialEndsAt: trialEnds,
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: periodEnd.toISOString(),
      usage: plan.billingType === 'usage_based' ? 0 : undefined,
      createdAt: now.toISOString(),
    };
    subscriptions.push(sub);

    auditService.log({
      type: 'settings_change',
      actorId: params.customerId,
      actorName: params.customerName,
      actorRole: 'customer',
      action: `Subscribed to ${plan.name}`,
      resourceType: 'subscription',
      resourceId: sub.id,
    });

    return sub;
  },

  /** Cancel a subscription. */
  cancel(id: string): SubscriptionV2 | undefined {
    const sub = subscriptions.find((s) => s.id === id);
    if (!sub) return undefined;
    sub.status = 'cancelled';
    sub.canceledAt = new Date().toISOString();
    return sub;
  },

  /** Pause a subscription. */
  pause(id: string): SubscriptionV2 | undefined {
    const sub = subscriptions.find((s) => s.id === id);
    if (!sub) return undefined;
    sub.status = 'paused';
    return sub;
  },

  /** Resume a subscription. */
  resume(id: string): SubscriptionV2 | undefined {
    const sub = subscriptions.find((s) => s.id === id);
    if (!sub) return undefined;
    sub.status = 'active';
    return sub;
  },

  /** Record usage for usage-based subscriptions. */
  recordUsage(id: string, amount: number): SubscriptionV2 | undefined {
    const sub = subscriptions.find((s) => s.id === id);
    if (!sub || sub.billingType !== 'usage_based') return undefined;
    sub.usage = (sub.usage ?? 0) + amount;
    return sub;
  },

  /** Get subscription by ID. */
  getById(id: string): SubscriptionV2 | undefined {
    return subscriptions.find((s) => s.id === id);
  },

  /** Get subscriptions by customer. */
  getByCustomer(customerId: string): SubscriptionV2[] {
    return subscriptions.filter((s) => s.customerId === customerId);
  },

  /** Get all subscriptions. */
  getAll(): SubscriptionV2[] {
    return [...subscriptions].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  /** Get by status. */
  getByStatus(status: SubscriptionStatus): SubscriptionV2[] {
    return subscriptions.filter((s) => s.status === status);
  },

  /** Get stats. */
  getStats(): { total: number; active: number; trialing: number; cancelled: number; paused: number; pastDue: number; mrr: number } {
    const active = subscriptions.filter((s) => s.status === 'active');
    return {
      total: subscriptions.length,
      active: active.length,
      trialing: subscriptions.filter((s) => s.status === 'trialing').length,
      cancelled: subscriptions.filter((s) => s.status === 'cancelled').length,
      paused: subscriptions.filter((s) => s.status === 'paused').length,
      pastDue: subscriptions.filter((s) => s.status === 'past_due').length,
      mrr: active.filter((s) => s.interval === 'monthly').reduce((sum, s) => sum + s.amount, 0),
    };
  },

  /** Seed mock data. */
  _seed(subs: SubscriptionV2[]): void {
    subscriptions = subs;
    subCounter = subs.length;
  },
};

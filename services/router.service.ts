/**
 * Payment Router Service
 * Determines which provider should process a payment based on routing rules.
 * Supports routing by: country, currency, payment method, merchant preference,
 * risk rules, availability, processing cost, priority, and failover.
 */

import type { ProviderId, PaymentMethod, CurrencyCode, RoutingRule, Provider } from '@/types';
import { providerService } from './provider.service';
import { PROVIDER_CONFIGS } from './providers/mock-providers';

const DEFAULT_RULES: RoutingRule[] = [
  { id: 'rule-001', name: 'M-Pesa for KES in Kenya', priority: 1, condition: { country: ['KE'], currency: ['KES'], paymentMethod: ['mpesa'] }, providerId: 'mpesa', failoverProviderId: 'airtel_money', enabled: true },
  { id: 'rule-002', name: 'Airtel for East Africa mobile money', priority: 2, condition: { country: ['UG','TZ','RW'], paymentMethod: ['airtel'] }, providerId: 'airtel_money', failoverProviderId: 'mpesa', enabled: true },
  { id: 'rule-003', name: 'PesaLink for KES bank transfers', priority: 3, condition: { country: ['KE'], currency: ['KES'], paymentMethod: ['bank'] }, providerId: 'pesalink', failoverProviderId: 'bank_transfer', enabled: true },
  { id: 'rule-004', name: 'Apple Pay priority', priority: 1, condition: { paymentMethod: ['apple_pay'] }, providerId: 'apple_pay', failoverProviderId: 'visa', enabled: true },
  { id: 'rule-005', name: 'Google Pay priority', priority: 2, condition: { paymentMethod: ['google_pay'] }, providerId: 'google_pay', failoverProviderId: 'mastercard', enabled: true },
  { id: 'rule-006', name: 'PayPal for wallet payments', priority: 3, condition: { paymentMethod: ['paypal'] }, providerId: 'paypal', enabled: true },
  { id: 'rule-007', name: 'Visa for card payments (default)', priority: 10, condition: { paymentMethod: ['card','visa'] }, providerId: 'visa', failoverProviderId: 'mastercard', enabled: true },
  { id: 'rule-008', name: 'Mastercard fallback', priority: 11, condition: { paymentMethod: ['mastercard'] }, providerId: 'mastercard', failoverProviderId: 'visa', enabled: true },
  { id: 'rule-009', name: 'Amex for premium cards', priority: 5, condition: { paymentMethod: ['amex'] }, providerId: 'amex', failoverProviderId: 'visa', enabled: true },
  { id: 'rule-010', name: 'Bank transfer default', priority: 8, condition: { paymentMethod: ['bank'] }, providerId: 'bank_transfer', enabled: true },
];

let rules: RoutingRule[] = [...DEFAULT_RULES];

export interface RoutingInput {
  country?: string;
  currency: CurrencyCode;
  paymentMethod: PaymentMethod;
  merchantId?: string;
  amount?: number;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
}

export interface RoutingResult {
  providerId: ProviderId;
  failoverProviderId?: ProviderId;
  rule: RoutingRule;
  reason: string;
}

export const routerService = {
  /** Route a payment to the best provider. */
  route(input: RoutingInput): RoutingResult {
    // Sort rules by priority (lower = higher priority)
    const sortedRules = rules.filter((r) => r.enabled).sort((a, b) => a.priority - b.priority);

    for (const rule of sortedRules) {
      const c = rule.condition;
      if (c.country && input.country && !c.country.includes(input.country)) continue;
      if (c.currency && !c.currency.includes(input.currency)) continue;
      if (c.paymentMethod && !c.paymentMethod.includes(input.paymentMethod)) continue;
      if (c.merchantId && input.merchantId && !c.merchantId.includes(input.merchantId)) continue;
      if (c.minAmount && input.amount && input.amount < c.minAmount) continue;
      if (c.maxAmount && input.amount && input.amount > c.maxAmount) continue;

      // Check risk — high risk routes to more reliable providers
      if (input.riskLevel === 'critical' || input.riskLevel === 'high') {
        const provider = providerService.getConfig(rule.providerId);
        if (provider.successRate < 98) continue;
      }

      // Check availability
      const provider = providerService.getConfig(rule.providerId);
      if (!provider.enabled || provider.status === 'down' || provider.status === 'maintenance') {
        if (rule.failoverProviderId) {
          const failover = providerService.getConfig(rule.failoverProviderId);
          if (failover.enabled && failover.status === 'operational') {
            return { providerId: rule.failoverProviderId, rule, reason: `Failover: ${rule.name} (primary unavailable)` };
          }
        }
        continue;
      }

      return { providerId: rule.providerId, failoverProviderId: rule.failoverProviderId, rule, reason: `Matched: ${rule.name}` };
    }

    // Fallback: find any operational provider that supports the currency
    const fallback = providerService.getByCurrency(input.currency)
      .filter((p) => p.enabled && p.status === 'operational')
      .sort((a, b) => a.priority - b.priority)[0];

    if (fallback) {
      return { providerId: fallback.id, reason: `Fallback: first available for ${input.currency}` , rule: { id: 'fallback', name: 'Fallback', priority: 999, condition: {}, providerId: fallback.id, enabled: true } };
    }

    throw new Error(`No provider available for ${input.currency} / ${input.paymentMethod}`);
  },

  /** Get all routing rules. */
  getRules(): RoutingRule[] {
    return [...rules].sort((a, b) => a.priority - b.priority);
  },

  /** Add a routing rule. */
  addRule(rule: Omit<RoutingRule, 'id'>): RoutingRule {
    const newRule: RoutingRule = { ...rule, id: `rule-${Date.now()}` };
    rules.push(newRule);
    return newRule;
  },

  /** Update a routing rule. */
  updateRule(id: string, updates: Partial<RoutingRule>): RoutingRule | undefined {
    const rule = rules.find((r) => r.id === id);
    if (!rule) return undefined;
    Object.assign(rule, updates);
    return rule;
  },

  /** Delete a routing rule. */
  deleteRule(id: string): boolean {
    const idx = rules.findIndex((r) => r.id === id);
    if (idx === -1) return false;
    rules.splice(idx, 1);
    return true;
  },

  /** Toggle a rule. */
  toggleRule(id: string): void {
    const rule = rules.find((r) => r.id === id);
    if (rule) rule.enabled = !rule.enabled;
  },

  /** Get routing cost estimate. */
  getCostEstimate(providerId: ProviderId, amount: number): { rate: number; flat: number; total: number } {
    const config = PROVIDER_CONFIGS[providerId];
    const total = amount * config.processingFeeRate + config.processingFeeFlat;
    return { rate: config.processingFeeRate, flat: config.processingFeeFlat, total: Math.round(total * 100) / 100 };
  },
};

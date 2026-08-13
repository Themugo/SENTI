/**
 * Limits Service
 * Enforces transaction limits per wallet: daily, monthly, and per-transaction.
 * Limits are checked before any transaction is posted to the ledger.
 * Usage is calculated from ledger entries — never stored.
 */

import type { TransactionLimit, CurrencyCode, LimitType } from '@/types';
import { ledgerService } from './ledger.service';
import { currencyService } from './currency.service';

const DEFAULT_LIMITS: Omit<TransactionLimit, 'walletId'>[] = [
  { id: 'lim_daily', type: 'daily', amount: 50_000, currency: 'USD', used: 0 },
  { id: 'lim_monthly', type: 'monthly', amount: 200_000, currency: 'USD', used: 0 },
  { id: 'lim_per_tx', type: 'per_transaction', amount: 25_000, currency: 'USD', used: 0 },
];

const customLimits = new Map<string, TransactionLimit[]>();

function getStartOfDay(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function getStartOfMonth(): string {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export const limitsService = {
  /** Get limits for a wallet (defaults if no custom limits set). */
  getLimits(walletId: string): TransactionLimit[] {
    const custom = customLimits.get(walletId);
    if (custom) return custom;
    return DEFAULT_LIMITS.map((l) => ({ ...l, walletId, used: 0 }));
  },

  /** Set custom limits for a wallet. */
  setLimits(walletId: string, limits: { daily?: number; monthly?: number; perTransaction?: number; currency?: CurrencyCode }): void {
    const currency = limits.currency ?? 'USD';
    const mapped: TransactionLimit[] = [
      { id: 'lim_daily', walletId, type: 'daily', amount: limits.daily ?? 50_000, currency, used: 0 },
      { id: 'lim_monthly', walletId, type: 'monthly', amount: limits.monthly ?? 200_000, currency, used: 0 },
      { id: 'lim_per_tx', walletId, type: 'per_transaction', amount: limits.perTransaction ?? 25_000, currency, used: 0 },
    ];
    customLimits.set(walletId, mapped);
  },

  /**
   * Calculate current usage from the ledger.
   * Usage = sum of posted debit entries within the period, converted to limit currency.
   */
  getUsage(walletId: string, type: LimitType): number {
    const entries = ledgerService.getByWallet(walletId).filter(
      (e) => e.type === 'debit' && e.status === 'posted',
    );

    const cutoff = type === 'daily' ? getStartOfDay() : type === 'monthly' ? getStartOfMonth() : '1970-01-01T00:00:00Z';
    const periodEntries = entries.filter((e) => e.timestamp >= cutoff);

    return periodEntries.reduce((sum, e) => {
      return sum + currencyService.convert(e.amount, e.currency, 'USD');
    }, 0);
  },

  /**
   * Check if a transaction would exceed limits.
   * Returns { allowed, reason } — never throws.
   */
  checkLimit(walletId: string, amount: number, currency: CurrencyCode): { allowed: boolean; reason?: string; limitType?: LimitType } {
    const amountUSD = currencyService.convert(amount, currency, 'USD');
    const limits = this.getLimits(walletId);

    for (const limit of limits) {
      const usage = this.getUsage(walletId, limit.type);
      const limitUSD = currencyService.convert(limit.amount, limit.currency, 'USD');

      if (limit.type === 'per_transaction') {
        if (amountUSD > limitUSD) {
          return {
            allowed: false,
            reason: `Amount ${currencyService.format(amount, currency)} exceeds per-transaction limit of ${currencyService.format(limit.amount, limit.currency)}`,
            limitType: 'per_transaction',
          };
        }
      } else {
        if (usage + amountUSD > limitUSD) {
          const remaining = limitUSD - usage;
          return {
            allowed: false,
            reason: `${limit.type === 'daily' ? 'Daily' : 'Monthly'} limit exceeded. Remaining: ${currencyService.format(remaining, 'USD')}`,
            limitType: limit.type,
          };
        }
      }
    }

    return { allowed: true };
  },

  /** Get a summary of limits and usage for display. */
  getSummary(walletId: string): { type: LimitType; limit: number; used: number; remaining: number; currency: CurrencyCode; percentage: number }[] {
    return this.getLimits(walletId).map((limit) => {
      const usedUSD = this.getUsage(walletId, limit.type);
      const used = currencyService.convert(usedUSD, 'USD', limit.currency);
      const remaining = Math.max(0, limit.amount - used);
      const percentage = limit.amount > 0 ? (used / limit.amount) * 100 : 0;
      return {
        type: limit.type,
        limit: limit.amount,
        used,
        remaining,
        currency: limit.currency,
        percentage: Math.min(100, percentage),
      };
    });
  },
};

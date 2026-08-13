/**
 * Fees Engine
 * Calculates fees for any transaction type.
 * Supports: flat, percentage, FX, settlement, merchant, and platform fees.
 */

import { FEE_RULES } from '@/constants';
import type { CurrencyCode, FeeBreakdown, FeeRule, TransactionType } from '@/types';
import { currencyService } from './currency.service';

export const feesService = {
  /** Get all fee rules. */
  getRules(): FeeRule[] {
    return FEE_RULES;
  },

  /** Get rules that apply to a transaction type. */
  getRulesForType(type: TransactionType): FeeRule[] {
    return FEE_RULES.filter((r) => r.appliesTo.includes(type));
  },

  /**
   * Calculate the full fee breakdown for a transaction.
   * Returns all fee components and the total.
   */
  calculate(
    amount: number,
    currency: CurrencyCode,
    type: TransactionType,
    isCrossCurrency = false,
  ): FeeBreakdown {
    const rules = this.getRulesForType(type);

    let flatFee = 0;
    let percentageFee = 0;
    let fxFee = 0;
    let settlementFee = 0;
    let merchantFee = 0;
    let platformFee = 0;

    for (const rule of rules) {
      switch (rule.type) {
        case 'flat':
          flatFee += rule.flatAmount;
          break;
        case 'percentage':
          percentageFee += amount * rule.rate;
          break;
        case 'fx':
          if (isCrossCurrency) {
            fxFee += amount * rule.rate;
          }
          break;
        case 'settlement':
          settlementFee += amount * rule.rate;
          break;
        case 'merchant':
          merchantFee += amount * rule.rate;
          break;
        case 'platform':
          platformFee += amount * rule.rate;
          break;
      }
    }

    const total = flatFee + percentageFee + fxFee + settlementFee + merchantFee + platformFee;

    return {
      flatFee,
      percentageFee,
      fxFee,
      settlementFee,
      merchantFee,
      platformFee,
      total,
      currency,
    };
  },

  /** Format a fee breakdown for display. */
  formatBreakdown(breakdown: FeeBreakdown): { label: string; amount: string }[] {
    const fmt = (n: number) => currencyService.format(n, breakdown.currency);
    const items: { label: string; amount: string }[] = [];

    if (breakdown.flatFee > 0) items.push({ label: 'Flat Fee', amount: fmt(breakdown.flatFee) });
    if (breakdown.percentageFee > 0) items.push({ label: 'Processing Fee', amount: fmt(breakdown.percentageFee) });
    if (breakdown.fxFee > 0) items.push({ label: 'FX Fee', amount: fmt(breakdown.fxFee) });
    if (breakdown.settlementFee > 0) items.push({ label: 'Settlement Fee', amount: fmt(breakdown.settlementFee) });
    if (breakdown.merchantFee > 0) items.push({ label: 'Merchant Fee', amount: fmt(breakdown.merchantFee) });
    if (breakdown.platformFee > 0) items.push({ label: 'Platform Fee', amount: fmt(breakdown.platformFee) });
    items.push({ label: 'Total Fees', amount: fmt(breakdown.total) });

    return items;
  },
};

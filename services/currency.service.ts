/**
 * Currency Service
 * Manages 14 supported currencies and mock exchange rates.
 */

import { CURRENCIES, CURRENCY_LIST } from '@/constants';
import type { CurrencyCode, CurrencyMeta } from '@/types';

export const currencyService = {
  /** Get metadata for a currency. */
  getMeta(code: CurrencyCode): CurrencyMeta {
    return { code, ...CURRENCIES[code] };
  },

  /** List all supported currencies. */
  list(): CurrencyMeta[] {
    return CURRENCY_LIST;
  },

  /** Convert an amount from one currency to another, rounded to destination decimals. */
  convert(amount: number, from: CurrencyCode, to: CurrencyCode): number {
    if (from === to) return amount;
    const usd = amount * CURRENCIES[from].rateToUSD;
    const converted = usd / CURRENCIES[to].rateToUSD;
    const decimals = CURRENCIES[to].decimals;
    return Math.round(converted * Math.pow(10, decimals)) / Math.pow(10, decimals);
  },

  /** Get the exchange rate for a pair. */
  getRate(from: CurrencyCode, to: CurrencyCode): number {
    if (from === to) return 1;
    return CURRENCIES[to].rateToUSD / CURRENCIES[from].rateToUSD;
  },

  /** Format an amount with the correct symbol and decimals. */
  format(amount: number, code: CurrencyCode): string {
    const meta = CURRENCIES[code];
    return `${meta.symbol}${new Intl.NumberFormat('en-US', {
      minimumFractionDigits: meta.decimals,
      maximumFractionDigits: meta.decimals,
    }).format(amount)}`;
  },

  /** Get the inverse rate (for display). */
  getInverseRate(from: CurrencyCode, to: CurrencyCode): number {
    return 1 / this.getRate(from, to);
  },
};

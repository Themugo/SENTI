/**
 * Reports Service
 * Generates financial reports from the ledger and transaction data.
 * All reports are computed on-demand — nothing is pre-calculated or stored.
 *
 * Reports:
 * - Daily Volume (last 7/30 days)
 * - Monthly Revenue (last 12 months)
 * - Fees Earned (total + breakdown by type)
 * - Top Merchants (by volume)
 * - Currency Distribution
 * - Settlement Reports
 * - Cash Flow (inflow vs outflow)
 * - Wallet Growth (cumulative)
 */

import type { CurrencyCode, ReportPoint, CurrencyDistribution, TopMerchant, SettlementReport, FeeType } from '@/types';
import { ledgerService } from './ledger.service';
import { transactionService } from './transaction.service';
import { settlementService } from './settlement.service';
import { merchantService } from './merchant.service';
import { currencyService } from './currency.service';
import { feesService } from './fees.service';
import { walletService } from './wallet.service';
import { engineCache } from './financial-engine';

export interface FeeReport {
  total: number;
  byType: Record<FeeType, number>;
  byTransactionType: Record<string, number>;
}

export interface CashFlowReport {
  inflow: number;
  outflow: number;
  net: number;
  points: ReportPoint[];
}

export interface AdminStats {
  totalVolume: number;
  totalTransactions: number;
  totalWallets: number;
  totalMerchants: number;
  pendingMerchants: number;
  totalFees: number;
  completedTransactions: number;
  failedTransactions: number;
  settlementReport: SettlementReport;
  topCurrencies: CurrencyDistribution[];
}

export const reportsService = {
  /**
   * Daily volume for last N days.
   * Volume = sum of completed transaction amounts in USD.
   */
  getDailyVolume(days = 7): ReportPoint[] {
    const points: ReportPoint[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().slice(0, 10);
      const label = date.toLocaleDateString('en-US', { weekday: 'short' });

      const txs = engineCache.transactions.filter(
        (t) => t.createdAt.slice(0, 10) === dateStr && t.status === 'completed',
      );
      const volume = txs.reduce((sum, t) => sum + currencyService.convert(t.amount, t.currency, 'USD'), 0);
      points.push({ label, value: Math.round(volume) });
    }
    return points;
  },

  /**
   * Monthly revenue for last N months.
   * Revenue = total transaction volume.
   * Net = revenue - fees.
   */
  getMonthlyRevenue(months = 7): ReportPoint[] {
    const points: ReportPoint[] = [];
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStr = date.toISOString().slice(0, 7);
      const label = date.toLocaleDateString('en-US', { month: 'short' });

      const txs = engineCache.transactions.filter(
        (t) => t.createdAt.slice(0, 7) === monthStr && t.status === 'completed',
      );
      const revenue = txs.reduce((sum, t) => sum + currencyService.convert(t.amount, t.currency, 'USD'), 0);
      const fees = txs.reduce((sum, t) => sum + currencyService.convert(t.fee.total, t.fee.currency, 'USD'), 0);
      points.push({ label, value: Math.round(revenue), secondary: Math.round(revenue - fees) });
    }
    return points;
  },

  /**
   * Total fees earned, broken down by fee type and transaction type.
   */
  getFeesReport(): FeeReport {
    const byType: Record<FeeType, number> = {
      flat: 0,
      percentage: 0,
      fx: 0,
      settlement: 0,
      merchant: 0,
      platform: 0,
    };
    const byTransactionType: Record<string, number> = {};

    for (const tx of engineCache.transactions) {
      if (tx.status !== 'completed') continue;
      const feeUSD = currencyService.convert(tx.fee.total, tx.fee.currency, 'USD');
      byTransactionType[tx.type] = (byTransactionType[tx.type] ?? 0) + feeUSD;

      byType.flat += currencyService.convert(tx.fee.flatFee, tx.fee.currency, 'USD');
      byType.percentage += currencyService.convert(tx.fee.percentageFee, tx.fee.currency, 'USD');
      byType.fx += currencyService.convert(tx.fee.fxFee, tx.fee.currency, 'USD');
      byType.settlement += currencyService.convert(tx.fee.settlementFee, tx.fee.currency, 'USD');
      byType.merchant += currencyService.convert(tx.fee.merchantFee, tx.fee.currency, 'USD');
      byType.platform += currencyService.convert(tx.fee.platformFee, tx.fee.currency, 'USD');
    }

    const total = Object.values(byType).reduce((a, b) => a + b, 0);
    return { total, byType, byTransactionType };
  },

  /**
   * Top merchants by transaction volume (in USD).
   */
  getTopMerchants(limit = 10): TopMerchant[] {
    return merchantService.getTopMerchants(limit);
  },

  /**
   * Currency distribution by transaction volume.
   */
  getCurrencyDistribution(): CurrencyDistribution[] {
    const totals: Record<string, number> = {};
    for (const tx of engineCache.transactions) {
      if (tx.status !== 'completed') continue;
      totals[tx.currency] = (totals[tx.currency] ?? 0) + tx.amount;
    }
    const total = Object.values(totals).reduce((a, b) => a + b, 0);
    return Object.entries(totals)
      .map(([currency, volume]) => ({
        currency: currency as CurrencyCode,
        volume,
        percentage: total > 0 ? (volume / total) * 100 : 0,
      }))
      .sort((a, b) => b.volume - a.volume);
  },

  /**
   * Settlement report — totals by status.
   */
  getSettlementReport(): SettlementReport {
    return settlementService.getReport();
  },

  /**
   * Cash flow: inflow vs outflow per day.
   * Inflow = credits to user wallets. Outflow = debits from user wallets.
   */
  getCashFlow(days = 7): CashFlowReport {
    const points: ReportPoint[] = [];
    let totalInflow = 0;
    let totalOutflow = 0;

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().slice(0, 10);
      const label = date.toLocaleDateString('en-US', { weekday: 'short' });

      let dayInflow = 0;
      let dayOutflow = 0;

      for (const entry of ledgerService.getAll()) {
        if (entry.timestamp.slice(0, 10) !== dateStr) continue;
        if (entry.status !== 'posted') continue;
        const usd = currencyService.convert(entry.amount, entry.currency, 'USD');
        if (entry.type === 'credit') dayInflow += usd;
        else dayOutflow += usd;
      }

      totalInflow += dayInflow;
      totalOutflow += dayOutflow;
      points.push({ label, value: Math.round(dayInflow), secondary: Math.round(dayOutflow) });
    }

    return {
      inflow: Math.round(totalInflow),
      outflow: Math.round(totalOutflow),
      net: Math.round(totalInflow - totalOutflow),
      points,
    };
  },

  /**
   * Wallet growth — cumulative wallet count over time.
   */
  getWalletGrowth(months = 7): ReportPoint[] {
    const points: ReportPoint[] = [];
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStr = date.toISOString().slice(0, 7);
      const label = date.toLocaleDateString('en-US', { month: 'short' });
      const count = engineCache.wallets.filter((w) => w.createdAt.slice(0, 7) <= monthStr).length;
      points.push({ label, value: count });
    }
    return points;
  },

  /**
   * Platform-wide admin stats.
   */
  getAdminStats(): AdminStats {
    const completed = engineCache.transactions.filter((t) => t.status === 'completed');
    const failed = engineCache.transactions.filter((t) => t.status === 'failed');
    const totalVolume = completed.reduce((sum, t) => sum + currencyService.convert(t.amount, t.currency, 'USD'), 0);
    const totalFees = completed.reduce((sum, t) => sum + currencyService.convert(t.fee.total, t.fee.currency, 'USD'), 0);

    return {
      totalVolume: Math.round(totalVolume),
      totalTransactions: engineCache.transactions.length,
      totalWallets: walletService.count(),
      totalMerchants: merchantService.count(),
      pendingMerchants: merchantService.getPending().length,
      totalFees: Math.round(totalFees),
      completedTransactions: completed.length,
      failedTransactions: failed.length,
      settlementReport: settlementService.getReport(),
      topCurrencies: this.getCurrencyDistribution().slice(0, 5),
    };
  },

  /**
   * Settlement status distribution for charts.
   */
  getSettlementStatusBreakdown(): { label: string; value: number; color: string }[] {
    const all = settlementService.getAll();
    const completed = all.filter((s) => s.status === 'completed').length;
    const pending = all.filter((s) => s.status === 'pending').length;
    const queued = all.filter((s) => s.status === 'queued').length;
    const failed = all.filter((s) => s.status === 'failed').length;

    return [
      { label: 'Completed', value: completed, color: 'hsl(142 71% 45%)' },
      { label: 'Pending', value: pending, color: 'hsl(38 92% 50%)' },
      { label: 'Queued', value: queued, color: 'hsl(200 80% 50%)' },
      { label: 'Failed', value: failed, color: 'hsl(0 72% 51%)' },
    ];
  },

  /**
   * Transaction status distribution for charts.
   */
  getTransactionStatusBreakdown(): { label: string; value: number; color: string }[] {
    const all = engineCache.transactions;
    const colors: Record<string, string> = {
      completed: 'hsl(142 71% 45%)',
      processing: 'hsl(200 80% 50%)',
      failed: 'hsl(0 72% 51%)',
      cancelled: 'hsl(280 60% 55%)',
      reversed: 'hsl(38 92% 50%)',
      settled: 'hsl(160 84% 39%)',
      authorized: 'hsl(186 90% 45%)',
      created: 'hsl(210 80% 55%)',
    };

    const counts: Record<string, number> = {};
    for (const t of all) {
      counts[t.status] = (counts[t.status] ?? 0) + 1;
    }

    return Object.entries(counts)
      .map(([status, count]) => ({
        label: status.charAt(0).toUpperCase() + status.slice(1),
        value: count,
        color: colors[status] ?? 'hsl(0 0% 50%)',
      }))
      .sort((a, b) => b.value - a.value);
  },
};

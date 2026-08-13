/**
 * Merchant Service
 * Manages merchant accounts and calculates merchant balances from the ledger.
 * Includes rolling reserve calculation.
 */

import type { MerchantAccount, MerchantBalance, CurrencyCode, SettlementSchedule } from '@/types';
import { ledgerService } from './ledger.service';
import { settlementService } from './settlement.service';

let merchants: MerchantAccount[] = [];
let merchantCounter = 0;

function nextMerchantId(): string {
  merchantCounter++;
  return `MCH-${Date.now().toString(36).toUpperCase()}-${merchantCounter.toString().padStart(4, '0')}`;
}

export const merchantService = {
  _init(ms: MerchantAccount[]) {
    merchants = ms;
    merchantCounter = ms.length;
  },

  /** Get all merchants. */
  getAll(): MerchantAccount[] {
    return [...merchants];
  },

  /** Get a single merchant. */
  getById(id: string): MerchantAccount | undefined {
    return merchants.find((m) => m.id === id);
  },

  /** Get verified merchants. */
  getVerified(): MerchantAccount[] {
    return merchants.filter((m) => m.verificationStatus === 'verified');
  },

  /** Get pending verifications. */
  getPending(): MerchantAccount[] {
    return merchants.filter((m) => m.verificationStatus === 'pending');
  },

  /**
   * Create a new merchant account.
   * Automatically creates merchant + reserve wallets (done by walletService caller).
   */
  create(params: {
    businessName: string;
    email: string;
    category: string;
    country: string;
    settlementSchedule: SettlementSchedule;
    rollingReserveRate?: number;
    merchantWalletId: string;
    reserveWalletId: string;
  }): MerchantAccount {
    const merchant: MerchantAccount = {
      id: nextMerchantId(),
      businessName: params.businessName,
      email: params.email,
      category: params.category,
      country: params.country,
      verificationStatus: 'pending',
      settlementSchedule: params.settlementSchedule,
      rollingReserveRate: params.rollingReserveRate ?? 0.05,
      joinedAt: new Date().toISOString(),
      merchantWalletId: params.merchantWalletId,
      reserveWalletId: params.reserveWalletId,
    };

    merchants.push(merchant);
    return merchant;
  },

  /**
   * Calculate merchant balance from the ledger.
   * Available = merchant wallet balance - reserve
   * Reserve = rolling reserve held in reserve wallet
   * Pending = pending settlements
   */
  getBalance(merchantId: string): MerchantBalance {
    const merchant = this.getById(merchantId);
    if (!merchant) {
      return {
        merchantId,
        available: 0,
        pending: 0,
        reserve: 0,
        rollingReserve: 0,
        currency: 'USD',
      };
    }

    const merchantBalance = ledgerService.calculateBalance(merchant.merchantWalletId);
    const reserveBalance = ledgerService.calculateBalance(merchant.reserveWalletId);

    const pendingSettlements = settlementService
      .getByMerchant(merchantId)
      .filter((s) => s.status === 'pending' || s.status === 'queued')
      .reduce((sum, s) => sum + s.netAmount, 0);

    return {
      merchantId,
      available: merchantBalance.available - pendingSettlements,
      pending: pendingSettlements,
      reserve: reserveBalance.balance,
      rollingReserve: reserveBalance.balance,
      currency: merchantBalance.currency,
    };
  },

  /** Verify a merchant. */
  verify(id: string): MerchantAccount | undefined {
    const m = merchants.find((x) => x.id === id);
    if (m) m.verificationStatus = 'verified';
    return m;
  },

  /** Reject a merchant. */
  reject(id: string): MerchantAccount | undefined {
    const m = merchants.find((x) => x.id === id);
    if (m) m.verificationStatus = 'rejected';
    return m;
  },

  /** Get count. */
  count(): number {
    return merchants.length;
  },

  /** Get top merchants by gross volume (sum of credit entries). */
  getTopMerchants(limit = 5): { merchantId: string; businessName: string; volume: number; transactionCount: number }[] {
    return merchants
      .map((m) => {
        const entries = ledgerService.getByWallet(m.merchantWalletId);
        const volume = entries.filter((e) => e.type === 'credit' && e.status === 'posted').reduce((sum, e) => sum + e.amount, 0);
        return {
          merchantId: m.id,
          businessName: m.businessName,
          volume,
          transactionCount: entries.length,
        };
      })
      .sort((a, b) => b.volume - a.volume)
      .slice(0, limit);
  },
};

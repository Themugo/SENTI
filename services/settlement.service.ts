/**
 * Settlement Service
 * Manages the settlement queue: pending, completed, failed settlements.
 * Settlements move funds from merchant wallet to merchant's bank account.
 */

import type { Settlement, SettlementStatus, SettlementSchedule, SettlementReport, CurrencyCode } from '@/types';
import { ledgerService } from './ledger.service';
import { feesService } from './fees.service';

let settlements: Settlement[] = [];
let settlementCounter = 0;

function nextSettlementId(): string {
  settlementCounter++;
  return `STL-${Date.now().toString(36).toUpperCase()}-${settlementCounter.toString().padStart(6, '0')}`;
}

export const settlementService = {
  _init(stls: Settlement[]) {
    settlements = stls;
    settlementCounter = stls.length;
  },

  /** Get all settlements. */
  getAll(): Settlement[] {
    return [...settlements].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  /** Get settlements for a merchant. */
  getByMerchant(merchantId: string): Settlement[] {
    return settlements.filter((s) => s.merchantId === merchantId);
  },

  /** Get settlements by status. */
  getByStatus(status: SettlementStatus): Settlement[] {
    return settlements.filter((s) => s.status === status);
  },

  /** Get a single settlement. */
  getById(id: string): Settlement | undefined {
    return settlements.find((s) => s.id === id);
  },

  /**
   * Create a new settlement.
   * Debits merchant wallet, credits bank account (via ledger).
   */
  create(params: {
    merchantId: string;
    merchantName: string;
    merchantWalletId: string;
    amount: number;
    currency: CurrencyCode;
    schedule: SettlementSchedule;
    transactionIds: string[];
    bankAccount?: string;
  }): Settlement {
    const id = nextSettlementId();
    const now = new Date().toISOString();

    const fees = feesService.calculate(params.amount, params.currency, 'merchant_settlement');

    const settlement: Settlement = {
      id,
      reference: id,
      merchantId: params.merchantId,
      merchantName: params.merchantName,
      merchantWalletId: params.merchantWalletId,
      amount: params.amount,
      currency: params.currency,
      fees: fees.total,
      netAmount: params.amount - fees.total,
      status: 'queued',
      schedule: params.schedule,
      transactionIds: params.transactionIds,
      bankAccount: params.bankAccount,
      createdAt: now,
    };

    settlements.push(settlement);
    return settlement;
  },

  /** Advance a settlement to pending. */
  process(id: string): Settlement | undefined {
    const s = settlements.find((x) => x.id === id);
    if (s && s.status === 'queued') {
      s.status = 'pending';
    }
    return s;
  },

  /** Complete a settlement. Posts ledger entries to move funds from merchant wallet to bank. */
  complete(id: string, bankWalletId?: string): Settlement | undefined {
    const s = settlements.find((x) => x.id === id);
    if (s && s.status === 'pending') {
      s.status = 'completed';
      s.settledAt = new Date().toISOString();

      // Post ledger entry: debit merchant wallet, credit bank/external wallet
      const settlementWalletId = bankWalletId ?? 'PW-EXTERNAL-BANK';
      ledgerService.postEntry({
        reference: `${s.id}-SETTLE`,
        description: `Settlement payout to bank account`,
        sourceWalletId: s.merchantWalletId,
        destinationWalletId: settlementWalletId,
        amount: s.netAmount,
        currency: s.currency,
        type: 'merchant_settlement',
      });

      // Post fee entry: debit merchant wallet for settlement fee, credit platform
      if (s.fees > 0) {
        ledgerService.postEntry({
          reference: `${s.id}-FEE`,
          description: `Settlement fee for ${s.id}`,
          sourceWalletId: s.merchantWalletId,
          destinationWalletId: 'PW-PLATFORM-0001',
          amount: s.fees,
          currency: s.currency,
          type: 'fee',
        });
      }
    }
    return s;
  },

  /** Fail a settlement. */
  fail(id: string, reason?: string): Settlement | undefined {
    const s = settlements.find((x) => x.id === id);
    if (s && (s.status === 'pending' || s.status === 'queued')) {
      s.status = 'failed';
    }
    return s;
  },

  /** Generate a settlement report. */
  getReport(): SettlementReport {
    const completed = settlements.filter((s) => s.status === 'completed');
    const pending = settlements.filter((s) => s.status === 'pending' || s.status === 'queued');
    const failed = settlements.filter((s) => s.status === 'failed');

    return {
      totalSettled: completed.reduce((sum, s) => sum + s.netAmount, 0),
      pending: pending.reduce((sum, s) => sum + s.netAmount, 0),
      failed: failed.reduce((sum, s) => sum + s.netAmount, 0),
      count: settlements.length,
    };
  },

  /** Get count. */
  count(): number {
    return settlements.length;
  },
};

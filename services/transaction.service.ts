/**
 * Transaction Service
 * Manages the full transaction lifecycle: 16 types, timeline tracking,
 * search, and filtering. Every transaction creates ledger entries.
 */

import type {
  Transaction,
  TransactionType,
  TransactionStatus,
  PaymentMethod,
  CurrencyCode,
  TransactionSearchFilters,
  TransactionTimelineEvent,
  FeeBreakdown,
} from '@/types';
import { ledgerService } from './ledger.service';
import { feesService } from './fees.service';
import { currencyService } from './currency.service';

let transactions: Transaction[] = [];
let txCounter = 0;

function nextTxId(): string {
  txCounter++;
  return `TXN-${Date.now().toString(36).toUpperCase()}-${txCounter.toString().padStart(6, '0')}`;
}

function nextReference(): string {
  return `REF-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

export const transactionService = {
  _init(txs: Transaction[]) {
    transactions = txs;
    txCounter = txs.length;
  },

  /** Get all transactions. */
  getAll(filters?: TransactionSearchFilters): Transaction[] {
    let result = [...transactions];

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter((t) =>
        t.reference.toLowerCase().includes(q) ||
        t.counterparty.name.toLowerCase().includes(q) ||
        t.counterparty.email?.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.sourceWalletId.toLowerCase().includes(q) ||
        t.destinationWalletId.toLowerCase().includes(q),
      );
    }
    if (filters?.status && filters.status !== 'all') {
      result = result.filter((t) => t.status === filters.status);
    }
    if (filters?.type && filters.type !== 'all') {
      result = result.filter((t) => t.type === filters.type);
    }
    if (filters?.currency && filters.currency !== 'all') {
      result = result.filter((t) => t.currency === filters.currency);
    }
    if (filters?.paymentMethod && filters.paymentMethod !== 'all') {
      result = result.filter((t) => t.paymentMethod === filters.paymentMethod);
    }
    if (filters?.merchantId && filters.merchantId !== 'all') {
      result = result.filter((t) => t.counterparty.walletId === filters.merchantId);
    }
    if (filters?.dateFrom) {
      result = result.filter((t) => t.createdAt >= filters.dateFrom!);
    }
    if (filters?.dateTo) {
      result = result.filter((t) => t.createdAt <= filters.dateTo!);
    }
    if (filters?.minAmount !== undefined) {
      result = result.filter((t) => t.amount >= filters.minAmount!);
    }
    if (filters?.maxAmount !== undefined) {
      result = result.filter((t) => t.amount <= filters.maxAmount!);
    }
    if (filters?.limit) {
      result = result.slice(0, filters.limit);
    }

    return result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  /** Get a single transaction by ID. */
  getById(id: string): Transaction | undefined {
    return transactions.find((t) => t.id === id);
  },

  /** Get by reference. */
  getByReference(reference: string): Transaction | undefined {
    return transactions.find((t) => t.reference === reference);
  },

  /** Get transactions for a wallet. */
  getByWallet(walletId: string): Transaction[] {
    return transactions.filter(
      (t) => t.sourceWalletId === walletId || t.destinationWalletId === walletId,
    );
  },

  /**
   * Create a new transaction with full lifecycle.
   * Posts ledger entries and fee entries automatically.
   */
  create(params: {
    type: TransactionType;
    amount: number;
    currency: CurrencyCode;
    description: string;
    counterparty: { name: string; email?: string; walletId?: string };
    sourceWalletId: string;
    destinationWalletId: string;
    paymentMethod: PaymentMethod;
    destinationCurrency?: CurrencyCode;
  }): Transaction {
    const id = nextTxId();
    const reference = nextReference();
    const now = new Date().toISOString();

    const isCrossCurrency = params.destinationCurrency && params.destinationCurrency !== params.currency;
    const fee = feesService.calculate(
      params.amount,
      params.currency,
      params.type,
      isCrossCurrency,
    );

    const exchangeRate = isCrossCurrency && params.destinationCurrency
      ? currencyService.getRate(params.currency, params.destinationCurrency)
      : undefined;

    // Post ledger entries (debit source, credit destination)
    const { debitEntry, creditEntry } = ledgerService.postEntry({
      reference,
      description: params.description,
      sourceWalletId: params.sourceWalletId,
      destinationWalletId: params.destinationWalletId,
      amount: params.amount,
      currency: params.currency,
      exchangeRate,
      type: params.type,
    });

    // Post fee entry if fees apply
    let feeEntryIds: string[] = [];
    if (fee.total > 0) {
      const feeEntries = ledgerService.postFeeEntry({
        reference,
        walletId: params.sourceWalletId,
        platformWalletId: 'PW-PLATFORM-0001',
        amount: fee.total,
        currency: params.currency,
        description: params.type,
      });
      feeEntryIds = [feeEntries.debitEntry.id, feeEntries.creditEntry.id];
    }

    const timeline: TransactionTimelineEvent[] = [
      { status: 'created', timestamp: now },
      { status: 'authorized', timestamp: now, note: 'Authorized automatically' },
      { status: 'processing', timestamp: now },
    ];

    const tx: Transaction = {
      id,
      reference,
      type: params.type,
      status: 'processing',
      amount: params.amount,
      currency: params.currency,
      fee,
      description: params.description,
      counterparty: params.counterparty,
      sourceWalletId: params.sourceWalletId,
      destinationWalletId: params.destinationWalletId,
      paymentMethod: params.paymentMethod,
      exchangeRate,
      timeline,
      ledgerEntryIds: [debitEntry.id, creditEntry.id, ...feeEntryIds],
      createdAt: now,
      updatedAt: now,
    };

    transactions.push(tx);
    return tx;
  },

  /** Advance the transaction timeline to a new status. */
  updateStatus(id: string, status: TransactionStatus, note?: string): Transaction | undefined {
    const tx = transactions.find((t) => t.id === id);
    if (!tx) return undefined;

    tx.status = status;
    tx.updatedAt = new Date().toISOString();
    tx.timeline.push({ status, timestamp: tx.updatedAt, note });

    // If failed or reversed, reverse the ledger entries
    if (status === 'failed' || status === 'reversed') {
      ledgerService.reverseEntry(tx.reference, note ?? `Transaction ${status}`);
    }

    return tx;
  },

  /** Get count. */
  count(): number {
    return transactions.length;
  },

  /** Get all transaction types. */
  getTypes(): TransactionType[] {
    return [
      'deposit', 'withdrawal', 'card_payment', 'bank_transfer',
      'mpesa', 'airtel_money', 'internal_transfer', 'currency_exchange',
      'refund', 'chargeback', 'escrow_hold', 'escrow_release',
      'subscription', 'invoice_payment', 'merchant_settlement', 'fee',
    ];
  },

  /** Get all statuses. */
  getStatuses(): TransactionStatus[] {
    return ['created', 'authorized', 'processing', 'settled', 'completed', 'failed', 'cancelled', 'reversed'];
  },
};

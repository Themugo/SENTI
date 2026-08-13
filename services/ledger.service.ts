/**
 * Ledger Service — The Source of Truth
 *
 * PRINCIPLES:
 * 1. The ledger is immutable. Entries can NEVER be edited or deleted.
 * 2. Balances are NEVER stored. They are always calculated from ledger entries.
 * 3. Every transaction produces at least two entries: a debit and a credit.
 * 4. Double-entry bookkeeping: for every debit there is an equal credit.
 * 5. Reversed entries create new compensating entries (never modify originals).
 */

import type { LedgerEntry, WalletBalance, CurrencyCode, TransactionType } from '@/types';
import { currencyService } from './currency.service';
import { feesService } from './fees.service';

// In-memory ledger store (would be a database in production)
let ledgerEntries: LedgerEntry[] = [];

let auditCounter = 0;
function nextAuditId(): string {
  auditCounter++;
  return `AUD-${Date.now().toString(36).toUpperCase()}-${auditCounter.toString().padStart(6, '0')}`;
}

let entryCounter = 0;
function nextEntryId(): string {
  entryCounter++;
  return `LE-${Date.now().toString(36).toUpperCase()}-${entryCounter.toString().padStart(6, '0')}`;
}

export const ledgerService = {
  /** Initialize the ledger with pre-generated entries (called once at startup). */
  _init(entries: LedgerEntry[]) {
    ledgerEntries = entries;
    auditCounter = entries.length;
    entryCounter = entries.length;
  },

  /** Get all ledger entries (for audit). */
  getAll(): LedgerEntry[] {
    return [...ledgerEntries];
  },

  /** Get entries for a specific wallet. */
  getByWallet(walletId: string): LedgerEntry[] {
    return ledgerEntries.filter((e) => e.walletId === walletId);
  },

  /** Get entries by reference (all entries for one transaction). */
  getByReference(reference: string): LedgerEntry[] {
    return ledgerEntries.filter((e) => e.reference === reference);
  },

  /**
   * Calculate the balance of a wallet from ledger entries.
   * This is the ONLY way to get a balance — never store balances.
   * Balance = sum(credits) - sum(debits), for posted entries only.
   */
  calculateBalance(walletId: string): WalletBalance {
    const entries = this.getByWallet(walletId);
    const posted = entries.filter((e) => e.status === 'posted');
    const pending = entries.filter((e) => e.status === 'pending');

    const currency = posted[0]?.currency ?? pending[0]?.currency ?? 'USD';

    const balance = posted.reduce((sum, e) => {
      return e.type === 'credit' ? sum + e.amount : sum - e.amount;
    }, 0);

    const pendingAmount = pending.reduce((sum, e) => {
      return e.type === 'credit' ? sum + e.amount : sum - e.amount;
    }, 0);

    return {
      walletId,
      currency,
      balance,
      pending: pendingAmount,
      available: balance + pendingAmount,
    };
  },

  /**
   * Calculate balance in USD (for cross-currency comparison).
   */
  calculateBalanceUSD(walletId: string): number {
    const bal = this.calculateBalance(walletId);
    return currencyService.convert(bal.balance, bal.currency, 'USD');
  },

  /**
   * Post a new pair of ledger entries (double-entry bookkeeping).
   * This is the primary method for recording any financial movement.
   */
  postEntry(params: {
    reference: string;
    description: string;
    sourceWalletId: string;
    destinationWalletId: string;
    amount: number;
    currency: CurrencyCode;
    exchangeRate?: number;
    type: TransactionType;
  }): { debitEntry: LedgerEntry; creditEntry: LedgerEntry } {
    const auditId = nextAuditId();
    const timestamp = new Date().toISOString();
    const baseId = nextEntryId();

    const debitEntry: LedgerEntry = {
      id: baseId,
      auditId,
      walletId: params.sourceWalletId,
      type: 'debit',
      amount: params.amount,
      currency: params.currency,
      reference: params.reference,
      description: params.description,
      sourceWalletId: params.sourceWalletId,
      destinationWalletId: params.destinationWalletId,
      exchangeRate: params.exchangeRate,
      status: 'posted',
      timestamp,
      immutable: true,
    };

    const creditEntry: LedgerEntry = {
      id: `${baseId}-C`,
      auditId,
      walletId: params.destinationWalletId,
      type: 'credit',
      amount: params.amount,
      currency: params.currency,
      reference: params.reference,
      description: params.description,
      sourceWalletId: params.sourceWalletId,
      destinationWalletId: params.destinationWalletId,
      exchangeRate: params.exchangeRate,
      status: 'posted',
      timestamp,
      immutable: true,
    };

    ledgerEntries.push(debitEntry, creditEntry);

    return { debitEntry, creditEntry };
  },

  /**
   * Post a fee entry (single debit from wallet, credit to platform wallet).
   */
  postFeeEntry(params: {
    reference: string;
    walletId: string;
    platformWalletId: string;
    amount: number;
    currency: CurrencyCode;
    description: string;
  }): { debitEntry: LedgerEntry; creditEntry: LedgerEntry } {
    return this.postEntry({
      reference: `${params.reference}-FEE`,
      description: `Fee: ${params.description}`,
      sourceWalletId: params.walletId,
      destinationWalletId: params.platformWalletId,
      amount: params.amount,
      currency: params.currency,
      type: 'fee',
    });
  },

  /**
   * Reverse an entry by creating compensating entries.
   * Original entries are NEVER modified — only new compensating entries are added.
   */
  reverseEntry(reference: string, reason: string): void {
    const original = this.getByReference(reference);
    const auditId = nextAuditId();
    const timestamp = new Date().toISOString();

    for (const entry of original) {
      if (entry.status !== 'posted') continue;

      const reversal: LedgerEntry = {
        id: `${nextEntryId()}-REV`,
        auditId,
        walletId: entry.walletId,
        type: entry.type === 'debit' ? 'credit' : 'debit',
        amount: entry.amount,
        currency: entry.currency,
        reference: `${reference}-REV`,
        description: `REVERSAL: ${reason}`,
        sourceWalletId: entry.destinationWalletId,
        destinationWalletId: entry.sourceWalletId,
        exchangeRate: entry.exchangeRate,
        status: 'posted',
        timestamp,
        immutable: true,
      };

      ledgerEntries.push(reversal);
    }
  },

  /** Get total volume from ledger (sum of all credit entries). */
  getTotalVolume(currency?: CurrencyCode): number {
    const entries = currency
      ? ledgerEntries.filter((e) => e.currency === currency)
      : ledgerEntries;
    return entries
      .filter((e) => e.type === 'credit' && e.status === 'posted')
      .reduce((sum, e) => sum + e.amount, 0);
  },

  /** Get total fees collected. */
  getTotalFees(): number {
    return ledgerEntries
      .filter((e) => e.reference.includes('-FEE') && e.type === 'credit' && e.status === 'posted')
      .reduce((sum, e) => sum + e.amount, 0);
  },

  /** Get entry count. */
  count(): number {
    return ledgerEntries.length;
  },
};

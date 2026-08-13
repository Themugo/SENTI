/**
 * Search Service
 * Unified search across the entire financial platform.
 * Searches transactions, wallets, merchants, ledger entries by:
 * Reference, Wallet, Email, Merchant, Currency, Status, Amount.
 */

import type { Transaction, Wallet, MerchantAccount, LedgerEntry, CurrencyCode, TransactionStatus } from '@/types';
import { transactionService } from './transaction.service';
import { walletService } from './wallet.service';
import { merchantService } from './merchant.service';
import { ledgerService } from './ledger.service';
import { currencyService } from './currency.service';

export interface SearchResult {
  type: 'transaction' | 'wallet' | 'merchant' | 'ledger';
  id: string;
  title: string;
  subtitle: string;
  reference?: string;
  amount?: number;
  currency?: CurrencyCode;
  status?: TransactionStatus;
  href: string;
}

export const searchService = {
  /**
   * Global search across all entities.
   * Returns ranked results grouped by type.
   */
  search(query: string, limit = 20): SearchResult[] {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    const results: SearchResult[] = [];

    // Search transactions by reference, description, counterparty, wallet IDs
    for (const tx of transactionService.getAll()) {
      const matches =
        tx.reference.toLowerCase().includes(q) ||
        tx.id.toLowerCase().includes(q) ||
        tx.description.toLowerCase().includes(q) ||
        tx.counterparty.name.toLowerCase().includes(q) ||
        tx.counterparty.email?.toLowerCase().includes(q) ||
        tx.sourceWalletId.toLowerCase().includes(q) ||
        tx.destinationWalletId.toLowerCase().includes(q);

      if (matches) {
        results.push({
          type: 'transaction',
          id: tx.id,
          title: tx.reference,
          subtitle: `${tx.type.replace(/_/g, ' ')} — ${tx.counterparty.name}`,
          reference: tx.reference,
          amount: tx.amount,
          currency: tx.currency,
          status: tx.status,
          href: '/transactions',
        });
      }
    }

    // Search wallets by ID, owner name, owner ID
    for (const w of walletService.getAll()) {
      const matches =
        w.id.toLowerCase().includes(q) ||
        w.ownerName.toLowerCase().includes(q) ||
        w.ownerId.toLowerCase().includes(q) ||
        w.currency.toLowerCase().includes(q);

      if (matches) {
        const balance = ledgerService.calculateBalance(w.id);
        results.push({
          type: 'wallet',
          id: w.id,
          title: w.id,
          subtitle: `${w.type} — ${w.ownerName} — ${currencyService.format(balance.balance, balance.currency)}`,
          href: '/wallet',
        });
      }
    }

    // Search merchants by business name, email, ID
    for (const m of merchantService.getAll()) {
      const matches =
        m.businessName.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q) ||
        m.country.toLowerCase().includes(q);

      if (matches) {
        results.push({
          type: 'merchant',
          id: m.id,
          title: m.businessName,
          subtitle: `${m.id} — ${m.category} — ${m.country}`,
          href: '/merchant',
        });
      }
    }

    // Search ledger entries by reference, audit ID, description
      for (const e of ledgerService.getAll()) {
        const matches =
          e.reference.toLowerCase().includes(q) ||
          e.auditId.toLowerCase().includes(q) ||
          e.id.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q);

        if (matches) {
          results.push({
            type: 'ledger',
            id: e.id,
            title: e.reference,
            subtitle: `${e.type} — ${e.description} — ${currencyService.format(e.amount, e.currency)}`,
            reference: e.reference,
            amount: e.amount,
            currency: e.currency,
            href: '/transactions',
          });
      }
    }

    return results.slice(0, limit);
  },

  /**
   * Search by amount range.
   */
  searchByAmount(min: number, max: number, currency: CurrencyCode = 'USD'): SearchResult[] {
    const results: SearchResult[] = [];
    for (const tx of transactionService.getAll()) {
      const txUSD = currencyService.convert(tx.amount, tx.currency, currency);
      if (txUSD >= min && txUSD <= max) {
        results.push({
          type: 'transaction',
          id: tx.id,
          title: tx.reference,
          subtitle: `${tx.type.replace(/_/g, ' ')} — ${tx.counterparty.name}`,
          reference: tx.reference,
          amount: tx.amount,
          currency: tx.currency,
          status: tx.status,
          href: '/transactions',
        });
      }
    }
    return results.sort((a, b) => (b.amount ?? 0) - (a.amount ?? 0));
  },

  /**
   * Search by currency.
   */
  searchByCurrency(currency: CurrencyCode): SearchResult[] {
    const results: SearchResult[] = [];
    for (const tx of transactionService.getAll()) {
      if (tx.currency === currency) {
        results.push({
          type: 'transaction',
          id: tx.id,
          title: tx.reference,
          subtitle: `${tx.type.replace(/_/g, ' ')} — ${tx.counterparty.name}`,
          reference: tx.reference,
          amount: tx.amount,
          currency: tx.currency,
          status: tx.status,
          href: '/transactions',
        });
      }
    }
    return results.sort((a, b) => (b.amount ?? 0) - (a.amount ?? 0));
  },

  /**
   * Search by status.
   */
  searchByStatus(status: TransactionStatus): SearchResult[] {
    return transactionService.getAll()
      .filter((t) => t.status === status)
      .map((t) => ({
        type: 'transaction' as const,
        id: t.id,
        title: t.reference,
        subtitle: `${t.type.replace(/_/g, ' ')} — ${t.counterparty.name}`,
        reference: t.reference,
        amount: t.amount,
        currency: t.currency,
        status: t.status,
        href: '/transactions',
      }));
  },
};

/**
 * Wallet Service
 * Manages wallet lifecycle. Balances are ALWAYS calculated from the ledger — never stored.
 * Every user automatically receives 4 wallets: primary, merchant, escrow, reserve.
 */

import type { Wallet, WalletBalance, WalletType, CurrencyCode } from '@/types';
import { ledgerService } from './ledger.service';

// In-memory wallet store
let wallets: Wallet[] = [];

let walletCounter = 0;
function nextWalletId(type: WalletType): string {
  walletCounter++;
  const prefix = type === 'primary' ? 'PW' : type === 'merchant' ? 'MW' : type === 'escrow' ? 'EW' : 'RW';
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${walletCounter.toString().padStart(4, '0')}`;
}

export const walletService = {
  /** Initialize with pre-generated wallets (called once at startup). */
  _init(ws: Wallet[]) {
    wallets = ws;
    walletCounter = ws.length;
  },

  /** Get all wallets. */
  getAll(): Wallet[] {
    return [...wallets];
  },

  /** Get wallets for a user. */
  getByOwner(ownerId: string): Wallet[] {
    return wallets.filter((w) => w.ownerId === ownerId);
  },

  /** Get a single wallet. */
  getById(id: string): Wallet | undefined {
    return wallets.find((w) => w.id === id);
  },

  /** Get wallets by type. */
  getByType(type: WalletType): Wallet[] {
    return wallets.filter((w) => w.type === type);
  },

  /**
   * Create the 4 default wallets for a new user.
   * Called automatically on signup.
   */
  createDefaultWallets(ownerId: string, ownerName: string, currency: CurrencyCode = 'USD'): Wallet[] {
    const types: WalletType[] = ['primary', 'merchant', 'escrow', 'reserve'];
    const created: Wallet[] = [];

    for (const type of types) {
      const wallet: Wallet = {
        id: nextWalletId(type),
        type,
        status: 'active',
        currency,
        ownerId,
        ownerName,
        createdAt: new Date().toISOString(),
      };
      wallets.push(wallet);
      created.push(wallet);
    }

    return created;
  },

  /**
   * Get the calculated balance for a wallet.
   * Delegates to the ledger service — the ledger is the source of truth.
   */
  getBalance(walletId: string): WalletBalance {
    return ledgerService.calculateBalance(walletId);
  },

  /**
   * Get balances for all wallets of a user.
   */
  getBalances(ownerId: string): WalletBalance[] {
    return this.getByOwner(ownerId).map((w) => this.getBalance(w.id));
  },

  /**
   * Get the total balance across all wallets in USD.
   */
  getTotalBalanceUSD(ownerId: string): number {
    return this.getByOwner(ownerId).reduce((sum, w) => {
      return sum + ledgerService.calculateBalanceUSD(w.id);
    }, 0);
  },

  /** Freeze a wallet. */
  freeze(id: string): void {
    const wallet = wallets.find((w) => w.id === id);
    if (wallet) wallet.status = 'frozen';
  },

  /** Unfreeze a wallet. */
  unfreeze(id: string): void {
    const wallet = wallets.find((w) => w.id === id);
    if (wallet) wallet.status = 'active';
  },

  /** Get wallet count. */
  count(): number {
    return wallets.length;
  },
};

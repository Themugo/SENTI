/**
 * Financial Engine — Mock Data Generator
 *
 * Generates internally consistent financial data:
 * - 500 wallets (4 per user: primary, merchant, escrow, reserve)
 * - 300 merchants
 * - 10,000 ledger entries
 * - ~5,000 transactions with timelines
 * - Settlements derived from merchant activity
 *
 * ALL balances are calculated from the ledger. Nothing is stored.
 * Run initFinancialEngine() once at app startup.
 */

import type {
  Wallet, WalletType, WalletBalance, CurrencyCode,
  LedgerEntry, Transaction, TransactionType, TransactionStatus,
  PaymentMethod, TransactionTimelineEvent, FeeBreakdown,
  Settlement, MerchantAccount, SettlementSchedule,
} from '@/types';
import { CURRENCIES } from '@/constants';
import { ledgerService } from './ledger.service';
import { walletService } from './wallet.service';
import { transactionService } from './transaction.service';
import { settlementService } from './settlement.service';
import { merchantService } from './merchant.service';
import { feesService } from './fees.service';
import { currencyService } from './currency.service';

// ─── Seeded random for reproducibility ───────────────────────

let seed = 42;
function rand(): number {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
}
function randInt(min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}
function randPick<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}
function randAmount(min: number, max: number): number {
  return Math.round((rand() * (max - min) + min) * 100) / 100;
}

// ─── Name pools ──────────────────────────────────────────────

const firstNames = ['John', 'Sarah', 'David', 'Maria', 'James', 'Emily', 'Michael', 'Lisa', 'Daniel', 'Anna', 'Robert', 'Sophia', 'Kevin', 'Grace', 'Thomas', 'Emma', 'Chris', 'Aisha', 'Mohammed', 'Priya', 'Liam', 'Olivia', 'Noah', 'Zoe', 'Lucas', 'Mia', 'Ethan', 'Chloe', 'Arthur', 'Nadia'];
const lastNames = ['Smith', 'Kimani', 'Okafor', 'Garcia', 'Johnson', 'Williams', 'Mwangi', 'Brown', 'Jones', 'Davis', 'Obi', 'Miller', 'Wilson', 'Adeyemi', 'Taylor', 'Anderson', 'Thomas', 'Kamau', 'Moore', 'Martin', 'Singh', 'Patel', 'Cohen', 'Muller', 'Rossi', 'Dubois', 'Schmidt', 'Yamamoto', 'Silva', 'Costa'];
const businessNames = ['Acme Corp', 'TechFlow Solutions', 'London Studios', 'Nairobi Coffee Co', 'Dubai Trade Hub', 'DevHub Agency', 'Lagos Fashion House', 'Cape Town Logistics', 'Global Payments Inc', 'Digital Edge Ltd', 'Cloud Nine Systems', 'Urban Market', 'Prime Retail', 'Smart Pay Africa', 'Emerald Ventures', 'Quantum Labs', 'Apex Digital', 'Vanguard Commerce', 'Summit Trading', 'Pinnacle Group'];
const businessCategories = ['Technology', 'Food & Beverage', 'Creative Services', 'Import/Export', 'Retail', 'Logistics', 'Finance', 'Healthcare', 'Education', 'Manufacturing'];
const countries = ['United States', 'Kenya', 'United Kingdom', 'Nigeria', 'South Africa', 'United Arab Emirates', 'Germany', 'France', 'Canada', 'Australia', 'India', 'Brazil'];
const currencyCodes = Object.keys(CURRENCIES) as CurrencyCode[];

const txTypes: TransactionType[] = [
  'deposit', 'withdrawal', 'card_payment', 'bank_transfer',
  'mpesa', 'airtel_money', 'internal_transfer', 'currency_exchange',
  'refund', 'chargeback', 'escrow_hold', 'escrow_release',
  'subscription', 'invoice_payment', 'merchant_settlement',
];
const paymentMethods: PaymentMethod[] = ['card', 'bank', 'mpesa', 'airtel', 'wallet', 'apple_pay', 'google_pay', 'paypal'];
const statuses: TransactionStatus[] = ['created', 'authorized', 'processing', 'settled', 'completed', 'failed', 'cancelled', 'reversed'];
const settlementSchedules: SettlementSchedule[] = ['daily', 'weekly', 'monthly'];

function fullName(): string {
  return `${randPick(firstNames)} ${randPick(lastNames)}`;
}
function emailFrom(name: string): string {
  return `${name.toLowerCase().replace(/\s/g, '.')}@${randPick(['gmail.com', 'outlook.com', 'company.co', 'business.io', 'mail.com'])}`;
}

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(randInt(8, 18), randInt(0, 59), 0, 0);
  return d.toISOString();
}

// ─── Generator ───────────────────────────────────────────────

let isInitialized = false;

export function initFinancialEngine() {
  if (isInitialized) return;
  seed = 42; // reset for reproducibility

  const generatedWallets: Wallet[] = [];
  const generatedMerchants: MerchantAccount[] = [];
  const generatedLedger: LedgerEntry[] = [];
  const generatedTransactions: Transaction[] = [];
  const generatedSettlements: Settlement[] = [];

  let walletIdCounter = 0;
  let merchantIdCounter = 0;
  let ledgerIdCounter = 0;
  let txIdCounter = 0;
  let settlementIdCounter = 0;
  let auditCounter = 0;

  function genWalletId(type: WalletType): string {
    walletIdCounter++;
    const prefix = type === 'primary' ? 'PW' : type === 'merchant' ? 'MW' : type === 'escrow' ? 'EW' : 'RW';
    return `${prefix}-${walletIdCounter.toString().padStart(5, '0')}`;
  }
  function genMerchantId(): string {
    merchantIdCounter++;
    return `MCH-${merchantIdCounter.toString().padStart(4, '0')}`;
  }
  function genLedgerId(): string {
    ledgerIdCounter++;
    return `LE-${ledgerIdCounter.toString().padStart(6, '0')}`;
  }
  function genTxId(): string {
    txIdCounter++;
    return `TXN-${txIdCounter.toString().padStart(6, '0')}`;
  }
  function genSettlementId(): string {
    settlementIdCounter++;
    return `STL-${settlementIdCounter.toString().padStart(6, '0')}`;
  }
  function genAuditId(): string {
    auditCounter++;
    return `AUD-${auditCounter.toString().padStart(6, '0')}`;
  }

  // ── Generate platform wallet (for fees) ──────────────────
  const platformWallet: Wallet = {
    id: 'PW-PLATFORM-0001',
    type: 'primary',
    status: 'active',
    currency: 'USD',
    ownerId: 'platform',
    ownerName: 'SENTI Platform',
    createdAt: daysAgo(365),
  };
  generatedWallets.push(platformWallet);

  // ── Generate 125 users × 4 wallets = 500 wallets ─────────
  const userCount = 125;
  for (let u = 0; u < userCount; u++) {
    const ownerName = fullName();
    const ownerId = `USR-${(u + 1).toString().padStart(4, '0')}`;
    const currency = randPick(currencyCodes);
    const types: WalletType[] = ['primary', 'merchant', 'escrow', 'reserve'];

    for (const type of types) {
      generatedWallets.push({
        id: genWalletId(type),
        type,
        status: rand() > 0.98 ? 'frozen' : 'active',
        currency,
        ownerId,
        ownerName,
        createdAt: daysAgo(randInt(30, 300)),
      });
    }
  }

  // ── Generate 300 merchants ───────────────────────────────
  for (let m = 0; m < 300; m++) {
    const bizName = m < businessNames.length ? businessNames[m] : `${randPick(businessNames)} ${randInt(2, 99)}`;
    const merchantWalletId = genWalletId('merchant');
    const reserveWalletId = genWalletId('reserve');

    // Add merchant + reserve wallets to wallet list
    generatedWallets.push({
      id: merchantWalletId,
      type: 'merchant',
      status: 'active',
      currency: rand() > 0.5 ? 'USD' : randPick(currencyCodes),
      ownerId: `MCH-${(m + 1).toString().padStart(4, '0')}`,
      ownerName: bizName,
      createdAt: daysAgo(randInt(30, 365)),
    });
    generatedWallets.push({
      id: reserveWalletId,
      type: 'reserve',
      status: 'active',
      currency: 'USD',
      ownerId: `MCH-${(m + 1).toString().padStart(4, '0')}`,
      ownerName: bizName,
      createdAt: daysAgo(randInt(30, 365)),
    });

    generatedMerchants.push({
      id: genMerchantId(),
      businessName: bizName,
      email: emailFrom(bizName.split(' ')[0]),
      category: randPick(businessCategories),
      country: randPick(countries),
      verificationStatus: rand() > 0.15 ? 'verified' : rand() > 0.5 ? 'pending' : 'rejected',
      settlementSchedule: randPick(settlementSchedules),
      rollingReserveRate: randPick([0.03, 0.05, 0.07, 0.10]),
      joinedAt: daysAgo(randInt(30, 365)),
      merchantWalletId,
      reserveWalletId,
    });
  }

  // ── Generate 10,000 ledger entries ───────────────────────
  // Each transaction creates 2-4 ledger entries (debit, credit, fee debit, fee credit)
  // So we generate ~3,000 transactions to get ~10,000 entries

  const targetEntries = 10_000;
  let entryCount = 0;

  while (entryCount < targetEntries) {
    const txType = randPick(txTypes);
    const currency = randPick(currencyCodes);
    const amount = randAmount(10, 10_000);
    const daysOld = randInt(0, 180);
    const timestamp = daysAgo(daysOld);
    const txId = genTxId();
    const reference = `REF-${txId}`;
    const auditId = genAuditId();

    // Pick source and destination wallets based on tx type
    let sourceWalletId: string;
    let destinationWalletId: string;
    let isCrossCurrency = false;

    if (txType === 'deposit' || txType === 'withdrawal') {
      const userWallets = generatedWallets.filter((w) => w.type === 'primary' && w.status === 'active');
      const wallet = randPick(userWallets);
      sourceWalletId = txType === 'deposit' ? 'PW-PLATFORM-0001' : wallet.id;
      destinationWalletId = txType === 'deposit' ? wallet.id : 'PW-PLATFORM-0001';
    } else if (txType === 'merchant_settlement') {
      const merchant = randPick(generatedMerchants.filter((m) => m.verificationStatus === 'verified'));
      sourceWalletId = merchant.merchantWalletId;
      destinationWalletId = 'PW-PLATFORM-0001';
    } else if (txType === 'escrow_hold' || txType === 'escrow_release') {
      const escrowWallets = generatedWallets.filter((w) => w.type === 'escrow');
      const primaryWallets = generatedWallets.filter((w) => w.type === 'primary');
      const escrow = randPick(escrowWallets);
      const primary = randPick(primaryWallets);
      sourceWalletId = txType === 'escrow_hold' ? primary.id : escrow.id;
      destinationWalletId = txType === 'escrow_hold' ? escrow.id : primary.id;
    } else if (txType === 'currency_exchange') {
      const userWallets = generatedWallets.filter((w) => w.type === 'primary' && w.status === 'active');
      const wallet = randPick(userWallets);
      const otherCurrencyWallets = generatedWallets.filter((w) => w.type === 'primary' && w.currency !== wallet.currency && w.ownerId === wallet.ownerId);
      if (otherCurrencyWallets.length === 0) {
        sourceWalletId = wallet.id;
        destinationWalletId = wallet.id;
      } else {
        sourceWalletId = wallet.id;
        destinationWalletId = randPick(otherCurrencyWallets).id;
        isCrossCurrency = true;
      }
    } else {
      // Card, bank, mpesa, airtel, internal, subscription, invoice, refund, chargeback
      const primaryWallets = generatedWallets.filter((w) => w.type === 'primary' && w.status === 'active');
      const merchantWallets = generatedWallets.filter((w) => w.type === 'merchant' && w.status === 'active');
      if (primaryWallets.length === 0 || merchantWallets.length === 0) continue;
      const source = randPick(primaryWallets);
      const dest = randPick(merchantWallets);
      sourceWalletId = txType === 'refund' || txType === 'chargeback' ? dest.id : source.id;
      destinationWalletId = txType === 'refund' || txType === 'chargeback' ? source.id : dest.id;
    }

    const exchangeRate = isCrossCurrency
      ? currencyService.getRate(currency, generatedWallets.find((w) => w.id === destinationWalletId)?.currency ?? currency)
      : undefined;

    // Determine final status
    const statusRoll = rand();
    let finalStatus: TransactionStatus;
    if (statusRoll > 0.95) finalStatus = 'failed';
    else if (statusRoll > 0.92) finalStatus = 'cancelled';
    else if (statusRoll > 0.90) finalStatus = 'reversed';
    else if (statusRoll > 0.80) finalStatus = 'processing';
    else finalStatus = 'completed';
    // Cast to prevent TS narrowing in comparisons below
    const fs: string = finalStatus;

    // Build timeline
    const timeline: TransactionTimelineEvent[] = [];
    const baseTime = new Date(timestamp);
    timeline.push({ status: 'created', timestamp: baseTime.toISOString() });
    {
      const t1 = new Date(baseTime.getTime() + randInt(1, 30) * 1000);
      timeline.push({ status: 'authorized', timestamp: t1.toISOString() });
    }
    {
      const t2 = new Date(baseTime.getTime() + randInt(31, 120) * 1000);
      timeline.push({ status: 'processing', timestamp: t2.toISOString() });
    }
    if (fs === 'completed' || fs === 'settled') {
      const t3 = new Date(baseTime.getTime() + randInt(121, 600) * 1000);
      timeline.push({ status: 'settled', timestamp: t3.toISOString() });
      const t4 = new Date(baseTime.getTime() + randInt(601, 1800) * 1000);
      timeline.push({ status: 'completed', timestamp: t4.toISOString() });
    }
    if (fs === 'failed') {
      const t3 = new Date(baseTime.getTime() + randInt(121, 300) * 1000);
      timeline.push({ status: 'failed', timestamp: t3.toISOString(), note: 'Insufficient funds' });
    }
    if (fs === 'cancelled') {
      const t3 = new Date(baseTime.getTime() + randInt(121, 300) * 1000);
      timeline.push({ status: 'cancelled', timestamp: t3.toISOString(), note: 'Cancelled by user' });
    }
    if (fs === 'reversed') {
      const t3 = new Date(baseTime.getTime() + randInt(121, 600) * 1000);
      timeline.push({ status: 'settled', timestamp: t3.toISOString() });
      const t4 = new Date(baseTime.getTime() + randInt(601, 3600) * 1000);
      timeline.push({ status: 'completed', timestamp: t4.toISOString() });
      const t5 = new Date(baseTime.getTime() + randInt(3601, 7200) * 1000);
      timeline.push({ status: 'reversed', timestamp: t5.toISOString(), note: 'Chargeback issued' });
    }

    // Calculate fees
    const fee = feesService.calculate(amount, currency, txType, isCrossCurrency);

    // Create ledger entries
    const ledgerEntryIds: string[] = [];
    const entryStatus = fs === 'failed' || fs === 'cancelled' ? 'pending' : 'posted';

    // Debit entry
    const debitEntry: LedgerEntry = {
      id: genLedgerId(),
      auditId,
      walletId: sourceWalletId,
      type: 'debit',
      amount,
      currency,
      reference,
      description: `${txType.replace(/_/g, ' ')} — ${fullName()}`,
      sourceWalletId,
      destinationWalletId,
      exchangeRate,
      status: entryStatus,
      timestamp,
      immutable: true,
    };
    generatedLedger.push(debitEntry);
    ledgerEntryIds.push(debitEntry.id);
    entryCount++;

    // Credit entry
    const creditEntry: LedgerEntry = {
      id: genLedgerId(),
      auditId,
      walletId: destinationWalletId,
      type: 'credit',
      amount,
      currency,
      reference,
      description: debitEntry.description,
      sourceWalletId,
      destinationWalletId,
      exchangeRate,
      status: entryStatus,
      timestamp,
      immutable: true,
    };
    generatedLedger.push(creditEntry);
    ledgerEntryIds.push(creditEntry.id);
    entryCount++;

    // Fee entries (if fees apply)
    if (fee.total > 0 && entryStatus === 'posted') {
      const feeDebit: LedgerEntry = {
        id: genLedgerId(),
        auditId,
        walletId: sourceWalletId,
        type: 'debit',
        amount: fee.total,
        currency,
        reference: `${reference}-FEE`,
        description: `Fee for ${txType.replace(/_/g, ' ')}`,
        sourceWalletId,
        destinationWalletId: 'PW-PLATFORM-0001',
        status: 'posted',
        timestamp,
        immutable: true,
      };
      generatedLedger.push(feeDebit);
      ledgerEntryIds.push(feeDebit.id);
      entryCount++;

      const feeCredit: LedgerEntry = {
        id: genLedgerId(),
        auditId,
        walletId: 'PW-PLATFORM-0001',
        type: 'credit',
        amount: fee.total,
        currency,
        reference: `${reference}-FEE`,
        description: `Fee for ${txType.replace(/_/g, ' ')}`,
        sourceWalletId,
        destinationWalletId: 'PW-PLATFORM-0001',
        status: 'posted',
        timestamp,
        immutable: true,
      };
      generatedLedger.push(feeCredit);
      ledgerEntryIds.push(feeCredit.id);
      entryCount++;
    }

    // Create the transaction record
    const counterpartyName = fullName();
    const tx: Transaction = {
      id: txId,
      reference,
      type: txType,
      status: finalStatus as TransactionStatus,
      amount,
      currency,
      fee,
      description: debitEntry.description,
      counterparty: {
        name: counterpartyName,
        email: emailFrom(counterpartyName.split(' ')[0]),
        walletId: destinationWalletId,
      },
      sourceWalletId,
      destinationWalletId,
      paymentMethod: randPick(paymentMethods),
      exchangeRate,
      timeline,
      ledgerEntryIds,
      createdAt: timestamp,
      updatedAt: timeline[timeline.length - 1].timestamp,
    };
    generatedTransactions.push(tx);

    // For merchant transactions, sometimes create a settlement
    if ((txType === 'card_payment' || txType === 'mpesa' || txType === 'bank_transfer') && rand() > 0.8) {
      const merchant = generatedMerchants.find((m) => m.merchantWalletId === destinationWalletId);
      if (merchant && merchant.verificationStatus === 'verified') {
        const settlementStatus = rand() > 0.85 ? 'failed' : rand() > 0.5 ? 'completed' : 'pending';
        generatedSettlements.push({
          id: genSettlementId(),
          reference: genSettlementId(),
          merchantId: merchant.id,
          merchantName: merchant.businessName,
          merchantWalletId: merchant.merchantWalletId,
          amount: randAmount(500, 20_000),
          currency,
          fees: randAmount(5, 200),
          netAmount: 0, // calculated below
          status: settlementStatus,
          schedule: merchant.settlementSchedule,
          transactionIds: [txId],
          createdAt: daysAgo(randInt(0, 30)),
          settledAt: settlementStatus === 'completed' ? daysAgo(randInt(0, 10)) : undefined,
        });
        // Fix netAmount
        const last = generatedSettlements[generatedSettlements.length - 1];
        last.netAmount = last.amount - last.fees;
      }
    }
  }

  // ── Initialize all services with generated data ──────────
  walletService._init(generatedWallets);
  ledgerService._init(generatedLedger);
  transactionService._init(generatedTransactions);
  settlementService._init(generatedSettlements);
  merchantService._init(generatedMerchants);

  isInitialized = true;

  // Store in a module-level cache for the engine accessor
  engineCache.wallets = generatedWallets;
  engineCache.merchants = generatedMerchants;
  engineCache.transactions = generatedTransactions;
  engineCache.ledger = generatedLedger;
  engineCache.settlements = generatedSettlements;
}

// ─── Engine Cache (for direct access) ────────────────────────

export const engineCache = {
  wallets: [] as Wallet[],
  merchants: [] as MerchantAccount[],
  transactions: [] as Transaction[],
  ledger: [] as LedgerEntry[],
  settlements: [] as Settlement[],
};

// ─── High-level engine API ───────────────────────────────────

export const financialEngine = {
  init: initFinancialEngine,

  /** Get the "current user" (first user in the system). */
  getCurrentUser() {
    const wallets = walletService.getAll();
    const primaryWallets = wallets.filter((w) => w.type === 'primary' && w.ownerId !== 'platform');
    if (primaryWallets.length === 0) return null;
    const wallet = primaryWallets[0];
    return {
      id: wallet.ownerId,
      name: wallet.ownerName,
      wallets: wallets.filter((w) => w.ownerId === wallet.ownerId),
    };
  },

  /** Get all wallets for the current user. */
  getCurrentUserWallets(): Wallet[] {
    const user = this.getCurrentUser();
    if (!user) return [];
    return walletService.getByOwner(user.id);
  },

  /** Get calculated balances for the current user. */
  getCurrentUserBalances(): WalletBalance[] {
    const wallets = this.getCurrentUserWallets();
    return wallets.map((w) => ledgerService.calculateBalance(w.id));
  },

  /** Get total balance in USD for the current user. */
  getCurrentUserTotalUSD(): number {
    const wallets = this.getCurrentUserWallets();
    return wallets.reduce((sum, w) => sum + ledgerService.calculateBalanceUSD(w.id), 0);
  },

  /** Get recent transactions for the current user. */
  getCurrentUserTransactions(limit?: number): Transaction[] {
    const wallets = this.getCurrentUserWallets();
    const walletIds = new Set(wallets.map((w) => w.id));
    let txs = engineCache.transactions.filter(
      (t) => walletIds.has(t.sourceWalletId) || walletIds.has(t.destinationWalletId),
    );
    if (limit) txs = txs.slice(0, limit);
    return txs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  /** Get the current merchant (first verified merchant). */
  getCurrentMerchant(): MerchantAccount | undefined {
    return merchantService.getVerified()[0];
  },

  /** Get all transactions (for admin/analytics). */
  getAllTransactions(): Transaction[] {
    return [...engineCache.transactions];
  },

  /** Get daily volume report (last 7 days). */
  getDailyVolume(): { label: string; value: number }[] {
    const days: { label: string; value: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().slice(0, 10);
      const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' });
      const volume = engineCache.transactions
        .filter((t) => t.createdAt.slice(0, 10) === dateStr && t.status === 'completed')
        .reduce((sum, t) => sum + currencyService.convert(t.amount, t.currency, 'USD'), 0);
      days.push({ label: dayLabel, value: Math.round(volume) });
    }
    return days;
  },

  /** Get monthly revenue report (last 7 months). */
  getMonthlyRevenue(): { label: string; value: number; secondary: number }[] {
    const months: { label: string; value: number; secondary: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStr = date.toISOString().slice(0, 7);
      const monthLabel = date.toLocaleDateString('en-US', { month: 'short' });
      const txs = engineCache.transactions.filter(
        (t) => t.createdAt.slice(0, 7) === monthStr && t.status === 'completed',
      );
      const revenue = txs.reduce((sum, t) => sum + currencyService.convert(t.amount, t.currency, 'USD'), 0);
      const fees = txs.reduce((sum, t) => sum + currencyService.convert(t.fee.total, t.fee.currency, 'USD'), 0);
      months.push({ label: monthLabel, value: Math.round(revenue), secondary: Math.round(revenue - fees) });
    }
    return months;
  },

  /** Get currency distribution. */
  getCurrencyDistribution(): { currency: CurrencyCode; volume: number; percentage: number }[] {
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
        percentage: (volume / total) * 100,
      }))
      .sort((a, b) => b.volume - a.volume);
  },

  /** Get fees earned report. */
  getFeesEarned(): number {
    return engineCache.transactions
      .filter((t) => t.status === 'completed')
      .reduce((sum, t) => sum + currencyService.convert(t.fee.total, t.fee.currency, 'USD'), 0);
  },

  /** Get top merchants. */
  getTopMerchants(limit = 5) {
    return merchantService.getTopMerchants(limit);
  },

  /** Get settlement report. */
  getSettlementReport() {
    return settlementService.getReport();
  },

  /** Get wallet growth data (cumulative wallets over time). */
  getWalletGrowth(): { label: string; value: number }[] {
    const months: { label: string; value: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStr = date.toISOString().slice(0, 7);
      const monthLabel = date.toLocaleDateString('en-US', { month: 'short' });
      const count = engineCache.wallets.filter(
        (w) => w.createdAt.slice(0, 7) <= monthStr,
      ).length;
      months.push({ label: monthLabel, value: count });
    }
    return months;
  },
};

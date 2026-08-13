/**
 * Data Access Layer — bridges the financial engine to Supabase.
 *
 * On first load: checks if the database has data. If empty, generates
 * the 10K ledger entries / 500 wallets / 300 merchants and seeds them.
 * On subsequent loads: reads from Supabase and hydrates the in-memory services.
 *
 * Race-condition safe: if seeding fails because another page already seeded
 * (duplicate key), we skip seeding and load from the database instead.
 */

import { getSupabase } from '@/lib/supabase';
import { initFinancialEngine, engineCache } from '@/services/financial-engine';
import { ledgerService } from '@/services/ledger.service';
import { walletService } from '@/services/wallet.service';
import { transactionService } from '@/services/transaction.service';
import { settlementService } from '@/services/settlement.service';
import { merchantService } from '@/services/merchant.service';
import type {
  Wallet, LedgerEntry, Transaction, MerchantAccount, Settlement,
} from '@/types';

let isInitialized = false;
let isInitializing = false;

interface DBWallet {
  id: string;
  type: string;
  status: string;
  currency: string;
  owner_id: string;
  owner_name: string;
  created_at: string;
}

interface DBLedgerEntry {
  id: string;
  audit_id: string;
  wallet_id: string;
  type: string;
  amount: number;
  currency: string;
  reference: string;
  description: string;
  source_wallet_id: string | null;
  destination_wallet_id: string | null;
  exchange_rate: number | null;
  status: string;
  timestamp: string;
  immutable: boolean;
}

interface DBTransaction {
  id: string;
  reference: string;
  type: string;
  status: string;
  amount: number;
  currency: string;
  fee: any;
  description: string;
  counterparty: any;
  source_wallet_id: string;
  destination_wallet_id: string;
  payment_method: string;
  exchange_rate: number | null;
  timeline: any;
  ledger_entry_ids: any;
  created_at: string;
  updated_at: string;
}

interface DBMerchant {
  id: string;
  business_name: string;
  email: string;
  category: string;
  country: string;
  verification_status: string;
  settlement_schedule: string;
  rolling_reserve_rate: number;
  joined_at: string;
  merchant_wallet_id: string;
  reserve_wallet_id: string;
}

interface DBSettlement {
  id: string;
  reference: string;
  merchant_id: string;
  merchant_name: string;
  merchant_wallet_id: string;
  amount: number;
  currency: string;
  fees: number;
  net_amount: number;
  status: string;
  schedule: string;
  transaction_ids: any;
  bank_account: string | null;
  created_at: string;
  settled_at: string | null;
}

function mapWallet(w: DBWallet): Wallet {
  return {
    id: w.id,
    type: w.type as Wallet['type'],
    status: w.status as Wallet['status'],
    currency: w.currency as Wallet['currency'],
    ownerId: w.owner_id,
    ownerName: w.owner_name,
    createdAt: w.created_at,
  };
}

function mapLedgerEntry(e: DBLedgerEntry): LedgerEntry {
  return {
    id: e.id,
    auditId: e.audit_id,
    walletId: e.wallet_id,
    type: e.type as LedgerEntry['type'],
    amount: Number(e.amount),
    currency: e.currency as LedgerEntry['currency'],
    reference: e.reference,
    description: e.description,
    sourceWalletId: e.source_wallet_id ?? undefined,
    destinationWalletId: e.destination_wallet_id ?? undefined,
    exchangeRate: e.exchange_rate ? Number(e.exchange_rate) : undefined,
    status: e.status as LedgerEntry['status'],
    timestamp: e.timestamp,
    immutable: true,
  };
}

function mapTransaction(t: DBTransaction): Transaction {
  return {
    id: t.id,
    reference: t.reference,
    type: t.type as Transaction['type'],
    status: t.status as Transaction['status'],
    amount: Number(t.amount),
    currency: t.currency as Transaction['currency'],
    fee: t.fee as Transaction['fee'],
    description: t.description,
    counterparty: t.counterparty as Transaction['counterparty'],
    sourceWalletId: t.source_wallet_id,
    destinationWalletId: t.destination_wallet_id,
    paymentMethod: t.payment_method as Transaction['paymentMethod'],
    exchangeRate: t.exchange_rate ? Number(t.exchange_rate) : undefined,
    timeline: t.timeline as Transaction['timeline'],
    ledgerEntryIds: t.ledger_entry_ids as Transaction['ledgerEntryIds'],
    createdAt: t.created_at,
    updatedAt: t.updated_at,
  };
}

function mapMerchant(m: DBMerchant): MerchantAccount {
  return {
    id: m.id,
    businessName: m.business_name,
    email: m.email,
    category: m.category,
    country: m.country,
    verificationStatus: m.verification_status as MerchantAccount['verificationStatus'],
    settlementSchedule: m.settlement_schedule as MerchantAccount['settlementSchedule'],
    rollingReserveRate: Number(m.rolling_reserve_rate),
    joinedAt: m.joined_at,
    merchantWalletId: m.merchant_wallet_id,
    reserveWalletId: m.reserve_wallet_id,
  };
}

function mapSettlement(s: DBSettlement): Settlement {
  return {
    id: s.id,
    reference: s.reference,
    merchantId: s.merchant_id,
    merchantName: s.merchant_name,
    merchantWalletId: s.merchant_wallet_id,
    amount: Number(s.amount),
    currency: s.currency as Settlement['currency'],
    fees: Number(s.fees),
    netAmount: Number(s.net_amount),
    status: s.status as Settlement['status'],
    schedule: s.schedule as Settlement['schedule'],
    transactionIds: s.transaction_ids as Settlement['transactionIds'],
    bankAccount: s.bank_account ?? undefined,
    createdAt: s.created_at,
    settledAt: s.settled_at ?? undefined,
  };
}

/**
 * Initialize the financial engine from Supabase.
 * If the database is empty, seeds it with generated data.
 * Safe to call multiple times — only runs once per module instance.
 * If seeding fails due to a race condition (another page already seeded),
 * falls through to loading from the database.
 */
export async function initFromSupabase(): Promise<void> {
  if (isInitialized || isInitializing) return;
  isInitializing = true;

  try {
    const supabase = getSupabase();

    // Check if data already exists
    const { count } = await supabase
      .from('wallets')
      .select('*', { count: 'exact', head: true });

    if (count === 0) {
      // Database is empty — try to seed
      try {
        await seedDatabase();
      } catch (seedErr) {
        // Race condition: another page seeded concurrently.
        // The data is now there — just load it.
        const { count: retryCount } = await supabase
          .from('wallets')
          .select('*', { count: 'exact', head: true });
        if (retryCount === 0) {
          // Seeding genuinely failed and DB is still empty — use in-memory fallback
          throw seedErr;
        }
      }
    }

    // Load all data from Supabase into in-memory services
    await loadFromDatabase();

    isInitialized = true;
  } catch (err) {
    // Fallback: initialize in-memory only (no persistence)
    console.warn('Supabase init failed, using in-memory engine:', err);
    initFinancialEngine();
    isInitialized = true;
  } finally {
    isInitializing = false;
  }
}

async function seedDatabase(): Promise<void> {
  // Generate data in memory first
  initFinancialEngine();

  const supabase = getSupabase();

  // Insert wallets
  const wallets = engineCache.wallets.map((w) => ({
    id: w.id,
    type: w.type,
    status: w.status,
    currency: w.currency,
    owner_id: w.ownerId,
    owner_name: w.ownerName,
    created_at: w.createdAt,
  }));

  const { error: walletErr } = await supabase.from('wallets').insert(wallets);
  if (walletErr) throw new Error(`Failed to seed wallets: ${walletErr.message}`);

  // Insert ledger entries in batches of 1000
  const ledgerBatches: any[] = [];
  for (const e of engineCache.ledger) {
    ledgerBatches.push({
      id: e.id,
      audit_id: e.auditId,
      wallet_id: e.walletId,
      type: e.type,
      amount: e.amount,
      currency: e.currency,
      reference: e.reference,
      description: e.description,
      source_wallet_id: e.sourceWalletId ?? null,
      destination_wallet_id: e.destinationWalletId ?? null,
      exchange_rate: e.exchangeRate ?? null,
      status: e.status,
      timestamp: e.timestamp,
      immutable: true,
    });
  }

  for (let i = 0; i < ledgerBatches.length; i += 1000) {
    const batch = ledgerBatches.slice(i, i + 1000);
    const { error } = await supabase.from('ledger_entries').insert(batch);
    if (error) throw new Error(`Failed to seed ledger batch ${i}: ${error.message}`);
  }

  // Insert transactions in batches of 500
  const txBatches: any[] = [];
  for (const t of engineCache.transactions) {
    txBatches.push({
      id: t.id,
      reference: t.reference,
      type: t.type,
      status: t.status,
      amount: t.amount,
      currency: t.currency,
      fee: t.fee,
      description: t.description,
      counterparty: t.counterparty,
      source_wallet_id: t.sourceWalletId,
      destination_wallet_id: t.destinationWalletId,
      payment_method: t.paymentMethod,
      exchange_rate: t.exchangeRate ?? null,
      timeline: t.timeline,
      ledger_entry_ids: t.ledgerEntryIds,
      created_at: t.createdAt,
      updated_at: t.updatedAt,
    });
  }

  for (let i = 0; i < txBatches.length; i += 500) {
    const batch = txBatches.slice(i, i + 500);
    const { error } = await supabase.from('transactions').insert(batch);
    if (error) throw new Error(`Failed to seed transactions batch ${i}: ${error.message}`);
  }

  // Insert merchants
  const merchants = engineCache.merchants.map((m) => ({
    id: m.id,
    business_name: m.businessName,
    email: m.email,
    category: m.category,
    country: m.country,
    verification_status: m.verificationStatus,
    settlement_schedule: m.settlementSchedule,
    rolling_reserve_rate: m.rollingReserveRate,
    joined_at: m.joinedAt,
    merchant_wallet_id: m.merchantWalletId,
    reserve_wallet_id: m.reserveWalletId,
  }));

  const { error: merchantErr } = await supabase.from('merchants').insert(merchants);
  if (merchantErr) throw new Error(`Failed to seed merchants: ${merchantErr.message}`);

  // Insert settlements
  const settlements = engineCache.settlements.map((s) => ({
    id: s.id,
    reference: s.reference,
    merchant_id: s.merchantId,
    merchant_name: s.merchantName,
    merchant_wallet_id: s.merchantWalletId,
    amount: s.amount,
    currency: s.currency,
    fees: s.fees,
    net_amount: s.netAmount,
    status: s.status,
    schedule: s.schedule,
    transaction_ids: s.transactionIds,
    bank_account: s.bankAccount ?? null,
    created_at: s.createdAt,
    settled_at: s.settledAt ?? null,
  }));

  const { error: settlementErr } = await supabase.from('settlements').insert(settlements);
  if (settlementErr) throw new Error(`Failed to seed settlements: ${settlementErr.message}`);
}

async function loadFromDatabase(): Promise<void> {
  const supabase = getSupabase();

  // Load wallets
  const { data: dbWallets } = await supabase.from('wallets').select('*');
  const wallets = (dbWallets as DBWallet[] ?? []).map(mapWallet);

  // Load ledger entries
  const { data: dbLedger } = await supabase.from('ledger_entries').select('*').limit(10000);
  const ledger = (dbLedger as DBLedgerEntry[] ?? []).map(mapLedgerEntry);

  // Load transactions
  const { data: dbTxs } = await supabase.from('transactions').select('*').order('created_at', { ascending: false }).limit(5000);
  const transactions = (dbTxs as DBTransaction[] ?? []).map(mapTransaction);

  // Load merchants
  const { data: dbMerchants } = await supabase.from('merchants').select('*');
  const merchants = (dbMerchants as DBMerchant[] ?? []).map(mapMerchant);

  // Load settlements
  const { data: dbSettlements } = await supabase.from('settlements').select('*').order('created_at', { ascending: false });
  const settlements = (dbSettlements as DBSettlement[] ?? []).map(mapSettlement);

  // Hydrate in-memory services
  walletService._init(wallets);
  ledgerService._init(ledger);
  transactionService._init(transactions);
  merchantService._init(merchants);
  settlementService._init(settlements);

  // Update engine cache
  engineCache.wallets = wallets;
  engineCache.ledger = ledger;
  engineCache.transactions = transactions;
  engineCache.merchants = merchants;
  engineCache.settlements = settlements;
}

/** Check if the engine is ready (initialized from Supabase or fallback). */
export function isEngineReady(): boolean {
  return isInitialized;
}

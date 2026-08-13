/*
# Create SENTI Financial Engine Schema

This migration creates the core financial infrastructure tables for the SENTI
payment platform. The ledger is the single source of truth — balances are
NEVER stored, only calculated from ledger entries.

## Tables Created

1. **wallets** — User wallet accounts (4 types: primary, merchant, escrow, reserve)
   - `id` (text, PK) — e.g. "PW-00001"
   - `type` (text) — primary | merchant | escrow | reserve
   - `status` (text) — active | frozen | closed
   - `currency` (text) — ISO currency code
   - `owner_id` (text) — user identifier
   - `owner_name` (text) — display name
   - `created_at` (timestamptz)

2. **ledger_entries** — Immutable double-entry bookkeeping records
   - `id` (text, PK) — e.g. "LE-000001"
   - `audit_id` (text) — groups entries from one transaction
   - `wallet_id` (text, FK → wallets) — wallet affected
   - `type` (text) — debit | credit
   - `amount` (numeric) — monetary amount
   - `currency` (text) — ISO currency code
   - `reference` (text) — transaction reference
   - `description` (text) — human-readable description
   - `source_wallet_id` (text) — origin wallet
   - `destination_wallet_id` (text) — destination wallet
   - `exchange_rate` (numeric, nullable) — FX rate if cross-currency
   - `status` (text) — posted | pending | reversed
   - `timestamp` (timestamptz) — when entry was recorded
   - `immutable` (boolean, default true) — entries can never be edited

3. **transactions** — User-facing transaction records with timelines
   - `id` (text, PK) — e.g. "TXN-000001"
   - `reference` (text) — human-readable reference
   - `type` (text) — 16 transaction types
   - `status` (text) — 8 lifecycle statuses
   - `amount` (numeric) — transaction amount
   - `currency` (text) — ISO currency code
   - `fee` (jsonb) — fee breakdown object
   - `description` (text)
   - `counterparty` (jsonb) — { name, email, walletId }
   - `source_wallet_id` (text)
   - `destination_wallet_id` (text)
   - `payment_method` (text)
   - `exchange_rate` (numeric, nullable)
   - `timeline` (jsonb) — array of { status, timestamp, note }
   - `ledger_entry_ids` (jsonb) — array of ledger entry IDs
   - `created_at` (timestamptz)
   - `updated_at` (timestamptz)

4. **merchants** — Merchant account records
   - `id` (text, PK) — e.g. "MCH-0001"
   - `business_name` (text)
   - `email` (text)
   - `category` (text)
   - `country` (text)
   - `verification_status` (text) — verified | pending | rejected
   - `settlement_schedule` (text) — daily | weekly | monthly
   - `rolling_reserve_rate` (numeric) — e.g. 0.05 = 5%
   - `joined_at` (timestamptz)
   - `merchant_wallet_id` (text, FK → wallets)
   - `reserve_wallet_id` (text, FK → wallets)

5. **settlements** — Merchant settlement queue
   - `id` (text, PK) — e.g. "STL-000001"
   - `reference` (text)
   - `merchant_id` (text, FK → merchants)
   - `merchant_name` (text)
   - `amount` (numeric)
   - `currency` (text)
   - `fees` (numeric)
   - `net_amount` (numeric)
   - `status` (text) — queued | pending | completed | failed
   - `schedule` (text) — daily | weekly | monthly
   - `transaction_ids` (jsonb) — array of transaction IDs
   - `bank_account` (text, nullable)
   - `created_at` (timestamptz)
   - `settled_at` (timestamptz, nullable)

## Security

This is a single-tenant demo app with no sign-in screen. All policies use
`TO anon, authenticated` so the anon-key frontend can read and write data.
RLS is enabled on every table.

## Indexes

- `ledger_entries.wallet_id` — for balance calculation queries
- `ledger_entries.reference` — for lookup by transaction reference
- `transactions.created_at` — for sorted listing
- `transactions.status` — for status filtering
- `transactions.type` — for type filtering
- `wallets.owner_id` — for user wallet lookups
- `merchants.verification_status` — for admin verification queue
- `settlements.merchant_id` — for merchant settlement history
- `settlements.status` — for settlement queue

## Notes

1. All monetary amounts use `numeric(18,2)` for precision.
2. The `immutable` column on ledger_entries is a documentation flag — the
   application enforces immutability, not the database.
3. JSONB columns store structured data (fee breakdowns, timelines, etc.)
4. No `user_id` or `auth.uid()` references — this is a single-tenant demo.
*/

-- ─── Wallets ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wallets (
  id text PRIMARY KEY,
  type text NOT NULL DEFAULT 'primary',
  status text NOT NULL DEFAULT 'active',
  currency text NOT NULL DEFAULT 'USD',
  owner_id text NOT NULL,
  owner_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_wallets" ON wallets;
CREATE POLICY "anon_select_wallets" ON wallets FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_wallets" ON wallets;
CREATE POLICY "anon_insert_wallets" ON wallets FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_wallets" ON wallets;
CREATE POLICY "anon_update_wallets" ON wallets FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_wallets" ON wallets;
CREATE POLICY "anon_delete_wallets" ON wallets FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_wallets_owner_id ON wallets (owner_id);
CREATE INDEX IF NOT EXISTS idx_wallets_type ON wallets (type);

-- ─── Ledger Entries ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ledger_entries (
  id text PRIMARY KEY,
  audit_id text NOT NULL,
  wallet_id text NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'debit',
  amount numeric(18,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  reference text NOT NULL,
  description text NOT NULL DEFAULT '',
  source_wallet_id text,
  destination_wallet_id text,
  exchange_rate numeric(18,8),
  status text NOT NULL DEFAULT 'posted',
  timestamp timestamptz NOT NULL DEFAULT now(),
  immutable boolean NOT NULL DEFAULT true
);

ALTER TABLE ledger_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_ledger" ON ledger_entries;
CREATE POLICY "anon_select_ledger" ON ledger_entries FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_ledger" ON ledger_entries;
CREATE POLICY "anon_insert_ledger" ON ledger_entries FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_ledger" ON ledger_entries;
CREATE POLICY "anon_update_ledger" ON ledger_entries FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_ledger" ON ledger_entries;
CREATE POLICY "anon_delete_ledger" ON ledger_entries FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_ledger_wallet_id ON ledger_entries (wallet_id);
CREATE INDEX IF NOT EXISTS idx_ledger_reference ON ledger_entries (reference);
CREATE INDEX IF NOT EXISTS idx_ledger_status ON ledger_entries (status);
CREATE INDEX IF NOT EXISTS idx_ledger_timestamp ON ledger_entries (timestamp);

-- ─── Transactions ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
  id text PRIMARY KEY,
  reference text NOT NULL,
  type text NOT NULL DEFAULT 'card_payment',
  status text NOT NULL DEFAULT 'created',
  amount numeric(18,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  fee jsonb NOT NULL DEFAULT '{}'::jsonb,
  description text NOT NULL DEFAULT '',
  counterparty jsonb NOT NULL DEFAULT '{}'::jsonb,
  source_wallet_id text NOT NULL,
  destination_wallet_id text NOT NULL,
  payment_method text NOT NULL DEFAULT 'card',
  exchange_rate numeric(18,8),
  timeline jsonb NOT NULL DEFAULT '[]'::jsonb,
  ledger_entry_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_transactions" ON transactions;
CREATE POLICY "anon_select_transactions" ON transactions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_transactions" ON transactions;
CREATE POLICY "anon_insert_transactions" ON transactions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_transactions" ON transactions;
CREATE POLICY "anon_update_transactions" ON transactions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_transactions" ON transactions;
CREATE POLICY "anon_delete_transactions" ON transactions FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions (status);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions (type);
CREATE INDEX IF NOT EXISTS idx_transactions_currency ON transactions (currency);

-- ─── Merchants ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS merchants (
  id text PRIMARY KEY,
  business_name text NOT NULL,
  email text NOT NULL,
  category text NOT NULL DEFAULT '',
  country text NOT NULL DEFAULT '',
  verification_status text NOT NULL DEFAULT 'pending',
  settlement_schedule text NOT NULL DEFAULT 'weekly',
  rolling_reserve_rate numeric(5,4) NOT NULL DEFAULT 0.05,
  joined_at timestamptz NOT NULL DEFAULT now(),
  merchant_wallet_id text NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  reserve_wallet_id text NOT NULL REFERENCES wallets(id) ON DELETE CASCADE
);

ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_merchants" ON merchants;
CREATE POLICY "anon_select_merchants" ON merchants FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_merchants" ON merchants;
CREATE POLICY "anon_insert_merchants" ON merchants FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_merchants" ON merchants;
CREATE POLICY "anon_update_merchants" ON merchants FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_merchants" ON merchants;
CREATE POLICY "anon_delete_merchants" ON merchants FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_merchants_verification_status ON merchants (verification_status);

-- ─── Settlements ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS settlements (
  id text PRIMARY KEY,
  reference text NOT NULL,
  merchant_id text NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  merchant_name text NOT NULL,
  amount numeric(18,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  fees numeric(18,2) NOT NULL DEFAULT 0,
  net_amount numeric(18,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'queued',
  schedule text NOT NULL DEFAULT 'weekly',
  transaction_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  bank_account text,
  created_at timestamptz NOT NULL DEFAULT now(),
  settled_at timestamptz
);

ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_settlements" ON settlements;
CREATE POLICY "anon_select_settlements" ON settlements FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_settlements" ON settlements;
CREATE POLICY "anon_insert_settlements" ON settlements FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_settlements" ON settlements;
CREATE POLICY "anon_update_settlements" ON settlements FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_settlements" ON settlements;
CREATE POLICY "anon_delete_settlements" ON settlements FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_settlements_merchant_id ON settlements (merchant_id);
CREATE INDEX IF NOT EXISTS idx_settlements_status ON settlements (status);

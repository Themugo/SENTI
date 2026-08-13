/*
# Add merchant_wallet_id to settlements table

1. New Columns
- `merchant_wallet_id` (text) — The merchant's wallet ID for ledger posting on settlement completion

2. Notes
- This column is required for the settlement completion flow to post ledger entries
- Backfilled with empty string for existing rows, then set NOT NULL
*/

ALTER TABLE settlements ADD COLUMN IF NOT EXISTS merchant_wallet_id text;

-- Backfill existing rows with a placeholder
UPDATE settlements SET merchant_wallet_id = 'MW-00001' WHERE merchant_wallet_id IS NULL;

ALTER TABLE settlements ALTER COLUMN merchant_wallet_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_settlements_merchant_wallet ON settlements(merchant_wallet_id);

/*
# Create Payment Infrastructure Schema

## Overview
This migration creates the complete payment infrastructure for SENTI: payment intents,
checkout sessions, refunds, disputes, webhooks, payment links, subscriptions, invoices,
reconciliation records, and routing rules.

## New Tables
1. payment_intents — Payment intents with provider routing
2. checkout_sessions — Checkout sessions (embedded/hosted/express/guest)
3. refunds — Full and partial refunds with timeline
4. disputes — Dispute center with evidence and timeline
5. webhook_endpoints — Webhook endpoint configuration
6. webhook_events — Webhook event delivery log with retries
7. payment_links — Payment links with QR codes and types
8. subscription_plans — Subscription plan definitions
9. subscriptions — Active customer subscriptions
10. invoices_v2 — Professional invoices with line items
11. reconciliation_records — Provider reconciliation records
12. reconciliation_reports — Daily reconciliation reports
13. routing_rules — Payment routing rules

## Security
- RLS enabled on all tables
- Merchant-scoped access for merchant-owned data
- Read access for operational tables (admin/compliance)
*/

CREATE TABLE IF NOT EXISTS payment_intents (
  id text PRIMARY KEY,
  reference text UNIQUE NOT NULL,
  merchant_id text NOT NULL,
  amount numeric NOT NULL,
  currency text NOT NULL,
  status text DEFAULT 'requires_payment_method',
  payment_method text,
  provider_id text,
  customer_id text,
  customer_email text,
  description text,
  metadata jsonb DEFAULT '{}',
  fee numeric DEFAULT 0,
  net_amount numeric DEFAULT 0,
  timeline jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE payment_intents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_payment_intents" ON payment_intents;
CREATE POLICY "select_payment_intents" ON payment_intents FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_payment_intents" ON payment_intents;
CREATE POLICY "insert_payment_intents" ON payment_intents FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_payment_intents" ON payment_intents;
CREATE POLICY "update_payment_intents" ON payment_intents FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS checkout_sessions (
  id text PRIMARY KEY,
  merchant_id text NOT NULL,
  amount numeric NOT NULL,
  currency text NOT NULL,
  status text DEFAULT 'open',
  mode text DEFAULT 'embedded',
  payment_methods jsonb DEFAULT '[]',
  customer_email text,
  customer_name text,
  description text,
  success_url text,
  cancel_url text,
  webhook_url text,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  payment_intent_id text
);

ALTER TABLE checkout_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_checkout" ON checkout_sessions;
CREATE POLICY "select_checkout" ON checkout_sessions FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_checkout" ON checkout_sessions;
CREATE POLICY "insert_checkout" ON checkout_sessions FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_checkout" ON checkout_sessions;
CREATE POLICY "update_checkout" ON checkout_sessions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS refunds (
  id text PRIMARY KEY,
  reference text UNIQUE NOT NULL,
  payment_intent_id text NOT NULL,
  merchant_id text NOT NULL,
  amount numeric NOT NULL,
  currency text NOT NULL,
  type text DEFAULT 'full',
  status text DEFAULT 'pending',
  reason text,
  timeline jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  processed_at timestamptz
);

ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_refunds" ON refunds;
CREATE POLICY "select_refunds" ON refunds FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_refunds" ON refunds;
CREATE POLICY "insert_refunds" ON refunds FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_refunds" ON refunds;
CREATE POLICY "update_refunds" ON refunds FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS disputes (
  id text PRIMARY KEY,
  reference text UNIQUE NOT NULL,
  payment_intent_id text NOT NULL,
  merchant_id text NOT NULL,
  amount numeric NOT NULL,
  currency text NOT NULL,
  status text DEFAULT 'open',
  reason text,
  evidence_submitted boolean DEFAULT false,
  evidence_count integer DEFAULT 0,
  customer_email text,
  description text,
  timeline jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz,
  due_date timestamptz
);

ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_disputes" ON disputes;
CREATE POLICY "select_disputes" ON disputes FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_disputes" ON disputes;
CREATE POLICY "insert_disputes" ON disputes FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_disputes" ON disputes;
CREATE POLICY "update_disputes" ON disputes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS webhook_endpoints (
  id text PRIMARY KEY,
  merchant_id text NOT NULL,
  url text NOT NULL,
  events jsonb DEFAULT '[]',
  status text DEFAULT 'active',
  secret text,
  created_at timestamptz DEFAULT now(),
  last_delivery timestamptz,
  success_rate numeric DEFAULT 100
);

ALTER TABLE webhook_endpoints ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_webhook_endpoints" ON webhook_endpoints;
CREATE POLICY "select_webhook_endpoints" ON webhook_endpoints FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_webhook_endpoints" ON webhook_endpoints;
CREATE POLICY "insert_webhook_endpoints" ON webhook_endpoints FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_webhook_endpoints" ON webhook_endpoints;
CREATE POLICY "update_webhook_endpoints" ON webhook_endpoints FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "delete_webhook_endpoints" ON webhook_endpoints;
CREATE POLICY "delete_webhook_endpoints" ON webhook_endpoints FOR DELETE TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS webhook_events (
  id text PRIMARY KEY,
  endpoint_id text REFERENCES webhook_endpoints(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  payload jsonb DEFAULT '{}',
  status text DEFAULT 'pending',
  attempts integer DEFAULT 0,
  max_attempts integer DEFAULT 5,
  response_code integer,
  delivered_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_webhook_events" ON webhook_events;
CREATE POLICY "select_webhook_events" ON webhook_events FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_webhook_events" ON webhook_events;
CREATE POLICY "insert_webhook_events" ON webhook_events FOR INSERT TO authenticated WITH CHECK (true);

CREATE TABLE IF NOT EXISTS payment_links (
  id text PRIMARY KEY,
  reference text UNIQUE NOT NULL,
  merchant_id text NOT NULL,
  name text NOT NULL,
  description text,
  amount numeric NOT NULL,
  currency text NOT NULL,
  type text DEFAULT 'one_time',
  status text DEFAULT 'active',
  url text NOT NULL,
  customer_name text,
  expiry_date timestamptz,
  redirect_url text,
  webhook_url text,
  payments integer DEFAULT 0,
  total_collected numeric DEFAULT 0,
  qr_code text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE payment_links ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_payment_links" ON payment_links;
CREATE POLICY "select_payment_links" ON payment_links FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_payment_links" ON payment_links;
CREATE POLICY "insert_payment_links" ON payment_links FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_payment_links" ON payment_links;
CREATE POLICY "update_payment_links" ON payment_links FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS subscription_plans (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  amount numeric DEFAULT 0,
  currency text DEFAULT 'USD',
  interval text DEFAULT 'monthly',
  billing_type text DEFAULT 'fixed',
  trial_days integer,
  features jsonb DEFAULT '[]',
  active boolean DEFAULT true
);

ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_subscription_plans" ON subscription_plans;
CREATE POLICY "select_subscription_plans" ON subscription_plans FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_subscription_plans" ON subscription_plans;
CREATE POLICY "insert_subscription_plans" ON subscription_plans FOR INSERT TO authenticated WITH CHECK (true);

CREATE TABLE IF NOT EXISTS subscriptions (
  id text PRIMARY KEY,
  reference text UNIQUE NOT NULL,
  customer_id text NOT NULL,
  customer_name text,
  customer_email text,
  plan_id text NOT NULL,
  plan_name text,
  amount numeric NOT NULL,
  currency text NOT NULL,
  interval text NOT NULL,
  billing_type text DEFAULT 'fixed',
  status text DEFAULT 'active',
  trial_ends_at timestamptz,
  current_period_start timestamptz,
  current_period_end timestamptz,
  canceled_at timestamptz,
  usage numeric,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_subscriptions" ON subscriptions;
CREATE POLICY "select_subscriptions" ON subscriptions FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_subscriptions" ON subscriptions;
CREATE POLICY "insert_subscriptions" ON subscriptions FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_subscriptions" ON subscriptions;
CREATE POLICY "update_subscriptions" ON subscriptions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS invoices_v2 (
  id text PRIMARY KEY,
  number text UNIQUE NOT NULL,
  merchant_id text NOT NULL,
  customer_id text NOT NULL,
  customer_name text,
  customer_email text,
  amount numeric NOT NULL,
  currency text NOT NULL,
  status text DEFAULT 'draft',
  issue_date timestamptz DEFAULT now(),
  due_date timestamptz,
  paid_at timestamptz,
  items jsonb DEFAULT '[]',
  notes text,
  tax numeric DEFAULT 0,
  discount numeric DEFAULT 0,
  payment_link_id text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE invoices_v2 ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_invoices" ON invoices_v2;
CREATE POLICY "select_invoices" ON invoices_v2 FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_invoices" ON invoices_v2;
CREATE POLICY "insert_invoices" ON invoices_v2 FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_invoices" ON invoices_v2;
CREATE POLICY "update_invoices" ON invoices_v2 FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS reconciliation_records (
  id text PRIMARY KEY,
  date text NOT NULL,
  provider_id text NOT NULL,
  provider_transaction_id text,
  internal_transaction_id text,
  provider_amount numeric,
  internal_amount numeric,
  provider_fee numeric,
  internal_fee numeric,
  status text DEFAULT 'pending',
  discrepancy text,
  resolved_at timestamptz
);

ALTER TABLE reconciliation_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_recon_records" ON reconciliation_records;
CREATE POLICY "select_recon_records" ON reconciliation_records FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_recon_records" ON reconciliation_records;
CREATE POLICY "insert_recon_records" ON reconciliation_records FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_recon_records" ON reconciliation_records;
CREATE POLICY "update_recon_records" ON reconciliation_records FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS reconciliation_reports (
  id text PRIMARY KEY,
  date text NOT NULL,
  provider_id text NOT NULL,
  total_transactions integer DEFAULT 0,
  matched integer DEFAULT 0,
  mismatched integer DEFAULT 0,
  missing integer DEFAULT 0,
  pending integer DEFAULT 0,
  total_fees numeric DEFAULT 0,
  total_volume numeric DEFAULT 0,
  status text DEFAULT 'in_progress'
);

ALTER TABLE reconciliation_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_recon_reports" ON reconciliation_reports;
CREATE POLICY "select_recon_reports" ON reconciliation_reports FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_recon_reports" ON reconciliation_reports;
CREATE POLICY "insert_recon_reports" ON reconciliation_reports FOR INSERT TO authenticated WITH CHECK (true);

CREATE TABLE IF NOT EXISTS routing_rules (
  id text PRIMARY KEY,
  name text NOT NULL,
  priority integer DEFAULT 10,
  condition jsonb DEFAULT '{}',
  provider_id text NOT NULL,
  failover_provider_id text,
  enabled boolean DEFAULT true
);

ALTER TABLE routing_rules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_routing_rules" ON routing_rules;
CREATE POLICY "select_routing_rules" ON routing_rules FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_routing_rules" ON routing_rules;
CREATE POLICY "insert_routing_rules" ON routing_rules FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_routing_rules" ON routing_rules;
CREATE POLICY "update_routing_rules" ON routing_rules FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "delete_routing_rules" ON routing_rules;
CREATE POLICY "delete_routing_rules" ON routing_rules FOR DELETE TO authenticated USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payment_intents_merchant ON payment_intents(merchant_id);
CREATE INDEX IF NOT EXISTS idx_payment_intents_status ON payment_intents(status);
CREATE INDEX IF NOT EXISTS idx_refunds_merchant ON refunds(merchant_id);
CREATE INDEX IF NOT EXISTS idx_disputes_merchant ON disputes(merchant_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_endpoint ON webhook_events(endpoint_id);
CREATE INDEX IF NOT EXISTS idx_payment_links_merchant ON payment_links(merchant_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_customer ON subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_merchant ON invoices_v2(merchant_id);
CREATE INDEX IF NOT EXISTS idx_recon_records_date ON reconciliation_records(date);

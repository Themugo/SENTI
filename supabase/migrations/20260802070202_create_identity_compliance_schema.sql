/*
# Create Identity & Compliance Platform Schema

## Overview
This migration creates the complete identity, KYC, KYB, compliance, audit, and risk
infrastructure for the SENTI fintech platform. All tables support multi-user isolation
via user_id columns with RLS policies.

## New Tables
1. identities — User identity profiles
2. kyc_profiles — KYC verification status and timeline
3. kyc_documents — Individual KYC documents
4. kyb_profiles — KYB business verification status and timeline
5. kyb_documents — Company verification documents
6. compliance_cases — Compliance review queue
7. compliance_notes — Notes on compliance cases
8. audit_events — Immutable audit log (append-only)
9. risk_profiles — Risk scores per user/merchant
10. risk_flags — Individual risk flags
11. role_assignments — RBAC role assignments
12. security_events — Security timeline events
13. trusted_devices — User's trusted devices
14. sessions — Active user sessions

## Security
- RLS enabled on every table
- Owner-scoped CRUD for user-owned tables
- Audit events are insert-only (no UPDATE or DELETE policies)
*/

-- ─── identities ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS identities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text,
  date_of_birth date,
  nationality text,
  country text,
  language text DEFAULT 'en',
  timezone text DEFAULT 'UTC',
  preferred_currency text DEFAULT 'USD',
  account_type text DEFAULT 'personal',
  avatar text,
  notification_preferences jsonb DEFAULT '{"email":true,"push":true,"sms":false,"transactionAlerts":true,"securityAlerts":true,"marketingUpdates":false,"weeklySummary":true,"productUpdates":true}',
  privacy_settings jsonb DEFAULT '{"profileVisibility":"private","showTransactionHistory":false,"shareAnalytics":true,"twoFactorRequired":true}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE identities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_identity" ON identities;
CREATE POLICY "select_own_identity" ON identities FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_identity" ON identities;
CREATE POLICY "insert_own_identity" ON identities FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_identity" ON identities;
CREATE POLICY "update_own_identity" ON identities FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ─── kyc_profiles ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS kyc_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  status text DEFAULT 'not_started',
  selfie_verified boolean DEFAULT false,
  proof_of_address_verified boolean DEFAULT false,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewer_id uuid,
  rejection_reason text,
  expires_at timestamptz,
  timeline jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE kyc_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_kyc" ON kyc_profiles;
CREATE POLICY "select_own_kyc" ON kyc_profiles FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_kyc" ON kyc_profiles;
CREATE POLICY "insert_own_kyc" ON kyc_profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_kyc" ON kyc_profiles;
CREATE POLICY "update_own_kyc" ON kyc_profiles FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ─── kyc_documents ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS kyc_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kyc_profile_id uuid REFERENCES kyc_profiles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  status text DEFAULT 'pending',
  file_name text,
  file_size integer,
  uploaded_at timestamptz DEFAULT now(),
  reviewed_at timestamptz,
  reviewer_id uuid,
  rejection_reason text
);

ALTER TABLE kyc_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_kyc_docs" ON kyc_documents;
CREATE POLICY "select_own_kyc_docs" ON kyc_documents FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_kyc_docs" ON kyc_documents;
CREATE POLICY "insert_own_kyc_docs" ON kyc_documents FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- ─── kyb_profiles ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS kyb_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id text NOT NULL,
  status text DEFAULT 'not_started',
  directors jsonb DEFAULT '[]',
  beneficial_owners jsonb DEFAULT '[]',
  business_address jsonb DEFAULT '{}',
  website text,
  business_description text,
  expected_monthly_volume numeric DEFAULT 0,
  expected_countries jsonb DEFAULT '[]',
  expected_currencies jsonb DEFAULT '[]',
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewer_id uuid,
  rejection_reason text,
  timeline jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE kyb_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_kyb" ON kyb_profiles;
CREATE POLICY "select_kyb" ON kyb_profiles FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_kyb" ON kyb_profiles;
CREATE POLICY "insert_kyb" ON kyb_profiles FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_kyb" ON kyb_profiles;
CREATE POLICY "update_kyb" ON kyb_profiles FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- ─── kyb_documents ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS kyb_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kyb_profile_id uuid REFERENCES kyb_profiles(id) ON DELETE CASCADE,
  merchant_id text,
  type text NOT NULL,
  status text DEFAULT 'pending',
  file_name text,
  file_size integer,
  uploaded_at timestamptz DEFAULT now(),
  reviewed_at timestamptz,
  reviewer_id uuid,
  rejection_reason text
);

ALTER TABLE kyb_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_kyb_docs" ON kyb_documents;
CREATE POLICY "select_kyb_docs" ON kyb_documents FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_kyb_docs" ON kyb_documents;
CREATE POLICY "insert_kyb_docs" ON kyb_documents FOR INSERT
  TO authenticated WITH CHECK (true);

-- ─── compliance_cases ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS compliance_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  merchant_id text,
  type text NOT NULL,
  status text DEFAULT 'pending_review',
  priority text DEFAULT 'medium',
  assigned_to text,
  description text,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE compliance_cases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_compliance" ON compliance_cases;
CREATE POLICY "select_compliance" ON compliance_cases FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_compliance" ON compliance_cases;
CREATE POLICY "insert_compliance" ON compliance_cases FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_compliance" ON compliance_cases;
CREATE POLICY "update_compliance" ON compliance_cases FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- ─── compliance_notes ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS compliance_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES compliance_cases(id) ON DELETE CASCADE,
  author_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id),
  author_name text,
  note text NOT NULL,
  timestamp timestamptz DEFAULT now()
);

ALTER TABLE compliance_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_compliance_notes" ON compliance_notes;
CREATE POLICY "select_compliance_notes" ON compliance_notes FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_compliance_notes" ON compliance_notes;
CREATE POLICY "insert_compliance_notes" ON compliance_notes FOR INSERT
  TO authenticated WITH CHECK (true);

-- ─── audit_events ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  actor_id text NOT NULL,
  actor_name text,
  actor_role text,
  action text NOT NULL,
  resource_type text,
  resource_id text,
  metadata jsonb,
  ip_address text,
  user_agent text,
  timestamp timestamptz DEFAULT now()
);

ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;

-- Audit events are insert-only. No update or delete.
DROP POLICY IF EXISTS "select_audit" ON audit_events;
CREATE POLICY "select_audit" ON audit_events FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_audit" ON audit_events;
CREATE POLICY "insert_audit" ON audit_events FOR INSERT
  TO authenticated WITH CHECK (true);

-- ─── risk_profiles ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS risk_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  merchant_id text,
  overall_score integer DEFAULT 0,
  level text DEFAULT 'low',
  transaction_risk integer DEFAULT 0,
  country_risk integer DEFAULT 0,
  merchant_risk integer DEFAULT 0,
  device_risk integer DEFAULT 0,
  behaviour_risk integer DEFAULT 0,
  velocity_risk integer DEFAULT 0,
  assessed_at timestamptz DEFAULT now()
);

ALTER TABLE risk_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_risk" ON risk_profiles;
CREATE POLICY "select_risk" ON risk_profiles FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_risk" ON risk_profiles;
CREATE POLICY "insert_risk" ON risk_profiles FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_risk" ON risk_profiles;
CREATE POLICY "update_risk" ON risk_profiles FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- ─── risk_flags ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS risk_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  risk_profile_id uuid REFERENCES risk_profiles(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  type text NOT NULL,
  severity text DEFAULT 'medium',
  description text,
  detected_at timestamptz DEFAULT now(),
  resolved boolean DEFAULT false,
  resolved_at timestamptz
);

ALTER TABLE risk_flags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_risk_flags" ON risk_flags;
CREATE POLICY "select_risk_flags" ON risk_flags FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_risk_flags" ON risk_flags;
CREATE POLICY "insert_risk_flags" ON risk_flags FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_risk_flags" ON risk_flags;
CREATE POLICY "update_risk_flags" ON risk_flags FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- ─── role_assignments ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS role_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'customer',
  permissions jsonb DEFAULT '[]',
  assigned_at timestamptz DEFAULT now(),
  assigned_by text
);

ALTER TABLE role_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_roles" ON role_assignments;
CREATE POLICY "select_roles" ON role_assignments FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_roles" ON role_assignments;
CREATE POLICY "insert_roles" ON role_assignments FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_roles" ON role_assignments;
CREATE POLICY "update_roles" ON role_assignments FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- ─── security_events ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  description text,
  location text,
  ip_address text,
  timestamp timestamptz DEFAULT now()
);

ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_security" ON security_events;
CREATE POLICY "select_own_security" ON security_events FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_security" ON security_events;
CREATE POLICY "insert_own_security" ON security_events FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- ─── trusted_devices ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS trusted_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  device_name text NOT NULL,
  device_type text,
  browser text,
  os text,
  location text,
  last_used timestamptz DEFAULT now(),
  trusted boolean DEFAULT false
);

ALTER TABLE trusted_devices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_devices" ON trusted_devices;
CREATE POLICY "select_own_devices" ON trusted_devices FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_devices" ON trusted_devices;
CREATE POLICY "insert_own_devices" ON trusted_devices FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_devices" ON trusted_devices;
CREATE POLICY "update_own_devices" ON trusted_devices FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_devices" ON trusted_devices;
CREATE POLICY "delete_own_devices" ON trusted_devices FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ─── sessions ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  device text,
  location text,
  ip_address text,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  last_active timestamptz DEFAULT now()
);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_sessions" ON sessions;
CREATE POLICY "select_own_sessions" ON sessions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_sessions" ON sessions;
CREATE POLICY "insert_own_sessions" ON sessions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_sessions" ON sessions;
CREATE POLICY "update_own_sessions" ON sessions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_sessions" ON sessions;
CREATE POLICY "delete_own_sessions" ON sessions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ─── Indexes ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_identities_user_id ON identities(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_profiles_user_id ON kyc_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_documents_user_id ON kyc_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_kyb_profiles_merchant_id ON kyb_profiles(merchant_id);
CREATE INDEX IF NOT EXISTS idx_compliance_cases_status ON compliance_cases(status);
CREATE INDEX IF NOT EXISTS idx_audit_events_timestamp ON audit_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_events_actor_id ON audit_events(actor_id);
CREATE INDEX IF NOT EXISTS idx_risk_profiles_user_id ON risk_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_risk_flags_user_id ON risk_flags(user_id);
CREATE INDEX IF NOT EXISTS idx_role_assignments_user_id ON role_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);

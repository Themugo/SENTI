/**
 * SENTI Financial Engine — Enterprise TypeScript Models
 * These types model the internal financial infrastructure.
 * The Ledger is the single source of truth — balances are NEVER stored, only calculated.
 */

// ─── Currency ───────────────────────────────────────────────

export type CurrencyCode =
  | 'USD' | 'KES' | 'EUR' | 'GBP' | 'NGN'
  | 'TZS' | 'UGX' | 'RWF' | 'AED'
  | 'CAD' | 'AUD' | 'JPY' | 'CHF' | 'ZAR';

export interface CurrencyMeta {
  code: CurrencyCode;
  symbol: string;
  flag: string;
  name: string;
  decimals: number;
  rateToUSD: number;
}

// ─── Wallet ──────────────────────────────────────────────────

export type WalletType = 'primary' | 'merchant' | 'escrow' | 'reserve';
export type WalletStatus = 'active' | 'frozen' | 'closed';

export interface Wallet {
  id: string;
  type: WalletType;
  status: WalletStatus;
  currency: CurrencyCode;
  ownerId: string;
  ownerName: string;
  createdAt: string;
}

/** Calculated from ledger — never stored. */
export interface WalletBalance {
  walletId: string;
  currency: CurrencyCode;
  balance: number;
  pending: number;
  available: number;
}

// ─── Ledger ──────────────────────────────────────────────────

export type LedgerEntryType = 'debit' | 'credit';
export type LedgerEntryStatus = 'posted' | 'pending' | 'reversed';

export interface LedgerEntry {
  id: string;
  auditId: string;
  walletId: string;
  type: LedgerEntryType;
  amount: number;
  currency: CurrencyCode;
  reference: string;
  description: string;
  sourceWalletId?: string;
  destinationWalletId?: string;
  exchangeRate?: number;
  status: LedgerEntryStatus;
  timestamp: string;
  /** Immutable — once posted, this entry can never be edited. */
  readonly immutable: true;
}

// ─── Transactions ───────────────────────────────────────────

export type TransactionType =
  | 'deposit'
  | 'withdrawal'
  | 'card_payment'
  | 'bank_transfer'
  | 'mpesa'
  | 'airtel_money'
  | 'internal_transfer'
  | 'currency_exchange'
  | 'refund'
  | 'chargeback'
  | 'escrow_hold'
  | 'escrow_release'
  | 'subscription'
  | 'invoice_payment'
  | 'merchant_settlement'
  | 'fee';

export type TransactionStatus =
  | 'created'
  | 'authorized'
  | 'processing'
  | 'settled'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'reversed'
  | 'pending'
  | 'refunded';

export type PaymentMethod =
  | 'card' | 'bank' | 'mpesa' | 'airtel'
  | 'wallet' | 'apple_pay' | 'google_pay' | 'paypal'
  | 'visa' | 'mastercard' | 'amex' | 'unionpay'
  | 'airtel_money' | 'bank_transfer' | 'pesalink';

export interface TransactionTimelineEvent {
  status: TransactionStatus;
  timestamp: string;
  note?: string;
}

export interface FeeBreakdown {
  flatFee: number;
  percentageFee: number;
  fxFee: number;
  settlementFee: number;
  merchantFee: number;
  platformFee: number;
  total: number;
  currency: CurrencyCode;
}

export interface Transaction {
  id: string;
  reference: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  currency: CurrencyCode;
  fee: FeeBreakdown;
  description: string;
  counterparty: {
    name: string;
    email?: string;
    walletId?: string;
  };
  sourceWalletId: string;
  destinationWalletId: string;
  paymentMethod: PaymentMethod;
  exchangeRate?: number;
  timeline: TransactionTimelineEvent[];
  ledgerEntryIds: string[];
  createdAt: string;
  updatedAt: string;
}

// ─── Settlement ──────────────────────────────────────────────

export type SettlementStatus = 'queued' | 'pending' | 'completed' | 'failed';
export type SettlementSchedule = 'daily' | 'weekly' | 'monthly';

export interface Settlement {
  id: string;
  reference: string;
  merchantId: string;
  merchantName: string;
  merchantWalletId: string;
  amount: number;
  currency: CurrencyCode;
  fees: number;
  netAmount: number;
  status: SettlementStatus;
  schedule: SettlementSchedule;
  transactionIds: string[];
  bankAccount?: string;
  createdAt: string;
  settledAt?: string;
}

// ─── Merchant ────────────────────────────────────────────────

export type MerchantVerificationStatus = 'verified' | 'pending' | 'rejected';

export interface LegacyMerchant {
  id: string;
  businessName: string;
  email: string;
  category: string;
  verificationStatus: MerchantVerificationStatus;
  monthlyVolume: number;
  payoutBalance: number;
  joinedAt: string;
  country: string;
}

export interface MerchantAccount {
  id: string;
  businessName: string;
  email: string;
  category: string;
  country: string;
  verificationStatus: MerchantVerificationStatus;
  settlementSchedule: SettlementSchedule;
  rollingReserveRate: number; // e.g. 0.05 = 5%
  joinedAt: string;
  merchantWalletId: string;
  reserveWalletId: string;
}

/** Calculated from ledger. */
export interface MerchantBalance {
  merchantId: string;
  available: number;
  pending: number;
  reserve: number;
  rollingReserve: number;
  currency: CurrencyCode;
}

// ─── Fees ────────────────────────────────────────────────────

export type FeeType = 'flat' | 'percentage' | 'fx' | 'settlement' | 'merchant' | 'platform';

export interface FeeRule {
  id: string;
  name: string;
  type: FeeType;
  rate: number;       // percentage as decimal (0.029 = 2.9%)
  flatAmount: number; // flat fee in currency
  currency: CurrencyCode;
  appliesTo: TransactionType[];
  minAmount?: number;
  maxAmount?: number;
}

// ─── Limits ──────────────────────────────────────────────────

export type LimitType = 'daily' | 'monthly' | 'per_transaction';

export interface TransactionLimit {
  id: string;
  walletId: string;
  type: LimitType;
  amount: number;
  currency: CurrencyCode;
  used: number;
}

// ─── Reports ─────────────────────────────────────────────────

export interface ReportPoint {
  label: string;
  value: number;
  secondary?: number;
}

export interface CurrencyDistribution {
  currency: CurrencyCode;
  volume: number;
  percentage: number;
}

export interface TopMerchant {
  merchantId: string;
  businessName: string;
  volume: number;
  transactionCount: number;
}

export interface SettlementReport {
  totalSettled: number;
  pending: number;
  failed: number;
  count: number;
}

// ─── Search & Filters ────────────────────────────────────────

export interface TransactionSearchFilters {
  search?: string;
  status?: TransactionStatus | 'all';
  type?: TransactionType | 'all';
  currency?: CurrencyCode | 'all';
  paymentMethod?: PaymentMethod | 'all';
  merchantId?: string | 'all';
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  limit?: number;
}

// ─── Legacy compat (kept for existing pages that import from types) ───

export type Currency = CurrencyCode;
export type TransactionCategory = TransactionType;

export interface WalletBalanceLegacy {
  currency: CurrencyCode;
  amount: number;
  flag: string;
  pending: number;
  change: number;
}

export interface Card {
  id: string;
  type: 'virtual' | 'physical';
  brand: 'visa' | 'mastercard';
  last4: string;
  expiry: string;
  holder: string;
  status: 'active' | 'frozen' | 'expired';
  color: string;
  spendingLimit: number;
  spent: number;
}

export interface Invoice {
  id: string;
  number: string;
  client: string;
  email: string;
  amount: number;
  currency: CurrencyCode;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  issueDate: string;
  dueDate: string;
  items: InvoiceLineItem[];
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  rate: number;
}

export interface PaymentLink {
  id: string;
  name: string;
  url: string;
  amount: number;
  currency: CurrencyCode;
  status: 'active' | 'inactive';
  payments: number;
  totalCollected: number;
  createdAt: string;
}

export interface Subscription {
  id: string;
  customer: string;
  email: string;
  plan: string;
  amount: number;
  currency: CurrencyCode;
  interval: 'monthly' | 'yearly' | 'weekly';
  status: 'active' | 'trialing' | 'past_due' | 'cancelled';
  nextBilling: string;
  startedAt: string;
}

export interface EscrowTransaction {
  id: string;
  title: string;
  buyer: string;
  seller: string;
  amount: number;
  currency: CurrencyCode;
  status: 'pending' | 'funded' | 'released' | 'disputed' | 'cancelled';
  milestones: EscrowMilestone[];
  createdAt: string;
}

export interface EscrowMilestone {
  id: string;
  title: string;
  description: string;
  amount: number;
  status: 'pending' | 'approved' | 'released' | 'disputed';
  dueDate: string;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  environment: 'live' | 'test';
  createdAt: string;
  lastUsed?: string;
  permissions: string[];
}

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  status: 'active' | 'inactive';
  lastDelivery?: string;
  successRate: number;
}

export interface Notification {
  id: string;
  type: 'payment' | 'transfer' | 'invoice' | 'security' | 'system' | 'card';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'pending' | 'resolved' | 'closed';
  createdAt: string;
  requester: string;
}

export interface ChartPoint {
  label: string;
  value: number;
  secondary?: number;
}

// Legacy Transaction interface for existing components
export interface LegacyTransaction {
  id: string;
  reference: string;
  type: 'incoming' | 'outgoing' | 'exchange' | 'deposit' | 'withdrawal' | 'fee' | 'refund';
  category: TransactionType;
  status: TransactionStatus;
  amount: number;
  currency: CurrencyCode;
  fee: number;
  description: string;
  counterparty: {
    name: string;
    email?: string;
    avatar?: string;
  };
  date: string;
  method?: string;
}

// ─── Identity & Compliance ─────────────────────────────────────

export type AccountType =
  | 'personal'
  | 'business'
  | 'non_profit'
  | 'government'
  | 'developer'
  | 'marketplace'
  | 'administrator'
  | 'support_agent'
  | 'compliance_officer';

export type Role =
  | 'customer'
  | 'merchant'
  | 'support'
  | 'finance'
  | 'compliance'
  | 'admin'
  | 'super_admin'
  | 'developer'
  | 'partner';

export type Permission =
  | 'view_dashboard'
  | 'manage_own_wallet'
  | 'send_money'
  | 'request_money'
  | 'create_payment_link'
  | 'manage_invoices'
  | 'manage_subscriptions'
  | 'manage_merchant'
  | 'view_transactions'
  | 'view_all_transactions'
  | 'approve_settlement'
  | 'view_analytics'
  | 'view_admin_panel'
  | 'manage_users'
  | 'manage_merchants'
  | 'review_compliance'
  | 'view_audit_log'
  | 'view_risk_dashboard'
  | 'manage_api_keys'
  | 'manage_roles'
  | 'access_support_queue'
  | 'view_support_tickets'
  | 'manage_webhooks'
  | 'view_all_wallets'
  | 'freeze_wallet'
  | 'approve_kyc'
  | 'approve_kyb'
  | 'escalate_compliance'
  | 'suspend_account';

export type KYCStatus =
  | 'not_started'
  | 'pending'
  | 'in_review'
  | 'approved'
  | 'rejected'
  | 'expired';

export type KYBStatus =
  | 'not_started'
  | 'pending'
  | 'in_review'
  | 'approved'
  | 'rejected'
  | 'expired';

export type DocumentType =
  | 'passport'
  | 'national_id'
  | 'driver_license'
  | 'residence_permit'
  | 'selfie'
  | 'proof_of_address'
  | 'certificate_of_incorporation'
  | 'business_registration'
  | 'tax_certificate'
  | 'shareholder_declaration'
  | 'director_declaration'
  | 'business_address_proof'
  | 'company_document';

export type DocumentStatus = 'pending' | 'in_review' | 'approved' | 'rejected' | 'expired';

export type MerchantStatus =
  | 'pending'
  | 'verified'
  | 'restricted'
  | 'rejected'
  | 'suspended';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type RiskFlagType =
  | 'high_value_transaction'
  | 'multiple_failed_logins'
  | 'rapid_transfers'
  | 'multiple_devices'
  | 'new_device_login'
  | 'high_risk_country'
  | 'sanctions_match'
  | 'chargeback_risk'
  | 'velocity_anomaly'
  | 'unusual_pattern';

export type AuditEventType =
  | 'login'
  | 'logout'
  | 'password_change'
  | 'email_change'
  | 'document_upload'
  | 'wallet_creation'
  | 'merchant_registration'
  | 'api_key_creation'
  | 'role_change'
  | 'settlement_approval'
  | 'kyc_submission'
  | 'kyb_submission'
  | 'kyc_approval'
  | 'kyb_approval'
  | 'compliance_review'
  | 'account_suspension'
  | 'account_reactivation'
  | 'security_alert'
  | 'permission_change'
  | 'settings_change';

export type ComplianceStatus =
  | 'pending_review'
  | 'approved'
  | 'rejected'
  | 'manual_review'
  | 'escalated'
  | 'suspended';

export type SessionStatus = 'active' | 'revoked' | 'expired';

export interface Identity {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  nationality: string;
  country: string;
  language: string;
  timezone: string;
  preferredCurrency: CurrencyCode;
  accountType: AccountType;
  avatar?: string;
  notificationPreferences: NotificationPreferences;
  privacySettings: PrivacySettings;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  transactionAlerts: boolean;
  securityAlerts: boolean;
  marketingUpdates: boolean;
  weeklySummary: boolean;
  productUpdates: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'contacts';
  showTransactionHistory: boolean;
  shareAnalytics: boolean;
  twoFactorRequired: boolean;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  twoFactorMethod: 'authenticator_app' | 'sms' | 'none';
  recoveryCodes: string[];
  trustedDevices: TrustedDevice[];
  sessions: Session[];
  securityTimeline: SecurityEvent[];
}

export interface TrustedDevice {
  id: string;
  deviceName: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
  location: string;
  lastUsed: string;
  trusted: boolean;
}

export interface Session {
  id: string;
  device: string;
  location: string;
  ipAddress: string;
  status: SessionStatus;
  createdAt: string;
  lastActive: string;
}

export interface SecurityEvent {
  id: string;
  type: 'login' | 'logout' | 'password_change' | '2fa_enabled' | '2fa_disabled' | 'recovery_code_used' | 'suspicious_activity' | 'device_trusted' | 'device_revoked';
  description: string;
  location: string;
  ipAddress: string;
  timestamp: string;
}

export interface KYCDocument {
  id: string;
  type: DocumentType;
  status: DocumentStatus;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  reviewedAt?: string;
  reviewerId?: string;
  rejectionReason?: string;
}

export interface KYCProfile {
  id: string;
  userId: string;
  status: KYCStatus;
  documents: KYCDocument[];
  selfieVerified: boolean;
  proofOfAddressVerified: boolean;
  submittedAt?: string;
  reviewedAt?: string;
  reviewerId?: string;
  rejectionReason?: string;
  expiresAt?: string;
  timeline: KYCTimelineEvent[];
}

export interface KYCTimelineEvent {
  status: KYCStatus;
  timestamp: string;
  note?: string;
  actor?: string;
}

export interface KYBDocument {
  id: string;
  type: DocumentType;
  status: DocumentStatus;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  reviewedAt?: string;
  reviewerId?: string;
  rejectionReason?: string;
}

export interface KYBProfile {
  id: string;
  merchantId: string;
  status: KYBStatus;
  documents: KYBDocument[];
  directors: Director[];
  beneficialOwners: BeneficialOwner[];
  businessAddress: Address;
  website?: string;
  businessDescription?: string;
  expectedMonthlyVolume: number;
  expectedCountries: string[];
  expectedCurrencies: CurrencyCode[];
  submittedAt?: string;
  reviewedAt?: string;
  reviewerId?: string;
  rejectionReason?: string;
  timeline: KYBTimelineEvent[];
}

export interface KYBTimelineEvent {
  status: KYBStatus;
  timestamp: string;
  note?: string;
  actor?: string;
}

export interface Director {
  id: string;
  name: string;
  email: string;
  role: string;
  nationality: string;
  dateOfBirth: string;
}

export interface BeneficialOwner {
  id: string;
  name: string;
  email: string;
  ownershipPercentage: number;
  nationality: string;
  dateOfBirth: string;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
}

export interface BusinessOnboardingData {
  companyName: string;
  registrationNumber: string;
  taxNumber: string;
  businessType: string;
  industry: string;
  country: string;
  address: Address;
  website?: string;
  businessDescription?: string;
  expectedMonthlyVolume: number;
  expectedCountries: string[];
  expectedCurrencies: CurrencyCode[];
  directors: Director[];
  beneficialOwners: BeneficialOwner[];
}

export interface RiskProfile {
  userId: string;
  merchantId?: string;
  overallScore: number;
  level: RiskLevel;
  transactionRisk: number;
  countryRisk: number;
  merchantRisk: number;
  deviceRisk: number;
  behaviourRisk: number;
  velocityRisk: number;
  flags: RiskFlag[];
  assessedAt: string;
}

export interface RiskFlag {
  id: string;
  type: RiskFlagType;
  severity: RiskLevel;
  description: string;
  detectedAt: string;
  resolved: boolean;
  resolvedAt?: string;
}

export interface AuditEvent {
  id: string;
  type: AuditEventType;
  actorId: string;
  actorName: string;
  actorRole: Role;
  action: string;
  resourceType: string;
  resourceId: string;
  metadata?: Record<string, string | number | boolean>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  readonly immutable: true;
}

export interface ComplianceCase {
  id: string;
  userId?: string;
  merchantId?: string;
  type: 'kyc_review' | 'kyb_review' | 'transaction_review' | 'sanctions_check' | 'chargeback_review' | 'manual_review';
  status: ComplianceStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  notes: ComplianceNote[];
}

export interface ComplianceNote {
  id: string;
  authorId: string;
  authorName: string;
  note: string;
  timestamp: string;
}

export interface RoleAssignment {
  userId: string;
  role: Role;
  permissions: Permission[];
  assignedAt: string;
  assignedBy: string;
}

export interface MerchantComplianceProfile {
  merchantId: string;
  merchantStatus: MerchantStatus;
  riskScore: number;
  riskLevel: RiskLevel;
  kycStatus: KYCStatus;
  kybStatus: KYBStatus;
  settlementSchedule: SettlementSchedule;
  verificationProgress: number;
  complianceFlags: string[];
  lastReviewDate?: string;
  nextReviewDate?: string;
}

// ─── Payment Infrastructure ──────────────────────────────────

export type ProviderId =
  | 'visa' | 'mastercard' | 'amex' | 'unionpay'
  | 'mpesa' | 'airtel_money' | 'bank_transfer' | 'pesalink'
  | 'apple_pay' | 'google_pay' | 'paypal'
  | 'crypto' | 'open_banking';

export type ProviderCategory = 'card' | 'mobile_money' | 'bank' | 'wallet' | 'crypto' | 'open_banking';

export type ProviderStatus = 'operational' | 'degraded' | 'down' | 'maintenance';

export interface Provider {
  id: ProviderId;
  name: string;
  category: ProviderCategory;
  status: ProviderStatus;
  supportedCurrencies: CurrencyCode[];
  supportedCountries: string[];
  processingFeeRate: number;
  processingFeeFlat: number;
  avgProcessingTime: number;
  successRate: number;
  priority: number;
  enabled: boolean;
  failoverTo?: ProviderId;
}

export type PaymentIntentStatus =
  | 'requires_payment_method'
  | 'requires_confirmation'
  | 'requires_action'
  | 'processing'
  | 'succeeded'
  | 'cancelled'
  | 'failed';

export interface PaymentIntent {
  id: string;
  reference: string;
  merchantId: string;
  amount: number;
  currency: CurrencyCode;
  status: PaymentIntentStatus;
  paymentMethod: PaymentMethod;
  providerId?: ProviderId;
  customerId?: string;
  customerEmail?: string;
  description?: string;
  metadata?: Record<string, string>;
  fee: number;
  netAmount: number;
  createdAt: string;
  updatedAt: string;
  timeline: { status: PaymentIntentStatus; timestamp: string; note?: string }[];
}

export type CheckoutSessionStatus = 'open' | 'completed' | 'expired' | 'abandoned';

export type CheckoutMode = 'embedded' | 'hosted' | 'express' | 'guest' | 'business';

export interface CheckoutSession {
  id: string;
  merchantId: string;
  amount: number;
  currency: CurrencyCode;
  status: CheckoutSessionStatus;
  mode: CheckoutMode;
  paymentMethods: PaymentMethod[];
  customerEmail?: string;
  customerName?: string;
  description?: string;
  successUrl?: string;
  cancelUrl?: string;
  webhookUrl?: string;
  expiresAt: string;
  createdAt: string;
  completedAt?: string;
  paymentIntentId?: string;
}

export type RefundStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'partial';
export type RefundType = 'full' | 'partial';

export interface Refund {
  id: string;
  reference: string;
  paymentIntentId: string;
  merchantId: string;
  amount: number;
  currency: CurrencyCode;
  type: RefundType;
  status: RefundStatus;
  reason: string;
  timeline: { status: RefundStatus; timestamp: string; note?: string }[];
  createdAt: string;
  processedAt?: string;
}

export type DisputeStatus = 'open' | 'under_review' | 'won' | 'lost' | 'expired' | 'challenged';
export type DisputeReason = 'fraudulent' | 'unrecognized' | 'product_not_received' | 'product_unacceptable' | 'duplicate' | 'subscription_canceled' | 'general';

export interface Dispute {
  id: string;
  reference: string;
  paymentIntentId: string;
  merchantId: string;
  amount: number;
  currency: CurrencyCode;
  status: DisputeStatus;
  reason: DisputeReason;
  evidenceSubmitted: boolean;
  evidenceCount: number;
  customerEmail?: string;
  description: string;
  timeline: { status: DisputeStatus; timestamp: string; note?: string }[];
  createdAt: string;
  resolvedAt?: string;
  dueDate: string;
}

export type WebhookEventStatus = 'pending' | 'delivered' | 'failed' | 'retrying';

export interface WebhookEndpoint {
  id: string;
  merchantId: string;
  url: string;
  events: string[];
  status: 'active' | 'inactive';
  secret: string;
  createdAt: string;
  lastDelivery?: string;
  successRate: number;
}

export interface WebhookEvent {
  id: string;
  endpointId: string;
  eventType: string;
  payload: Record<string, unknown>;
  status: WebhookEventStatus;
  attempts: number;
  maxAttempts: number;
  responseCode?: number;
  deliveredAt?: string;
  createdAt: string;
}

export type PaymentLinkStatus = 'active' | 'inactive' | 'expired';
export type PaymentLinkType = 'one_time' | 'invoice' | 'subscription';

export interface PaymentLinkV2 {
  id: string;
  reference: string;
  merchantId: string;
  name: string;
  description?: string;
  amount: number;
  currency: CurrencyCode;
  type: PaymentLinkType;
  status: PaymentLinkStatus;
  url: string;
  customerName?: string;
  expiryDate?: string;
  redirectUrl?: string;
  webhookUrl?: string;
  payments: number;
  totalCollected: number;
  qrCode?: string;
  createdAt: string;
}

export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'cancelled' | 'expired' | 'paused';
export type SubscriptionInterval = 'monthly' | 'quarterly' | 'yearly' | 'weekly';
export type BillingType = 'fixed' | 'usage_based';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  amount: number;
  currency: CurrencyCode;
  interval: SubscriptionInterval;
  billingType: BillingType;
  trialDays?: number;
  features: string[];
  active: boolean;
}

export interface SubscriptionV2 {
  id: string;
  reference: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  planId: string;
  planName: string;
  amount: number;
  currency: CurrencyCode;
  interval: SubscriptionInterval;
  billingType: BillingType;
  status: SubscriptionStatus;
  trialEndsAt?: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  canceledAt?: string;
  usage?: number;
  createdAt: string;
}

export type InvoiceStatusV2 = 'draft' | 'sent' | 'paid' | 'overdue' | 'void' | 'uncollectible';

export interface InvoiceV2 {
  id: string;
  number: string;
  merchantId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  currency: CurrencyCode;
  status: InvoiceStatusV2;
  issueDate: string;
  dueDate: string;
  paidAt?: string;
  items: InvoiceLineItem[];
  notes?: string;
  tax?: number;
  discount?: number;
  paymentLinkId?: string;
  createdAt: string;
}

export type ReconciliationStatus = 'matched' | 'mismatched' | 'missing' | 'pending';

export interface ReconciliationRecord {
  id: string;
  date: string;
  providerId: ProviderId;
  providerTransactionId: string;
  internalTransactionId: string;
  providerAmount: number;
  internalAmount: number;
  providerFee: number;
  internalFee: number;
  status: ReconciliationStatus;
  discrepancy?: string;
  resolvedAt?: string;
}

export interface ReconciliationReport {
  id: string;
  date: string;
  providerId: ProviderId;
  totalTransactions: number;
  matched: number;
  mismatched: number;
  missing: number;
  pending: number;
  totalFees: number;
  totalVolume: number;
  status: 'completed' | 'in_progress' | 'failed';
}

export interface RoutingRule {
  id: string;
  name: string;
  priority: number;
  condition: {
    country?: string[];
    currency?: CurrencyCode[];
    paymentMethod?: PaymentMethod[];
    merchantId?: string[];
    minAmount?: number;
    maxAmount?: number;
  };
  providerId: ProviderId;
  failoverProviderId?: ProviderId;
  enabled: boolean;
}

export interface ProviderHealth {
  providerId: ProviderId;
  status: ProviderStatus;
  uptime: number;
  avgResponseTime: number;
  successRate: number;
  lastIncident?: string;
  incidents: number;
}

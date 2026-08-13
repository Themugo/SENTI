/**
 * Legacy mock data — kept for backward compatibility with existing pages.
 * New pages should use the financial engine instead.
 */

import type {
  WalletBalanceLegacy, LegacyTransaction, Card, Invoice,
  PaymentLink, Subscription, EscrowTransaction, LegacyMerchant,
  ApiKey, Webhook, Notification, SupportTicket, ChartPoint,
} from '@/types';

export const mockWalletBalances: WalletBalanceLegacy[] = [
  { currency: 'USD', amount: 128_450.75, flag: '🇺🇸', pending: 3_200, change: 12.4 },
  { currency: 'KES', amount: 4_820_000, flag: '🇰🇪', pending: 45_000, change: 8.2 },
  { currency: 'EUR', amount: 34_120.5, flag: '🇪🇺', pending: 0, change: -2.1 },
  { currency: 'GBP', amount: 18_900.0, flag: '🇬🇧', pending: 1_200, change: 5.6 },
  { currency: 'NGN', amount: 12_500_000, flag: '🇳🇬', pending: 0, change: 15.3 },
  { currency: 'ZAR', amount: 245_000, flag: '🇿🇦', pending: 8_000, change: 3.7 },
  { currency: 'AED', amount: 89_500, flag: '🇦🇪', pending: 0, change: 1.2 },
];

export const mockTransactions: LegacyTransaction[] = [
  { id: 'tx_001', reference: 'TXN-9F2A1B', type: 'incoming', category: 'card_payment', status: 'completed', amount: 4_250.0, currency: 'USD', fee: 0, description: 'Payment from Acme Corp', counterparty: { name: 'Acme Corp', email: 'finance@acme.com' }, date: '2026-07-31T14:32:00Z', method: 'Card' },
  { id: 'tx_002', reference: 'TXN-3C8D9E', type: 'outgoing', category: 'internal_transfer', status: 'completed', amount: 1_800.0, currency: 'USD', fee: 2.5, description: 'Transfer to Sarah Kimani', counterparty: { name: 'Sarah Kimani', email: 'sarah@gmail.com' }, date: '2026-07-31T11:15:00Z', method: 'Wallet' },
  { id: 'tx_003', reference: 'TXN-5A1B2C', type: 'incoming', category: 'mpesa', status: 'pending', amount: 12_000.0, currency: 'KES', fee: 120, description: 'Checkout payment — Order #4821', counterparty: { name: 'John Mwangi', email: 'john.m@gmail.com' }, date: '2026-07-31T09:45:00Z', method: 'M-Pesa' },
  { id: 'tx_004', reference: 'TXN-7D4E5F', type: 'outgoing', category: 'subscription', status: 'completed', amount: 49.0, currency: 'USD', fee: 0, description: 'Figma — Monthly subscription', counterparty: { name: 'Figma Inc', email: 'billing@figma.com' }, date: '2026-07-30T16:00:00Z', method: 'Card' },
  { id: 'tx_005', reference: 'TXN-9G6H7I', type: 'exchange', category: 'currency_exchange', status: 'completed', amount: 2_000.0, currency: 'EUR', fee: 4.0, description: 'USD → EUR exchange', counterparty: { name: 'SENTI Exchange' }, date: '2026-07-30T13:20:00Z', method: 'Exchange' },
  { id: 'tx_006', reference: 'TXN-1J8K9L', type: 'incoming', category: 'invoice_payment', status: 'completed', amount: 8_750.0, currency: 'GBP', fee: 17.5, description: 'Invoice INV-0042 — Design services', counterparty: { name: 'London Studios Ltd', email: 'ap@londonstudios.co.uk' }, date: '2026-07-29T10:00:00Z', method: 'Bank Transfer' },
  { id: 'tx_007', reference: 'TXN-2M0N1P', type: 'outgoing', category: 'escrow_hold', status: 'processing', amount: 15_000.0, currency: 'USD', fee: 75, description: 'Escrow deposit — Project milestone', counterparty: { name: 'DevHub Agency', email: 'contact@devhub.io' }, date: '2026-07-29T08:30:00Z', method: 'Wallet' },
  { id: 'tx_008', reference: 'TXN-4Q3R4S', type: 'incoming', category: 'card_payment', status: 'completed', amount: 320.0, currency: 'USD', fee: 3.2, description: 'Payment link — Premium consultation', counterparty: { name: 'David Okafor', email: 'd.okafor@outlook.com' }, date: '2026-07-28T15:45:00Z', method: 'Payment Link' },
  { id: 'tx_009', reference: 'TXN-6T5U6V', type: 'outgoing', category: 'card_payment', status: 'completed', amount: 89.99, currency: 'USD', fee: 0, description: 'Amazon Web Services', counterparty: { name: 'Amazon Web Services', email: 'billing@aws.com' }, date: '2026-07-28T12:00:00Z', method: 'Card' },
  { id: 'tx_010', reference: 'TXN-8W7X8Y', type: 'incoming', category: 'subscription', status: 'completed', amount: 1_200.0, currency: 'USD', fee: 12, description: 'Subscription renewal — Pro Plan', counterparty: { name: 'TechFlow Solutions', email: 'billing@techflow.com' }, date: '2026-07-27T09:00:00Z', method: 'Card' },
  { id: 'tx_011', reference: 'TXN-0Z9A0B', type: 'outgoing', category: 'bank_transfer', status: 'failed', amount: 5_000.0, currency: 'NGN', fee: 0, description: 'Transfer to Chidi Obi', counterparty: { name: 'Chidi Obi', email: 'chidi@yahoo.com' }, date: '2026-07-27T07:30:00Z', method: 'Wallet' },
  { id: 'tx_012', reference: 'TXN-2C1D2E', type: 'incoming', category: 'refund', status: 'reversed', amount: 750.0, currency: 'USD', fee: 0, description: 'Refund — Order #3920', counterparty: { name: 'Maria Garcia', email: 'maria.g@gmail.com' }, date: '2026-07-26T14:00:00Z', method: 'Card' },
];

export const mockCards: Card[] = [
  { id: 'card_001', type: 'virtual', brand: 'visa', last4: '4242', expiry: '08/28', holder: 'SENTI USER', status: 'active', color: 'emerald', spendingLimit: 10_000, spent: 3_420.5 },
  { id: 'card_002', type: 'physical', brand: 'mastercard', last4: '8830', expiry: '11/27', holder: 'SENTI USER', status: 'active', color: 'dark', spendingLimit: 25_000, spent: 12_800.0 },
  { id: 'card_003', type: 'virtual', brand: 'visa', last4: '1029', expiry: '03/28', holder: 'SENTI USER', status: 'frozen', color: 'cyan', spendingLimit: 5_000, spent: 890.0 },
];

export const mockInvoices: Invoice[] = [
  { id: 'inv_001', number: 'INV-0042', client: 'London Studios Ltd', email: 'ap@londonstudios.co.uk', amount: 8_750, currency: 'GBP', status: 'paid', issueDate: '2026-07-15', dueDate: '2026-07-29', items: [{ description: 'Brand identity design', quantity: 1, rate: 5_000 }, { description: 'Website UI/UX design', quantity: 1, rate: 3_750 }] },
  { id: 'inv_002', number: 'INV-0043', client: 'Acme Corp', email: 'finance@acme.com', amount: 12_400, currency: 'USD', status: 'sent', issueDate: '2026-07-28', dueDate: '2026-08-11', items: [{ description: 'API integration consulting', quantity: 8, rate: 1_200 }, { description: 'Architecture review', quantity: 1, rate: 2_800 }] },
  { id: 'inv_003', number: 'INV-0044', client: 'TechFlow Solutions', email: 'billing@techflow.com', amount: 4_500, currency: 'USD', status: 'overdue', issueDate: '2026-06-30', dueDate: '2026-07-14', items: [{ description: 'Monthly retainer — Development', quantity: 1, rate: 4_500 }] },
  { id: 'inv_004', number: 'INV-0045', client: 'Nairobi Coffee Co.', email: 'ops@nairobicoffee.co.ke', amount: 320_000, currency: 'KES', status: 'draft', issueDate: '2026-07-31', dueDate: '2026-08-14', items: [{ description: 'POS system setup', quantity: 1, rate: 180_000 }, { description: 'Staff training', quantity: 4, rate: 35_000 }] },
  { id: 'inv_005', number: 'INV-0046', client: 'Dubai Trade Hub', email: 'accounts@dubaitrade.ae', amount: 22_000, currency: 'AED', status: 'sent', issueDate: '2026-07-30', dueDate: '2026-08-13', items: [{ description: 'Cross-border payment setup', quantity: 1, rate: 22_000 }] },
];

export const mockPaymentLinks: PaymentLink[] = [
  { id: 'pl_001', name: 'Premium Consultation', url: 'senti.pay/c/premium-consult', amount: 320, currency: 'USD', status: 'active', payments: 14, totalCollected: 4_480, createdAt: '2026-07-10' },
  { id: 'pl_002', name: 'Monthly Membership', url: 'senti.pay/c/membership', amount: 50, currency: 'USD', status: 'active', payments: 87, totalCollected: 4_350, createdAt: '2026-06-15' },
  { id: 'pl_003', name: 'One-time Setup Fee', url: 'senti.pay/c/setup-fee', amount: 1_200, currency: 'USD', status: 'inactive', payments: 3, totalCollected: 3_600, createdAt: '2026-05-20' },
  { id: 'pl_004', name: 'Event Registration', url: 'senti.pay/c/event-2026', amount: 75, currency: 'USD', status: 'active', payments: 42, totalCollected: 3_150, createdAt: '2026-07-01' },
];

export const mockSubscriptions: Subscription[] = [
  { id: 'sub_001', customer: 'TechFlow Solutions', email: 'billing@techflow.com', plan: 'Pro Plan', amount: 1_200, currency: 'USD', interval: 'monthly', status: 'active', nextBilling: '2026-08-27', startedAt: '2026-01-15' },
  { id: 'sub_002', customer: 'Acme Corp', email: 'finance@acme.com', plan: 'Business Plan', amount: 49, currency: 'USD', interval: 'monthly', status: 'active', nextBilling: '2026-08-12', startedAt: '2026-03-20' },
  { id: 'sub_003', customer: 'Nairobi Coffee Co.', email: 'ops@nairobicoffee.co.ke', plan: 'Starter Plan', amount: 5_000, currency: 'KES', interval: 'monthly', status: 'trialing', nextBilling: '2026-08-05', startedAt: '2026-07-22' },
  { id: 'sub_004', customer: 'London Studios Ltd', email: 'ap@londonstudios.co.uk', plan: 'Pro Plan', amount: 960, currency: 'GBP', interval: 'yearly', status: 'active', nextBilling: '2027-02-10', startedAt: '2026-02-10' },
  { id: 'sub_005', customer: 'Dubai Trade Hub', email: 'accounts@dubaitrade.ae', plan: 'Business Plan', amount: 180, currency: 'AED', interval: 'monthly', status: 'past_due', nextBilling: '2026-08-01', startedAt: '2026-04-05' },
];

export const mockEscrow: EscrowTransaction[] = [
  { id: 'esc_001', title: 'E-commerce Platform Build', buyer: 'Acme Corp', seller: 'DevHub Agency', amount: 45_000, currency: 'USD', status: 'funded', createdAt: '2026-07-15', milestones: [
    { id: 'ms_1', title: 'Design & Wireframes', description: 'Complete UI/UX design and wireframes for all pages', amount: 10_000, status: 'released', dueDate: '2026-07-25' },
    { id: 'ms_2', title: 'Frontend Development', description: 'Implement all frontend pages with responsive design', amount: 15_000, status: 'approved', dueDate: '2026-08-10' },
    { id: 'ms_3', title: 'Backend & Integration', description: 'Build API, database, and payment integration', amount: 12_000, status: 'pending', dueDate: '2026-08-25' },
    { id: 'ms_4', title: 'Testing & Launch', description: 'QA testing, bug fixes, and production deployment', amount: 8_000, status: 'pending', dueDate: '2026-09-05' },
  ]},
  { id: 'esc_002', title: 'Bulk Goods Purchase — Electronics', buyer: 'SENTI User', seller: 'Shenzhen Electronics Co.', amount: 22_500, currency: 'USD', status: 'pending', createdAt: '2026-07-28', milestones: [
    { id: 'ms_5', title: 'Full Payment', description: 'Payment held in escrow until delivery confirmation', amount: 22_500, status: 'pending', dueDate: '2026-08-15' },
  ]},
  { id: 'esc_003', title: 'Freelance Design Project', buyer: 'London Studios Ltd', seller: 'SENTI User', amount: 8_750, currency: 'GBP', status: 'released', createdAt: '2026-06-20', milestones: [
    { id: 'ms_6', title: 'Full Delivery', description: 'Brand identity and website design', amount: 8_750, status: 'released', dueDate: '2026-07-29' },
  ]},
];

export const mockMerchants: LegacyMerchant[] = [
  { id: 'm_001', businessName: 'Acme Corp', email: 'finance@acme.com', category: 'Technology', verificationStatus: 'verified', monthlyVolume: 240_000, payoutBalance: 48_200, joinedAt: '2025-03-15', country: 'United States' },
  { id: 'm_002', businessName: 'Nairobi Coffee Co.', email: 'ops@nairobicoffee.co.ke', category: 'Food & Beverage', verificationStatus: 'verified', monthlyVolume: 1_850_000, payoutBalance: 320_000, joinedAt: '2025-06-20', country: 'Kenya' },
  { id: 'm_003', businessName: 'London Studios Ltd', email: 'ap@londonstudios.co.uk', category: 'Creative Services', verificationStatus: 'verified', monthlyVolume: 95_000, payoutBalance: 12_400, joinedAt: '2025-01-10', country: 'United Kingdom' },
  { id: 'm_004', businessName: 'Dubai Trade Hub', email: 'accounts@dubaitrade.ae', category: 'Import/Export', verificationStatus: 'pending', monthlyVolume: 320_000, payoutBalance: 0, joinedAt: '2026-04-05', country: 'United Arab Emirates' },
  { id: 'm_005', businessName: 'Lagos Fashion House', email: 'hello@lagosfashion.ng', category: 'Retail', verificationStatus: 'pending', monthlyVolume: 8_900_000, payoutBalance: 2_100_000, joinedAt: '2026-02-28', country: 'Nigeria' },
];

export const mockApiKeys: ApiKey[] = [
  { id: 'key_001', name: 'Production Server', key: 'sk_live_4f2a8b9c1d2e3f4a5b6c7d8e9f0a1b2c', environment: 'live', createdAt: '2026-01-15', lastUsed: '2026-07-31', permissions: ['read', 'write', 'payments', 'refunds'] },
  { id: 'key_002', name: 'Sandbox Testing', key: 'sk_test_9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d', environment: 'test', createdAt: '2026-01-15', lastUsed: '2026-07-30', permissions: ['read', 'write', 'payments'] },
  { id: 'key_003', name: 'Mobile App', key: 'sk_live_1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d', environment: 'live', createdAt: '2026-03-20', lastUsed: '2026-07-29', permissions: ['read', 'payments'] },
];

export const mockWebhooks: Webhook[] = [
  { id: 'wh_001', url: 'https://api.acme.com/webhooks/senti', events: ['payment.completed', 'payment.failed', 'refund.created'], status: 'active', lastDelivery: '2026-07-31', successRate: 99.8 },
  { id: 'wh_002', url: 'https://hooks.techflow.com/senti-events', events: ['subscription.created', 'subscription.cancelled', 'invoice.paid'], status: 'active', lastDelivery: '2026-07-30', successRate: 100 },
  { id: 'wh_003', url: 'https://staging.londonstudios.co.uk/senti-hook', events: ['payment.completed'], status: 'inactive', lastDelivery: '2026-07-15', successRate: 87.5 },
];

export const mockNotifications: Notification[] = [
  { id: 'n_001', type: 'payment', title: 'Payment received', message: 'You received $4,250.00 from Acme Corp', timestamp: '2026-07-31T14:32:00Z', read: false },
  { id: 'n_002', type: 'invoice', title: 'Invoice paid', message: 'Invoice INV-0042 has been paid (£8,750.00)', timestamp: '2026-07-29T10:00:00Z', read: false },
  { id: 'n_003', type: 'security', title: 'New device login', message: 'Login detected from Nairobi, Kenya — MacBook Pro', timestamp: '2026-07-28T18:45:00Z', read: true },
  { id: 'n_004', type: 'card', title: 'Card transaction', message: 'Your Visa ending 4242 was charged $89.99 at Amazon Web Services', timestamp: '2026-07-28T12:00:00Z', read: true },
  { id: 'n_005', type: 'transfer', title: 'Transfer completed', message: 'You sent $1,800.00 to Sarah Kimani', timestamp: '2026-07-31T11:15:00Z', read: false },
  { id: 'n_006', type: 'system', title: 'New feature available', message: 'AI Financial Assistant is now available in your dashboard', timestamp: '2026-07-27T09:00:00Z', read: true },
];

export const mockSupportTickets: SupportTicket[] = [
  { id: 'tkt_001', subject: 'Payment not reflecting in wallet', category: 'Payments', priority: 'high', status: 'open', createdAt: '2026-07-31', requester: 'Acme Corp' },
  { id: 'tkt_002', subject: 'Unable to verify business documents', category: 'Verification', priority: 'medium', status: 'pending', createdAt: '2026-07-30', requester: 'Dubai Trade Hub' },
  { id: 'tkt_003', subject: 'Request for higher transaction limits', category: 'Account', priority: 'low', status: 'open', createdAt: '2026-07-29', requester: 'Lagos Fashion House' },
  { id: 'tkt_004', subject: 'Escrow dispute — milestone 2', category: 'Escrow', priority: 'urgent', status: 'pending', createdAt: '2026-07-28', requester: 'Acme Corp' },
];

export const mockRevenueData: ChartPoint[] = [
  { label: 'Jan', value: 42_000, secondary: 38_000 },
  { label: 'Feb', value: 48_000, secondary: 41_000 },
  { label: 'Mar', value: 55_000, secondary: 47_000 },
  { label: 'Apr', value: 52_000, secondary: 50_000 },
  { label: 'May', value: 68_000, secondary: 55_000 },
  { label: 'Jun', value: 72_000, secondary: 61_000 },
  { label: 'Jul', value: 89_000, secondary: 72_000 },
];

export const mockVolumeData: ChartPoint[] = [
  { label: 'Mon', value: 12_400 },
  { label: 'Tue', value: 18_200 },
  { label: 'Wed', value: 15_800 },
  { label: 'Thu', value: 22_100 },
  { label: 'Fri', value: 28_500 },
  { label: 'Sat', value: 19_300 },
  { label: 'Sun', value: 14_700 },
];

export const mockCurrencyBreakdown = [
  { name: 'USD', value: 45, color: 'hsl(160 84% 35%)' },
  { name: 'KES', value: 22, color: 'hsl(186 90% 45%)' },
  { name: 'EUR', value: 12, color: 'hsl(142 71% 45%)' },
  { name: 'GBP', value: 8, color: 'hsl(38 92% 55%)' },
  { name: 'NGN', value: 7, color: 'hsl(0 72% 55%)' },
  { name: 'ZAR', value: 4, color: 'hsl(280 60% 55%)' },
  { name: 'AED', value: 2, color: 'hsl(200 80% 50%)' },
];

export const mockAdminStats = {
  totalMerchants: 12_840,
  totalVolume: 842_000_000,
  totalTransactions: 1_892_400,
  activeUsers: 84_200,
  pendingVerifications: 142,
  openDisputes: 38,
  systemUptime: 99.98,
  avgResponseTime: 142,
};

export const mockAdminRevenueData: ChartPoint[] = [
  { label: 'Jan', value: 2_400_000 },
  { label: 'Feb', value: 2_850_000 },
  { label: 'Mar', value: 3_120_000 },
  { label: 'Apr', value: 3_480_000 },
  { label: 'May', value: 4_100_000 },
  { label: 'Jun', value: 4_720_000 },
  { label: 'Jul', value: 5_340_000 },
];

export const mockAdminGeoData = [
  { country: 'United States', flag: '🇺🇸', volume: 284_000_000, share: 33.7 },
  { country: 'Kenya', flag: '🇰🇪', volume: 156_000_000, share: 18.5 },
  { country: 'Nigeria', flag: '🇳🇬', volume: 142_000_000, share: 16.9 },
  { country: 'United Kingdom', flag: '🇬🇧', volume: 98_000_000, share: 11.6 },
  { country: 'South Africa', flag: '🇿🇦', volume: 72_000_000, share: 8.6 },
  { country: 'UAE', flag: '🇦🇪', volume: 54_000_000, share: 6.4 },
  { country: 'Other', flag: '🌍', volume: 36_000_000, share: 4.3 },
];

export const mockSystemServices = [
  { name: 'Payment Gateway', status: 'operational', uptime: 99.99, latency: 45 },
  { name: 'Wallet Service', status: 'operational', uptime: 100, latency: 28 },
  { name: 'Card Processing', status: 'operational', uptime: 99.97, latency: 120 },
  { name: 'Exchange Engine', status: 'operational', uptime: 99.95, latency: 89 },
  { name: 'Escrow Service', status: 'degraded', uptime: 98.80, latency: 340 },
  { name: 'API Gateway', status: 'operational', uptime: 99.99, latency: 32 },
  { name: 'Webhook Delivery', status: 'operational', uptime: 99.92, latency: 67 },
  { name: 'Mobile Money Bridge', status: 'operational', uptime: 99.88, latency: 210 },
];

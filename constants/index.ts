import type { CurrencyCode, CurrencyMeta, FeeRule } from '@/types';

export const CURRENCIES: Record<CurrencyCode, Omit<CurrencyMeta, 'code'>> = {
  USD: { symbol: '$', flag: '🇺🇸', name: 'US Dollar', decimals: 2, rateToUSD: 1 },
  KES: { symbol: 'KSh', flag: '🇰🇪', name: 'Kenyan Shilling', decimals: 2, rateToUSD: 0.0063 },
  EUR: { symbol: '€', flag: '🇪🇺', name: 'Euro', decimals: 2, rateToUSD: 1.087 },
  GBP: { symbol: '£', flag: '🇬🇧', name: 'British Pound', decimals: 2, rateToUSD: 1.266 },
  NGN: { symbol: '₦', flag: '🇳🇬', name: 'Nigerian Naira', decimals: 2, rateToUSD: 0.00064 },
  TZS: { symbol: 'TSh', flag: '🇹🇿', name: 'Tanzanian Shilling', decimals: 2, rateToUSD: 0.00039 },
  UGX: { symbol: 'USh', flag: '🇺🇬', name: 'Ugandan Shilling', decimals: 0, rateToUSD: 0.00027 },
  RWF: { symbol: 'RWF', flag: '🇷🇼', name: 'Rwandan Franc', decimals: 0, rateToUSD: 0.00078 },
  AED: { symbol: 'AED', flag: '🇦🇪', name: 'UAE Dirham', decimals: 2, rateToUSD: 0.272 },
  CAD: { symbol: 'C$', flag: '🇨🇦', name: 'Canadian Dollar', decimals: 2, rateToUSD: 0.731 },
  AUD: { symbol: 'A$', flag: '🇦🇺', name: 'Australian Dollar', decimals: 2, rateToUSD: 0.665 },
  JPY: { symbol: '¥', flag: '🇯🇵', name: 'Japanese Yen', decimals: 0, rateToUSD: 0.0067 },
  CHF: { symbol: 'CHF', flag: '🇨🇭', name: 'Swiss Franc', decimals: 2, rateToUSD: 1.123 },
  ZAR: { symbol: 'R', flag: '🇿🇦', name: 'South African Rand', decimals: 2, rateToUSD: 0.054 },
};

export const EXCHANGE_RATES: Record<CurrencyCode, number> = Object.fromEntries(
  Object.entries(CURRENCIES).map(([code, meta]) => [code, 1 / meta.rateToUSD]),
) as Record<CurrencyCode, number>;

export const CURRENCY_LIST = Object.entries(CURRENCIES).map(([code, meta]) => ({
  code: code as CurrencyCode,
  ...meta,
}));

export const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'Wallet', href: '/wallet', icon: 'Wallet' },
  { label: 'Transactions', href: '/transactions', icon: 'ArrowLeftRight' },
  { label: 'Send Money', href: '/send-money', icon: 'Send' },
  { label: 'Receive Money', href: '/receive-money', icon: 'Download' },
  { label: 'Payment Links', href: '/payment-links', icon: 'Link2' },
  { label: 'Invoices', href: '/invoices', icon: 'FileText' },
  { label: 'Subscriptions', href: '/subscriptions', icon: 'Repeat' },
  { label: 'Merchant', href: '/merchant', icon: 'Store' },
  { label: 'Checkout', href: '/checkout', icon: 'ShoppingCart' },
  { label: 'Escrow', href: '/escrow', icon: 'Shield' },
  { label: 'Cards', href: '/cards', icon: 'CreditCard' },
  { label: 'Exchange', href: '/exchange', icon: 'RefreshCw' },
  { label: 'Analytics', href: '/analytics', icon: 'BarChart3' },
  { label: 'Developer API', href: '/developer', icon: 'Code2' },
  { label: 'Settings', href: '/settings', icon: 'Settings' },
  { label: 'Notifications', href: '/notifications', icon: 'Bell' },
] as const;

export const ADMIN_NAV_ITEMS = [
  { label: 'Admin Dashboard', href: '/admin', icon: 'ShieldCheck' },
  { label: 'Merchants', href: '/admin#merchants', icon: 'Store' },
  { label: 'Transactions', href: '/admin#transactions', icon: 'ArrowLeftRight' },
  { label: 'Compliance', href: '/admin#compliance', icon: 'FileCheck' },
  { label: 'Risk', href: '/admin#risk', icon: 'AlertTriangle' },
  { label: 'Support', href: '/admin#support', icon: 'LifeBuoy' },
  { label: 'System Health', href: '/admin#health', icon: 'Activity' },
] as const;

export const FOOTER_LINKS = {
  Product: [
    { label: 'Wallet', href: '/wallet' },
    { label: 'Payments', href: '/send-money' },
    { label: 'Cards', href: '/cards' },
    { label: 'Escrow', href: '/escrow' },
    { label: 'Checkout', href: '/checkout' },
  ],
  Business: [
    { label: 'Merchant', href: '/merchant' },
    { label: 'Invoices', href: '/invoices' },
    { label: 'Subscriptions', href: '/subscriptions' },
    { label: 'Developer API', href: '/developer' },
    { label: 'Analytics', href: '/analytics' },
  ],
  Company: [
    { label: 'Pricing', href: '/pricing' },
    { label: 'Documentation', href: '/docs' },
    { label: 'Help Center', href: '/help' },
    { label: 'About', href: '#' },
  ],
  Legal: [
    { label: 'Privacy', href: '#' },
    { label: 'Terms', href: '#' },
    { label: 'Security', href: '#' },
    { label: 'Compliance', href: '#' },
  ],
};

export const PAYMENT_METHODS = [
  { id: 'visa', label: 'Visa', icon: 'CreditCard', desc: 'Credit or debit card' },
  { id: 'mastercard', label: 'Mastercard', icon: 'CreditCard', desc: 'Credit or debit card' },
  { id: 'mpesa', label: 'M-Pesa', icon: 'Smartphone', desc: 'Mobile money — Kenya' },
  { id: 'airtel', label: 'Airtel Money', icon: 'Smartphone', desc: 'Mobile money' },
  { id: 'bank', label: 'Bank Transfer', icon: 'Landmark', desc: 'Direct bank transfer' },
  { id: 'applepay', label: 'Apple Pay', icon: 'Apple', desc: 'Pay with Apple Pay' },
  { id: 'googlepay', label: 'Google Pay', icon: 'Smartphone', desc: 'Pay with Google Pay' },
  { id: 'paypal', label: 'PayPal', icon: 'Wallet', desc: 'Pay with PayPal' },
] as const;

export const PRICING_PLANS = [
  {
    name: 'Personal',
    price: 0,
    description: 'Everything you need to manage your money across borders.',
    features: [
      'Multi-currency wallet (13 currencies)',
      'Free transfers between SENTI users',
      'Virtual card included',
      'Payment links',
      'Up to $2,000 monthly volume',
    ],
    cta: 'Get started',
    highlighted: false,
  },
  {
    name: 'Business',
    price: 49,
    description: 'For growing businesses that need powerful payment tools.',
    features: [
      'Everything in Personal',
      'Merchant checkout & payment links',
      'Unlimited invoices & subscriptions',
      'Team accounts (5 seats)',
      'Escrow protection',
      'API access (1M requests/mo)',
      'Priority support',
    ],
    cta: 'Start free trial',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: null,
    description: 'For high-volume businesses with custom requirements.',
    features: [
      'Everything in Business',
      'Unlimited team seats',
      'Dedicated account manager',
      'Custom integrations & SLAs',
      'Advanced risk & compliance tools',
      'Volume-based pricing',
    ],
    cta: 'Contact sales',
    highlighted: false,
  },
];

export const COUNTRIES = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
];

// ─── Fee Rules ───────────────────────────────────────────────

export const FEE_RULES: FeeRule[] = [
  { id: 'fee_card', name: 'Card Payment Fee', type: 'percentage', rate: 0.029, flatAmount: 0.30, currency: 'USD', appliesTo: ['card_payment'] },
  { id: 'fee_bank', name: 'Bank Transfer Fee', type: 'flat', rate: 0, flatAmount: 1.50, currency: 'USD', appliesTo: ['bank_transfer'] },
  { id: 'fee_mpesa', name: 'M-Pesa Fee', type: 'percentage', rate: 0.01, flatAmount: 0, currency: 'KES', appliesTo: ['mpesa'] },
  { id: 'fee_airtel', name: 'Airtel Money Fee', type: 'percentage', rate: 0.01, flatAmount: 0, currency: 'KES', appliesTo: ['airtel_money'] },
  { id: 'fee_fx', name: 'FX Fee', type: 'fx', rate: 0.005, flatAmount: 0, currency: 'USD', appliesTo: ['currency_exchange'] },
  { id: 'fee_settlement', name: 'Settlement Fee', type: 'settlement', rate: 0.001, flatAmount: 0, currency: 'USD', appliesTo: ['merchant_settlement'] },
  { id: 'fee_merchant', name: 'Merchant Fee', type: 'merchant', rate: 0.025, flatAmount: 0, currency: 'USD', appliesTo: ['card_payment', 'mpesa', 'bank_transfer'] },
  { id: 'fee_platform', name: 'Platform Fee', type: 'platform', rate: 0.001, flatAmount: 0, currency: 'USD', appliesTo: ['deposit', 'withdrawal', 'internal_transfer'] },
];

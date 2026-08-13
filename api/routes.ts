/**
 * SENTI API Route Registry
 * Centralized route definitions for all backend endpoints.
 * When the backend is ready, update the base URL in client.ts
 * and these routes will resolve automatically.
 */

export const API_ROUTES = {
  auth: {
    login: '/auth/login',
    signup: '/auth/signup',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    verifyOtp: '/auth/verify-otp',
    enable2fa: '/auth/2fa/enable',
    verify2fa: '/auth/2fa/verify',
  },
  wallet: {
    balances: '/wallet/balances',
    deposit: '/wallet/deposit',
    withdraw: '/wallet/withdraw',
    transfer: '/wallet/transfer',
    exchange: '/wallet/exchange',
    transactions: '/wallet/transactions',
  },
  payments: {
    create: '/payments',
    list: '/payments',
    details: (id: string) => `/payments/${id}`,
    refund: (id: string) => `/payments/${id}/refund`,
    links: '/payments/links',
    linkDetails: (id: string) => `/payments/links/${id}`,
  },
  merchant: {
    profile: '/merchant/profile',
    sales: '/merchant/sales',
    customers: '/merchant/customers',
    products: '/merchant/products',
    settlements: '/merchant/settlements',
    verify: '/merchant/verify',
  },
  escrow: {
    list: '/escrow',
    create: '/escrow',
    details: (id: string) => `/escrow/${id}`,
    release: (id: string) => `/escrow/${id}/release`,
    dispute: (id: string) => `/escrow/${id}/dispute`,
    milestone: (escrowId: string, milestoneId: string) =>
      `/escrow/${escrowId}/milestones/${milestoneId}`,
  },
  cards: {
    list: '/cards',
    create: '/cards',
    details: (id: string) => `/cards/${id}`,
    freeze: (id: string) => `/cards/${id}/freeze`,
    unfreeze: (id: string) => `/cards/${id}/unfreeze`,
    delete: (id: string) => `/cards/${id}`,
  },
  transactions: {
    list: '/transactions',
    details: (id: string) => `/transactions/${id}`,
    export: '/transactions/export',
  },
  invoices: {
    list: '/invoices',
    create: '/invoices',
    details: (id: string) => `/invoices/${id}`,
    send: (id: string) => `/invoices/${id}/send`,
  },
  subscriptions: {
    list: '/subscriptions',
    create: '/subscriptions',
    cancel: (id: string) => `/subscriptions/${id}/cancel`,
  },
  analytics: {
    overview: '/analytics/overview',
    revenue: '/analytics/revenue',
    volume: '/analytics/volume',
    breakdown: '/analytics/breakdown',
  },
  developer: {
    apiKeys: '/developer/api-keys',
    webhooks: '/developer/webhooks',
    logs: '/developer/logs',
  },
  admin: {
    stats: '/admin/stats',
    merchants: '/admin/merchants',
    compliance: '/admin/compliance',
    risk: '/admin/risk',
    support: '/admin/support',
    health: '/admin/health',
  },
} as const;

/**
 * Mock data re-exports for backward compatibility.
 * The real data is now loaded from Supabase via the data-access layer.
 */

export { financialEngine, engineCache } from '@/services/financial-engine';
export {
  mockWalletBalances,
  mockTransactions,
  mockCards,
  mockInvoices,
  mockPaymentLinks,
  mockSubscriptions,
  mockEscrow,
  mockMerchants,
  mockApiKeys,
  mockWebhooks,
  mockNotifications,
  mockSupportTickets,
  mockRevenueData,
  mockVolumeData,
  mockCurrencyBreakdown,
  mockAdminStats,
  mockAdminRevenueData,
  mockAdminGeoData,
  mockSystemServices,
} from './legacy-mock-data';

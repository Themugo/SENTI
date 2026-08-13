/**
 * Mock Provider Adapters
 * 13 providers implementing IPaymentProvider.
 * Each returns realistic mock data with simulated latency.
 * Swap any adapter for a real implementation with zero core changes.
 */

import type {
  IPaymentProvider,
  InitializePaymentInput,
  InitializePaymentResult,
  RefundInput,
  CreateCustomerInput,
  CreateCustomerResult,
  VerifySignatureInput,
  SettlementReportInput,
  SettlementReportResult,
} from './provider.interface';
import type {
  Provider, ProviderId, ProviderHealth, CurrencyCode,
  PaymentIntent, Refund, PaymentMethod,
} from '@/types';

function delay<T>(data: T, ms = 300 + Math.random() * 500): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

function genId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`.toUpperCase();
}

const PROVIDER_CONFIGS: Record<ProviderId, Omit<Provider, 'id'>> = {
  visa: { name: 'Visa', category: 'card', status: 'operational', supportedCurrencies: ['USD','EUR','GBP','KES','NGN','ZAR','AED','CAD','AUD','JPY','CHF'], supportedCountries: ['US','GB','KE','NG','ZA','AE','DE','FR','CA','AU','IN','BR'], processingFeeRate: 0.029, processingFeeFlat: 0.30, avgProcessingTime: 1200, successRate: 99.2, priority: 1, enabled: true, failoverTo: 'mastercard' },
  mastercard: { name: 'Mastercard', category: 'card', status: 'operational', supportedCurrencies: ['USD','EUR','GBP','KES','NGN','ZAR','AED','CAD','AUD','JPY','CHF'], supportedCountries: ['US','GB','KE','NG','ZA','AE','DE','FR','CA','AU','IN','BR'], processingFeeRate: 0.029, processingFeeFlat: 0.30, avgProcessingTime: 1100, successRate: 99.1, priority: 2, enabled: true, failoverTo: 'visa' },
  amex: { name: 'American Express', category: 'card', status: 'operational', supportedCurrencies: ['USD','EUR','GBP','CAD','AUD','JPY','CHF'], supportedCountries: ['US','GB','AE','DE','FR','CA','AU'], processingFeeRate: 0.035, processingFeeFlat: 0.30, avgProcessingTime: 1300, successRate: 98.5, priority: 3, enabled: true, failoverTo: 'visa' },
  unionpay: { name: 'UnionPay', category: 'card', status: 'operational', supportedCurrencies: ['USD','JPY','GBP','EUR'], supportedCountries: ['CN','US','GB','JP'], processingFeeRate: 0.025, processingFeeFlat: 0.20, avgProcessingTime: 1500, successRate: 97.8, priority: 4, enabled: true, failoverTo: 'visa' },
  mpesa: { name: 'M-Pesa', category: 'mobile_money', status: 'operational', supportedCurrencies: ['KES'], supportedCountries: ['KE'], processingFeeRate: 0.01, processingFeeFlat: 0, avgProcessingTime: 2000, successRate: 98.5, priority: 1, enabled: true },
  airtel_money: { name: 'Airtel Money', category: 'mobile_money', status: 'operational', supportedCurrencies: ['KES','UGX','TZS','RWF'], supportedCountries: ['KE','UG','TZ','RW'], processingFeeRate: 0.01, processingFeeFlat: 0, avgProcessingTime: 2200, successRate: 97.2, priority: 2, enabled: true, failoverTo: 'mpesa' },
  bank_transfer: { name: 'Bank Transfer', category: 'bank', status: 'operational', supportedCurrencies: ['USD','EUR','GBP','KES','NGN','ZAR','AED','CAD','AUD','JPY','CHF'], supportedCountries: ['US','GB','KE','NG','ZA','AE','DE','FR','CA','AU','IN','BR'], processingFeeRate: 0.005, processingFeeFlat: 1.50, avgProcessingTime: 5000, successRate: 99.5, priority: 5, enabled: true },
  pesalink: { name: 'PesaLink', category: 'bank', status: 'operational', supportedCurrencies: ['KES'], supportedCountries: ['KE'], processingFeeRate: 0.008, processingFeeFlat: 0, avgProcessingTime: 3000, successRate: 99.0, priority: 3, enabled: true, failoverTo: 'bank_transfer' },
  apple_pay: { name: 'Apple Pay', category: 'wallet', status: 'operational', supportedCurrencies: ['USD','EUR','GBP','CAD','AUD','JPY','CHF'], supportedCountries: ['US','GB','DE','FR','CA','AU','JP'], processingFeeRate: 0.029, processingFeeFlat: 0.30, avgProcessingTime: 800, successRate: 99.5, priority: 1, enabled: true, failoverTo: 'visa' },
  google_pay: { name: 'Google Pay', category: 'wallet', status: 'operational', supportedCurrencies: ['USD','EUR','GBP','KES','NGN','ZAR','AED','CAD','AUD','JPY','CHF'], supportedCountries: ['US','GB','KE','NG','ZA','AE','DE','FR','CA','AU','IN','BR'], processingFeeRate: 0.029, processingFeeFlat: 0.30, avgProcessingTime: 900, successRate: 99.4, priority: 2, enabled: true, failoverTo: 'mastercard' },
  paypal: { name: 'PayPal', category: 'wallet', status: 'operational', supportedCurrencies: ['USD','EUR','GBP','CAD','AUD','JPY','CHF'], supportedCountries: ['US','GB','DE','FR','CA','AU','JP','BR'], processingFeeRate: 0.039, processingFeeFlat: 0.49, avgProcessingTime: 1500, successRate: 98.0, priority: 3, enabled: true },
  crypto: { name: 'Crypto', category: 'crypto', status: 'maintenance', supportedCurrencies: ['USD'], supportedCountries: [], processingFeeRate: 0.01, processingFeeFlat: 0, avgProcessingTime: 10000, successRate: 95.0, priority: 10, enabled: false },
  open_banking: { name: 'Open Banking', category: 'open_banking', status: 'maintenance', supportedCurrencies: ['EUR','GBP'], supportedCountries: ['GB','DE','FR'], processingFeeRate: 0.005, processingFeeFlat: 0.25, avgProcessingTime: 3000, successRate: 97.0, priority: 8, enabled: false },
};

function createMockProvider(id: ProviderId): IPaymentProvider {
  const config = PROVIDER_CONFIGS[id];
  const provider: Provider = { id, ...config };

  return {
    id,
    name: config.name,

    async initializePayment(input: InitializePaymentInput): Promise<InitializePaymentResult> {
      const intentId = genId('PI');
      const providerRef = genId(id.toUpperCase().replace(/_/g, ''));
      const fee = input.amount * config.processingFeeRate + config.processingFeeFlat;
      return delay({
        intentId,
        status: 'requires_confirmation',
        providerReference: providerRef,
        clientSecret: `${intentId}_secret_${Math.random().toString(36).slice(2, 10)}`,
      });
    },

    async authorizePayment(intentId: string): Promise<{ authorized: boolean; status: PaymentIntent['status'] }> {
      const success = Math.random() < config.successRate / 100;
      return delay({
        authorized: success,
        status: success ? 'processing' : 'failed',
      });
    },

    async capturePayment(intentId: string): Promise<{ captured: boolean; status: PaymentIntent['status'] }> {
      const success = Math.random() < config.successRate / 100;
      return delay({
        captured: success,
        status: success ? 'succeeded' : 'failed',
      });
    },

    async cancelPayment(intentId: string): Promise<{ cancelled: boolean; status: PaymentIntent['status'] }> {
      return delay({ cancelled: true, status: 'cancelled' });
    },

    async refundPayment(input: RefundInput): Promise<{ refundId: string; status: Refund['status'] }> {
      return delay({
        refundId: genId('RFD'),
        status: 'processing',
      });
    },

    async createCustomer(input: CreateCustomerInput): Promise<CreateCustomerResult> {
      return delay({
        customerId: genId('CUS'),
        email: input.email,
      });
    },

    verifySignature(input: VerifySignatureInput): boolean {
      // Mock: always valid if secret is non-empty
      return input.secret.length > 0;
    },

    async getSettlementReport(input: SettlementReportInput): Promise<SettlementReportResult> {
      const txCount = Math.floor(Math.random() * 500) + 50;
      const volume = txCount * (100 + Math.random() * 500);
      const fees = volume * config.processingFeeRate;
      return delay({
        providerId: id,
        totalVolume: Math.round(volume),
        totalFees: Math.round(fees),
        netAmount: Math.round(volume - fees),
        transactionCount: txCount,
        currency: 'USD',
      });
    },

    async healthCheck(): Promise<ProviderHealth> {
      return delay({
        providerId: id,
        status: config.status,
        uptime: 99.9 - Math.random() * 0.5,
        avgResponseTime: config.avgProcessingTime + Math.random() * 200,
        successRate: config.successRate - Math.random() * 0.5,
        incidents: Math.floor(Math.random() * 3),
      });
    },

    getProvider(): Provider {
      return { ...provider };
    },
  };
}

// Create all provider instances
export const visaProvider = createMockProvider('visa');
export const mastercardProvider = createMockProvider('mastercard');
export const amexProvider = createMockProvider('amex');
export const unionpayProvider = createMockProvider('unionpay');
export const mpesaProvider = createMockProvider('mpesa');
export const airtelMoneyProvider = createMockProvider('airtel_money');
export const bankTransferProvider = createMockProvider('bank_transfer');
export const pesalinkProvider = createMockProvider('pesalink');
export const applePayProvider = createMockProvider('apple_pay');
export const googlePayProvider = createMockProvider('google_pay');
export const paypalProvider = createMockProvider('paypal');
export const cryptoProvider = createMockProvider('crypto');
export const openBankingProvider = createMockProvider('open_banking');

export const ALL_PROVIDERS: IPaymentProvider[] = [
  visaProvider, mastercardProvider, amexProvider, unionpayProvider,
  mpesaProvider, airtelMoneyProvider, bankTransferProvider, pesalinkProvider,
  applePayProvider, googlePayProvider, paypalProvider,
  cryptoProvider, openBankingProvider,
];

export const PROVIDER_MAP: Record<ProviderId, IPaymentProvider> = Object.fromEntries(
  ALL_PROVIDERS.map((p) => [p.id, p]),
) as Record<ProviderId, IPaymentProvider>;

export { PROVIDER_CONFIGS };

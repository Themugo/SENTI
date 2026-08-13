/**
 * Payment Provider Interface
 * Every provider adapter must implement this interface.
 * The Core NEVER depends directly on any provider — only on this interface.
 */

import type {
  PaymentIntent, Refund, CurrencyCode, PaymentMethod, ProviderId,
  ProviderHealth, Provider,
} from '@/types';

export interface InitializePaymentInput {
  amount: number;
  currency: CurrencyCode;
  paymentMethod: PaymentMethod;
  merchantId: string;
  customerEmail?: string;
  description?: string;
  metadata?: Record<string, string>;
}

export interface InitializePaymentResult {
  intentId: string;
  status: PaymentIntent['status'];
  providerReference: string;
  redirectUrl?: string;
  clientSecret?: string;
}

export interface RefundInput {
  providerReference: string;
  amount: number;
  currency: CurrencyCode;
  reason: string;
}

export interface SettlementReportInput {
  fromDate: string;
  toDate: string;
}

export interface SettlementReportResult {
  providerId: ProviderId;
  totalVolume: number;
  totalFees: number;
  netAmount: number;
  transactionCount: number;
  currency: CurrencyCode;
}

export interface CreateCustomerInput {
  email: string;
  name: string;
  phone?: string;
  metadata?: Record<string, string>;
}

export interface CreateCustomerResult {
  customerId: string;
  email: string;
}

export interface VerifySignatureInput {
  payload: string;
  signature: string;
  secret: string;
}

/**
 * The universal provider interface.
 * All 13+ providers implement this — swap mock for real with zero core changes.
 */
export interface IPaymentProvider {
  readonly id: ProviderId;
  readonly name: string;

  initializePayment(input: InitializePaymentInput): Promise<InitializePaymentResult>;
  authorizePayment(intentId: string): Promise<{ authorized: boolean; status: PaymentIntent['status'] }>;
  capturePayment(intentId: string): Promise<{ captured: boolean; status: PaymentIntent['status'] }>;
  cancelPayment(intentId: string): Promise<{ cancelled: boolean; status: PaymentIntent['status'] }>;
  refundPayment(input: RefundInput): Promise<{ refundId: string; status: Refund['status'] }>;
  createCustomer(input: CreateCustomerInput): Promise<CreateCustomerResult>;
  verifySignature(input: VerifySignatureInput): boolean;
  getSettlementReport(input: SettlementReportInput): Promise<SettlementReportResult>;
  healthCheck(): Promise<ProviderHealth>;
  getProvider(): Provider;
}

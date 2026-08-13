# Provider Interface

## Overview

Every payment provider implements the `IPaymentProvider` interface. This ensures the Core never depends on any specific provider implementation.

## Interface Definition

```typescript
interface IPaymentProvider {
  readonly id: ProviderId;
  readonly name: string;

  initializePayment(input: InitializePaymentInput): Promise<InitializePaymentResult>;
  authorizePayment(intentId: string): Promise<{ authorized: boolean; status: PaymentIntentStatus }>;
  capturePayment(intentId: string): Promise<{ captured: boolean; status: PaymentIntentStatus }>;
  cancelPayment(intentId: string): Promise<{ cancelled: boolean; status: PaymentIntentStatus }>;
  refundPayment(input: RefundInput): Promise<{ refundId: string; status: RefundStatus }>;
  createCustomer(input: CreateCustomerInput): Promise<CreateCustomerResult>;
  verifySignature(input: VerifySignatureInput): boolean;
  getSettlementReport(input: SettlementReportInput): Promise<SettlementReportResult>;
  healthCheck(): Promise<ProviderHealth>;
  getProvider(): Provider;
}
```

## Implemented Providers (13)

| Provider | Category | Currencies | Status |
|----------|----------|------------|--------|
| Visa | Card | 11 currencies | Operational |
| Mastercard | Card | 11 currencies | Operational |
| American Express | Card | 7 currencies | Operational |
| UnionPay | Card | 4 currencies | Operational |
| M-Pesa | Mobile Money | KES | Operational |
| Airtel Money | Mobile Money | 4 currencies | Operational |
| Bank Transfer | Bank | 11 currencies | Operational |
| PesaLink | Bank | KES | Operational |
| Apple Pay | Wallet | 7 currencies | Operational |
| Google Pay | Wallet | 11 currencies | Operational |
| PayPal | Wallet | 7 currencies | Operational |
| Crypto | Crypto | USD | Maintenance (future) |
| Open Banking | Open Banking | EUR, GBP | Maintenance (future) |

## Provider Properties

Each provider has: `id`, `name`, `category`, `status`, `supportedCurrencies`, `supportedCountries`, `processingFeeRate`, `processingFeeFlat`, `avgProcessingTime`, `successRate`, `priority`, `enabled`, `failoverTo`.

## Adding a New Provider

1. Create a new file in `services/providers/`
2. Implement `IPaymentProvider`
3. Register in `mock-providers.ts` → `ALL_PROVIDERS` and `PROVIDER_MAP`
4. Add routing rules in `router.service.ts`

The Core requires zero changes — the router and gateway automatically pick up new providers.

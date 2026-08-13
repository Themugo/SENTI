# Checkout

## Overview

SENTI's checkout supports 5 modes: embedded, hosted, express, guest, and business checkout.

## Checkout Modes

| Mode | Description | Use Case |
|------|-------------|----------|
| Embedded | Inline on merchant's page | SaaS, web apps |
| Hosted | SENTI-hosted payment page | Simple integration, no PCI scope |
| Express | One-click checkout | Returning customers, Apple/Google Pay |
| Guest | No account required | One-time purchases |
| Business | B2B checkout with invoicing | Enterprise, wholesale |

## Supported Payment Methods

- Card (Visa, Mastercard, Amex, UnionPay)
- Mobile Money (M-Pesa, Airtel Money)
- Bank Transfer, PesaLink
- Wallet (Apple Pay, Google Pay, PayPal)
- QR Code (dynamic, static, merchant, invoice)

## Checkout Flow

1. Merchant creates checkout session via `checkoutService.create()`
2. Customer selects payment method
3. Gateway creates payment intent via `gatewayService.createPaymentIntent()`
4. Router selects best provider
5. Provider processes payment
6. Session completed, webhook dispatched

## API

```typescript
checkoutService.create({
  merchantId: 'MCH-001',
  amount: 250,
  currency: 'USD',
  mode: 'embedded',
  paymentMethods: ['card', 'mpesa', 'bank', 'apple_pay'],
  successUrl: 'https://merchant.com/success',
  cancelUrl: 'https://merchant.com/cancel',
  webhookUrl: 'https://merchant.com/webhook',
});
```

## QR Payments

- Dynamic QR: Generated per transaction with amount embedded
- Static QR: Merchant display QR for any amount
- Invoice QR: QR code on invoices for instant payment
- Wallet QR: QR for wallet-to-wallet transfers

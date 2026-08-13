# Payment Routing

## Overview

The routing engine automatically determines which provider should process a payment based on 10 factors: country, currency, payment method, merchant preference, risk rules, availability, processing cost, priority, and failover.

## Routing Algorithm

```
1. Get all enabled routing rules sorted by priority (lower = higher priority)
2. For each rule, check if the payment matches all conditions:
   - Country match
   - Currency match
   - Payment method match
   - Merchant match
   - Amount range (min/max)
   - Risk level (high/critical → require 98%+ success rate)
3. Check provider availability (enabled + operational)
4. If primary unavailable, try failover provider
5. If no rule matches, fallback to first available provider for the currency
6. If no provider available, throw error
```

## Default Routing Rules (10)

| Priority | Rule | Provider | Failover |
|----------|------|----------|----------|
| 1 | M-Pesa for KES in Kenya | mpesa | airtel_money |
| 2 | Airtel for East Africa | airtel_money | mpesa |
| 3 | PesaLink for KES bank | pesalink | bank_transfer |
| 1 | Apple Pay priority | apple_pay | visa |
| 2 | Google Pay priority | google_pay | mastercard |
| 3 | PayPal for wallets | paypal | — |
| 10 | Visa for cards (default) | visa | mastercard |
| 11 | Mastercard fallback | mastercard | visa |
| 5 | Amex for premium | amex | visa |
| 8 | Bank transfer default | bank_transfer | — |

## Cost Estimation

```typescript
routerService.getCostEstimate('visa', 1000);
// { rate: 0.029, flat: 0.30, total: 29.30 }
```

## Custom Rules

Rules can be added, updated, deleted, and toggled at runtime via `routerService.addRule()`, `updateRule()`, `deleteRule()`, `toggleRule()`.

## Failover

Every routing rule can specify a `failoverProviderId`. If the primary provider is down or in maintenance, the router automatically routes to the failover. If the failover is also unavailable, the router continues to the next matching rule.

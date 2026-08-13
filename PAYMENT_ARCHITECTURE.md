# Payment Architecture

## Overview

SENTI is a payment infrastructure platform — not a payment gateway. It supports many payment gateways through a Provider Abstraction Layer. The Core never depends directly on any provider.

## Architecture

```
SENTI Core (Gateway Service)
       ↓
Payment Router (Router Service)
       ↓
Provider Adapters (13 providers)
       ↓
Payment Networks (Visa, M-Pesa, Banks, etc.)
```

## Key Principles

1. **Provider Agnostic** — The Core never imports or depends on any provider. All providers implement `IPaymentProvider`.
2. **Routing Engine** — The router determines the best provider based on 10+ factors.
3. **Failover** — Every route has a failover provider. If the primary is down, the router automatically switches.
4. **Immutable Audit Trail** — Every payment, refund, and dispute action is logged.
5. **Double-Entry Ledger** — All financial movements are recorded in the ledger.

## Modules

| Module | Service | Responsibility |
|--------|---------|----------------|
| Payment Gateway | `gateway.service.ts` | Orchestrate payment lifecycle (create → authorize → capture) |
| Provider Manager | `provider.service.ts` | Provider registration, health, configuration |
| Payment Router | `router.service.ts` | Route payments to best provider with failover |
| Checkout | `checkout.service.ts` | Checkout sessions (embedded/hosted/express/guest) |
| Refunds | `refund.service.ts` | Full/partial refunds with timeline |
| Reconciliation | `reconciliation.service.ts` | Daily, provider, fee reconciliation |
| Invoices | `invoice.service.ts` | Invoice generation, status, PDF placeholder |
| Subscriptions | `subscription.service.ts` | Plans, trials, coupons, billing cycles |
| Webhooks | `webhook.service.ts` | Event delivery, retries, signature verification |
| Payment Links | `paymentlink.service.ts` | Link creation with QR codes and types |

## Payment Flow

```
1. Merchant creates checkout session
2. Customer selects payment method
3. Gateway creates payment intent
4. Router selects best provider
5. Provider initializes payment
6. Gateway authorizes payment
7. Gateway captures payment
8. Ledger entries posted (debit/credit)
9. Webhook dispatched to merchant
10. Settlement queued
```

## Database

14 tables with RLS enabled: `payment_intents`, `checkout_sessions`, `refunds`, `disputes`, `webhook_endpoints`, `webhook_events`, `payment_links`, `subscription_plans`, `subscriptions`, `invoices_v2`, `reconciliation_records`, `reconciliation_reports`, `routing_rules`.

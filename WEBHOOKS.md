# Webhooks

## Overview

The webhook engine manages event delivery to merchant endpoints with retry logic, signature verification, and event replay.

## Webhook Lifecycle

```
Event occurs → Endpoint matched → Event dispatched → Delivery attempted
  → Success (200): marked delivered
  → Failure (5xx): retry with exponential backoff (up to 5 attempts)
  → All attempts fail: marked failed
```

## Event Types

- `payment.succeeded` — Payment completed
- `payment.failed` — Payment failed
- `payment.refunded` — Refund processed
- `checkout.completed` — Checkout session completed
- `invoice.paid` — Invoice paid
- `invoice.overdue` — Invoice overdue
- `subscription.created` — New subscription
- `subscription.renewed` — Subscription renewed
- `subscription.cancelled` — Subscription cancelled
- `settlement.completed` — Settlement completed
- `dispute.opened` — Dispute opened
- `dispute.resolved` — Dispute resolved

## Signature Verification

```typescript
webhookService.verifySignature(payload, signature, secret);
```

Each endpoint has a unique secret (`whsec_...`). SENTI signs payloads with HMAC-SHA256.

## Retry Logic

- Maximum 5 attempts per event
- Exponential backoff: 1m, 5m, 30m, 2h, 12h
- Events can be replayed manually

## API

```typescript
// Create endpoint
webhookService.create({
  merchantId: 'MCH-001',
  url: 'https://merchant.com/webhook',
  events: ['payment.succeeded', 'payment.refunded'],
});

// Dispatch event
webhookService.dispatch('payment.succeeded', { id: 'PI-001', amount: 250 });

// Replay event
webhookService.replay('WHEV-00000001');
```

## Database

- `webhook_endpoints` — Endpoint configuration with secret and status
- `webhook_events` — Event delivery log with attempts and response codes

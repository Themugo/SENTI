# Refunds

## Overview

The refund engine manages full and partial refunds with timeline tracking and ledger integration.

## Refund Types

- **Full Refund** — Refund the entire payment amount
- **Partial Refund** — Refund a portion of the payment

## Refund Statuses

```
pending → processing → succeeded | failed
```

## Refund Timeline

Every refund has a timeline of status changes:
1. `pending` — Refund initiated by merchant
2. `processing` — Being processed by the provider
3. `succeeded` — Refund completed, funds returned to customer
4. `failed` — Refund failed (insufficient funds, provider error, etc.)

## API

```typescript
// Create a full refund
refundService.create({
  paymentIntentId: 'PI-001',
  merchantId: 'MCH-001',
  amount: 250,
  currency: 'USD',
  type: 'full',
  reason: 'Customer requested cancellation',
});

// Create a partial refund
refundService.create({
  paymentIntentId: 'PI-001',
  merchantId: 'MCH-001',
  amount: 50,
  currency: 'USD',
  type: 'partial',
  reason: 'Product returned, partial refund',
});

// Process and complete
refundService.process(refundId);
refundService.complete(refundId);
```

## Ledger Integration

When a refund succeeds, the ledger posts:
- Debit the merchant wallet (refund amount)
- Credit the platform wallet (fee refund, if applicable)
- The original transaction's ledger entries are not modified — new compensating entries are created

## Audit Trail

All refund actions are logged to the audit trail with the `settings_change` event type, capturing the actor, amount, and reason.

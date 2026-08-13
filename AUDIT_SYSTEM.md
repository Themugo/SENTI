# Audit System

## Overview

Every important action on the SENTI platform creates an immutable audit record. The audit log is append-only — no record can be modified or deleted. This is enforced at both the TypeScript type level (`readonly immutable: true`) and the database level (no UPDATE or DELETE RLS policies).

## Audit Event Structure

```typescript
interface AuditEvent {
  id: string;              // Unique identifier (AUD-XXXXXXXX)
  type: AuditEventType;    // 20 event types
  actorId: string;         // Who performed the action
  actorName: string;       // Display name
  actorRole: Role;         // Role at time of action
  action: string;          // Human-readable description
  resourceType: string;    // Type of resource affected
  resourceId: string;      // ID of resource affected
  metadata?: Record<string, string | number | boolean>;
  ipAddress: string;       // IP address
  userAgent: string;       // Browser/client
  timestamp: string;       // ISO 8601
  readonly immutable: true; // TypeScript-level immutability
}
```

## Event Types (20)

| Category | Events |
|----------|--------|
| Authentication | `login`, `logout` |
| Account | `password_change`, `email_change`, `settings_change` |
| Identity | `document_upload`, `kyc_submission`, `kyb_submission`, `kyc_approval`, `kyb_approval` |
| Financial | `wallet_creation`, `settlement_approval` |
| Merchant | `merchant_registration` |
| Developer | `api_key_creation` |
| Admin | `role_change`, `permission_change`, `account_suspension`, `account_reactivation` |
| Security | `security_alert` |
| Compliance | `compliance_review` |

## Querying

- `getAll(limit?)` — Get all events (newest first)
- `getByActor(actorId)` — Events by a specific user
- `getByType(type)` — Events of a specific type
- `getByResource(resourceType, resourceId)` — Events for a specific resource
- `getByDateRange(from, to)` — Events within a date range

## Integration

Every service that performs important actions calls `auditService.log()`:

```typescript
auditService.log({
  type: 'settlement_approval',
  actorId: reviewerId,
  actorName: 'Compliance Officer',
  actorRole: 'compliance',
  action: `Settlement ${id} approved`,
  resourceType: 'settlement',
  resourceId: id,
});
```

## Database

The `audit_events` table has:
- RLS enabled
- SELECT policy: all authenticated users can read
- INSERT policy: all authenticated users can insert
- **No UPDATE or DELETE policies** — records are truly immutable
- Index on `timestamp DESC` for efficient querying
- Index on `actor_id` for user-specific lookups

# RBAC (Role-Based Access Control)

## Overview

SENTI's RBAC system provides granular, modular permissions across 9 roles. Every role has a defined set of permissions, and permissions can be checked at runtime via the `rbacService`.

## Roles

| Role | Key | Description |
|------|-----|-------------|
| Customer | `customer` | Standard user with personal wallet access |
| Merchant | `merchant` | Business user with merchant tools and API access |
| Support | `support` | Customer support agent with ticket queue access |
| Finance | `finance` | Finance team with settlement and reporting access |
| Compliance | `compliance` | Compliance officer with KYC/KYB review powers |
| Admin | `admin` | Platform administrator with user and merchant management |
| Super Admin | `super_admin` | Full platform access with no restrictions |
| Developer | `developer` | API developer with key and webhook management |
| Partner | `partner` | Integration partner with limited API access |

## Permissions (29 total)

### Wallet & Payments
- `view_dashboard` — Access the main dashboard
- `manage_own_wallet` — Manage own wallet
- `send_money` — Send money to others
- `request_money` — Request money from others
- `create_payment_link` — Create payment links
- `manage_invoices` — Create and manage invoices
- `manage_subscriptions` — Create and manage subscriptions

### Merchant
- `manage_merchant` — Manage merchant account
- `manage_api_keys` — Create and revoke API keys
- `manage_webhooks` — Configure webhooks

### Transactions
- `view_transactions` — View own transactions
- `view_all_transactions` — View all platform transactions
- `view_all_wallets` — View all user wallets
- `freeze_wallet` — Freeze a wallet

### Analytics
- `view_analytics` — View analytics dashboard

### Admin
- `view_admin_panel` — Access admin panel
- `manage_users` — Manage user accounts
- `manage_merchants` — Manage merchant accounts
- `manage_roles` — Assign and revoke roles

### Compliance
- `review_compliance` — Review compliance cases
- `view_audit_log` — View audit log
- `view_risk_dashboard` — View risk dashboard
- `approve_kyc` — Approve/reject KYC
- `approve_kyb` — Approve/reject KYB
- `escalate_compliance` — Escalate compliance cases
- `suspend_account` — Suspend user accounts

### Support
- `access_support_queue` — Access support ticket queue
- `view_support_tickets` — View support tickets

### Settlements
- `approve_settlement` — Approve settlements

## Permission Matrix

Each role maps to a specific set of permissions. The `rbacService.getRolePermissions(role)` method returns the full permission list for a role. The `rbacService.hasPermission(userId, permission)` method checks if a user has a specific permission.

## Assignment

Roles are assigned via `rbacService.assignRole(userId, role, assignedBy, actorName)`. All assignments are logged to the audit trail with the `role_change` event type.

## Database

The `role_assignments` table stores role assignments with RLS policies. All authenticated users can read role assignments (for permission checking), but only admins can modify them.

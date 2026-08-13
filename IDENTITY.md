# Identity Architecture

## Overview

SENTI's Identity module provides a complete user identity lifecycle: registration, profile management, preferences, privacy controls, and security settings. It supports 9 account types and is designed to feel comparable to Stripe, Wise, Mercury, and Revolut.

## Account Types

| Type | Key | Description |
|------|-----|-------------|
| Personal | `personal` | Individual accounts for personal use |
| Business | `business` | Registered businesses and startups |
| Non-Profit / NGO | `non_profit` | Charities and non-profit organizations |
| Government | `government` | Government organizations and agencies |
| Developer | `developer` | API developers building on SENTI |
| Marketplace | `marketplace` | Multi-sided marketplace platforms |
| Administrator | `administrator` | Platform administrators |
| Support Agent | `support_agent` | Customer support staff |
| Compliance Officer | `compliance_officer` | Compliance and risk team |

## Registration Flow

The multi-step wizard guides users through 5 steps:

1. **Account** — Email, phone, password, terms acceptance
2. **Personal** — First name, last name, account type selection
3. **Preferences** — Country, language, timezone, preferred currency
4. **Verify** — KYC introduction (skippable, completed later)
5. **Welcome** — Summary and redirect to dashboard

## Identity Profile

Each user has an `Identity` record containing:

- **Personal**: First name, last name, email, phone, date of birth, nationality
- **Regional**: Country, language, timezone, preferred currency
- **Preferences**: 8 notification channels (email, push, SMS, transaction alerts, security alerts, weekly summary, product updates, marketing)
- **Privacy**: Profile visibility, transaction history sharing, analytics sharing, 2FA requirement

## Services

| Service | File | Responsibility |
|---------|------|----------------|
| Identity | `identity.service.ts` | Profile CRUD, preferences, privacy settings |
| Auth | `auth.service.ts` | Login, signup, password reset, 2FA (mock) |
| RBAC | `rbac.service.ts` | Role assignment, permission checking |

## Database

The `identities` table stores all profile data with RLS policies ensuring users can only access their own identity records. Notification preferences and privacy settings are stored as JSONB columns for flexibility.

## Security

- Passwords are validated for strength (8+ chars, uppercase, number)
- 2FA can be required at the identity level via privacy settings
- All profile changes are logged to the audit trail
- Sessions are tracked and can be revoked

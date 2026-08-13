# KYC / KYB Verification

## Overview

SENTI implements a complete verification pipeline for both individuals (KYC) and businesses (KYB). All workflows are mock implementations structured for production swap to real providers (Onfido, Veriff, Persona, etc.).

## KYC (Know Your Customer)

### Document Types

| Type | Key | Description |
|------|-----|-------------|
| Passport | `passport` | Biometric passport page |
| National ID | `national_id` | Government-issued ID card |
| Driver License | `driver_license` | Valid driver license |
| Residence Permit | `residence_permit` | Valid residence permit |

### Verification Steps

1. **Identity Document Upload** — User uploads one of the accepted document types
2. **Selfie Verification** — Live selfie to match the document photo
3. **Proof of Address** — Utility bill or bank statement (not older than 3 months)
4. **Review** — Compliance officer reviews and approves/rejects

### Status Flow

```
not_started → pending → in_review → approved | rejected
                                              ↓
                                           expired (after 365 days)
```

### Progress Calculation

Progress is calculated as a percentage of completed steps:
- Identity document uploaded (25%)
- Selfie verified (25%)
- Proof of address verified (25%)
- Review completed (25%)

## KYB (Know Your Business)

### Required Documents

| Document | Key | Description |
|----------|-----|-------------|
| Certificate of Incorporation | `certificate_of_incorporation` | Company registration certificate |
| Business Registration | `business_registration` | Official business registration |
| Tax Certificate | `tax_certificate` | Tax compliance certificate |

### Business Onboarding Data

- Company name, registration number, tax number
- Business type, industry, country, address
- Directors (name, email, role, nationality, DOB)
- Beneficial owners (name, email, ownership %, nationality, DOB)
- Website, business description
- Expected monthly volume, expected countries, expected currencies

### Status Flow

```
not_started → pending → in_review → approved | rejected
```

## Audit Integration

Every KYC/KYB action creates an immutable audit event:
- `kyc_submission` / `kyb_submission` — User submits for review
- `kyc_approval` / `kyb_approval` — Compliance officer approves/rejects
- `document_upload` — Document uploaded

## Database

- `kyc_profiles` — KYC status, timeline, verification flags
- `kyc_documents` — Individual uploaded documents
- `kyb_profiles` — KYB status, directors, beneficial owners, business info
- `kyb_documents` — Company verification documents

All tables have RLS enabled with owner-scoped access for user-owned data.

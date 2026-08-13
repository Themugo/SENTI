# Compliance Architecture

## Overview

SENTI's compliance module provides a complete regulatory oversight framework: compliance queue, case management, risk dashboard, and audit trail. It is designed to meet the standards of regulated fintechs operating across Africa and globally.

## Compliance Queue

### Case Types

| Type | Key | Description |
|------|-----|-------------|
| KYC Review | `kyc_review` | Individual identity verification |
| KYB Review | `kyb_review` | Business verification |
| Transaction Review | `transaction_review` | Suspicious transaction review |
| Sanctions Check | `sanctions_check` | Potential sanctions match |
| Chargeback Review | `chargeback_review` | Chargeback dispute |
| Manual Review | `manual_review` | General manual review |

### Case Statuses

```
pending_review → manual_review → approved | rejected
                            ↓
                       escalated → suspended
```

### Priority Levels

- **Low** — Routine review
- **Medium** — Standard priority
- **High** — Requires attention within 24h
- **Urgent** — Immediate action required (sanctions, fraud)

## Risk Engine

### Risk Score (0-100)

The overall risk score is the average of 6 dimensions:

| Dimension | Description |
|-----------|-------------|
| Transaction Risk | Based on transaction patterns and amounts |
| Country Risk | Geographic risk based on sender/receiver countries |
| Merchant Risk | Merchant-specific risk profile |
| Device Risk | Device fingerprint and trust level |
| Behaviour Risk | User behavior anomaly detection |
| Velocity Risk | Transaction frequency and volume anomalies |

### Risk Levels

| Level | Score Range | Action |
|-------|------------|--------|
| Low | 0-29 | No action required |
| Medium | 30-59 | Monitor |
| High | 60-79 | Review required |
| Critical | 80-100 | Immediate action |

### Risk Flags (10 types)

- `high_value_transaction` — Transaction exceeds normal pattern
- `multiple_failed_logins` — 5+ failed attempts in 10 minutes
- `rapid_transfers` — Multiple transfers in short timeframe
- `multiple_devices` — Account accessed from multiple devices
- `new_device_login` — Login from unrecognized device
- `high_risk_country` — Transaction with high-risk jurisdiction
- `sanctions_match` — Potential match against sanctions list
- `chargeback_risk` — Chargeback rate exceeds threshold
- `velocity_anomaly` — Transaction velocity above baseline
- `unusual_pattern` — ML model detected unusual behavior

## Database Tables

| Table | Purpose |
|-------|---------|
| `compliance_cases` | Compliance review queue |
| `compliance_notes` | Notes on compliance cases |
| `risk_profiles` | Risk scores per user/merchant |
| `risk_flags` | Individual risk flags |
| `audit_events` | Immutable audit log |

All tables have RLS enabled with appropriate access controls.

## Integration Points

- **KYC Service** — Creates compliance cases on submission
- **KYB Service** — Creates compliance cases on business onboarding
- **Risk Service** — Flags trigger compliance cases automatically
- **Audit Service** — All compliance actions are logged
- **Notifications** — Users notified of compliance decisions

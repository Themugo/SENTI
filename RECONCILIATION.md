# Reconciliation

## Overview

Reconciliation ensures internal ledger records match provider records. SENTI runs daily reconciliation per provider, detecting mismatches, missing transactions, and fee discrepancies.

## Reconciliation Types

| Type | Description |
|------|-------------|
| Daily Reconciliation | Compare all transactions for a given day against provider records |
| Provider Reconciliation | Per-provider transaction matching |
| Settlement Reconciliation | Match settlement reports against ledger entries |
| Fee Reconciliation | Verify provider fees match internal fee calculations |

## Reconciliation Statuses

- `matched` — Internal and provider records agree
- `mismatched` — Amount or fee discrepancy detected
- `missing` — Transaction exists in one system but not the other
- `pending` — Awaiting comparison

## Process

```
1. Run reconciliation for a provider on a specific date
2. Generate reconciliation records (one per transaction)
3. Compare provider amount vs internal amount
4. Compare provider fee vs internal fee
5. Mark each record as matched/mismatched/missing
6. Generate summary report
7. Mismatches can be resolved manually
```

## API

```typescript
// Run daily reconciliation
reconciliationService.runDailyReconciliation('visa', '2026-08-02');

// Get reports
reconciliationService.getReports();

// Get mismatches
reconciliationService.getMismatches();

// Resolve a mismatch
reconciliationService.resolve('REC-00000001');
```

## Report Structure

Each report contains: date, provider ID, total transactions, matched count, mismatched count, missing count, total fees, total volume, and status.

## Database

- `reconciliation_records` — Individual transaction comparison records
- `reconciliation_reports` — Daily summary reports per provider

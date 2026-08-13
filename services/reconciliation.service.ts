/**
 * Reconciliation Service
 * Daily, provider, settlement, and fee reconciliation.
 * Detects mismatches between internal ledger and provider records.
 */

import type { ReconciliationRecord, ReconciliationReport, ProviderId } from '@/types';
import { auditService } from './audit.service';

let records: ReconciliationRecord[] = [];
let reports: ReconciliationReport[] = [];
let recordCounter = 0;
let reportCounter = 0;

function nextRecordId(): string {
  recordCounter++;
  return `REC-${recordCounter.toString().padStart(8, '0')}`;
}

function nextReportId(): string {
  reportCounter++;
  return `RPT-${reportCounter.toString().padStart(6, '0')}`;
}

export const reconciliationService = {
  /** Run daily reconciliation for a provider. */
  runDailyReconciliation(providerId: ProviderId, date: string): ReconciliationReport {
    // Mock: generate reconciliation records
    const txCount = Math.floor(Math.random() * 300) + 50;
    const matched = Math.floor(txCount * (0.92 + Math.random() * 0.07));
    const mismatched = Math.floor((txCount - matched) * 0.4);
    const missing = txCount - matched - mismatched;
    const pending = 0;

    const volume = txCount * (200 + Math.random() * 800);
    const fees = volume * 0.025;

    const report: ReconciliationReport = {
      id: nextReportId(),
      date,
      providerId,
      totalTransactions: txCount,
      matched,
      mismatched,
      missing,
      pending,
      totalFees: Math.round(fees),
      totalVolume: Math.round(volume),
      status: 'completed',
    };
    reports.push(report);

    // Generate individual records
    for (let i = 0; i < txCount; i++) {
      const isMatched = i < matched;
      const isMismatched = !isMatched && i < matched + mismatched;
      const record: ReconciliationRecord = {
        id: nextRecordId(),
        date,
        providerId,
        providerTransactionId: `PXT-${providerId.toUpperCase()}-${i.toString().padStart(6, '0')}`,
        internalTransactionId: `IXT-${i.toString().padStart(6, '0')}`,
        providerAmount: Math.round((100 + Math.random() * 500) * 100) / 100,
        internalAmount: isMismatched ? Math.round((100 + Math.random() * 500) * 100) / 100 : 0,
        providerFee: Math.round(Math.random() * 50 * 100) / 100,
        internalFee: isMismatched ? Math.round(Math.random() * 50 * 100) / 100 : 0,
        status: isMatched ? 'matched' : isMismatched ? 'mismatched' : 'missing',
        discrepancy: isMismatched ? 'Amount mismatch' : undefined,
      };
      if (isMatched) record.internalAmount = record.providerAmount;
      records.push(record);
    }

    auditService.log({
      type: 'settings_change',
      actorId: 'system',
      actorName: 'System',
      actorRole: 'admin',
      action: `Reconciliation completed for ${providerId} on ${date}`,
      resourceType: 'reconciliation_report',
      resourceId: report.id,
    });

    return report;
  },

  /** Get all reports. */
  getReports(): ReconciliationReport[] {
    return [...reports].sort((a, b) => b.date.localeCompare(a.date));
  },

  /** Get report by ID. */
  getReport(id: string): ReconciliationReport | undefined {
    return reports.find((r) => r.id === id);
  },

  /** Get records by report date and provider. */
  getRecords(date: string, providerId: ProviderId): ReconciliationRecord[] {
    return records.filter((r) => r.date === date && r.providerId === providerId);
  },

  /** Get mismatched records. */
  getMismatches(): ReconciliationRecord[] {
    return records.filter((r) => r.status === 'mismatched' || r.status === 'missing');
  },

  /** Resolve a mismatch. */
  resolve(id: string): ReconciliationRecord | undefined {
    const record = records.find((r) => r.id === id);
    if (!record) return undefined;
    record.status = 'matched';
    record.resolvedAt = new Date().toISOString();
    return record;
  },

  /** Get all records. */
  getAllRecords(): ReconciliationRecord[] {
    return [...records];
  },

  /** Get stats. */
  getStats(): { totalReports: number; totalRecords: number; matched: number; mismatched: number; missing: number; pending: number } {
    return {
      totalReports: reports.length,
      totalRecords: records.length,
      matched: records.filter((r) => r.status === 'matched').length,
      mismatched: records.filter((r) => r.status === 'mismatched').length,
      missing: records.filter((r) => r.status === 'missing').length,
      pending: records.filter((r) => r.status === 'pending').length,
    };
  },

  /** Seed mock data. */
  _seed(recs: ReconciliationRecord[], reps: ReconciliationReport[]): void {
    records = recs;
    reports = reps;
    recordCounter = recs.length;
    reportCounter = reps.length;
  },
};

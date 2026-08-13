'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  FileCheck2, CheckCircle2, AlertTriangle, FileQuestion, Receipt,
  Play, Check, Loader2, Download, Filter,
} from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/status-badge';
import {
  cn,
  formatDate,
  formatCurrencyWithSymbol,
  formatCompact,
} from '@/lib/utils';
import { reconciliationService } from '@/services/reconciliation.service';
import type {
  ReconciliationRecord,
  ReconciliationReport,
  ReconciliationStatus,
  ProviderId,
} from '@/types';

const PROVIDER_LABELS: Record<ProviderId, string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  amex: 'Amex',
  unionpay: 'UnionPay',
  mpesa: 'M-Pesa',
  airtel_money: 'Airtel Money',
  bank_transfer: 'Bank Transfer',
  pesalink: 'PesaLink',
  apple_pay: 'Apple Pay',
  google_pay: 'Google Pay',
  paypal: 'PayPal',
  crypto: 'Crypto',
  open_banking: 'Open Banking',
};

const RUN_PROVIDERS: ProviderId[] = ['visa', 'mpesa', 'bank_transfer', 'paypal'];

const statusConfig: Record<
  ReconciliationStatus,
  { label: string; variant: 'success' | 'warning' | 'error' | 'default' }
> = {
  matched: { label: 'Matched', variant: 'success' },
  mismatched: { label: 'Mismatched', variant: 'warning' },
  missing: { label: 'Missing', variant: 'error' },
  pending: { label: 'Pending', variant: 'default' },
};

export default function ReconciliationPage() {
  const [ready, setReady] = useState(false);
  const [reports, setReports] = useState<ReconciliationReport[]>([]);
  const [mismatches, setMismatches] = useState<ReconciliationRecord[]>([]);
  const [stats, setStats] = useState<{
    totalReports: number;
    totalRecords: number;
    matched: number;
    mismatched: number;
    missing: number;
    pending: number;
  }>({
    totalReports: 0,
    totalRecords: 0,
    matched: 0,
    mismatched: 0,
    missing: 0,
    pending: 0,
  });
  const [totalFees, setTotalFees] = useState(0);

  const [running, setRunning] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ProviderId>('visa');
  const [resolvingIds, setResolvingIds] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<
    ReconciliationStatus | 'all'
  >('all');

  useEffect(() => {
    refresh();
    setReady(true);
  }, []);

  function refresh() {
    setReports(reconciliationService.getReports());
    setMismatches(reconciliationService.getMismatches());
    setStats(reconciliationService.getStats());
    setTotalFees(
      reconciliationService
        .getReports()
        .reduce((sum, r) => sum + r.totalFees, 0),
    );
  }

  const filteredMismatches = useMemo(() => {
    if (statusFilter === 'all') return mismatches;
    return mismatches.filter((m) => m.status === statusFilter);
  }, [mismatches, statusFilter]);

  function handleRun() {
    setRunning(true);
    // Simulate async work for UX
    setTimeout(() => {
      try {
        const date = new Date().toISOString().slice(0, 10);
        const report = reconciliationService.runDailyReconciliation(
          selectedProvider,
          date,
        );
        refresh();
        toast.success('Reconciliation complete', {
          description: `${PROVIDER_LABELS[selectedProvider]} · ${report.totalTransactions} transactions · ${report.matched} matched`,
        });
      } catch {
        toast.error('Failed to run reconciliation');
      } finally {
        setRunning(false);
      }
    }, 600);
  }

  async function handleResolve(id: string) {
    setResolvingIds((prev) => new Set(prev).add(id));
    // Simulate async
    await new Promise((r) => setTimeout(r, 400));
    const resolved = reconciliationService.resolve(id);
    if (resolved) {
      refresh();
      toast.success('Record resolved', {
        description: `${id} marked as matched`,
      });
    } else {
      toast.error('Could not resolve record');
    }
    setResolvingIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  if (!ready) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Reconciliation"
          description="Reconcile internal ledger against provider records."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reconciliation"
        description="Reconcile internal ledger against provider records and resolve discrepancies."
      >
        <div className="flex items-center gap-2">
          <select
            value={selectedProvider}
            onChange={(e) =>
              setSelectedProvider(e.target.value as ProviderId)
            }
            className="h-9 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {RUN_PROVIDERS.map((p) => (
              <option key={p} value={p}>
                {PROVIDER_LABELS[p]}
              </option>
            ))}
          </select>
          <Button
            size="sm"
            className="gap-1.5"
            onClick={handleRun}
            disabled={running}
          >
            {running ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {running ? 'Running…' : 'Run Reconciliation'}
          </Button>
        </div>
      </PageHeader>

      {/* Summary stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Total Reports"
          value={formatCompact(stats.totalReports)}
          subtitle={`${stats.totalRecords} records`}
          icon={<FileCheck2 className="h-5 w-5" />}
        />
        <StatCard
          title="Matched"
          value={formatCompact(stats.matched)}
          icon={<CheckCircle2 className="h-5 w-5" />}
          delay={0.05}
        />
        <StatCard
          title="Mismatched"
          value={formatCompact(stats.mismatched)}
          icon={<AlertTriangle className="h-5 w-5" />}
          delay={0.1}
        />
        <StatCard
          title="Missing"
          value={formatCompact(stats.missing)}
          icon={<FileQuestion className="h-5 w-5" />}
          delay={0.15}
        />
        <StatCard
          title="Total Fees"
          value={formatCurrencyWithSymbol(totalFees, 'USD')}
          icon={<Receipt className="h-5 w-5" />}
          delay={0.2}
        />
      </div>

      {/* Reports table */}
      <Card className="overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-border p-5">
          <div>
            <h3 className="text-lg font-semibold font-display">
              Reconciliation Reports
            </h3>
            <p className="text-sm text-muted-foreground">
              Daily reconciliation runs across providers
            </p>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Date
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Provider
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Total Tx
                </th>
                <th className="hidden px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground sm:table-cell">
                  Matched
                </th>
                <th className="hidden px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground md:table-cell">
                  Mismatched
                </th>
                <th className="hidden px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground md:table-cell">
                  Missing
                </th>
                <th className="hidden px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground lg:table-cell">
                  Volume
                </th>
                <th className="hidden px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground lg:table-cell">
                  Fees
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {reports.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-12 text-center text-sm text-muted-foreground"
                  >
                    No reconciliation reports yet. Run a reconciliation to get
                    started.
                  </td>
                </tr>
              )}
              {reports.slice(0, 50).map((r, i) => (
                <motion.tr
                  key={r.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.5) }}
                  className="border-b border-border transition-colors hover:bg-muted/40"
                >
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium">{formatDate(r.date)}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {r.id}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium">
                      {PROVIDER_LABELS[r.providerId] ?? r.providerId}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-semibold">
                      {formatCompact(r.totalTransactions)}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <span className="text-sm text-success">
                      {formatCompact(r.matched)}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <span
                      className={cn(
                        'text-sm',
                        r.mismatched > 0
                          ? 'text-warning font-medium'
                          : 'text-muted-foreground',
                      )}
                    >
                      {formatCompact(r.mismatched)}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <span
                      className={cn(
                        'text-sm',
                        r.missing > 0
                          ? 'text-destructive font-medium'
                          : 'text-muted-foreground',
                      )}
                    >
                      {formatCompact(r.missing)}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 lg:table-cell">
                    <span className="text-sm text-muted-foreground">
                      {formatCurrencyWithSymbol(r.totalVolume, 'USD')}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 lg:table-cell">
                    <span className="text-sm text-muted-foreground">
                      {formatCurrencyWithSymbol(r.totalFees, 'USD')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        r.status === 'completed'
                          ? 'success'
                          : r.status === 'in_progress'
                            ? 'info'
                            : 'error'
                      }
                    >
                      {r.status === 'in_progress'
                        ? 'In Progress'
                        : r.status.charAt(0).toUpperCase() +
                          r.status.slice(1)}
                    </Badge>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {reports.length > 50 && (
          <div className="border-t border-border p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Showing 50 of {reports.length} reports
            </p>
          </div>
        )}
      </Card>

      {/* Mismatched records section */}
      <Card className="overflow-hidden p-0">
        <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold font-display">
              Mismatched &amp; Missing Records
            </h3>
            <p className="text-sm text-muted-foreground">
              Individual discrepancies requiring resolution
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as ReconciliationStatus | 'all')
              }
              className="h-9 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="all">All Statuses</option>
              <option value="mismatched">Mismatched</option>
              <option value="missing">Missing</option>
              <option value="pending">Pending</option>
            </select>
            <span className="text-sm text-muted-foreground">
              {filteredMismatches.length} records
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Record ID
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Provider
                </th>
                <th className="hidden px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground md:table-cell">
                  Provider Tx
                </th>
                <th className="hidden px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground md:table-cell">
                  Internal Tx
                </th>
                <th className="hidden px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground lg:table-cell">
                  Provider Amount
                </th>
                <th className="hidden px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground lg:table-cell">
                  Internal Amount
                </th>
                <th className="hidden px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground xl:table-cell">
                  Discrepancy
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredMismatches.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-12 text-center text-sm text-muted-foreground"
                  >
                    <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-success" />
                    No discrepancies found. All records are matched.
                  </td>
                </tr>
              )}
              {filteredMismatches.slice(0, 50).map((m, i) => {
                const cfg = statusConfig[m.status];
                const amountDiff =
                  m.providerAmount - m.internalAmount;
                const isResolving = resolvingIds.has(m.id);
                return (
                  <motion.tr
                    key={m.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: Math.min(i * 0.02, 0.4) }}
                    className="border-b border-border transition-colors hover:bg-muted/40"
                  >
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium font-mono">{m.id}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(m.date)}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium">
                        {PROVIDER_LABELS[m.providerId] ?? m.providerId}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <span className="text-xs font-mono text-muted-foreground">
                        {m.providerTransactionId}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <span className="text-xs font-mono text-muted-foreground">
                        {m.internalTransactionId}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 lg:table-cell">
                      <span className="text-sm">
                        {formatCurrencyWithSymbol(m.providerAmount, 'USD')}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 lg:table-cell">
                      <span
                        className={cn(
                          'text-sm',
                          Math.abs(amountDiff) > 0.01
                            ? 'text-destructive font-medium'
                            : 'text-muted-foreground',
                        )}
                      >
                        {formatCurrencyWithSymbol(m.internalAmount, 'USD')}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 xl:table-cell">
                      <span className="text-xs text-muted-foreground">
                        {m.discrepancy ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={cfg.variant}>{cfg.label}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5"
                        onClick={() => handleResolve(m.id)}
                        disabled={isResolving}
                      >
                        {isResolving ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Check className="h-3.5 w-3.5" />
                        )}
                        Resolve
                      </Button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredMismatches.length > 50 && (
          <div className="border-t border-border p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Showing 50 of {filteredMismatches.length} records
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}

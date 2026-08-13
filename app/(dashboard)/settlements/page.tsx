'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Banknote, Clock, CheckCircle2, XCircle, Download,
  Calendar, ArrowRight, Filter,
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge, StatusBadge } from '@/components/status-badge';
import { AnimatedCounter } from '@/components/animated-counter';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { initFromSupabase } from '@/services/data-access';
import { settlementService } from '@/services/settlement.service';
import { reportsService } from '@/services/reports.service';
import { formatCurrencyWithSymbol, formatDate, formatCompact } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Settlement, SettlementStatus } from '@/types';

const statusConfig: Record<SettlementStatus, { label: string; icon: typeof Clock; color: string; bg: string }> = {
  queued: { label: 'Queued', icon: Clock, color: 'text-info', bg: 'bg-info/10' },
  pending: { label: 'Pending', icon: Clock, color: 'text-warning', bg: 'bg-warning/10' },
  completed: { label: 'Completed', icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' },
  failed: { label: 'Failed', icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10' },
};

export default function SettlementsPage() {
  const [ready, setReady] = useState(false);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [statusFilter, setStatusFilter] = useState<SettlementStatus | 'all'>('all');
  const [report, setReport] = useState(reportsService.getSettlementReport());
  const [statusBreakdown, setStatusBreakdown] = useState<{ label: string; value: number; color: string }[]>([]);

  useEffect(() => {
    (async () => {
      await initFromSupabase();
      setSettlements(settlementService.getAll());
      setReport(reportsService.getSettlementReport());
      setStatusBreakdown(reportsService.getSettlementStatusBreakdown());
      setReady(true);
    })();
  }, []);

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return settlements;
    return settlements.filter((s) => s.status === statusFilter);
  }, [settlements, statusFilter]);

  if (!ready) {
    return (
      <div className="space-y-6">
        <PageHeader title="Settlements" description="Manage merchant settlement queue and schedules." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Settlements" description="Manage merchant settlement queue and schedules.">
        <Button variant="outline" size="sm" className="gap-1.5">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
        <Button size="sm" className="gap-1.5">
          <Banknote className="h-4 w-4" />
          Run Settlement
        </Button>
      </PageHeader>

      {/* Summary stats — from engine */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Settled"
          value={`$${formatCompact(report.totalSettled)}`}
          change={15.2}
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
        <StatCard
          title="Pending Settlement"
          value={`$${formatCompact(report.pending)}`}
          change={-2.4}
          icon={<Clock className="h-5 w-5" />}
          delay={0.05}
        />
        <StatCard
          title="Failed Settlements"
          value={`$${formatCompact(report.failed)}`}
          subtitle={`${report.count} total`}
          icon={<XCircle className="h-5 w-5" />}
          delay={0.1}
        />
        <StatCard
          title="Total Settlements"
          value={formatCompact(report.count)}
          subtitle="All-time"
          icon={<Banknote className="h-5 w-5" />}
          delay={0.15}
        />
      </div>

      {/* Settlement status breakdown — visual */}
      <Card className="p-5">
        <h3 className="text-lg font-semibold font-display">Settlement Status Breakdown</h3>
        <p className="text-sm text-muted-foreground">Distribution across all settlements</p>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {statusBreakdown.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="rounded-xl border border-border p-4 text-center"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: `${s.color}15` }}>
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: s.color }} />
              </div>
              <p className="mt-3 text-2xl font-bold font-display">
                <AnimatedCounter value={s.value} />
              </p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Filter bar */}
      <div className="flex items-center gap-3">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as SettlementStatus | 'all')}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="queued">Queued</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">{filtered.length} settlements</span>
      </div>

      {/* Settlement queue table — from engine */}
      <Card className="overflow-hidden p-0">
        <div className="border-b border-border p-5">
          <h3 className="text-lg font-semibold font-display">Settlement Queue</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Reference</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Merchant</th>
                <th className="hidden px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground sm:table-cell">Schedule</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Amount</th>
                <th className="hidden px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground md:table-cell">Fees</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Net</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="hidden px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground lg:table-cell">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 50).map((s, i) => {
                const config = statusConfig[s.status];
                return (
                  <motion.tr
                    key={s.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.5) }}
                    className="border-b border-border transition-colors hover:bg-muted/40"
                  >
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium font-mono">{s.reference}</p>
                      <p className="text-xs text-muted-foreground">{s.id}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium">{s.merchantName}</p>
                      <p className="text-xs text-muted-foreground">{s.merchantId}</p>
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <Badge variant="outline" className="capitalize">{s.schedule}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold">{formatCurrencyWithSymbol(s.amount, s.currency)}</span>
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <span className="text-sm text-muted-foreground">{formatCurrencyWithSymbol(s.fees, s.currency)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-bold text-success">{formatCurrencyWithSymbol(s.netAmount, s.currency)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className={cn('flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium w-fit', config.bg, config.color)}>
                        <config.icon className="h-3 w-3" />
                        {config.label}
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 lg:table-cell">
                      <span className="text-sm text-muted-foreground">{formatDate(s.createdAt)}</span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length > 50 && (
          <div className="border-t border-border p-4 text-center">
            <p className="text-sm text-muted-foreground">Showing 50 of {filtered.length} settlements</p>
          </div>
        )}
      </Card>
    </div>
  );
}

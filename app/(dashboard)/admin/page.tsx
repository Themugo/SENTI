'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck, Store, ArrowLeftRight, FileCheck, AlertTriangle,
  LifeBuoy, Activity, TrendingUp, Users, DollarSign,
  CheckCircle2, Clock, Server,
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { RevenueAreaChart, VolumeBarChart } from '@/components/charts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/status-badge';
import { AnimatedCounter } from '@/components/animated-counter';
import { initFromSupabase } from '@/services/data-access';
import { reportsService } from '@/services/reports.service';
import { merchantService } from '@/services/merchant.service';
import { settlementService } from '@/services/settlement.service';
import { mockSupportTickets, mockSystemServices, mockAdminGeoData } from '@/services/legacy-mock-data';
import { formatCurrencyWithSymbol, formatCompact, formatDate, formatPercent } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { AdminStats } from '@/services/reports.service';
import type { MerchantAccount } from '@/types';

export default function AdminPage() {
  const [ready, setReady] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [revenueData, setRevenueData] = useState<{ label: string; value: number; secondary?: number }[]>([]);
  const [volumeData, setVolumeData] = useState<{ label: string; value: number }[]>([]);
  const [merchants, setMerchants] = useState<MerchantAccount[]>([]);
  const [pendingMerchants, setPendingMerchants] = useState<MerchantAccount[]>([]);

  useEffect(() => {
    (async () => {
      await initFromSupabase();
      setStats(reportsService.getAdminStats());
      setRevenueData(reportsService.getMonthlyRevenue(7));
      setVolumeData(reportsService.getDailyVolume(7));
      setMerchants(merchantService.getAll().slice(0, 20));
      setPendingMerchants(merchantService.getPending().slice(0, 5));
      setReady(true);
    })();
  }, []);

  if (!ready || !stats) {
    return (
      <div className="space-y-6">
        <PageHeader title="Admin Dashboard" description="Platform-wide monitoring and management.">
          <Badge variant="info">
            <ShieldCheck className="h-3 w-3" />
            Admin Access
          </Badge>
        </PageHeader>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Admin Dashboard" description="Platform-wide monitoring and management.">
        <Badge variant="info">
          <ShieldCheck className="h-3 w-3" />
          Admin Access
        </Badge>
      </PageHeader>

      {/* Global stats — from engine */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Volume" value={`$${formatCompact(stats.totalVolume)}`} change={24.5} icon={<DollarSign className="h-5 w-5" />} />
        <StatCard title="Total Transactions" value={formatCompact(stats.totalTransactions)} change={18.2} icon={<ArrowLeftRight className="h-5 w-5" />} delay={0.05} />
        <StatCard title="Total Wallets" value={formatCompact(stats.totalWallets)} change={12.4} icon={<Users className="h-5 w-5" />} delay={0.1} />
        <StatCard title="Merchants" value={formatCompact(stats.totalMerchants)} change={8.1} icon={<Store className="h-5 w-5" />} delay={0.15} />
      </div>

      {/* Revenue chart — from engine */}
      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold font-display">Platform Revenue</h3>
            <p className="text-sm text-muted-foreground">Monthly gross volume — from ledger</p>
          </div>
          <Badge variant="success">
            <TrendingUp className="h-3 w-3" />
            +24.5% YoY
          </Badge>
        </div>
        <RevenueAreaChart data={revenueData} height={300} />
      </Card>

      {/* Volume + Fees */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <h3 className="text-lg font-semibold font-display">Daily Volume</h3>
          <p className="text-sm text-muted-foreground">Last 7 days — from ledger</p>
          <div className="mt-4">
            <VolumeBarChart data={volumeData} height={200} />
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-lg font-semibold font-display">Platform Health</h3>
          <div className="mt-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Completed TXs</span>
              <span className="font-semibold text-success">{formatCompact(stats.completedTransactions)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Failed TXs</span>
              <span className="font-semibold text-destructive">{formatCompact(stats.failedTransactions)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Fees</span>
              <span className="font-semibold">{formatCurrencyWithSymbol(stats.totalFees, 'USD')}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-border pt-2">
              <span className="text-muted-foreground">Pending Merchants</span>
              <span className="font-semibold text-warning">{stats.pendingMerchants}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Settlements Settled</span>
              <span className="font-semibold">{formatCurrencyWithSymbol(stats.settlementReport.totalSettled, 'USD')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Settlements Pending</span>
              <span className="font-semibold text-warning">{formatCurrencyWithSymbol(stats.settlementReport.pending, 'USD')}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Compliance + Risk */}
      <div id="compliance" className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold font-display">Compliance Queue</h3>
            <Badge variant="warning">{pendingMerchants.length} pending</Badge>
          </div>
          <div className="space-y-3">
            {pendingMerchants.length === 0 && (
              <p className="text-sm text-muted-foreground">No pending verifications.</p>
            )}
            {pendingMerchants.map((m, i) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="flex items-center justify-between rounded-lg border border-border p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning/10 text-warning">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{m.businessName}</p>
                    <p className="text-xs text-muted-foreground">{m.category} • {m.country}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 gap-1 text-xs"
                    onClick={() => {
                      merchantService.verify(m.id);
                      setPendingMerchants(merchantService.getPending().slice(0, 5));
                    }}
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs text-destructive"
                    onClick={() => {
                      merchantService.reject(m.id);
                      setPendingMerchants(merchantService.getPending().slice(0, 5));
                    }}
                  >
                    Reject
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        <Card id="risk" className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold font-display">Risk Dashboard</h3>
            <Badge variant="error">{stats.failedTransactions} failed TXs</Badge>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Failed Transactions', value: stats.failedTransactions, color: 'text-destructive', icon: AlertTriangle },
              { label: 'Pending Merchants', value: stats.pendingMerchants, color: 'text-warning', icon: AlertTriangle },
              { label: 'Failed Settlements', value: stats.settlementReport.failed, color: 'text-warning', icon: FileCheck },
              { label: 'Completed Settlements', value: stats.settlementReport.count, color: 'text-success', icon: CheckCircle2 },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="flex items-center gap-3">
                  <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg bg-muted', item.color)}>
                    <item.icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <span className={cn('text-lg font-bold font-display', item.color)}>{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Merchants table — from engine */}
      <Card id="merchants" className="overflow-hidden p-0">
        <div className="border-b border-border p-5">
          <h3 className="text-lg font-semibold font-display">Merchants</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Business</th>
                <th className="hidden px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground sm:table-cell">Category</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Wallet Balance</th>
                <th className="hidden px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground md:table-cell">Joined</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {merchants.map((m, i) => {
                const balance = merchantService.getBalance(m.id);
                return (
                  <motion.tr
                    key={m.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.04 }}
                    className="border-b border-border transition-colors hover:bg-muted/40"
                  >
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium">{m.businessName}</p>
                      <p className="text-xs text-muted-foreground">{m.country}</p>
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <span className="text-sm text-muted-foreground">{m.category}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold">{formatCurrencyWithSymbol(balance.available, balance.currency)}</span>
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <span className="text-sm text-muted-foreground">{formatDate(m.joinedAt)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={m.verificationStatus === 'verified' ? 'success' : m.verificationStatus === 'pending' ? 'warning' : 'error'}>
                        {m.verificationStatus}
                      </Badge>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Geo + Support */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="text-lg font-semibold font-display">Geographic Distribution</h3>
          <p className="text-sm text-muted-foreground">Volume by country</p>
          <div className="mt-4 space-y-3">
            {mockAdminGeoData.map((geo, i) => (
              <div key={geo.country} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="text-lg">{geo.flag}</span>
                    <span className="font-medium">{geo.country}</span>
                  </span>
                  <span className="text-muted-foreground">${formatCompact(geo.volume)} • {geo.share}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${geo.share}%` }}
                    transition={{ duration: 0.8, delay: i * 0.05 }}
                    className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card id="support" className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold font-display">Support Tickets</h3>
            <Badge variant="warning">{mockSupportTickets.filter((t) => t.status === 'open' || t.status === 'pending').length} active</Badge>
          </div>
          <div className="space-y-3">
            {mockSupportTickets.map((ticket, i) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="rounded-lg border border-border p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{ticket.subject}</p>
                    <p className="text-xs text-muted-foreground">{ticket.requester} • {formatDate(ticket.createdAt)}</p>
                  </div>
                  <div className="flex gap-1.5">
                    <Badge variant={
                      ticket.priority === 'urgent' ? 'error' :
                      ticket.priority === 'high' ? 'warning' :
                      ticket.priority === 'medium' ? 'info' : 'outline'
                    }>
                      {ticket.priority}
                    </Badge>
                    <Badge variant={
                      ticket.status === 'open' ? 'info' :
                      ticket.status === 'pending' ? 'warning' :
                      ticket.status === 'resolved' ? 'success' : 'outline'
                    }>
                      {ticket.status}
                    </Badge>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>

      {/* System health */}
      <Card id="health" className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold font-display">System Health</h3>
            <p className="text-sm text-muted-foreground">Real-time service status</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-2xl font-bold font-display text-success">
                <AnimatedCounter value={99.97} suffix="%" decimals={2} />
              </p>
              <p className="text-xs text-muted-foreground">Uptime (30d)</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold font-display text-primary">
                <AnimatedCounter value={42} suffix="ms" />
              </p>
              <p className="text-xs text-muted-foreground">Avg response</p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {mockSystemServices.map((service, i) => (
            <motion.div
              key={service.name}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              className={cn(
                'rounded-xl border p-3',
                service.status === 'operational' ? 'border-success/20 bg-success/5' : 'border-warning/20 bg-warning/5',
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className={cn('h-4 w-4', service.status === 'operational' ? 'text-success' : 'text-warning')} />
                  <span className="text-sm font-medium">{service.name}</span>
                </div>
                <span className={cn('h-2.5 w-2.5 rounded-full', service.status === 'operational' ? 'bg-success' : 'bg-warning animate-pulse')} />
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>{service.uptime}% uptime</span>
                <span>{service.latency}ms</span>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield, CheckCircle2, Clock, AlertTriangle, ArrowRight,
  User, Building2, DollarSign,
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/status-badge';
import { mockEscrow } from '@/services/mock-data';
import { formatCurrencyWithSymbol, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { EscrowMilestone } from '@/types';

const statusConfig = {
  pending: { variant: 'warning' as const, icon: Clock, label: 'Pending' },
  funded: { variant: 'info' as const, icon: Shield, label: 'Funded' },
  released: { variant: 'success' as const, icon: CheckCircle2, label: 'Released' },
  disputed: { variant: 'error' as const, icon: AlertTriangle, label: 'Disputed' },
  cancelled: { variant: 'outline' as const, icon: Clock, label: 'Cancelled' },
};

const milestoneStatusConfig = {
  pending: { variant: 'outline' as const, label: 'Pending' },
  approved: { variant: 'info' as const, label: 'Approved' },
  released: { variant: 'success' as const, label: 'Released' },
  disputed: { variant: 'error' as const, label: 'Disputed' },
};

export default function EscrowPage() {
  const [selectedId, setSelectedId] = useState(mockEscrow[0].id);
  const selected = mockEscrow.find((e) => e.id === selectedId)!;

  const activeCount = mockEscrow.filter((e) => e.status === 'funded' || e.status === 'pending').length;
  const releasedCount = mockEscrow.filter((e) => e.status === 'released').length;
  const totalValue = mockEscrow.reduce((a, e) => a + e.amount, 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Escrow" description="Secure transactions with milestone-based fund releases.">
        <Button size="sm" className="gap-1.5">
          <Shield className="h-4 w-4" />
          New Escrow
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Active Escrows" value={String(activeCount)} icon={<Shield className="h-5 w-5" />} />
        <StatCard title="Released" value={String(releasedCount)} icon={<CheckCircle2 className="h-5 w-5" />} delay={0.05} />
        <StatCard title="Total Value" value={formatCurrencyWithSymbol(totalValue, 'USD')} delay={0.1} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Escrow list */}
        <div className="space-y-3 lg:col-span-1">
          <h3 className="text-sm font-semibold text-muted-foreground">All Transactions</h3>
          {mockEscrow.map((esc, i) => {
            const config = statusConfig[esc.status];
            return (
              <motion.button
                key={esc.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                onClick={() => setSelectedId(esc.id)}
                className={cn(
                  'w-full rounded-xl border p-4 text-left transition-all',
                  selectedId === esc.id
                    ? 'border-primary bg-primary/5 shadow-premium'
                    : 'border-border hover:border-primary/30 hover:bg-muted/40',
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{esc.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{esc.buyer} → {esc.seller}</p>
                  </div>
                  <Badge variant={config.variant}>
                    {config.label}
                  </Badge>
                </div>
                <p className="mt-2 text-sm font-semibold">{formatCurrencyWithSymbol(esc.amount, esc.currency)}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{formatDate(esc.createdAt)}</p>
              </motion.button>
            );
          })}
        </div>

        {/* Escrow detail */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold font-display">{selected.title}</h3>
                <p className="text-sm text-muted-foreground">Created {formatDate(selected.createdAt)}</p>
              </div>
              <Badge variant={statusConfig[selected.status].variant}>
                {statusConfig[selected.status].label}
              </Badge>
            </div>

            {/* Parties */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border p-4">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <User className="h-3.5 w-3.5" />
                  Buyer
                </div>
                <p className="mt-2 text-sm font-semibold">{selected.buyer}</p>
              </div>
              <div className="rounded-xl border border-border p-4">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <Building2 className="h-3.5 w-3.5" />
                  Seller
                </div>
                <p className="mt-2 text-sm font-semibold">{selected.seller}</p>
              </div>
            </div>

            {/* Amount */}
            <div className="mt-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 p-4">
              <p className="text-xs text-muted-foreground">Total Escrow Amount</p>
              <p className="mt-1 text-2xl font-bold font-display">{formatCurrencyWithSymbol(selected.amount, selected.currency)}</p>
            </div>

            {/* Milestones */}
            <div className="mt-6">
              <h4 className="text-sm font-semibold">Milestones</h4>
              <div className="mt-3 space-y-3">
                {selected.milestones.map((ms: EscrowMilestone, i: number) => {
                  const config = milestoneStatusConfig[ms.status];
                  return (
                    <motion.div
                      key={ms.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      className="rounded-xl border border-border p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                            ms.status === 'released' ? 'bg-success/10 text-success' :
                            ms.status === 'approved' ? 'bg-accent/10 text-accent' :
                            ms.status === 'disputed' ? 'bg-destructive/10 text-destructive' :
                            'bg-muted text-muted-foreground',
                          )}>
                            {ms.status === 'released' ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{ms.title}</p>
                            <p className="text-xs text-muted-foreground">{ms.description}</p>
                            <p className="mt-1 text-xs text-muted-foreground">Due: {formatDate(ms.dueDate)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">{formatCurrencyWithSymbol(ms.amount, selected.currency)}</p>
                          <Badge variant={config.variant} className="mt-1">{config.label}</Badge>
                        </div>
                      </div>
                      {ms.status === 'approved' && (
                        <Button size="sm" className="mt-3 gap-1.5">
                          <DollarSign className="h-3.5 w-3.5" />
                          Release Funds
                        </Button>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Timeline */}
            <div className="mt-6">
              <h4 className="text-sm font-semibold">Transaction Timeline</h4>
              <div className="mt-3 space-y-3">
                {[
                  { event: 'Escrow created', date: selected.createdAt, done: true },
                  { event: 'Buyer funded escrow', date: '2026-07-16', done: selected.status !== 'pending' },
                  { event: 'Milestone 1 released', date: '2026-07-25', done: selected.milestones[0]?.status === 'released' },
                  { event: 'Milestone 2 approved', date: '2026-08-10', done: selected.milestones[1]?.status === 'approved' || selected.milestones[1]?.status === 'released' },
                ].map((t, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-full',
                      t.done ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground',
                    )}>
                      {t.done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{t.event}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(t.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

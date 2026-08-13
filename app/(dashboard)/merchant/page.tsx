'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Store, TrendingUp, Users, FileText, CheckCircle2, Clock,
  ShoppingBag, CreditCard, Link2, ArrowRight, Shield,
} from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { RevenueAreaChart, VolumeBarChart } from '@/components/charts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/status-badge';
import { financialEngine } from '@/services/financial-engine';
import { initFromSupabase } from '@/services/data-access';
import { merchantService } from '@/services/merchant.service';
import { settlementService } from '@/services/settlement.service';
import { ledgerService } from '@/services/ledger.service';
import { mockInvoices, mockPaymentLinks } from '@/services/legacy-mock-data';
import { formatCurrencyWithSymbol, formatDate, formatCompact } from '@/lib/utils';
import type { MerchantAccount, MerchantBalance } from '@/types';

export default function MerchantPage() {
  const [ready, setReady] = useState(false);
  const [merchant, setMerchant] = useState<MerchantAccount | undefined>();
  const [balance, setBalance] = useState<MerchantBalance | null>(null);
  const [settlements, setSettlements] = useState<{ id: string; amount: number; netAmount: number; currency: string; status: string; createdAt: string; settledAt?: string }[]>([]);
  const [revenueData, setRevenueData] = useState<{ label: string; value: number; secondary: number }[]>([]);
  const [volumeData, setVolumeData] = useState<{ label: string; value: number }[]>([]);
  const [txCount, setTxCount] = useState(0);

  useEffect(() => {
    (async () => {
      await initFromSupabase();

      const m = financialEngine.getCurrentMerchant();
    setMerchant(m);
    if (m) {
      setBalance(merchantService.getBalance(m.id));
      setSettlements(settlementService.getByMerchant(m.id).map((s) => ({
        id: s.id, amount: s.amount, netAmount: s.netAmount, currency: s.currency, status: s.status, createdAt: s.createdAt, settledAt: s.settledAt,
      })));
    }

    setRevenueData(financialEngine.getMonthlyRevenue());
    setVolumeData(financialEngine.getDailyVolume());
    setTxCount(financialEngine.getAllTransactions().length);

      setReady(true);
    })();
  }, []);

  if (!ready) {
    return (
      <div className="space-y-6">
        <PageHeader title="Merchant Dashboard" description="Your business overview, sales, and customer activity." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Merchant Dashboard" description="Your business overview — balances calculated from the ledger.">
        <Button variant="outline" size="sm" className="gap-1.5">
          <Link2 className="h-4 w-4" />
          Payment Links
        </Button>
        <Button asChild size="sm" className="gap-1.5">
          <Link href="/checkout">
            <CreditCard className="h-4 w-4" />
            Checkout
          </Link>
        </Button>
      </PageHeader>

      {/* Merchant profile banner */}
      <Card className="overflow-hidden p-0">
        <div className="relative h-24 bg-gradient-to-r from-primary to-accent" />
        <div className="px-6 pb-5">
          <div className="-mt-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-background bg-card text-2xl font-bold font-display text-primary">
                {merchant?.businessName?.slice(0, 2).toUpperCase() ?? 'AC'}
              </div>
              <div className="pb-1">
                <h2 className="text-xl font-bold font-display">{merchant?.businessName ?? 'Acme Corp'}</h2>
                <p className="text-sm text-muted-foreground">{merchant?.category ?? 'Technology'} • {merchant?.country ?? 'United States'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={merchant?.verificationStatus === 'verified' ? 'success' : 'warning'}>
                <CheckCircle2 className="h-3 w-3" />
                {merchant?.verificationStatus ?? 'verified'}
              </Badge>
              <Badge variant="info">{merchant?.settlementSchedule ?? 'weekly'} settlement</Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats — from ledger */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Available Balance" value={balance ? formatCurrencyWithSymbol(balance.available, balance.currency) : '—'} change={15.2} icon={<TrendingUp className="h-5 w-5" />} />
        <StatCard title="Pending Settlement" value={balance ? formatCurrencyWithSymbol(balance.pending, balance.currency) : '—'} change={8.4} icon={<Store className="h-5 w-5" />} delay={0.05} />
        <StatCard title="Rolling Reserve" value={balance ? formatCurrencyWithSymbol(balance.reserve, balance.currency) : '—'} subtitle={`${(merchant?.rollingReserveRate ?? 0.05) * 100}% rate`} icon={<Shield className="h-5 w-5" />} delay={0.1} />
        <StatCard title="Total Transactions" value={formatCompact(txCount)} delay={0.15} />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <h3 className="text-lg font-semibold font-display">Sales Overview</h3>
          <p className="text-sm text-muted-foreground">From ledger — monthly</p>
          <div className="mt-4"><RevenueAreaChart data={revenueData} height={260} /></div>
        </Card>

        <Card className="p-5">
          <h3 className="text-lg font-semibold font-display">Weekly Volume</h3>
          <p className="text-sm text-muted-foreground">From ledger — daily</p>
          <div className="mt-4"><VolumeBarChart data={volumeData} height={260} /></div>
        </Card>
      </div>

      {/* Settlement history + Products */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="text-lg font-semibold font-display">Settlement History</h3>
          <p className="text-sm text-muted-foreground">From settlement service</p>
          <div className="mt-4 space-y-3">
            {settlements.length > 0 ? settlements.slice(0, 6).map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-muted/40"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/10 text-success">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{formatCurrencyWithSymbol(s.netAmount, s.currency as any)}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(s.createdAt)}</p>
                  </div>
                </div>
                <Badge variant={s.status === 'completed' ? 'success' : s.status === 'failed' ? 'error' : 'warning'}>
                  {s.status}
                </Badge>
              </motion.div>
            )) : (
              <p className="py-8 text-center text-sm text-muted-foreground">No settlements yet</p>
            )}
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold font-display">Products</h3>
            <Button variant="ghost" size="sm" className="gap-1 text-xs">
              View all <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
          <div className="space-y-3">
            {[
              { name: 'Pro License', price: 49, sales: 87 },
              { name: 'Enterprise Plan', price: 199, sales: 24 },
              { name: 'Add-on: Analytics', price: 29, sales: 142 },
            ].map((p, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                    <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.sales} sales</p>
                  </div>
                </div>
                <p className="text-sm font-semibold">{formatCurrencyWithSymbol(p.price, 'USD')}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Invoices */}
      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold font-display">Recent Invoices</h3>
          <Button asChild variant="ghost" size="sm" className="gap-1 text-xs">
            <Link href="/invoices">View all <ArrowRight className="h-3 w-3" /></Link>
          </Button>
        </div>
        <div className="space-y-3">
          {mockInvoices.slice(0, 4).map((inv) => (
            <div key={inv.id} className="flex items-center justify-between rounded-lg border border-border p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">{inv.number}</p>
                  <p className="text-xs text-muted-foreground">{inv.client}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">{formatCurrencyWithSymbol(inv.amount, inv.currency)}</p>
                <Badge variant={inv.status === 'paid' ? 'success' : inv.status === 'overdue' ? 'error' : 'outline'}>
                  {inv.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

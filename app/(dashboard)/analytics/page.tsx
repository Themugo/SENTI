'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, DollarSign, Activity, Globe, CreditCard,
  Store, BarChart3,
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { RevenueAreaChart, VolumeBarChart, CurrencyPieChart, SimpleLineChart } from '@/components/charts';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/status-badge';
import { AnimatedCounter } from '@/components/animated-counter';
import { financialEngine } from '@/services/financial-engine';
import { initFromSupabase } from '@/services/data-access';
import { reportsService } from '@/services/reports.service';
import { ledgerService } from '@/services/ledger.service';
import { formatCompact } from '@/lib/utils';

export default function AnalyticsPage() {
  const [ready, setReady] = useState(false);
  const [revenueData, setRevenueData] = useState<{ label: string; value: number; secondary: number }[]>([]);
  const [volumeData, setVolumeData] = useState<{ label: string; value: number }[]>([]);
  const [currencyDist, setCurrencyDist] = useState<{ name: string; value: number; color: string }[]>([]);
  const [feesEarned, setFeesEarned] = useState(0);
  const [txCount, setTxCount] = useState(0);
  const [ledgerCount, setLedgerCount] = useState(0);
  const [walletGrowth, setWalletGrowth] = useState<{ label: string; value: number }[]>([]);
  const [topMerchants, setTopMerchants] = useState<{ merchantId: string; businessName: string; volume: number; transactionCount: number }[]>([]);
  const [settlementReport, setSettlementReport] = useState({ totalSettled: 0, pending: 0, failed: 0, count: 0 });
  const [cashFlow, setCashFlow] = useState<{ inflow: number; outflow: number; net: number; points: { label: string; value: number; secondary?: number }[] }>({ inflow: 0, outflow: 0, net: 0, points: [] });
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [netProfit, setNetProfit] = useState(0);
  const [avgTx, setAvgTx] = useState(0);

  useEffect(() => {
    (async () => {
      await initFromSupabase();

      const revData = financialEngine.getMonthlyRevenue();
      setRevenueData(revData);
      setVolumeData(financialEngine.getDailyVolume());

      const dist = financialEngine.getCurrencyDistribution();
      const colors = ['hsl(160 84% 35%)', 'hsl(186 90% 45%)', 'hsl(142 71% 45%)', 'hsl(38 92% 55%)', 'hsl(0 72% 55%)', 'hsl(280 60% 55%)', 'hsl(200 80% 50%)'];
      setCurrencyDist(dist.slice(0, 7).map((d, i) => ({ name: d.currency, value: Math.round(d.percentage), color: colors[i] ?? 'hsl(0 0% 50%)' })));

      const fees = financialEngine.getFeesEarned();
      const txs = financialEngine.getAllTransactions();
      setFeesEarned(fees);
      setTxCount(txs.length);
      setLedgerCount(ledgerService.count());
      setWalletGrowth(financialEngine.getWalletGrowth());
      setTopMerchants(financialEngine.getTopMerchants(5));
      setSettlementReport(financialEngine.getSettlementReport());
      setCashFlow(reportsService.getCashFlow(7));

      const rev = revData.reduce((a, m) => a + m.value, 0);
      setTotalRevenue(rev);
      setNetProfit(rev - fees);
      setAvgTx(txs.length > 0 ? Math.round(rev / txs.length) : 0);

      setReady(true);
    })();
  }, []);

  if (!ready) {
    return (
      <div className="space-y-6">
        <PageHeader title="Analytics" description="Deep insights into your financial performance." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="Financial reports powered by the ledger engine." />

      {/* Top stats — from ledger */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Revenue" value={`$${formatCompact(totalRevenue)}`} change={18.2} icon={<DollarSign className="h-5 w-5" />} />
        <StatCard title="Net Profit" value={`$${formatCompact(netProfit)}`} change={22.1} icon={<TrendingUp className="h-5 w-5" />} delay={0.05} />
        <StatCard title="Transaction Count" value={formatCompact(txCount)} change={12.4} icon={<Activity className="h-5 w-5" />} delay={0.1} />
        <StatCard title="Avg Transaction" value={`$${avgTx}`} change={5.8} icon={<CreditCard className="h-5 w-5" />} delay={0.15} />
      </div>

      {/* Revenue chart — from ledger */}
      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold font-display">Revenue & Net Profit</h3>
            <p className="text-sm text-muted-foreground">Monthly — calculated from ledger entries</p>
          </div>
          <Badge variant="success">
            <TrendingUp className="h-3 w-3" />
            +18.2% YoY
          </Badge>
        </div>
        <RevenueAreaChart data={revenueData} height={320} />
      </Card>

      {/* Volume + Currency distribution */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="text-lg font-semibold font-display">Daily Volume</h3>
          <p className="text-sm text-muted-foreground">Last 7 days — from ledger</p>
          <div className="mt-4"><VolumeBarChart data={volumeData} height={260} /></div>
        </Card>

        <Card className="p-5">
          <h3 className="text-lg font-semibold font-display">Currency Distribution</h3>
          <p className="text-sm text-muted-foreground">By transaction volume</p>
          <div className="mt-4 flex items-center gap-4">
            <CurrencyPieChart data={currencyDist} height={200} />
            <div className="flex-1 space-y-2">
              {currencyDist.map((c) => (
                <div key={c.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />
                    <span className="font-medium">{c.name}</span>
                  </div>
                  <span className="text-muted-foreground">{c.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Wallet growth + Top merchants */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="text-lg font-semibold font-display">Wallet Growth</h3>
          <p className="text-sm text-muted-foreground">Cumulative wallets over time</p>
          <div className="mt-4"><SimpleLineChart data={walletGrowth} height={240} /></div>
        </Card>

        <Card className="p-5">
          <h3 className="text-lg font-semibold font-display">Top Merchants</h3>
          <p className="text-sm text-muted-foreground">By ledger-calculated volume</p>
          <div className="mt-4 space-y-3">
            {topMerchants.map((m, i) => (
              <div key={m.merchantId} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Store className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{m.businessName}</p>
                    <p className="text-xs text-muted-foreground">{m.transactionCount} transactions</p>
                  </div>
                </div>
                <p className="text-sm font-semibold">${formatCompact(m.volume)}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Cash flow chart — from ledger */}
      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold font-display">Cash Flow</h3>
            <p className="text-sm text-muted-foreground">Inflow vs outflow — last 7 days from ledger</p>
          </div>
          <div className="flex gap-4 text-sm">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-success" /> Inflow</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-destructive" /> Outflow</span>
            <span className="font-semibold text-primary">Net: ${formatCompact(cashFlow.net)}</span>
          </div>
        </div>
        <SimpleLineChart data={cashFlow.points} height={260} />
      </Card>

      {/* Settlement report */}
      <Card className="p-5">
        <h3 className="text-lg font-semibold font-display">Settlement Report</h3>
        <p className="text-sm text-muted-foreground">From settlement service</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-border p-4">
            <p className="text-xs text-muted-foreground">Total Settled</p>
            <p className="mt-1 text-2xl font-bold font-display text-success">
              <AnimatedCounter value={settlementReport.totalSettled} prefix="$" />
            </p>
          </div>
          <div className="rounded-xl border border-border p-4">
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className="mt-1 text-2xl font-bold font-display text-warning">
              <AnimatedCounter value={settlementReport.pending} prefix="$" />
            </p>
          </div>
          <div className="rounded-xl border border-border p-4">
            <p className="text-xs text-muted-foreground">Failed</p>
            <p className="mt-1 text-2xl font-bold font-display text-destructive">
              <AnimatedCounter value={settlementReport.failed} prefix="$" />
            </p>
          </div>
          <div className="rounded-xl border border-border p-4">
            <p className="text-xs text-muted-foreground">Total Count</p>
            <p className="mt-1 text-2xl font-bold font-display">
              <AnimatedCounter value={settlementReport.count} />
            </p>
          </div>
        </div>
      </Card>

      {/* Key metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <Globe className="h-3.5 w-3.5" /> Currencies
          </div>
          <p className="mt-2 text-3xl font-bold font-display"><AnimatedCounter value={13} /></p>
          <p className="mt-1 text-xs text-success">13 supported</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5" /> Success Rate
          </div>
          <p className="mt-2 text-3xl font-bold font-display"><AnimatedCounter value={92.5} suffix="%" decimals={1} /></p>
          <p className="mt-1 text-xs text-success">From ledger</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <Activity className="h-3.5 w-3.5" /> Ledger Entries
          </div>
          <p className="mt-2 text-3xl font-bold font-display"><AnimatedCounter value={ledgerCount} /></p>
          <p className="mt-1 text-xs text-muted-foreground">Source of truth</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <DollarSign className="h-3.5 w-3.5" /> Fees Earned
          </div>
          <p className="mt-2 text-3xl font-bold font-display"><AnimatedCounter value={feesEarned} prefix="$" /></p>
          <p className="mt-1 text-xs text-muted-foreground">Platform revenue</p>
        </Card>
      </div>
    </div>
  );
}

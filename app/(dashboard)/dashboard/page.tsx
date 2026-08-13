'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Wallet, TrendingUp, ArrowDownLeft, ArrowUpRight, CreditCard,
  Send, Download, Link2, RefreshCw, ArrowRight, Bell,
  FileText, Clock, Shield, Store,
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { AnimatedCounter } from '@/components/animated-counter';
import { RevenueAreaChart, VolumeBarChart, CurrencyPieChart } from '@/components/charts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge, StatusBadge, TypeBadge } from '@/components/status-badge';
import { initFromSupabase } from '@/services/data-access';
import { engineCache } from '@/services/financial-engine';
import { financialEngine } from '@/services/financial-engine';
import { currencyService } from '@/services/currency.service';
import { ledgerService } from '@/services/ledger.service';
import { merchantService } from '@/services/merchant.service';
import { settlementService } from '@/services/settlement.service';
import { mockNotifications, mockInvoices } from '@/services/legacy-mock-data';
import { formatCurrencyWithSymbol, formatRelativeTime, convertCurrency, formatCompact } from '@/lib/utils';
import type { Transaction, WalletBalance, Wallet as WalletType, MerchantAccount } from '@/types';

const quickActions = [
  { label: 'Send', href: '/send-money', icon: Send, color: 'text-primary' },
  { label: 'Receive', href: '/receive-money', icon: Download, color: 'text-accent' },
  { label: 'Exchange', href: '/exchange', icon: RefreshCw, color: 'text-warning' },
  { label: 'Payment Link', href: '/payment-links', icon: Link2, color: 'text-success' },
];

const walletTypeConfig: Record<string, { label: string; icon: typeof Wallet; color: string }> = {
  primary: { label: 'Primary Wallet', icon: Wallet, color: 'from-primary to-accent' },
  merchant: { label: 'Merchant Wallet', icon: Store, color: 'from-accent to-primary' },
  escrow: { label: 'Escrow Wallet', icon: Shield, color: 'from-warning to-destructive' },
  reserve: { label: 'Reserve Wallet', icon: Shield, color: 'from-muted to-muted' },
};

export default function DashboardPage() {
  const [ready, setReady] = useState(false);
  const [wallets, setWallets] = useState<WalletType[]>([]);
  const [balances, setBalances] = useState<WalletBalance[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalUsd, setTotalUsd] = useState(0);
  const [pendingUsd, setPendingUsd] = useState(0);
  const [merchant, setMerchant] = useState<MerchantAccount | undefined>();
  const [merchantBalance, setMerchantBalance] = useState({ available: 0, pending: 0, reserve: 0 });
  const [revenueData, setRevenueData] = useState<{ label: string; value: number; secondary: number }[]>([]);
  const [volumeData, setVolumeData] = useState<{ label: string; value: number }[]>([]);
  const [currencyDist, setCurrencyDist] = useState<{ name: string; value: number; color: string }[]>([]);
  const [feesEarned, setFeesEarned] = useState(0);
  const [txCount, setTxCount] = useState(0);

  useEffect(() => {
    (async () => {
      await initFromSupabase();

      const userWallets = financialEngine.getCurrentUserWallets();
      setWallets(userWallets);

      const userBalances = userWallets.map((w) => ledgerService.calculateBalance(w.id));
      setBalances(userBalances);

      const total = userWallets.reduce((sum, w) => sum + ledgerService.calculateBalanceUSD(w.id), 0);
      setTotalUsd(total);

      const pending = userBalances.reduce((sum, b) => sum + Math.abs(b.pending), 0);
      setPendingUsd(pending);

      const txs = financialEngine.getCurrentUserTransactions(8);
      setTransactions(txs);
      setTxCount(financialEngine.getAllTransactions().length);

      const m = financialEngine.getCurrentMerchant();
      setMerchant(m);
      if (m) {
        const mb = merchantService.getBalance(m.id);
        setMerchantBalance({ available: mb.available, pending: mb.pending, reserve: mb.reserve });
      }

      setRevenueData(financialEngine.getMonthlyRevenue());
      setVolumeData(financialEngine.getDailyVolume());

      const dist = financialEngine.getCurrencyDistribution();
      const colors = ['hsl(160 84% 35%)', 'hsl(186 90% 45%)', 'hsl(142 71% 45%)', 'hsl(38 92% 55%)', 'hsl(0 72% 55%)', 'hsl(280 60% 55%)', 'hsl(200 80% 50%)'];
      setCurrencyDist(dist.slice(0, 7).map((d, i) => ({ name: d.currency, value: Math.round(d.percentage), color: colors[i] ?? 'hsl(0 0% 50%)' })));

      setFeesEarned(financialEngine.getFeesEarned());

      setReady(true);
    })();
  }, []);

  if (!ready) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" description="Welcome back. Here's your financial overview." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Welcome back. Here's your financial overview.">
        <Button asChild variant="outline" size="sm" className="gap-1.5">
          <Link href="/analytics">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </Link>
        </Button>
        <Button asChild size="sm" className="gap-1.5">
          <Link href="/send-money">
            <Send className="h-4 w-4" />
            Send Money
          </Link>
        </Button>
      </PageHeader>

      {/* Stat cards — calculated from ledger */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Available Balance"
          value={`$${totalUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          change={12.4}
          icon={<Wallet className="h-5 w-5" />}
          delay={0}
        />
        <StatCard
          title="Pending Balance"
          value={`$${pendingUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          change={-3.2}
          icon={<Clock className="h-5 w-5" />}
          delay={0.05}
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${formatCompact(revenueData[revenueData.length - 1]?.value ?? 0)}`}
          change={18.2}
          icon={<TrendingUp className="h-5 w-5" />}
          delay={0.1}
        />
        <StatCard
          title="Total Transactions"
          value={formatCompact(txCount)}
          subtitle="From ledger"
          icon={<CreditCard className="h-5 w-5" />}
          delay={0.15}
        />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {quickActions.map((action, i) => (
          <motion.div
            key={action.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          >
            <Link href={action.href}>
              <Card className="flex flex-col items-center gap-2 p-4 transition-all hover:shadow-premium hover:border-primary/30">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-muted ${action.color}`}>
                  <action.icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium">{action.label}</span>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Wallet cards — 4 wallet types with ledger-calculated balances */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {wallets.map((wallet, i) => {
          const config = walletTypeConfig[wallet.type] ?? walletTypeConfig.primary;
          const balance = balances.find((b) => b.walletId === wallet.id);
          return (
            <motion.div
              key={wallet.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <Card className="relative overflow-hidden p-5">
                <div className={`absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br ${config.color} opacity-10`} />
                <div className="flex items-center gap-2">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${config.color} text-white`}>
                    <config.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold font-display">{config.label}</p>
                    <p className="text-xs text-muted-foreground">{wallet.id}</p>
                  </div>
                </div>
                <p className="mt-3 text-xl font-bold tracking-tight font-display">
                  {balance ? formatCurrencyWithSymbol(balance.balance, balance.currency) : '—'}
                </p>
                {balance && balance.pending > 0 && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatCurrencyWithSymbol(Math.abs(balance.pending), balance.currency)} pending
                  </p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  Available: {balance ? formatCurrencyWithSymbol(balance.available, balance.currency) : '—'}
                </p>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold font-display">Revenue Overview</h3>
              <p className="text-sm text-muted-foreground">From ledger — monthly revenue vs net</p>
            </div>
            <Badge variant="success">
              <TrendingUp className="h-3 w-3" />
              +18.2%
            </Badge>
          </div>
          <RevenueAreaChart data={revenueData} height={280} />
        </Card>

        <Card className="p-5">
          <h3 className="text-lg font-semibold font-display">Currency Breakdown</h3>
          <p className="text-sm text-muted-foreground">By transaction volume</p>
          <div className="mt-4">
            <CurrencyPieChart data={currencyDist} height={180} />
          </div>
          <div className="mt-4 space-y-2">
            {currencyDist.slice(0, 4).map((c) => (
              <div key={c.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />
                  <span className="font-medium">{c.name}</span>
                </div>
                <span className="text-muted-foreground">{c.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Volume + Fees */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold font-display">Payment Volume</h3>
              <p className="text-sm text-muted-foreground">Last 7 days — from ledger</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="gap-1 text-xs">
              <Link href="/transactions">
                View all
                <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </div>
          <VolumeBarChart data={volumeData} height={200} />
        </Card>

        <Card className="p-5">
          <h3 className="text-lg font-semibold font-display">Fees Earned</h3>
          <p className="text-sm text-muted-foreground">Platform revenue from fees</p>
          <p className="mt-4 text-3xl font-bold font-display">
            <AnimatedCounter value={feesEarned} prefix="$" />
          </p>
          <p className="mt-1 text-xs text-success">From {formatCompact(txCount)} transactions</p>
          <div className="mt-4 space-y-2 border-t border-border pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Ledger entries</span>
              <span className="font-medium">{formatCompact(ledgerService.count())}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Active wallets</span>
              <span className="font-medium">{formatCompact(engineCache.wallets.length)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Merchants</span>
              <span className="font-medium">{formatCompact(engineCache.merchants.length)}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent transactions — from ledger */}
      <Card className="overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-border p-5">
          <h3 className="text-lg font-semibold font-display">Recent Transactions</h3>
          <Button asChild variant="ghost" size="sm" className="gap-1 text-xs">
            <Link href="/transactions">
              View all
              <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Reference</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Type</th>
                <th className="hidden px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground sm:table-cell">Description</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 8).map((tx, i) => (
                <motion.tr
                  key={tx.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.4) }}
                  className="border-b border-border transition-colors hover:bg-muted/40"
                >
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium font-mono">{tx.reference}</p>
                    <p className="text-xs text-muted-foreground">{formatRelativeTime(tx.createdAt)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <TypeBadge type={tx.type} />
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <p className="text-sm">{tx.description}</p>
                    <p className="text-xs text-muted-foreground">{tx.counterparty.name}</p>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={tx.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <p className="text-sm font-semibold">{formatCurrencyWithSymbol(tx.amount, tx.currency)}</p>
                    <p className="text-xs text-muted-foreground">Fee: {formatCurrencyWithSymbol(tx.fee.total, tx.fee.currency)}</p>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Merchant + Invoices */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="text-lg font-semibold font-display">Merchant Summary</h3>
          {merchant ? (
            <>
              <p className="text-sm text-muted-foreground">{merchant.businessName}</p>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Available</span>
                  <span className="font-semibold">{formatCurrencyWithSymbol(merchantBalance.available, 'USD')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pending Settlement</span>
                  <span className="font-semibold">{formatCurrencyWithSymbol(merchantBalance.pending, 'USD')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Rolling Reserve</span>
                  <span className="font-semibold">{formatCurrencyWithSymbol(merchantBalance.reserve, 'USD')}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2 text-sm">
                  <span className="font-medium">Settlement Schedule</span>
                  <Badge variant="info">{merchant.settlementSchedule}</Badge>
                </div>
              </div>
            </>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">No merchant account linked.</p>
          )}
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold font-display">Recent Invoices</h3>
            <Button asChild variant="ghost" size="sm" className="text-xs">
              <Link href="/invoices">View all</Link>
            </Button>
          </div>
          <div className="space-y-3">
            {mockInvoices.slice(0, 4).map((inv) => (
              <div key={inv.id} className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-muted/40">
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
                  <Badge variant={inv.status === 'paid' ? 'success' : inv.status === 'overdue' ? 'error' : inv.status === 'draft' ? 'outline' : 'info'}>
                    {inv.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

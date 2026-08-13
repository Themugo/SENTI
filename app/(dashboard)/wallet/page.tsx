'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, ArrowUpRight, RefreshCw, Send, TrendingUp, TrendingDown,
  Shield, Store, Wallet as WalletIcon,
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/status-badge';
import { initFromSupabase } from '@/services/data-access';
import { financialEngine } from '@/services/financial-engine';
import { ledgerService } from '@/services/ledger.service';
import { formatCurrencyWithSymbol, convertCurrency, formatPercent } from '@/lib/utils';
import type { Wallet as WalletType, WalletBalance } from '@/types';

const walletActions = [
  { label: 'Deposit', icon: Plus, color: 'bg-success/10 text-success' },
  { label: 'Withdraw', icon: ArrowUpRight, color: 'bg-warning/10 text-warning' },
  { label: 'Transfer', icon: Send, color: 'bg-primary/10 text-primary' },
  { label: 'Exchange', icon: RefreshCw, color: 'bg-accent/10 text-accent' },
];

const walletTypeConfig: Record<string, { label: string; icon: typeof WalletIcon; gradient: string; description: string }> = {
  primary: { label: 'Primary Wallet', icon: WalletIcon, gradient: 'from-primary to-accent', description: 'Your main wallet for everyday transactions' },
  merchant: { label: 'Merchant Wallet', icon: Store, gradient: 'from-accent to-primary', description: 'Funds from merchant payments and checkout' },
  escrow: { label: 'Escrow Wallet', icon: Shield, gradient: 'from-warning to-destructive', description: 'Funds held in escrow for milestone-based transactions' },
  reserve: { label: 'Reserve Wallet', icon: Shield, gradient: 'from-muted-foreground to-muted', description: 'Rolling reserve held for merchant risk management' },
};

export default function WalletPage() {
  const [ready, setReady] = useState(false);
  const [wallets, setWallets] = useState<WalletType[]>([]);
  const [balances, setBalances] = useState<WalletBalance[]>([]);
  const [totalUsd, setTotalUsd] = useState(0);
  const [pendingUsd, setPendingUsd] = useState(0);

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
      setReady(true);
    })();
  }, []);

  if (!ready) {
    return (
      <div className="space-y-6">
        <PageHeader title="Wallet" description="Manage your multi-currency balances across all accounts." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Wallet" description="Manage your multi-currency balances across all accounts.">
        <Button variant="outline" size="sm" className="gap-1.5">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Add Money
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Balance" value={`$${totalUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} change={12.4} icon={<TrendingUp className="h-5 w-5" />} />
        <StatCard title="Pending" value={`$${pendingUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} change={-3.2} icon={<TrendingDown className="h-5 w-5" />} delay={0.05} />
        <StatCard title="Active Wallets" value={String(wallets.length)} subtitle="4 wallet types" delay={0.1} />
        <StatCard title="Ledger Entries" value={ledgerService.count().toLocaleString()} subtitle="Source of truth" delay={0.15} />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {walletActions.map((action, i) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 transition-all hover:shadow-premium hover:border-primary/30"
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${action.color}`}>
              <action.icon className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium">{action.label}</span>
          </motion.button>
        ))}
      </div>

      {/* 4 Wallet Types with ledger-calculated balances */}
      <div className="grid gap-4 md:grid-cols-2">
        {wallets.map((wallet, i) => {
          const config = walletTypeConfig[wallet.type] ?? walletTypeConfig.primary;
          const balance = balances.find((b) => b.walletId === wallet.id);
          const usdValue = ledgerService.calculateBalanceUSD(wallet.id);

          return (
            <motion.div
              key={wallet.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <Card className="group relative overflow-hidden p-5 transition-all hover:shadow-premium-lg hover:border-primary/30">
                <div className={`absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br ${config.gradient} opacity-10`} />

                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${config.gradient} text-white shadow-premium`}>
                      <config.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold font-display">{config.label}</p>
                      <p className="text-xs text-muted-foreground">{wallet.id}</p>
                    </div>
                  </div>
                  <Badge variant={wallet.status === 'active' ? 'success' : 'warning'}>
                    {wallet.status}
                  </Badge>
                </div>

                <p className="mt-2 text-xs text-muted-foreground">{config.description}</p>

                <div className="mt-4 space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-muted-foreground">Balance</span>
                    <span className="text-2xl font-bold tracking-tight font-display">
                      {balance ? formatCurrencyWithSymbol(balance.balance, balance.currency) : '—'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Available</span>
                    <span className="font-medium">
                      {balance ? formatCurrencyWithSymbol(balance.available, balance.currency) : '—'}
                    </span>
                  </div>
                  {balance && balance.pending !== 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Pending</span>
                      <span className="font-medium text-warning">
                        {formatCurrencyWithSymbol(Math.abs(balance.pending), balance.currency)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm border-t border-border pt-2">
                    <span className="text-muted-foreground">In USD</span>
                    <span className="font-medium">
                      ≈ ${usdValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 gap-1 text-xs">
                    <Plus className="h-3 w-3" />
                    Add
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 gap-1 text-xs">
                    <Send className="h-3 w-3" />
                    Send
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 gap-1 text-xs">
                    <RefreshCw className="h-3 w-3" />
                    Swap
                  </Button>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

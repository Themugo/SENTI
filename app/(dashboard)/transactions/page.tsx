'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Filter, Download, ArrowDownLeft, ArrowUpRight,
  ChevronRight, X,
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge, TypeBadge } from '@/components/status-badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { financialEngine } from '@/services/financial-engine';
import { initFromSupabase } from '@/services/data-access';
import { currencyService } from '@/services/currency.service';
import { formatCurrencyWithSymbol, formatRelativeTime } from '@/lib/utils';
import type { Transaction, TransactionType, TransactionStatus, CurrencyCode, PaymentMethod } from '@/types';

const allTypes: TransactionType[] = [
  'deposit', 'withdrawal', 'card_payment', 'bank_transfer',
  'mpesa', 'airtel_money', 'internal_transfer', 'currency_exchange',
  'refund', 'chargeback', 'escrow_hold', 'escrow_release',
  'subscription', 'invoice_payment', 'merchant_settlement',
];

const allStatuses: TransactionStatus[] = [
  'created', 'authorized', 'processing', 'settled', 'completed', 'failed', 'cancelled', 'reversed',
];

const allCurrencies: CurrencyCode[] = ['USD', 'KES', 'EUR', 'GBP', 'NGN', 'TZS', 'UGX', 'RWF', 'AED', 'CAD', 'AUD', 'JPY', 'CHF'];

const allMethods: PaymentMethod[] = ['card', 'bank', 'mpesa', 'airtel', 'wallet', 'apple_pay', 'google_pay', 'paypal'];

export default function TransactionsPage() {
  const [ready, setReady] = useState(false);
  const [allTxs, setAllTxs] = useState<Transaction[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [currencyFilter, setCurrencyFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  useEffect(() => {
    (async () => {
      await initFromSupabase();
      setAllTxs(financialEngine.getAllTransactions());
      setReady(true);
    })();
  }, []);

  const filtered = useMemo(() => {
    return allTxs.filter((tx) => {
      const q = search.toLowerCase();
      const matchesSearch = !search ||
        tx.reference.toLowerCase().includes(q) ||
        tx.counterparty.name.toLowerCase().includes(q) ||
        tx.counterparty.email?.toLowerCase().includes(q) ||
        tx.description.toLowerCase().includes(q) ||
        tx.sourceWalletId.toLowerCase().includes(q) ||
        tx.destinationWalletId.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;
      const matchesType = typeFilter === 'all' || tx.type === typeFilter;
      const matchesCurrency = currencyFilter === 'all' || tx.currency === currencyFilter;
      const matchesMethod = methodFilter === 'all' || tx.paymentMethod === methodFilter;
      return matchesSearch && matchesStatus && matchesType && matchesCurrency && matchesMethod;
    }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [allTxs, search, statusFilter, typeFilter, currencyFilter, methodFilter]);

  const totalIncoming = filtered
    .filter((t) => ['deposit', 'refund', 'escrow_release', 'invoice_payment'].includes(t.type))
    .reduce((a, t) => a + currencyService.convert(t.amount, t.currency, 'USD'), 0);
  const totalOutgoing = filtered
    .filter((t) => ['withdrawal', 'card_payment', 'bank_transfer', 'internal_transfer'].includes(t.type))
    .reduce((a, t) => a + currencyService.convert(t.amount, t.currency, 'USD'), 0);

  const hasActiveFilters = statusFilter !== 'all' || typeFilter !== 'all' || currencyFilter !== 'all' || methodFilter !== 'all' || search;

  if (!ready) {
    return (
      <div className="space-y-6">
        <PageHeader title="Transactions" description="View and manage all your payment activity." />
        <div className="grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Transactions" description="View and manage all your payment activity.">
        <Button variant="outline" size="sm" className="gap-1.5">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Total Incoming" value={`$${totalIncoming.toLocaleString('en-US', { maximumFractionDigits: 0 })}`} icon={<ArrowDownLeft className="h-5 w-5" />} />
        <StatCard title="Total Outgoing" value={`$${totalOutgoing.toLocaleString('en-US', { maximumFractionDigits: 0 })}`} icon={<ArrowUpRight className="h-5 w-5" />} delay={0.05} />
        <StatCard title="Total Transactions" value={allTxs.length.toLocaleString()} subtitle="From ledger" delay={0.1} />
      </div>

      {/* Search & Filters */}
      <Card className="p-4">
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by reference, wallet, email, merchant, description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {allStatuses.map((s) => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {allTypes.map((t) => <SelectItem key={t} value={t}>{t.replace(/_/g, ' ')}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
              <SelectTrigger className="w-[120px]"><SelectValue placeholder="Currency" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Currencies</SelectItem>
                {allCurrencies.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Method" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                {allMethods.map((m) => <SelectItem key={m} value={m}>{m.replace(/_/g, ' ')}</SelectItem>)}
              </SelectContent>
            </Select>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" className="gap-1" onClick={() => {
                setSearch(''); setStatusFilter('all'); setTypeFilter('all'); setCurrencyFilter('all'); setMethodFilter('all');
              }}>
                <X className="h-3.5 w-3.5" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Transactions table */}
      <Card className="overflow-hidden p-0">
        <div className="border-b border-border p-4">
          <p className="text-sm text-muted-foreground">
            Showing {filtered.length.toLocaleString()} of {allTxs.length.toLocaleString()} transactions
          </p>
        </div>
        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Reference</th>
                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Type</th>
                  <th className="hidden px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground md:table-cell">Description</th>
                  <th className="hidden px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground sm:table-cell">Method</th>
                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Amount</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 100).map((tx, i) => (
                  <motion.tr
                    key={tx.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: Math.min(i * 0.02, 0.3) }}
                    className="cursor-pointer border-b border-border transition-colors hover:bg-muted/40"
                    onClick={() => setSelectedTx(tx)}
                  >
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium font-mono">{tx.reference}</p>
                      <p className="text-xs text-muted-foreground">{formatRelativeTime(tx.createdAt)}</p>
                    </td>
                    <td className="px-4 py-3"><TypeBadge type={tx.type} /></td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <p className="text-sm">{tx.description}</p>
                      <p className="text-xs text-muted-foreground">{tx.counterparty.name}</p>
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <span className="text-sm text-muted-foreground capitalize">{tx.paymentMethod.replace(/_/g, ' ')}</span>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={tx.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <p className="text-sm font-semibold">{formatCurrencyWithSymbol(tx.amount, tx.currency)}</p>
                      <p className="text-xs text-muted-foreground">Fee: {formatCurrencyWithSymbol(tx.fee.total, tx.fee.currency)}</p>
                    </td>
                    <td className="px-4 py-3"><ChevronRight className="h-4 w-4 text-muted-foreground" /></td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Filter className="h-10 w-10 text-muted-foreground" />
            <p className="mt-4 text-sm font-medium">No transactions found</p>
            <p className="mt-1 text-xs text-muted-foreground">Try adjusting your filters</p>
          </div>
        )}
      </Card>

      {/* Transaction detail drawer */}
      {selectedTx && (
        <TransactionDetail tx={selectedTx} onClose={() => setSelectedTx(null)} />
      )}
    </div>
  );
}

function TransactionDetail({ tx, onClose }: { tx: Transaction; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        className="relative h-full w-full max-w-md overflow-y-auto border-l border-border bg-card p-6 shadow-premium-lg"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold font-display">Transaction Details</h3>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
        </div>

        <div className="mt-6 space-y-4">
          <div className="rounded-xl bg-muted/50 p-4">
            <p className="text-xs text-muted-foreground">Reference</p>
            <p className="font-mono text-sm font-medium">{tx.reference}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">Type</p>
              <TypeBadge type={tx.type} />
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">Status</p>
              <StatusBadge status={tx.status} />
            </div>
          </div>

          <div className="rounded-xl border border-border p-4">
            <p className="text-xs text-muted-foreground">Amount</p>
            <p className="text-2xl font-bold font-display">{formatCurrencyWithSymbol(tx.amount, tx.currency)}</p>
            {tx.exchangeRate && (
              <p className="mt-1 text-xs text-muted-foreground">Rate: {tx.exchangeRate.toFixed(4)}</p>
            )}
          </div>

          {/* Fee breakdown */}
          <div className="rounded-xl border border-border p-4">
            <p className="text-sm font-semibold">Fee Breakdown</p>
            <div className="mt-3 space-y-2">
              {tx.fee.flatFee > 0 && (
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Flat Fee</span><span>{formatCurrencyWithSymbol(tx.fee.flatFee, tx.fee.currency)}</span></div>
              )}
              {tx.fee.percentageFee > 0 && (
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Processing Fee</span><span>{formatCurrencyWithSymbol(tx.fee.percentageFee, tx.fee.currency)}</span></div>
              )}
              {tx.fee.fxFee > 0 && (
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">FX Fee</span><span>{formatCurrencyWithSymbol(tx.fee.fxFee, tx.fee.currency)}</span></div>
              )}
              {tx.fee.settlementFee > 0 && (
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Settlement Fee</span><span>{formatCurrencyWithSymbol(tx.fee.settlementFee, tx.fee.currency)}</span></div>
              )}
              {tx.fee.merchantFee > 0 && (
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Merchant Fee</span><span>{formatCurrencyWithSymbol(tx.fee.merchantFee, tx.fee.currency)}</span></div>
              )}
              {tx.fee.platformFee > 0 && (
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Platform Fee</span><span>{formatCurrencyWithSymbol(tx.fee.platformFee, tx.fee.currency)}</span></div>
              )}
              <div className="flex justify-between border-t border-border pt-2 text-sm font-semibold">
                <span>Total Fees</span>
                <span>{formatCurrencyWithSymbol(tx.fee.total, tx.fee.currency)}</span>
              </div>
            </div>
          </div>

          {/* Counterparty */}
          <div className="rounded-xl border border-border p-4">
            <p className="text-sm font-semibold">Counterparty</p>
            <p className="mt-2 text-sm">{tx.counterparty.name}</p>
            {tx.counterparty.email && <p className="text-xs text-muted-foreground">{tx.counterparty.email}</p>}
          </div>

          {/* Wallets */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">Source</p>
              <p className="font-mono text-xs">{tx.sourceWalletId}</p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">Destination</p>
              <p className="font-mono text-xs">{tx.destinationWalletId}</p>
            </div>
          </div>

          {/* Timeline */}
          <div className="rounded-xl border border-border p-4">
            <p className="text-sm font-semibold">Timeline</p>
            <div className="mt-3 space-y-3">
              {tx.timeline.map((event, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${
                    event.status === 'completed' ? 'bg-success/10 text-success' :
                    event.status === 'failed' ? 'bg-destructive/10 text-destructive' :
                    event.status === 'reversed' ? 'bg-destructive/10 text-destructive' :
                    event.status === 'cancelled' ? 'bg-muted text-muted-foreground' :
                    'bg-accent/10 text-accent'
                  }`}>
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium capitalize">{event.status}</p>
                    <p className="text-xs text-muted-foreground">{new Date(event.timestamp).toLocaleString()}</p>
                    {event.note && <p className="text-xs text-muted-foreground">{event.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ledger entries */}
          <div className="rounded-xl border border-border p-4">
            <p className="text-sm font-semibold">Ledger Entries</p>
            <div className="mt-2 space-y-1">
              {tx.ledgerEntryIds.map((id) => (
                <p key={id} className="font-mono text-xs text-muted-foreground">{id}</p>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

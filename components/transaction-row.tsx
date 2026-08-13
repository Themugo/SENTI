'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowDownLeft, ArrowUpRight, RefreshCw, ArrowLeftRight, CreditCard, FileText, Store, Shield } from 'lucide-react';
import { StatusBadge } from '@/components/status-badge';
import { formatCurrencyWithSymbol, formatRelativeTime, getInitials } from '@/lib/utils';
import type { LegacyTransaction as Transaction } from '@/types';

const typeIcons: Record<string, React.ReactNode> = {
  incoming: <ArrowDownLeft className="h-4 w-4 text-success" />,
  outgoing: <ArrowUpRight className="h-4 w-4 text-destructive" />,
  exchange: <RefreshCw className="h-4 w-4 text-accent" />,
  deposit: <ArrowDownLeft className="h-4 w-4 text-success" />,
  withdrawal: <ArrowUpRight className="h-4 w-4 text-warning" />,
  fee: <ArrowUpRight className="h-4 w-4 text-muted-foreground" />,
  refund: <ArrowDownLeft className="h-4 w-4 text-success" />,
};

const categoryIcons: Record<string, React.ReactNode> = {
  payment: <CreditCard className="h-4 w-4" />,
  transfer: <ArrowLeftRight className="h-4 w-4" />,
  merchant: <Store className="h-4 w-4" />,
  subscription: <RefreshCw className="h-4 w-4" />,
  escrow: <Shield className="h-4 w-4" />,
  invoice: <FileText className="h-4 w-4" />,
  card: <CreditCard className="h-4 w-4" />,
  exchange: <RefreshCw className="h-4 w-4" />,
};

export function TransactionRow({ tx, index = 0 }: { tx: Transaction; index?: number }) {
  const isIncoming = tx.type === 'incoming' || tx.type === 'deposit' || tx.type === 'refund';
  const sign = isIncoming ? '+' : '-';

  return (
    <motion.tr
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.4) }}
      className="border-b border-border transition-colors hover:bg-muted/40"
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
            {typeIcons[tx.type] ?? categoryIcons[tx.category]}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{tx.counterparty.name}</p>
            <p className="truncate text-xs text-muted-foreground">{tx.description}</p>
          </div>
        </div>
      </td>
      <td className="hidden px-4 py-3 sm:table-cell">
        <span className="text-sm text-muted-foreground">{tx.reference}</span>
      </td>
      <td className="hidden px-4 py-3 md:table-cell">
        <span className="text-sm text-muted-foreground">{tx.method ?? '—'}</span>
      </td>
      <td className="hidden px-4 py-3 sm:table-cell">
        <StatusBadge status={tx.status} />
      </td>
      <td className="px-4 py-3 text-right">
        <p className={`text-sm font-semibold ${isIncoming ? 'text-success' : 'text-foreground'}`}>
          {sign}{formatCurrencyWithSymbol(tx.amount, tx.currency)}
        </p>
        <p className="text-xs text-muted-foreground">{formatRelativeTime(tx.date)}</p>
      </td>
    </motion.tr>
  );
}

export function TransactionList({ transactions, limit }: { transactions: Transaction[]; limit?: number }) {
  const items = limit ? transactions.slice(0, limit) : transactions;
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Counterparty</th>
            <th className="hidden px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground sm:table-cell">Reference</th>
            <th className="hidden px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground md:table-cell">Method</th>
            <th className="hidden px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground sm:table-cell">Status</th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((tx, i) => (
            <TransactionRow key={tx.id} tx={tx} index={i} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

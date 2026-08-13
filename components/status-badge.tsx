import { cn } from '@/lib/utils';
import type { TransactionStatus } from '@/types';

const statusConfig: Partial<Record<TransactionStatus, { label: string; className: string }>> = {
  created: { label: 'Created', className: 'bg-muted text-muted-foreground border-border' },
  authorized: { label: 'Authorized', className: 'bg-accent/10 text-accent border-accent/20' },
  processing: { label: 'Processing', className: 'bg-accent/10 text-accent border-accent/20' },
  settled: { label: 'Settled', className: 'bg-primary/10 text-primary border-primary/20' },
  completed: { label: 'Completed', className: 'bg-success/10 text-success border-success/20' },
  failed: { label: 'Failed', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  cancelled: { label: 'Cancelled', className: 'bg-muted text-muted-foreground border-border' },
  reversed: { label: 'Reversed', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  // Legacy compat
  pending: { label: 'Pending', className: 'bg-warning/10 text-warning border-warning/20' },
  refunded: { label: 'Refunded', className: 'bg-muted text-muted-foreground border-border' },
};

export function StatusBadge({ status, className }: { status: TransactionStatus; className?: string }) {
  const config = statusConfig[status] ?? { label: status, className: 'bg-muted text-muted-foreground border-border' };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        config.className,
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {config.label}
    </span>
  );
}

export function TypeBadge({ type, className }: { type: string; className?: string }) {
  const labels: Record<string, { label: string; className: string }> = {
    deposit: { label: 'Deposit', className: 'bg-success/10 text-success' },
    withdrawal: { label: 'Withdrawal', className: 'bg-warning/10 text-warning' },
    card_payment: { label: 'Card', className: 'bg-primary/10 text-primary' },
    bank_transfer: { label: 'Bank', className: 'bg-accent/10 text-accent' },
    mpesa: { label: 'M-Pesa', className: 'bg-success/10 text-success' },
    airtel_money: { label: 'Airtel', className: 'bg-success/10 text-success' },
    internal_transfer: { label: 'Transfer', className: 'bg-primary/10 text-primary' },
    currency_exchange: { label: 'Exchange', className: 'bg-accent/10 text-accent' },
    refund: { label: 'Refund', className: 'bg-muted text-muted-foreground' },
    chargeback: { label: 'Chargeback', className: 'bg-destructive/10 text-destructive' },
    escrow_hold: { label: 'Escrow Hold', className: 'bg-warning/10 text-warning' },
    escrow_release: { label: 'Escrow Release', className: 'bg-success/10 text-success' },
    subscription: { label: 'Subscription', className: 'bg-primary/10 text-primary' },
    invoice_payment: { label: 'Invoice', className: 'bg-accent/10 text-accent' },
    merchant_settlement: { label: 'Settlement', className: 'bg-primary/10 text-primary' },
    fee: { label: 'Fee', className: 'bg-muted text-muted-foreground' },
    // Legacy
    incoming: { label: 'Incoming', className: 'bg-success/10 text-success' },
    outgoing: { label: 'Outgoing', className: 'bg-destructive/10 text-destructive' },
    exchange: { label: 'Exchange', className: 'bg-accent/10 text-accent' },
  };
  const config = labels[type] ?? { label: type, className: 'bg-muted text-muted-foreground' };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium',
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  );
}

export function Badge({
  children,
  variant = 'default',
  className,
}: {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline';
  className?: string;
}) {
  const variants = {
    default: 'bg-primary/10 text-primary border-primary/20',
    success: 'bg-success/10 text-success border-success/20',
    warning: 'bg-warning/10 text-warning border-warning/20',
    error: 'bg-destructive/10 text-destructive border-destructive/20',
    info: 'bg-accent/10 text-accent border-accent/20',
    outline: 'border-border text-muted-foreground',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

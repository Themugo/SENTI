'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Link2,
  Plus,
  Copy,
  QrCode,
  Check,
  Clock,
  DollarSign,
  TrendingUp,
  ExternalLink,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/status-badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { cn, formatDate, formatCurrencyWithSymbol } from '@/lib/utils';
import { paymentLinkService } from '@/services/paymentlink.service';
import { CURRENCIES } from '@/constants';
import type { PaymentLinkV2, PaymentLinkType, CurrencyCode } from '@/types';

// ─── Helpers ───────────────────────────────────────────────

const TYPE_LABELS: Record<PaymentLinkType, string> = {
  one_time: 'One-time',
  invoice: 'Invoice',
  subscription: 'Subscription',
};

const TYPE_BADGE_VARIANT: Record<PaymentLinkType, 'default' | 'info' | 'success'> = {
  one_time: 'default',
  invoice: 'info',
  subscription: 'success',
};

function statusBadge(status: PaymentLinkV2['status']) {
  switch (status) {
    case 'active':
      return <Badge variant="success">Active</Badge>;
    case 'inactive':
      return <Badge variant="outline">Inactive</Badge>;
    case 'expired':
      return <Badge variant="warning">Expired</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

// ─── Create Link Form State ─────────────────────────────────

interface CreateLinkForm {
  name: string;
  description: string;
  amount: string;
  currency: CurrencyCode;
  type: PaymentLinkType;
  customerName: string;
  expiryDate: string;
  redirectUrl: string;
  webhookUrl: string;
}

const EMPTY_FORM: CreateLinkForm = {
  name: '',
  description: '',
  amount: '',
  currency: 'USD',
  type: 'one_time',
  customerName: '',
  expiryDate: '',
  redirectUrl: '',
  webhookUrl: '',
};

// ─── Page ───────────────────────────────────────────────────

export default function PaymentLinksPage() {
  const [links, setLinks] = useState<PaymentLinkV2[]>(() => paymentLinkService.getAll());
  const [stats, setStats] = useState(() => paymentLinkService.getStats());
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<CreateLinkForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [qrId, setQrId] = useState<string | null>(null);

  function refresh() {
    setLinks(paymentLinkService.getAll());
    setStats(paymentLinkService.getStats());
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error('Link name is required');
      return;
    }
    const amount = Number(form.amount);
    if (!form.amount || isNaN(amount) || amount <= 0) {
      toast.error('Enter a valid amount');
      return;
    }

    setSubmitting(true);
    try {
      paymentLinkService.create({
        merchantId: 'mcht_demo',
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        amount,
        currency: form.currency,
        type: form.type,
        customerName: form.customerName.trim() || undefined,
        expiryDate: form.expiryDate || undefined,
        redirectUrl: form.redirectUrl.trim() || undefined,
        webhookUrl: form.webhookUrl.trim() || undefined,
      });
      toast.success('Payment link created', {
        description: `"${form.name}" is now live and ready to share.`,
      });
      setForm(EMPTY_FORM);
      setCreateOpen(false);
      refresh();
    } catch {
      toast.error('Failed to create payment link');
    } finally {
      setSubmitting(false);
    }
  }

  function handleCopy(link: PaymentLinkV2) {
    navigator.clipboard.writeText(link.url);
    setCopiedId(link.id);
    toast.success('Link copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  }

  function handleDeactivate(link: PaymentLinkV2) {
    paymentLinkService.deactivate(link.id);
    toast.success('Payment link deactivated', {
      description: `"${link.name}" is no longer accepting payments.`,
    });
    refresh();
  }

  function toggleQr(link: PaymentLinkV2) {
    setQrId((prev) => (prev === link.id ? null : link.id));
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment Links"
        description="Create shareable links to accept payments from anyone, anywhere."
      >
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              Create Payment Link
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Payment Link</DialogTitle>
              <DialogDescription>
                Generate a shareable link to accept payments. Fields marked with
                <span className="font-medium text-foreground"> * </span> are required.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreate} className="space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <Label htmlFor="pl-name">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="pl-name"
                  placeholder="e.g. Premium subscription"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label htmlFor="pl-desc">Description</Label>
                <Input
                  id="pl-desc"
                  placeholder="What is this link for?"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              {/* Amount + Currency */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="pl-amount">
                    Amount <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <DollarSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="pl-amount"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="pl-9"
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Currency</Label>
                  <Select
                    value={form.currency}
                    onValueChange={(v) => setForm({ ...form, currency: v as CurrencyCode })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => (
                        <SelectItem key={code} value={code}>
                          <span className="mr-1.5">{CURRENCIES[code].flag}</span>
                          {code} — {CURRENCIES[code].name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Type + Customer */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Type</Label>
                  <Select
                    value={form.type}
                    onValueChange={(v) => setForm({ ...form, type: v as PaymentLinkType })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="one_time">One-time</SelectItem>
                      <SelectItem value="invoice">Invoice</SelectItem>
                      <SelectItem value="subscription">Subscription</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pl-customer">Customer name</Label>
                  <Input
                    id="pl-customer"
                    placeholder="Optional"
                    value={form.customerName}
                    onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                  />
                </div>
              </div>

              {/* Expiry */}
              <div className="space-y-1.5">
                <Label htmlFor="pl-expiry">Expiry date</Label>
                <Input
                  id="pl-expiry"
                  type="date"
                  value={form.expiryDate}
                  onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                />
              </div>

              {/* Redirect URL */}
              <div className="space-y-1.5">
                <Label htmlFor="pl-redirect">Redirect URL</Label>
                <Input
                  id="pl-redirect"
                  type="url"
                  placeholder="https://yoursite.com/thanks"
                  value={form.redirectUrl}
                  onChange={(e) => setForm({ ...form, redirectUrl: e.target.value })}
                />
              </div>

              {/* Webhook URL */}
              <div className="space-y-1.5">
                <Label htmlFor="pl-webhook">Webhook URL</Label>
                <Input
                  id="pl-webhook"
                  type="url"
                  placeholder="https://api.yoursite.com/webhooks/payment"
                  value={form.webhookUrl}
                  onChange={(e) => setForm({ ...form, webhookUrl: e.target.value })}
                />
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="gap-1.5">
                  {submitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      Creating…
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Create Link
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* ─── Summary Stats ─────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Links"
          value={String(stats.total)}
          icon={<Link2 className="h-5 w-5" />}
          subtitle="All time"
        />
        <StatCard
          title="Active"
          value={String(stats.active)}
          icon={<TrendingUp className="h-5 w-5" />}
          delay={0.05}
          subtitle={`${stats.inactive} inactive · ${stats.expired} expired`}
        />
        <StatCard
          title="Total Collected"
          value={formatCurrencyWithSymbol(stats.totalCollected, 'USD')}
          icon={<DollarSign className="h-5 w-5" />}
          delay={0.1}
          subtitle="Across all links"
        />
        <StatCard
          title="Total Payments"
          value={String(stats.totalPayments)}
          icon={<Clock className="h-5 w-5" />}
          delay={0.15}
          subtitle="Lifetime transactions"
        />
      </div>

      {/* ─── Links Table ───────────────────────────────────── */}
      <Card className="overflow-hidden p-0">
        {links.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Name
                  </th>
                  <th className="hidden px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground md:table-cell">
                    URL
                  </th>
                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Amount
                  </th>
                  <th className="hidden px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground lg:table-cell">
                    Type
                  </th>
                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Status
                  </th>
                  <th className="hidden px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground sm:table-cell">
                    Payments
                  </th>
                  <th className="hidden px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground lg:table-cell">
                    Collected
                  </th>
                  <th className="hidden px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground xl:table-cell">
                    Created
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {links.map((link, i) => (
                  <motion.tr
                    key={link.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.04 }}
                    className="border-b border-border transition-colors last:border-0 hover:bg-muted/40"
                  >
                    {/* Name */}
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-2.5">
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Link2 className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{link.name}</p>
                          {link.customerName && (
                            <p className="truncate text-xs text-muted-foreground">
                              {link.customerName}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* URL */}
                    <td className="hidden px-4 py-3 md:table-cell">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleCopy(link)}
                          className="group flex max-w-[180px] items-center gap-1.5 text-sm text-primary hover:underline"
                          title="Copy link"
                        >
                          {copiedId === link.id ? (
                            <Check className="h-3.5 w-3.5 shrink-0 text-success" />
                          ) : (
                            <Copy className="h-3.5 w-3.5 shrink-0" />
                          )}
                          <span className="truncate">{link.url.replace('https://', '')}</span>
                        </button>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium">
                        {formatCurrencyWithSymbol(link.amount, link.currency)}
                      </p>
                    </td>

                    {/* Type */}
                    <td className="hidden px-4 py-3 lg:table-cell">
                      <Badge variant={TYPE_BADGE_VARIANT[link.type]}>
                        {TYPE_LABELS[link.type]}
                      </Badge>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">{statusBadge(link.status)}</td>

                    {/* Payments */}
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <span className="text-sm text-muted-foreground">{link.payments}</span>
                    </td>

                    {/* Collected */}
                    <td className="hidden px-4 py-3 lg:table-cell">
                      <span className="text-sm font-medium">
                        {formatCurrencyWithSymbol(link.totalCollected, link.currency)}
                      </span>
                    </td>

                    {/* Created */}
                    <td className="hidden px-4 py-3 xl:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {formatDate(link.createdAt)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => toggleQr(link)}
                          title="Show QR code"
                        >
                          <QrCode className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleCopy(link)}
                          title="Copy link"
                        >
                          {copiedId === link.id ? (
                            <Check className="h-4 w-4 text-success" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                          title="Open link"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleDeactivate(link)}
                          disabled={link.status !== 'active'}
                          title="Deactivate link"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 px-6 py-20 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Link2 className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <p className="text-base font-medium">No payment links yet</p>
              <p className="text-sm text-muted-foreground">
                Create your first payment link to start accepting payments from anyone.
              </p>
            </div>
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Create Payment Link
            </Button>
          </div>
        )}
      </Card>

      {/* ─── QR Code Modal ──────────────────────────────────── */}
      <AnimatePresence>
        {qrId &&
          (() => {
            const link = links.find((l) => l.id === qrId);
            if (!link) return null;
            return (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
                onClick={() => setQrId(null)}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-full max-w-sm rounded-xl border bg-background p-6 shadow-lg"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">{link.name}</p>
                      <p className="text-xs text-muted-foreground">QR Code</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setQrId(null)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-col items-center gap-4">
                    {link.qrCode ? (
                      <img
                        src={link.qrCode}
                        alt={`QR code for ${link.name}`}
                        className="h-48 w-48 rounded-lg border"
                      />
                    ) : (
                      <div className="flex h-48 w-48 items-center justify-center rounded-lg border bg-muted">
                        <QrCode className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    <p className="break-all text-center text-xs text-muted-foreground">
                      {link.url}
                    </p>
                    <Button
                      size="sm"
                      className="w-full gap-1.5"
                      onClick={() => handleCopy(link)}
                    >
                      {copiedId === link.id ? (
                        <>
                          <Check className="h-4 w-4" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" /> Copy Link
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            );
          })()}
      </AnimatePresence>
    </div>
  );
}

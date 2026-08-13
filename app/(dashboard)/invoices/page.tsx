'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  AlertCircle,
  Check,
  Clock,
  DollarSign,
  Download,
  FileText,
  Plus,
  Send,
  Trash2,
  X,
} from 'lucide-react';

import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { Badge } from '@/components/status-badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn, formatCurrencyWithSymbol, formatDate } from '@/lib/utils';
import { invoiceService } from '@/services/invoice.service';
import type {
  CurrencyCode,
  InvoiceLineItem,
  InvoiceStatusV2,
  InvoiceV2,
} from '@/types';

// ─── Helpers ─────────────────────────────────────────────────

const CURRENCIES: CurrencyCode[] = [
  'USD', 'EUR', 'GBP', 'KES', 'NGN', 'TZS', 'UGX', 'RWF',
  'AED', 'CAD', 'AUD', 'JPY', 'CHF', 'ZAR',
];

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline';

function statusVariant(status: InvoiceStatusV2): BadgeVariant {
  switch (status) {
    case 'draft': return 'warning';
    case 'sent': return 'info';
    case 'paid': return 'success';
    case 'overdue': return 'error';
    case 'void': return 'warning';
    case 'uncollectible': return 'error';
    default: return 'outline';
  }
}

function statusIcon(status: InvoiceStatusV2) {
  switch (status) {
    case 'paid': return <Check className="h-3 w-3" />;
    case 'sent': return <Send className="h-3 w-3" />;
    case 'overdue': return <AlertCircle className="h-3 w-3" />;
    case 'draft': return <FileText className="h-3 w-3" />;
    case 'void': return <X className="h-3 w-3" />;
    case 'uncollectible': return <AlertCircle className="h-3 w-3" />;
    default: return <Clock className="h-3 w-3" />;
  }
}

// ─── Create Invoice Form ────────────────────────────────────

interface CreateFormState {
  customerName: string;
  customerEmail: string;
  currency: CurrencyCode;
  dueDate: string;
  notes: string;
  items: InvoiceLineItem[];
}

const emptyItem = (): InvoiceLineItem => ({
  description: '',
  quantity: 1,
  rate: 0,
});

const initialFormState: CreateFormState = {
  customerName: '',
  customerEmail: '',
  currency: 'USD',
  dueDate: '',
  notes: '',
  items: [emptyItem()],
};

interface CreateInvoiceFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (form: CreateFormState) => void;
}

function CreateInvoiceForm({ open, onClose, onSubmit }: CreateInvoiceFormProps) {
  const [form, setForm] = useState<CreateFormState>(initialFormState);

  const update = <K extends keyof CreateFormState>(key: K, value: CreateFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateItem = (index: number, patch: Partial<InvoiceLineItem>) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }));
  };

  const addItem = () => {
    setForm((prev) => ({ ...prev, items: [...prev.items, emptyItem()] }));
  };

  const removeItem = (index: number) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.length > 1 ? prev.items.filter((_, i) => i !== index) : prev.items,
    }));
  };

  const subtotal = useMemo(
    () => form.items.reduce((sum, item) => sum + item.quantity * item.rate, 0),
    [form.items],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName.trim()) {
      toast.error('Customer name is required');
      return;
    }
    if (!form.customerEmail.trim()) {
      toast.error('Customer email is required');
      return;
    }
    if (!form.dueDate) {
      toast.error('Due date is required');
      return;
    }
    if (form.items.length === 0 || form.items.every((i) => !i.description.trim())) {
      toast.error('Add at least one line item');
      return;
    }
    onSubmit(form);
    setForm(initialFormState);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 backdrop-blur-sm p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-2xl my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border bg-muted/30 px-6 py-4">
                <div className="space-y-0.5">
                  <h2 className="text-lg font-semibold tracking-tight font-display">Create Invoice</h2>
                  <p className="text-xs text-muted-foreground">Fill in the details below to generate a new invoice.</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose} type="button">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Body */}
              <form onSubmit={handleSubmit} className="space-y-6 p-6">
                {/* Customer details */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="customer-name">Customer Name</Label>
                    <Input
                      id="customer-name"
                      placeholder="Acme Inc."
                      value={form.customerName}
                      onChange={(e) => update('customerName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customer-email">Customer Email</Label>
                    <Input
                      id="customer-email"
                      type="email"
                      placeholder="billing@acme.com"
                      value={form.customerEmail}
                      onChange={(e) => update('customerEmail', e.target.value)}
                    />
                  </div>
                </div>

                {/* Currency + Due date */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <select
                      id="currency"
                      value={form.currency}
                      onChange={(e) => update('currency', e.target.value as CurrencyCode)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="due-date">Due Date</Label>
                    <Input
                      id="due-date"
                      type="date"
                      value={form.dueDate}
                      onChange={(e) => update('dueDate', e.target.value)}
                    />
                  </div>
                </div>

                {/* Line items */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Line Items</Label>
                    <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={addItem}>
                      <Plus className="h-3.5 w-3.5" />
                      Add Item
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {form.items.map((item, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 items-end">
                        <div className="col-span-12 sm:col-span-6 space-y-1">
                          {index === 0 && <Label className="text-xs text-muted-foreground">Description</Label>}
                          <Input
                            placeholder="Service or product"
                            value={item.description}
                            onChange={(e) => updateItem(index, { description: e.target.value })}
                          />
                        </div>
                        <div className="col-span-5 sm:col-span-2 space-y-1">
                          {index === 0 && <Label className="text-xs text-muted-foreground">Qty</Label>}
                          <Input
                            type="number"
                            min={1}
                            step={1}
                            value={item.quantity}
                            onChange={(e) => updateItem(index, { quantity: Number(e.target.value) || 0 })}
                          />
                        </div>
                        <div className="col-span-5 sm:col-span-3 space-y-1">
                          {index === 0 && <Label className="text-xs text-muted-foreground">Unit Price</Label>}
                          <Input
                            type="number"
                            min={0}
                            step="0.01"
                            value={item.rate}
                            onChange={(e) => updateItem(index, { rate: Number(e.target.value) || 0 })}
                          />
                        </div>
                        <div className="col-span-2 sm:col-span-1 flex justify-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 text-muted-foreground hover:text-destructive"
                            onClick={() => removeItem(index)}
                            disabled={form.items.length === 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end pt-1">
                    <div className="text-right space-y-0.5">
                      <p className="text-xs text-muted-foreground">Subtotal</p>
                      <p className="text-base font-semibold tracking-tight font-display">
                        {formatCurrencyWithSymbol(subtotal, form.currency)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <textarea
                    id="notes"
                    rows={3}
                    placeholder="Payment terms, bank details, thank-you note…"
                    value={form.notes}
                    onChange={(e) => update('notes', e.target.value)}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
                  <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                  <Button type="submit" className="gap-1.5">
                    <Plus className="h-4 w-4" />
                    Create Invoice
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Page ────────────────────────────────────────────────────

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceV2[]>(() => invoiceService.getAll());
  const [stats, setStats] = useState(() => invoiceService.getStats());
  const [createOpen, setCreateOpen] = useState(false);

  const refresh = useCallback(() => {
    setInvoices(invoiceService.getAll());
    setStats(invoiceService.getStats());
  }, []);

  const handleCreate = (form: CreateFormState) => {
    invoiceService.create({
      merchantId: 'mcht_current',
      customerId: `cust_${Date.now().toString(36)}`,
      customerName: form.customerName,
      customerEmail: form.customerEmail,
      items: form.items.map((i) => ({
        description: i.description,
        quantity: i.quantity,
        unitPrice: i.rate,
      })) as unknown as InvoiceLineItem[],
      currency: form.currency,
      dueDate: new Date(form.dueDate).toISOString(),
      notes: form.notes || undefined,
    });
    setCreateOpen(false);
    refresh();
    toast.success('Invoice created as draft');
  };

  const handleSend = (id: string, number: string) => {
    invoiceService.send(id);
    refresh();
    toast.success(`Invoice ${number} sent to customer`);
  };

  const handleMarkPaid = (id: string, number: string) => {
    invoiceService.markPaid(id);
    refresh();
    toast.success(`Invoice ${number} marked as paid`);
  };

  const handleVoid = (id: string, number: string) => {
    invoiceService.void(id);
    refresh();
    toast.success(`Invoice ${number} voided`);
  };

  const handleDownload = (number: string) => {
    toast.info(`Downloading PDF for ${number}…`);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Invoices" description="Create, send, and track invoices to your clients.">
        <Button size="sm" className="gap-1.5" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Create Invoice
        </Button>
      </PageHeader>

      {/* Summary stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Total Invoices"
          value={String(stats.total)}
          icon={<FileText className="h-5 w-5" />}
        />
        <StatCard
          title="Paid"
          value={String(stats.paid)}
          icon={<Check className="h-5 w-5" />}
          delay={0.05}
        />
        <StatCard
          title="Overdue"
          value={String(stats.overdue)}
          icon={<AlertCircle className="h-5 w-5" />}
          delay={0.1}
        />
        <StatCard
          title="Total Amount"
          value={formatCurrencyWithSymbol(stats.totalAmount, 'USD')}
          icon={<DollarSign className="h-5 w-5" />}
          delay={0.15}
        />
        <StatCard
          title="Paid Amount"
          value={formatCurrencyWithSymbol(stats.paidAmount, 'USD')}
          icon={<DollarSign className="h-5 w-5" />}
          delay={0.2}
        />
      </div>

      {/* Invoices table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Number</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Customer</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Amount</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="hidden px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground md:table-cell">Issue Date</th>
                <th className="hidden px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground md:table-cell">Due Date</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <FileText className="h-10 w-10 opacity-40" />
                      <div>
                        <p className="text-sm font-medium">No invoices yet</p>
                        <p className="text-xs">Create your first invoice to get started.</p>
                      </div>
                      <Button size="sm" className="gap-1.5 mt-1" onClick={() => setCreateOpen(true)}>
                        <Plus className="h-4 w-4" />
                        Create Invoice
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                invoices.map((inv, i) => (
                  <motion.tr
                    key={inv.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.04 }}
                    className="border-b border-border transition-colors hover:bg-muted/40"
                  >
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium">{inv.number}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium">{inv.customerName}</p>
                      <p className="text-xs text-muted-foreground">{inv.customerEmail}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold">{formatCurrencyWithSymbol(inv.amount, inv.currency)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant(inv.status)}>
                        <span className="flex items-center gap-1">
                          {statusIcon(inv.status)}
                          <span className="capitalize">{inv.status}</span>
                        </span>
                      </Badge>
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <span className="text-sm text-muted-foreground">{formatDate(inv.issueDate)}</span>
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <span className={cn('text-sm', inv.status === 'overdue' ? 'font-medium text-destructive' : 'text-muted-foreground')}>
                        {formatDate(inv.dueDate)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {inv.status === 'draft' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1.5 text-xs"
                            onClick={() => handleSend(inv.id, inv.number)}
                          >
                            <Send className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Send</span>
                          </Button>
                        )}
                        {inv.status === 'sent' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1.5 text-xs"
                            onClick={() => handleMarkPaid(inv.id, inv.number)}
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Mark Paid</span>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1.5 text-xs"
                          onClick={() => handleDownload(inv.number)}
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">PDF</span>
                        </Button>
                        {(inv.status === 'draft' || inv.status === 'sent' || inv.status === 'overdue') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-destructive"
                            onClick={() => handleVoid(inv.id, inv.number)}
                          >
                            <X className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Void</span>
                          </Button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <CreateInvoiceForm
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
      />
    </div>
  );
}

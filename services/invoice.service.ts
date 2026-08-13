/**
 * Invoice Service
 * Professional invoice generation, timeline, payment status, PDF placeholder.
 */

import type { InvoiceV2, InvoiceStatusV2, InvoiceLineItem, CurrencyCode } from '@/types';
import { auditService } from './audit.service';

let invoices: InvoiceV2[] = [];
let counter = 0;

function nextNumber(): string {
  counter++;
  return `INV-2026-${counter.toString().padStart(5, '0')}`;
}

export const invoiceService = {
  /** Create an invoice. */
  create(params: {
    merchantId: string;
    customerId: string;
    customerName: string;
    customerEmail: string;
    items: InvoiceLineItem[];
    currency: CurrencyCode;
    dueDate: string;
    notes?: string;
    tax?: number;
    discount?: number;
  }): InvoiceV2 {
    const now = new Date().toISOString();
    const subtotal = params.items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
    const taxAmount = params.tax ?? 0;
    const discountAmount = params.discount ?? 0;
    const total = subtotal + taxAmount - discountAmount;

    const invoice: InvoiceV2 = {
      id: `INV-${Date.now().toString(36).toUpperCase()}`,
      number: nextNumber(),
      merchantId: params.merchantId,
      customerId: params.customerId,
      customerName: params.customerName,
      customerEmail: params.customerEmail,
      amount: total,
      currency: params.currency,
      status: 'draft',
      issueDate: now,
      dueDate: params.dueDate,
      items: params.items,
      notes: params.notes,
      tax: taxAmount,
      discount: discountAmount,
      createdAt: now,
    };
    invoices.push(invoice);

    auditService.log({
      type: 'settings_change',
      actorId: params.merchantId,
      actorName: 'Merchant',
      actorRole: 'merchant',
      action: `Invoice created: ${invoice.number}`,
      resourceType: 'invoice',
      resourceId: invoice.id,
      metadata: { amount: total, currency: params.currency },
    });

    return invoice;
  },

  /** Send an invoice. */
  send(id: string): InvoiceV2 | undefined {
    const inv = invoices.find((i) => i.id === id);
    if (!inv) return undefined;
    inv.status = 'sent';
    return inv;
  },

  /** Mark as paid. */
  markPaid(id: string): InvoiceV2 | undefined {
    const inv = invoices.find((i) => i.id === id);
    if (!inv) return undefined;
    inv.status = 'paid';
    inv.paidAt = new Date().toISOString();
    return inv;
  },

  /** Mark as overdue. */
  markOverdue(id: string): InvoiceV2 | undefined {
    const inv = invoices.find((i) => i.id === id);
    if (!inv) return undefined;
    inv.status = 'overdue';
    return inv;
  },

  /** Void an invoice. */
  void(id: string): InvoiceV2 | undefined {
    const inv = invoices.find((i) => i.id === id);
    if (!inv) return undefined;
    inv.status = 'void';
    return inv;
  },

  /** Get by ID. */
  getById(id: string): InvoiceV2 | undefined {
    return invoices.find((i) => i.id === id);
  },

  /** Get by merchant. */
  getByMerchant(merchantId: string): InvoiceV2[] {
    return invoices.filter((i) => i.merchantId === merchantId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  /** Get all invoices. */
  getAll(): InvoiceV2[] {
    return [...invoices].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  /** Get by status. */
  getByStatus(status: InvoiceStatusV2): InvoiceV2[] {
    return invoices.filter((i) => i.status === status);
  },

  /** Get stats. */
  getStats(): { total: number; paid: number; sent: number; overdue: number; draft: number; totalAmount: number; paidAmount: number } {
    return {
      total: invoices.length,
      paid: invoices.filter((i) => i.status === 'paid').length,
      sent: invoices.filter((i) => i.status === 'sent').length,
      overdue: invoices.filter((i) => i.status === 'overdue').length,
      draft: invoices.filter((i) => i.status === 'draft').length,
      totalAmount: invoices.reduce((s, i) => s + i.amount, 0),
      paidAmount: invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + i.amount, 0),
    };
  },

  /** Seed mock data. */
  _seed(data: InvoiceV2[]): void {
    invoices = data;
    counter = data.length;
  },
};

/**
 * Payment Link Service
 * Create and manage payment links with QR codes, expiry, and types.
 */

import type { PaymentLinkV2, PaymentLinkType, PaymentLinkStatus, CurrencyCode } from '@/types';
import { auditService } from './audit.service';

let links: PaymentLinkV2[] = [];
let counter = 0;

function nextId(): string {
  counter++;
  return `PL-${Date.now().toString(36).toUpperCase()}-${counter.toString().padStart(6, '0')}`;
}

function genUrl(name: string): string {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `https://pay.senti.com/c/${slug}-${Math.random().toString(36).slice(2, 6)}`;
}

function genQr(url: string): string {
  // Mock QR code as a data URI placeholder
  return `data:image/svg+xml;base64,${Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="white"/><text x="100" y="100" text-anchor="middle" font-size="10">${url}</text></svg>`).toString('base64')}`;
}

export const paymentLinkService = {
  /** Create a payment link. */
  create(params: {
    merchantId: string;
    name: string;
    description?: string;
    amount: number;
    currency: CurrencyCode;
    type?: PaymentLinkType;
    customerName?: string;
    expiryDate?: string;
    redirectUrl?: string;
    webhookUrl?: string;
  }): PaymentLinkV2 {
    const url = genUrl(params.name);
    const link: PaymentLinkV2 = {
      id: nextId(),
      reference: `REF-PL-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      merchantId: params.merchantId,
      name: params.name,
      description: params.description,
      amount: params.amount,
      currency: params.currency,
      type: params.type ?? 'one_time',
      status: 'active',
      url,
      customerName: params.customerName,
      expiryDate: params.expiryDate,
      redirectUrl: params.redirectUrl,
      webhookUrl: params.webhookUrl,
      payments: 0,
      totalCollected: 0,
      qrCode: genQr(url),
      createdAt: new Date().toISOString(),
    };
    links.push(link);

    auditService.log({
      type: 'settings_change',
      actorId: params.merchantId,
      actorName: 'Merchant',
      actorRole: 'merchant',
      action: `Payment link created: ${link.name}`,
      resourceType: 'payment_link',
      resourceId: link.id,
    });

    return link;
  },

  /** Get link by ID. */
  getById(id: string): PaymentLinkV2 | undefined {
    return links.find((l) => l.id === id);
  },

  /** Get links by merchant. */
  getByMerchant(merchantId: string): PaymentLinkV2[] {
    return links.filter((l) => l.merchantId === merchantId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  /** Get all links. */
  getAll(): PaymentLinkV2[] {
    return [...links].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  /** Deactivate a link. */
  deactivate(id: string): PaymentLinkV2 | undefined {
    const link = links.find((l) => l.id === id);
    if (!link) return undefined;
    link.status = 'inactive';
    return link;
  },

  /** Record a payment on a link. */
  recordPayment(id: string, amount: number): PaymentLinkV2 | undefined {
    const link = links.find((l) => l.id === id);
    if (!link) return undefined;
    link.payments++;
    link.totalCollected += amount;
    return link;
  },

  /** Get stats. */
  getStats(): { total: number; active: number; inactive: number; expired: number; totalCollected: number; totalPayments: number } {
    return {
      total: links.length,
      active: links.filter((l) => l.status === 'active').length,
      inactive: links.filter((l) => l.status === 'inactive').length,
      expired: links.filter((l) => l.status === 'expired').length,
      totalCollected: links.reduce((s, l) => s + l.totalCollected, 0),
      totalPayments: links.reduce((s, l) => s + l.payments, 0),
    };
  },

  /** Seed mock data. */
  _seed(data: PaymentLinkV2[]): void {
    links = data;
    counter = data.length;
  },
};

'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Eye,
  FileText,
  Gavel,
  ShieldCheck,
  Clock,
  TrendingDown,
  XCircle,
  CheckCircle2,
  ScrollText,
} from 'lucide-react';
import { toast } from 'sonner';

import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { Badge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn, formatDate, formatCurrencyWithSymbol } from '@/lib/utils';
import type {
  Dispute,
  DisputeReason,
  DisputeStatus,
  CurrencyCode,
} from '@/types';

// ─── Dispute status config ───────────────────────────────────

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline';

const statusConfig: Record<DisputeStatus, {
  label: string;
  variant: BadgeVariant;
  icon: React.ReactNode;
}> = {
  open: {
    label: 'Open',
    variant: 'warning',
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
  },
  under_review: {
    label: 'Under Review',
    variant: 'info',
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  won: {
    label: 'Won',
    variant: 'success',
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  lost: {
    label: 'Lost',
    variant: 'error',
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
  expired: {
    label: 'Expired',
    variant: 'warning',
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  challenged: {
    label: 'Challenged',
    variant: 'info',
    icon: <Gavel className="h-3.5 w-3.5" />,
  },
};

const reasonLabels: Record<DisputeReason, string> = {
  fraudulent: 'Fraudulent',
  unrecognized: 'Unrecognized',
  product_not_received: 'Product Not Received',
  product_unacceptable: 'Product Unacceptable',
  duplicate: 'Duplicate',
  subscription_canceled: 'Subscription Canceled',
  general: 'General',
};

type FilterStatus = DisputeStatus | 'all';

const filterOptions: { value: FilterStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
  { value: 'expired', label: 'Expired' },
  { value: 'challenged', label: 'Challenged' },
];

// ─── Mock data ───────────────────────────────────────────────

const mockDisputes: Dispute[] = [
  {
    id: 'dsp_001',
    reference: 'DSP-2024-7841',
    paymentIntentId: 'pi_9f2a1b8c',
    merchantId: 'mch_8a1f',
    amount: 1240.0,
    currency: 'USD',
    status: 'open',
    reason: 'fraudulent',
    evidenceSubmitted: false,
    evidenceCount: 0,
    customerEmail: 'j.holmes@protonmail.com',
    description: 'Cardholder claims this transaction was unauthorized. No prior history of disputes on this account.',
    timeline: [
      { status: 'open', timestamp: '2024-11-18T09:14:00Z', note: 'Dispute opened by cardholder via issuing bank.' },
    ],
    createdAt: '2024-11-18T09:14:00Z',
    dueDate: '2024-12-02T23:59:59Z',
  },
  {
    id: 'dsp_002',
    reference: 'DSP-2024-7842',
    paymentIntentId: 'pi_3c8d2e1a',
    merchantId: 'mch_2b7c',
    amount: 549.99,
    currency: 'USD',
    status: 'under_review',
    reason: 'product_not_received',
    evidenceSubmitted: true,
    evidenceCount: 3,
    customerEmail: 'amelia.k@gmail.com',
    description: 'Customer states order was never delivered. Tracking shows delivered but no signature captured.',
    timeline: [
      { status: 'open', timestamp: '2024-11-10T14:22:00Z', note: 'Dispute opened.' },
      { status: 'under_review', timestamp: '2024-11-12T08:00:00Z', note: 'Evidence submitted: delivery logs, courier confirmation, customer emails.' },
    ],
    createdAt: '2024-11-10T14:22:00Z',
    dueDate: '2024-11-24T23:59:59Z',
  },
  {
    id: 'dsp_003',
    reference: 'DSP-2024-7843',
    paymentIntentId: 'pi_7e1f3a9d',
    merchantId: 'mch_4d2e',
    amount: 89.0,
    currency: 'USD',
    status: 'won',
    reason: 'duplicate',
    evidenceSubmitted: true,
    evidenceCount: 2,
    customerEmail: 'r.singh@outlook.com',
    description: 'Duplicate charge dispute. Merchant provided proof of two separate authorized transactions.',
    timeline: [
      { status: 'open', timestamp: '2024-10-05T11:30:00Z', note: 'Dispute opened.' },
      { status: 'under_review', timestamp: '2024-10-06T16:45:00Z', note: 'Evidence submitted.' },
      { status: 'won', timestamp: '2024-10-15T10:00:00Z', note: 'Ruling in favor of merchant. Duplicate charges confirmed as separate transactions.' },
    ],
    createdAt: '2024-10-05T11:30:00Z',
    resolvedAt: '2024-10-15T10:00:00Z',
    dueDate: '2024-10-19T23:59:59Z',
  },
  {
    id: 'dsp_004',
    reference: 'DSP-2024-7844',
    paymentIntentId: 'pi_2b9c4f7e',
    merchantId: 'mch_8a1f',
    amount: 3200.0,
    currency: 'USD',
    status: 'lost',
    reason: 'product_unacceptable',
    evidenceSubmitted: true,
    evidenceCount: 4,
    customerEmail: 'd.brooks@icloud.com',
    description: 'Product quality dispute. Customer provided photos of damaged goods. Merchant evidence insufficient.',
    timeline: [
      { status: 'open', timestamp: '2024-09-20T13:00:00Z', note: 'Dispute opened.' },
      { status: 'under_review', timestamp: '2024-09-22T09:15:00Z', note: 'Evidence submitted.' },
      { status: 'lost', timestamp: '2024-10-01T14:30:00Z', note: 'Ruling in favor of cardholder. Refund issued to customer.' },
    ],
    createdAt: '2024-09-20T13:00:00Z',
    resolvedAt: '2024-10-01T14:30:00Z',
    dueDate: '2024-10-04T23:59:59Z',
  },
  {
    id: 'dsp_005',
    reference: 'DSP-2024-7845',
    paymentIntentId: 'pi_6d8a1c3b',
    merchantId: 'mch_5f9a',
    amount: 12.99,
    currency: 'USD',
    status: 'expired',
    reason: 'subscription_canceled',
    evidenceSubmitted: false,
    evidenceCount: 0,
    customerEmail: 't.wilson@yahoo.com',
    description: 'Subscription cancellation dispute. Evidence window lapsed without submission.',
    timeline: [
      { status: 'open', timestamp: '2024-08-28T10:00:00Z', note: 'Dispute opened.' },
      { status: 'expired', timestamp: '2024-09-11T23:59:59Z', note: 'Evidence deadline passed. Dispute auto-resolved as lost.' },
    ],
    createdAt: '2024-08-28T10:00:00Z',
    resolvedAt: '2024-09-11T23:59:59Z',
    dueDate: '2024-09-11T23:59:59Z',
  },
  {
    id: 'dsp_006',
    reference: 'DSP-2024-7846',
    paymentIntentId: 'pi_1e7b9d4c',
    merchantId: 'mch_2b7c',
    amount: 780.0,
    currency: 'USD',
    status: 'challenged',
    reason: 'fraudulent',
    evidenceSubmitted: true,
    evidenceCount: 5,
    customerEmail: 'm.fischer@gmail.com',
    description: 'Fraud dispute challenged by merchant. Merchant provided signed agreement and IP match evidence.',
    timeline: [
      { status: 'open', timestamp: '2024-11-01T08:00:00Z', note: 'Dispute opened.' },
      { status: 'under_review', timestamp: '2024-11-03T12:00:00Z', note: 'Initial evidence submitted.' },
      { status: 'challenged', timestamp: '2024-11-08T15:20:00Z', note: 'Merchant challenged the dispute with additional signed documentation.' },
    ],
    createdAt: '2024-11-01T08:00:00Z',
    dueDate: '2024-11-22T23:59:59Z',
  },
  {
    id: 'dsp_007',
    reference: 'DSP-2024-7847',
    paymentIntentId: 'pi_9a3f2e8b',
    merchantId: 'mch_4d2e',
    amount: 199.0,
    currency: 'USD',
    status: 'open',
    reason: 'unrecognized',
    evidenceSubmitted: false,
    evidenceCount: 0,
    customerEmail: 'l.petrov@protonmail.com',
    description: 'Customer does not recognize this transaction. Merchant has 14 days to submit evidence.',
    timeline: [
      { status: 'open', timestamp: '2024-11-20T16:45:00Z', note: 'Dispute opened by cardholder.' },
    ],
    createdAt: '2024-11-20T16:45:00Z',
    dueDate: '2024-12-04T23:59:59Z',
  },
  {
    id: 'dsp_008',
    reference: 'DSP-2024-7848',
    paymentIntentId: 'pi_4c2d8e1f',
    merchantId: 'mch_8a1f',
    amount: 45.0,
    currency: 'USD',
    status: 'won',
    reason: 'general',
    evidenceSubmitted: true,
    evidenceCount: 2,
    customerEmail: 's.kowalski@gmail.com',
    description: 'General dispute resolved in merchant favor. Customer did not respond to requests for additional info.',
    timeline: [
      { status: 'open', timestamp: '2024-09-15T11:00:00Z', note: 'Dispute opened.' },
      { status: 'under_review', timestamp: '2024-09-17T09:00:00Z', note: 'Evidence submitted.' },
      { status: 'won', timestamp: '2024-09-28T10:00:00Z', note: 'Ruling in favor of merchant.' },
    ],
    createdAt: '2024-09-15T11:00:00Z',
    resolvedAt: '2024-09-28T10:00:00Z',
    dueDate: '2024-09-29T23:59:59Z',
  },
  {
    id: 'dsp_009',
    reference: 'DSP-2024-7849',
    paymentIntentId: 'pi_8b1e5c3a',
    merchantId: 'mch_5f9a',
    amount: 1560.0,
    currency: 'USD',
    status: 'under_review',
    reason: 'product_not_received',
    evidenceSubmitted: true,
    evidenceCount: 3,
    customerEmail: 'c.dubois@outlook.com',
    description: 'Customer claims high-value order never arrived. Merchant submitted courier logs and signature proof.',
    timeline: [
      { status: 'open', timestamp: '2024-11-14T07:30:00Z', note: 'Dispute opened.' },
      { status: 'under_review', timestamp: '2024-11-16T11:00:00Z', note: 'Evidence submitted: courier signature, GPS logs, delivery photo.' },
    ],
    createdAt: '2024-11-14T07:30:00Z',
    dueDate: '2024-11-28T23:59:59Z',
  },
  {
    id: 'dsp_010',
    reference: 'DSP-2024-7850',
    paymentIntentId: 'pi_3f7a9d2c',
    merchantId: 'mch_2b7c',
    amount: 29.99,
    currency: 'USD',
    status: 'lost',
    reason: 'subscription_canceled',
    evidenceSubmitted: false,
    evidenceCount: 0,
    customerEmail: 'p.novak@yahoo.com',
    description: 'Subscription was canceled but customer continued to be billed. Merchant failed to submit cancellation proof.',
    timeline: [
      { status: 'open', timestamp: '2024-08-10T14:00:00Z', note: 'Dispute opened.' },
      { status: 'lost', timestamp: '2024-08-24T10:00:00Z', note: 'No evidence submitted. Auto-resolved as lost.' },
    ],
    createdAt: '2024-08-10T14:00:00Z',
    resolvedAt: '2024-08-24T10:00:00Z',
    dueDate: '2024-08-24T23:59:59Z',
  },
  {
    id: 'dsp_011',
    reference: 'DSP-2024-7851',
    paymentIntentId: 'pi_5e2b8f4a',
    merchantId: 'mch_4d2e',
    amount: 675.0,
    currency: 'USD',
    status: 'challenged',
    reason: 'product_unacceptable',
    evidenceSubmitted: true,
    evidenceCount: 4,
    customerEmail: 'a.muller@gmail.com',
    description: 'Customer claims product not as described. Merchant challenged with product specs and customer communication logs.',
    timeline: [
      { status: 'open', timestamp: '2024-11-05T09:00:00Z', note: 'Dispute opened.' },
      { status: 'under_review', timestamp: '2024-11-07T13:00:00Z', note: 'Initial evidence submitted.' },
      { status: 'challenged', timestamp: '2024-11-12T10:30:00Z', note: 'Merchant challenged with product specification sheets and chat logs.' },
    ],
    createdAt: '2024-11-05T09:00:00Z',
    dueDate: '2024-11-26T23:59:59Z',
  },
  {
    id: 'dsp_012',
    reference: 'DSP-2024-7852',
    paymentIntentId: 'pi_7c3a1e9b',
    merchantId: 'mch_8a1f',
    amount: 99.0,
    currency: 'USD',
    status: 'open',
    reason: 'duplicate',
    evidenceSubmitted: false,
    evidenceCount: 0,
    customerEmail: 'k.olsen@protonmail.com',
    description: 'Customer reports duplicate charge for same order. Awaiting merchant evidence.',
    timeline: [
      { status: 'open', timestamp: '2024-11-19T18:00:00Z', note: 'Dispute opened.' },
    ],
    createdAt: '2024-11-19T18:00:00Z',
    dueDate: '2024-12-03T23:59:59Z',
  },
  {
    id: 'dsp_013',
    reference: 'DSP-2024-7853',
    paymentIntentId: 'pi_2d9f6c4b',
    merchantId: 'mch_5f9a',
    amount: 2100.0,
    currency: 'USD',
    status: 'won',
    reason: 'fraudulent',
    evidenceSubmitted: true,
    evidenceCount: 6,
    customerEmail: 'h.tanaka@icloud.com',
    description: 'Fraud dispute won. Merchant provided 3DS authentication proof, device fingerprint match, and signed delivery receipt.',
    timeline: [
      { status: 'open', timestamp: '2024-09-25T08:00:00Z', note: 'Dispute opened.' },
      { status: 'under_review', timestamp: '2024-09-27T10:00:00Z', note: 'Evidence submitted: 3DS proof, device fingerprint, delivery receipt.' },
      { status: 'won', timestamp: '2024-10-08T12:00:00Z', note: 'Ruling in favor of merchant. Strong 3DS and delivery evidence.' },
    ],
    createdAt: '2024-09-25T08:00:00Z',
    resolvedAt: '2024-10-08T12:00:00Z',
    dueDate: '2024-10-09T23:59:59Z',
  },
  {
    id: 'dsp_014',
    reference: 'DSP-2024-7854',
    paymentIntentId: 'pi_6b4e2a8c',
    merchantId: 'mch_2b7c',
    amount: 149.99,
    currency: 'USD',
    status: 'under_review',
    reason: 'unrecognized',
    evidenceSubmitted: true,
    evidenceCount: 2,
    customerEmail: 'f.rossi@gmail.com',
    description: 'Customer does not recognize transaction. Merchant submitted order confirmation email and IP geolocation match.',
    timeline: [
      { status: 'open', timestamp: '2024-11-16T15:30:00Z', note: 'Dispute opened.' },
      { status: 'under_review', timestamp: '2024-11-18T09:00:00Z', note: 'Evidence submitted: order confirmation, IP match, customer account login history.' },
    ],
    createdAt: '2024-11-16T15:30:00Z',
    dueDate: '2024-11-30T23:59:59Z',
  },
  {
    id: 'dsp_015',
    reference: 'DSP-2024-7855',
    paymentIntentId: 'pi_1a8d5f3e',
    merchantId: 'mch_4d2e',
    amount: 430.0,
    currency: 'USD',
    status: 'open',
    reason: 'general',
    evidenceSubmitted: false,
    evidenceCount: 0,
    customerEmail: 'v.kumar@yahoo.com',
    description: 'General dispute. Customer filed chargeback without specifying detailed reason. Awaiting merchant response.',
    timeline: [
      { status: 'open', timestamp: '2024-11-21T11:00:00Z', note: 'Dispute opened.' },
    ],
    createdAt: '2024-11-21T11:00:00Z',
    dueDate: '2024-12-05T23:59:59Z',
  },
];

// ─── Helpers ─────────────────────────────────────────────────

function isDueSoon(dueDate: string): boolean {
  const now = Date.now();
  const due = new Date(dueDate).getTime();
  const threeDays = 3 * 24 * 60 * 60 * 1000;
  return due - now < threeDays && due > now;
}

function isOverdue(dueDate: string): boolean {
  return new Date(dueDate).getTime() < Date.now();
}

// ─── Page ────────────────────────────────────────────────────

export default function DisputesPage() {
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);

  const filteredDisputes = useMemo(() => {
    if (filter === 'all') return mockDisputes;
    return mockDisputes.filter((d) => d.status === filter);
  }, [filter]);

  const stats = useMemo(() => {
    const open = mockDisputes.filter((d) => d.status === 'open').length;
    const underReview = mockDisputes.filter((d) => d.status === 'under_review').length;
    const won = mockDisputes.filter((d) => d.status === 'won').length;
    const lost = mockDisputes.filter((d) => d.status === 'lost').length;
    const totalAmount = mockDisputes.reduce((sum, d) => sum + d.amount, 0);
    return { open, underReview, won, lost, totalAmount };
  }, []);

  const handleSubmitEvidence = (dispute: Dispute) => {
    toast.success('Evidence submitted', {
      description: `Evidence package uploaded for ${dispute.reference}.`,
    });
  };

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <PageHeader
        title="Dispute Center"
        description="Manage chargebacks, submit evidence, and track dispute resolution timelines."
      >
        <Button variant="outline" className="gap-2">
          <ScrollText className="h-4 w-4" />
          Export Report
        </Button>
      </PageHeader>

      {/* Summary stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Open Disputes"
          value={String(stats.open)}
          icon={<AlertTriangle className="h-5 w-5" />}
          delay={0}
          subtitle="Awaiting evidence"
        />
        <StatCard
          title="Under Review"
          value={String(stats.underReview)}
          icon={<Clock className="h-5 w-5" />}
          delay={0.05}
          subtitle="Evidence submitted"
        />
        <StatCard
          title="Won"
          value={String(stats.won)}
          icon={<ShieldCheck className="h-5 w-5" />}
          delay={0.1}
          subtitle="Resolved in your favor"
        />
        <StatCard
          title="Lost"
          value={String(stats.lost)}
          icon={<TrendingDown className="h-5 w-5" />}
          delay={0.15}
          subtitle="Resolved against you"
        />
        <StatCard
          title="Total Disputed"
          value={formatCurrencyWithSymbol(stats.totalAmount, 'USD')}
          icon={<FileText className="h-5 w-5" />}
          delay={0.2}
          subtitle="Across all disputes"
        />
      </div>

      {/* Filter pills + table */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg">All Disputes</CardTitle>
              <CardDescription>
                {filteredDisputes.length} {filteredDisputes.length === 1 ? 'dispute' : 'disputes'} shown
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {filterOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFilter(opt.value)}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                    filter === opt.value
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[140px]">Reference</TableHead>
                  <TableHead>Merchant</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDisputes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                      No disputes found for this filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDisputes.map((dispute, index) => {
                    const config = statusConfig[dispute.status];
                    const overdue = isOverdue(dispute.dueDate) && dispute.status !== 'won' && dispute.status !== 'lost';
                    const dueSoon = isDueSoon(dispute.dueDate) && dispute.status !== 'won' && dispute.status !== 'lost';

                    return (
                      <motion.tr
                        key={dispute.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: index * 0.03, ease: 'easeOut' }}
                        className="group border-b transition-colors hover:bg-muted/40"
                      >
                        <TableCell className="font-mono text-xs font-medium">
                          {dispute.reference}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{dispute.merchantId}</span>
                            <span className="text-xs text-muted-foreground">
                              {dispute.customerEmail}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium tabular-nums">
                          {formatCurrencyWithSymbol(dispute.amount, dispute.currency)}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{reasonLabels[dispute.reason]}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={config.variant} className="gap-1.5">
                            {config.icon}
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(dispute.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={cn(
                                'text-sm tabular-nums',
                                overdue
                                  ? 'font-semibold text-destructive'
                                  : dueSoon
                                    ? 'font-medium text-warning'
                                    : 'text-muted-foreground',
                              )}
                            >
                              {formatDate(dispute.dueDate)}
                            </span>
                            {(overdue || dueSoon) && (
                              <Clock
                                className={cn(
                                  'h-3.5 w-3.5',
                                  overdue ? 'text-destructive' : 'text-warning',
                                )}
                              />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {!dispute.evidenceSubmitted && dispute.status !== 'won' && dispute.status !== 'lost' && (
                              <Button
                                size="sm"
                                variant="default"
                                className="h-8 gap-1.5"
                                onClick={() => handleSubmitEvidence(dispute)}
                              >
                                <FileText className="h-3.5 w-3.5" />
                                Submit Evidence
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 gap-1.5"
                              onClick={() => setSelectedDispute(dispute)}
                            >
                              <Eye className="h-3.5 w-3.5" />
                              Details
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detail dialog */}
      <Dialog open={selectedDispute !== null} onOpenChange={(open) => !open && setSelectedDispute(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedDispute && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between pr-8">
                  <DialogTitle className="text-xl font-display">
                    {selectedDispute.reference}
                  </DialogTitle>
                  <Badge variant={statusConfig[selectedDispute.status].variant} className="gap-1.5">
                    {statusConfig[selectedDispute.status].icon}
                    {statusConfig[selectedDispute.status].label}
                  </Badge>
                </div>
                <DialogDescription>
                  Dispute details and full activity timeline
                </DialogDescription>
              </DialogHeader>

              {/* Key facts grid */}
              <div className="grid grid-cols-2 gap-4 py-2">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Amount</p>
                  <p className="text-lg font-semibold tabular-nums">
                    {formatCurrencyWithSymbol(selectedDispute.amount, selectedDispute.currency)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Reason</p>
                  <p className="text-sm font-medium">{reasonLabels[selectedDispute.reason]}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Merchant ID</p>
                  <p className="font-mono text-sm">{selectedDispute.merchantId}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Payment Intent</p>
                  <p className="font-mono text-sm">{selectedDispute.paymentIntentId}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Customer Email</p>
                  <p className="text-sm">{selectedDispute.customerEmail ?? '—'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Evidence Submitted</p>
                  <p className="text-sm font-medium">
                    {selectedDispute.evidenceSubmitted
                      ? `Yes (${selectedDispute.evidenceCount} file${selectedDispute.evidenceCount !== 1 ? 's' : ''})`
                      : 'No'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Created</p>
                  <p className="text-sm">{formatDate(selectedDispute.createdAt)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Due Date</p>
                  <p
                    className={cn(
                      'text-sm font-medium',
                      isOverdue(selectedDispute.dueDate) && selectedDispute.status !== 'won' && selectedDispute.status !== 'lost'
                        ? 'text-destructive'
                        : isDueSoon(selectedDispute.dueDate) && selectedDispute.status !== 'won' && selectedDispute.status !== 'lost'
                          ? 'text-warning'
                          : '',
                    )}
                  >
                    {formatDate(selectedDispute.dueDate)}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-xs font-medium text-muted-foreground">Description</p>
                <p className="mt-1 text-sm leading-relaxed">{selectedDispute.description}</p>
              </div>

              {/* Timeline */}
              <div className="space-y-1">
                <h4 className="text-sm font-semibold">Timeline</h4>
                <div className="relative space-y-4 pl-6">
                  <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />
                  {selectedDispute.timeline.map((event, idx) => {
                    const eventConfig = statusConfig[event.status];
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.08 }}
                        className="relative"
                      >
                        <div
                          className={cn(
                            'absolute -left-[22px] top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-background',
                            eventConfig.variant === 'success' && 'bg-success',
                            eventConfig.variant === 'warning' && 'bg-warning',
                            eventConfig.variant === 'error' && 'bg-destructive',
                            eventConfig.variant === 'info' && 'bg-accent',
                            eventConfig.variant === 'default' && 'bg-primary',
                          )}
                        />
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2">
                            <Badge variant={eventConfig.variant} className="gap-1">
                              {eventConfig.icon}
                              {eventConfig.label}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(event.timestamp, { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          {event.note && (
                            <p className="text-sm text-muted-foreground">{event.note}</p>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Footer actions */}
              <div className="flex items-center justify-end gap-2 border-t pt-4">
                <Button
                  variant="outline"
                  onClick={() => setSelectedDispute(null)}
                >
                  Close
                </Button>
                {!selectedDispute.evidenceSubmitted && selectedDispute.status !== 'won' && selectedDispute.status !== 'lost' && (
                  <Button
                    onClick={() => {
                      handleSubmitEvidence(selectedDispute);
                      setSelectedDispute(null);
                    }}
                    className="gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Submit Evidence
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck, Clock, CheckCircle2, XCircle, AlertCircle, ArrowUpRight,
  UserX, FileCheck, Users, ChevronRight,
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/status-badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { complianceService } from '@/services/compliance.service';
import { cn, formatDate } from '@/lib/utils';
import type { ComplianceCase, ComplianceStatus } from '@/types';

const statusConfig: Record<ComplianceStatus, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  pending_review: { label: 'Pending Review', color: 'text-warning', bg: 'bg-warning/10', icon: Clock },
  approved: { label: 'Approved', color: 'text-success', bg: 'bg-success/10', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'text-destructive', bg: 'bg-destructive/10', icon: XCircle },
  manual_review: { label: 'Manual Review', color: 'text-info', bg: 'bg-info/10', icon: AlertCircle },
  escalated: { label: 'Escalated', color: 'text-destructive', bg: 'bg-destructive/20', icon: ArrowUpRight },
  suspended: { label: 'Suspended', color: 'text-destructive', bg: 'bg-destructive/10', icon: UserX },
};

const priorityConfig: Record<string, string> = {
  low: 'text-muted-foreground', medium: 'text-info', high: 'text-warning', urgent: 'text-destructive',
};

export default function ComplianceDashboardPage() {
  const [cases, setCases] = useState<ComplianceCase[]>([]);
  const [stats, setStats] = useState(complianceService.getStats());
  const [statusFilter, setStatusFilter] = useState<ComplianceStatus | 'all'>('all');
  const [selectedCase, setSelectedCase] = useState<ComplianceCase | null>(null);

  useEffect(() => {
    // Seed some mock cases if empty
    if (complianceService.getAll().length === 0) {
      complianceService._seed([
        {
          id: 'CMP-001', userId: 'usr_002', merchantId: 'MCH-001',
          type: 'kyc_review', status: 'pending_review', priority: 'high',
          description: 'KYC review for Amara Okafor — passport verification needed',
          createdAt: new Date(Date.now() - 86400_000).toISOString(), updatedAt: new Date(Date.now() - 86400_000).toISOString(), notes: [],
        },
        {
          id: 'CMP-002', merchantId: 'MCH-002',
          type: 'kyb_review', status: 'manual_review', priority: 'medium',
          description: 'KYB review for Sarah Chen Enterprises — beneficial owner verification',
          createdAt: new Date(Date.now() - 2 * 86400_000).toISOString(), updatedAt: new Date(Date.now() - 2 * 86400_000).toISOString(), notes: [],
        },
        {
          id: 'CMP-003', userId: 'usr_006',
          type: 'transaction_review', status: 'escalated', priority: 'urgent',
          description: 'High-value transaction $50,000 flagged for sanctions screening',
          createdAt: new Date(Date.now() - 6 * 3600_000).toISOString(), updatedAt: new Date(Date.now() - 6 * 3600_000).toISOString(), notes: [],
        },
        {
          id: 'CMP-004', merchantId: 'MCH-003',
          type: 'sanctions_check', status: 'pending_review', priority: 'urgent',
          description: 'Potential sanctions match — requires immediate review',
          createdAt: new Date(Date.now() - 3 * 3600_000).toISOString(), updatedAt: new Date(Date.now() - 3 * 3600_000).toISOString(), notes: [],
        },
        {
          id: 'CMP-005', userId: 'usr_007',
          type: 'chargeback_review', status: 'approved', priority: 'low',
          description: 'Chargeback dispute resolved in favor of merchant',
          createdAt: new Date(Date.now() - 7 * 86400_000).toISOString(), updatedAt: new Date(Date.now() - 5 * 86400_000).toISOString(),
          resolvedAt: new Date(Date.now() - 5 * 86400_000).toISOString(), notes: [],
        },
        {
          id: 'CMP-006', userId: 'usr_008',
          type: 'manual_review', status: 'suspended', priority: 'high',
          description: 'Account suspended due to suspicious activity patterns',
          createdAt: new Date(Date.now() - 4 * 86400_000).toISOString(), updatedAt: new Date(Date.now() - 3 * 86400_000).toISOString(),
          resolvedAt: new Date(Date.now() - 3 * 86400_000).toISOString(), notes: [],
        },
      ]);
    }
    setCases(complianceService.getAll());
    setStats(complianceService.getStats());
  }, []);

  const filtered = statusFilter === 'all' ? cases : cases.filter((c) => c.status === statusFilter);

  const handleAction = (caseId: string, action: 'approve' | 'reject' | 'escalate' | 'suspend', note?: string) => {
    const statusMap = { approve: 'approved', reject: 'rejected', escalate: 'escalated', suspend: 'suspended' } as const;
    complianceService.updateStatus(caseId, statusMap[action], 'usr_005', 'Compliance Officer', note);
    setCases(complianceService.getAll());
    setStats(complianceService.getStats());
    setSelectedCase(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Compliance Dashboard" description="Review queue, case management, and regulatory oversight.">
        <Badge variant="info">
          <ShieldCheck className="h-3 w-3" />
          Compliance Officer
        </Badge>
      </PageHeader>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Pending Reviews" value={stats.pending.toString()} subtitle="awaiting review" icon={<Clock className="h-5 w-5" />} />
        <StatCard title="Manual Review" value={stats.manualReview.toString()} subtitle="requires investigation" icon={<AlertCircle className="h-5 w-5" />} delay={0.05} />
        <StatCard title="Escalated" value={stats.escalated.toString()} subtitle="needs senior review" icon={<ArrowUpRight className="h-5 w-5" />} delay={0.1} />
        <StatCard title="Suspended" value={stats.suspended.toString()} subtitle="accounts suspended" icon={<UserX className="h-5 w-5" />} delay={0.15} />
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ComplianceStatus | 'all')}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cases</SelectItem>
            <SelectItem value="pending_review">Pending Review</SelectItem>
            <SelectItem value="manual_review">Manual Review</SelectItem>
            <SelectItem value="escalated">Escalated</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">{filtered.length} cases</span>
      </div>

      {/* Cases */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Case ID</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Type</th>
                <th className="hidden px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground md:table-cell">Description</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Priority</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="hidden px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground lg:table-cell">Created</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => {
                const config = statusConfig[c.status];
                return (
                  <motion.tr key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.03, 0.3) }} className="border-b border-border transition-colors hover:bg-muted/40">
                    <td className="px-4 py-3"><p className="text-sm font-mono">{c.id}</p></td>
                    <td className="px-4 py-3"><span className="text-sm capitalize">{c.type.replace(/_/g, ' ')}</span></td>
                    <td className="hidden px-4 py-3 md:table-cell"><span className="text-sm text-muted-foreground line-clamp-1">{c.description}</span></td>
                    <td className="px-4 py-3"><span className={cn('text-xs font-semibold uppercase', priorityConfig[c.priority])}>{c.priority}</span></td>
                    <td className="px-4 py-3">
                      <div className={cn('flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium w-fit', config.bg, config.color)}>
                        <config.icon className="h-3 w-3" /> {config.label}
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 lg:table-cell"><span className="text-sm text-muted-foreground">{formatDate(c.createdAt)}</span></td>
                    <td className="px-4 py-3">
                      {c.status === 'pending_review' || c.status === 'manual_review' ? (
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" className="h-7 gap-1 text-xs text-success" onClick={() => handleAction(c.id, 'approve')}><CheckCircle2 className="h-3 w-3" /> Approve</Button>
                          <Button size="sm" variant="outline" className="h-7 gap-1 text-xs text-destructive" onClick={() => handleAction(c.id, 'reject')}><XCircle className="h-3 w-3" /> Reject</Button>
                          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => handleAction(c.id, 'escalate')}><ArrowUpRight className="h-3 w-3" /></Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

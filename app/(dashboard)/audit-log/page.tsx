'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  History, Filter, Download, User, Shield, Key, FileText,
  Building2, CreditCard, Settings, AlertTriangle, Check, X, Lock,
} from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/status-badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { auditService } from '@/services/audit.service';
import { cn, formatDate } from '@/lib/utils';
import type { AuditEvent, AuditEventType } from '@/types';

const eventIcons: Record<string, typeof User> = {
  login: User, logout: User, password_change: Key, email_change: Settings,
  document_upload: FileText, wallet_creation: CreditCard, merchant_registration: Building2,
  api_key_creation: Key, role_change: Shield, settlement_approval: Check,
  kyc_submission: FileText, kyb_submission: FileText, kyc_approval: Check, kyb_approval: Check,
  compliance_review: Shield, account_suspension: AlertTriangle, account_reactivation: Check,
  security_alert: AlertTriangle, permission_change: Shield, settings_change: Settings,
};

export default function AuditLogPage() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [typeFilter, setTypeFilter] = useState<AuditEventType | 'all'>('all');
  const [count, setCount] = useState(0);

  useEffect(() => {
    setEvents(auditService.getAll());
    setCount(auditService.count());
  }, []);

  const filtered = typeFilter === 'all' ? events : events.filter((e) => e.type === typeFilter);

  const eventTypes: AuditEventType[] = ['login', 'logout', 'password_change', 'email_change', 'document_upload', 'wallet_creation', 'merchant_registration', 'api_key_creation', 'role_change', 'settlement_approval', 'kyc_submission', 'kyb_submission', 'kyc_approval', 'kyb_approval', 'compliance_review', 'account_suspension', 'security_alert', 'settings_change'];

  return (
    <div className="space-y-6">
      <PageHeader title="Audit Log" description="Immutable record of every important action on the platform.">
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => toast.info('Export coming soon')}>
          <Download className="h-4 w-4" />
          Export
        </Button>
      </PageHeader>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Events" value={count.toString()} subtitle="all-time" icon={<History className="h-5 w-5" />} />
        <StatCard title="Security Events" value={events.filter((e) => e.type === 'security_alert').length.toString()} subtitle="alerts" icon={<AlertTriangle className="h-5 w-5" />} delay={0.05} />
        <StatCard title="Compliance Actions" value={events.filter((e) => e.type === 'compliance_review' || e.type === 'kyc_approval' || e.type === 'kyb_approval').length.toString()} subtitle="reviews" icon={<Shield className="h-5 w-5" />} delay={0.1} />
        <StatCard title="Role Changes" value={events.filter((e) => e.type === 'role_change').length.toString()} subtitle="assignments" icon={<Key className="h-5 w-5" />} delay={0.15} />
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as AuditEventType | 'all')}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Filter by event type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Event Types</SelectItem>
            {eventTypes.map((t) => (
              <SelectItem key={t} value={t}>{t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">{filtered.length} events</span>
      </div>

      {/* Audit Events Table */}
      <Card className="overflow-hidden p-0">
        <div className="border-b border-border p-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
              <Lock className="h-3 w-3" />
              Immutable — Append-only
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Type</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Actor</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Action</th>
                <th className="hidden px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground md:table-cell">Resource</th>
                <th className="hidden px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground lg:table-cell">IP Address</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 50).map((event, i) => {
                const Icon = eventIcons[event.type] ?? History;
                return (
                  <motion.tr key={event.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.02, 0.3) }} className="border-b border-border transition-colors hover:bg-muted/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted">
                          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <span className="text-xs font-medium capitalize">{event.type.replace(/_/g, ' ')}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium">{event.actorName}</p>
                      <p className="text-xs text-muted-foreground capitalize">{event.actorRole}</p>
                    </td>
                    <td className="px-4 py-3"><span className="text-sm">{event.action}</span></td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <span className="text-xs font-mono text-muted-foreground">{event.resourceType}:{event.resourceId}</span>
                    </td>
                    <td className="hidden px-4 py-3 lg:table-cell"><span className="text-xs text-muted-foreground font-mono">{event.ipAddress}</span></td>
                    <td className="px-4 py-3"><span className="text-xs text-muted-foreground">{formatDate(event.timestamp)}</span></td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length > 50 && (
          <div className="border-t border-border p-4 text-center">
            <p className="text-sm text-muted-foreground">Showing 50 of {filtered.length} events</p>
          </div>
        )}
      </Card>
    </div>
  );
}

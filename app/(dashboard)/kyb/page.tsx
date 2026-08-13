'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Building2, Upload, FileText, Users, UserCheck, Globe, Check,
  Clock, XCircle, AlertCircle, CheckCircle2, Briefcase, MapPin,
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/status-badge';
import { toast } from 'sonner';
import { kybService } from '@/services/kyb.service';
import { merchantService } from '@/services/merchant.service';
import { cn, formatDate } from '@/lib/utils';
import type { KYBProfile, KYBStatus, DocumentType } from '@/types';

const requiredDocs: { type: DocumentType; label: string; desc: string }[] = [
  { type: 'certificate_of_incorporation', label: 'Certificate of Incorporation', desc: 'Company registration certificate' },
  { type: 'business_registration', label: 'Business Registration', desc: 'Official business registration document' },
  { type: 'tax_certificate', label: 'Tax Certificate', desc: 'Tax compliance certificate' },
];

const statusConfig: Record<KYBStatus, { label: string; color: string; bg: string; icon: typeof Check }> = {
  not_started: { label: 'Not Started', color: 'text-muted-foreground', bg: 'bg-muted', icon: Clock },
  pending: { label: 'Pending', color: 'text-warning', bg: 'bg-warning/10', icon: Clock },
  in_review: { label: 'In Review', color: 'text-info', bg: 'bg-info/10', icon: AlertCircle },
  approved: { label: 'Approved', color: 'text-success', bg: 'bg-success/10', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'text-destructive', bg: 'bg-destructive/10', icon: XCircle },
  expired: { label: 'Expired', color: 'text-warning', bg: 'bg-warning/10', icon: Clock },
};

export default function KYBPage() {
  const [profile, setProfile] = useState<KYBProfile | null>(null);
  const [merchantId, setMerchantId] = useState('MCH-001');

  useEffect(() => {
    const merchants = merchantService.getAll();
    if (merchants.length > 0) setMerchantId(merchants[0].id);
    setProfile(kybService.getProfile(merchants[0]?.id ?? 'MCH-001'));
  }, []);

  if (!profile) {
    return (
      <div className="space-y-6">
        <PageHeader title="Business Verification" description="Complete KYB to activate your merchant account." />
        <div className="h-96 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  const config = statusConfig[profile.status];
  const progress = kybService.getProgress(profile.merchantId);

  const handleUpload = (type: DocumentType) => {
    kybService.uploadDocument(profile.merchantId, { type, fileName: `${type}.pdf`, fileSize: 1024 * 1024 * 3 });
    setProfile({ ...kybService.getProfile(profile.merchantId) });
    toast.success(`${type.replace(/_/g, ' ')} uploaded`);
  };

  const handleSubmit = () => {
    kybService.submitForReview(profile.merchantId);
    setProfile({ ...kybService.getProfile(profile.merchantId) });
    toast.success('KYB submitted for review');
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Business Verification" description="Complete KYB to activate your merchant account and start accepting payments.">
        <div className={cn('flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium', config.bg, config.color)}>
          <config.icon className="h-3.5 w-3.5" />
          {config.label}
        </div>
      </PageHeader>

      {/* Progress */}
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold font-display">Verification Progress</h3>
            <p className="text-sm text-muted-foreground">Complete all steps to get your business verified</p>
          </div>
          <span className="text-3xl font-bold font-display text-primary">{progress}%</span>
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-muted">
          <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.8 }} className="h-full rounded-full bg-gradient-to-r from-primary to-accent" />
        </div>
      </Card>

      {/* Company Documents */}
      <Card className="p-5">
        <h3 className="text-lg font-semibold font-display">Company Documents</h3>
        <p className="text-sm text-muted-foreground">Upload required company verification documents</p>
        <div className="mt-4 space-y-3">
          {requiredDocs.map((doc) => {
            const uploaded = profile.documents.find((d) => d.type === doc.type);
            return (
              <div key={doc.type} className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{doc.label}</p>
                    <p className="text-xs text-muted-foreground">{doc.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {uploaded && <Badge variant={uploaded.status === 'approved' ? 'success' : 'warning'}>{uploaded.status}</Badge>}
                  <Button variant="outline" size="sm" onClick={() => handleUpload(doc.type)} className="gap-1.5">
                    <Upload className="h-3.5 w-3.5" />
                    Upload
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Directors & Beneficial Owners */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold font-display">Directors</h3>
            <Badge variant="outline">{profile.directors.length} registered</Badge>
          </div>
          <div className="mt-4 space-y-2">
            {profile.directors.length === 0 ? (
              <p className="text-sm text-muted-foreground">No directors added yet.</p>
            ) : (
              profile.directors.map((d) => (
                <div key={d.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{d.name}</p>
                    <p className="text-xs text-muted-foreground">{d.role} • {d.nationality}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold font-display">Beneficial Owners</h3>
            <Badge variant="outline">{profile.beneficialOwners.length} registered</Badge>
          </div>
          <div className="mt-4 space-y-2">
            {profile.beneficialOwners.length === 0 ? (
              <p className="text-sm text-muted-foreground">No beneficial owners added yet.</p>
            ) : (
              profile.beneficialOwners.map((o) => (
                <div key={o.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <UserCheck className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{o.name}</p>
                    <p className="text-xs text-muted-foreground">{o.nationality} • {o.ownershipPercentage}% ownership</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Business Info */}
      <Card className="p-5">
        <h3 className="text-lg font-semibold font-display">Business Information</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Business Address</Label>
            <div className="rounded-lg border border-border p-3 text-sm">
              <p>{profile.businessAddress.line1 || 'Not provided'}</p>
              <p className="text-muted-foreground">{profile.businessAddress.city}{profile.businessAddress.country ? `, ${profile.businessAddress.country}` : ''}</p>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Website</Label>
            <Input value={profile.website ?? ''} readOnly placeholder="Not provided" />
          </div>
          <div className="space-y-2">
            <Label>Expected Monthly Volume (USD)</Label>
            <Input value={profile.expectedMonthlyVolume ? `$${profile.expectedMonthlyVolume.toLocaleString()}` : 'Not specified'} readOnly />
          </div>
          <div className="space-y-2">
            <Label>Expected Countries</Label>
            <Input value={profile.expectedCountries.join(', ') || 'Not specified'} readOnly />
          </div>
        </div>
      </Card>

      {/* Timeline */}
      <Card className="p-5">
        <h3 className="text-lg font-semibold font-display">Verification Timeline</h3>
        <div className="mt-4 space-y-3">
          {profile.timeline.map((event, i) => {
            const eventConfig = statusConfig[event.status];
            return (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-start gap-3">
                <div className={cn('flex h-8 w-8 items-center justify-center rounded-full', eventConfig.bg)}>
                  <eventConfig.icon className={cn('h-4 w-4', eventConfig.color)} />
                </div>
                <div className="flex-1 pt-0.5">
                  <p className="text-sm font-medium capitalize">{event.status.replace(/_/g, ' ')}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(event.timestamp)} {event.note && `• ${event.note}`}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Card>

      {/* Submit */}
      {profile.status === 'pending' && (
        <Button className="w-full gap-2" size="lg" onClick={handleSubmit}>
          <Building2 className="h-4 w-4" />
          Submit for Review
        </Button>
      )}
    </div>
  );
}

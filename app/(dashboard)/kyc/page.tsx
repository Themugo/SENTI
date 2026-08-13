'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck, Upload, FileText, Camera, MapPin, Check, Clock,
  XCircle, AlertCircle, CheckCircle2, User, FileCheck,
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/status-badge';
import { toast } from 'sonner';
import { kycService } from '@/services/kyc.service';
import { identityService } from '@/services/identity.service';
import { cn, formatDate } from '@/lib/utils';
import type { KYCProfile, KYCStatus, DocumentType } from '@/types';

const docTypes: { value: DocumentType; label: string; icon: typeof FileText; desc: string }[] = [
  { value: 'passport', label: 'Passport', icon: FileText, desc: 'Biometric passport page' },
  { value: 'national_id', label: 'National ID', icon: FileText, desc: 'Government-issued ID card' },
  { value: 'driver_license', label: 'Driver License', icon: FileText, desc: 'Valid driver license' },
  { value: 'residence_permit', label: 'Residence Permit', icon: FileText, desc: 'Valid residence permit' },
];

const statusConfig: Record<KYCStatus, { label: string; color: string; bg: string; icon: typeof Check }> = {
  not_started: { label: 'Not Started', color: 'text-muted-foreground', bg: 'bg-muted', icon: Clock },
  pending: { label: 'Pending', color: 'text-warning', bg: 'bg-warning/10', icon: Clock },
  in_review: { label: 'In Review', color: 'text-info', bg: 'bg-info/10', icon: AlertCircle },
  approved: { label: 'Approved', color: 'text-success', bg: 'bg-success/10', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'text-destructive', bg: 'bg-destructive/10', icon: XCircle },
  expired: { label: 'Expired', color: 'text-warning', bg: 'bg-warning/10', icon: Clock },
};

export default function KYCPage() {
  const [profile, setProfile] = useState<KYCProfile | null>(null);
  const [selectedDocType, setSelectedDocType] = useState<DocumentType>('passport');

  useEffect(() => {
    const identity = identityService.getCurrent();
    setProfile(kycService.getProfile(identity.userId));
  }, []);

  if (!profile) {
    return (
      <div className="space-y-6">
        <PageHeader title="Identity Verification" description="Complete KYC to unlock all features." />
        <div className="h-96 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  const config = statusConfig[profile.status];
  const progress = kycService.getProgress(profile.userId);

  const handleUpload = (type: DocumentType) => {
    kycService.uploadDocument(profile.userId, { type, fileName: `${type}_document.jpg`, fileSize: 1024 * 1024 * 2 });
    setProfile({ ...kycService.getProfile(profile.userId) });
    toast.success(`${type.replace(/_/g, ' ')} uploaded`);
  };

  const handleSelfie = () => {
    kycService.verifySelfie(profile.userId);
    setProfile({ ...kycService.getProfile(profile.userId) });
    toast.success('Selfie verification completed');
  };

  const handleProofOfAddress = () => {
    kycService.verifyProofOfAddress(profile.userId);
    setProfile({ ...kycService.getProfile(profile.userId) });
    toast.success('Proof of address verified');
  };

  const handleSubmit = () => {
    kycService.submitForReview(profile.userId);
    setProfile({ ...kycService.getProfile(profile.userId) });
    toast.success('KYC submitted for review');
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Identity Verification" description="Complete KYC to unlock sending, receiving, and withdrawals.">
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
            <p className="text-sm text-muted-foreground">Complete all steps to get verified</p>
          </div>
          <span className="text-3xl font-bold font-display text-primary">{progress}%</span>
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-muted">
          <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.8 }} className="h-full rounded-full bg-gradient-to-r from-primary to-accent" />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: 'Identity Doc', done: profile.documents.length > 0 },
            { label: 'Selfie', done: profile.selfieVerified },
            { label: 'Proof of Address', done: profile.proofOfAddressVerified },
            { label: 'Review', done: profile.status === 'approved', pending: profile.status === 'in_review' },
          ].map((step) => (
            <div key={step.label} className="flex items-center gap-1.5 text-xs">
              {step.done ? <CheckCircle2 className="h-4 w-4 text-success" /> : step.pending ? <Clock className="h-4 w-4 text-info" /> : <Clock className="h-4 w-4 text-muted-foreground" />}
              <span className={step.done ? 'text-success font-medium' : 'text-muted-foreground'}>{step.label}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Document Upload */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="text-lg font-semibold font-display">Identity Document</h3>
          <p className="text-sm text-muted-foreground">Upload a government-issued ID</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {docTypes.map((doc) => (
              <button
                key={doc.value}
                onClick={() => setSelectedDocType(doc.value)}
                className={cn('rounded-xl border p-3 text-left transition-all', selectedDocType === doc.value ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-border hover:border-primary/50')}
              >
                <doc.icon className="h-5 w-5 text-primary" />
                <p className="mt-2 text-sm font-semibold">{doc.label}</p>
                <p className="text-xs text-muted-foreground">{doc.desc}</p>
              </button>
            ))}
          </div>
          <Button className="mt-4 w-full gap-2" onClick={() => handleUpload(selectedDocType)}>
            <Upload className="h-4 w-4" />
            Upload {docTypes.find((d) => d.value === selectedDocType)?.label}
          </Button>
        </Card>

        <Card className="p-5">
          <h3 className="text-lg font-semibold font-display">Selfie Verification</h3>
          <p className="text-sm text-muted-foreground">Take a live selfie to match your ID</p>
          <div className="mt-4 flex flex-col items-center gap-3 rounded-xl border border-dashed border-border p-6">
            <Camera className="h-12 w-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground text-center">Click below to start the selfie verification process</p>
            <Button variant="outline" className="gap-2" onClick={handleSelfie} disabled={profile.selfieVerified}>
              {profile.selfieVerified ? <><Check className="h-4 w-4 text-success" /> Verified</> : <><Camera className="h-4 w-4" /> Start Selfie</>}
            </Button>
          </div>
        </Card>
      </div>

      {/* Proof of Address */}
      <Card className="p-5">
        <h3 className="text-lg font-semibold font-display">Proof of Address</h3>
        <p className="text-sm text-muted-foreground">Upload a utility bill or bank statement (not older than 3 months)</p>
        <div className="mt-4 flex items-center gap-4 rounded-lg border border-border p-4">
          <MapPin className="h-8 w-8 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-sm font-medium">Address Verification</p>
            <p className="text-xs text-muted-foreground">Utility bill, bank statement, or government letter</p>
          </div>
          <Button variant="outline" onClick={handleProofOfAddress} disabled={profile.proofOfAddressVerified}>
            {profile.proofOfAddressVerified ? <><Check className="h-4 w-4 text-success" /> Verified</> : 'Verify'}
          </Button>
        </div>
      </Card>

      {/* Uploaded Documents */}
      {profile.documents.length > 0 && (
        <Card className="p-5">
          <h3 className="text-lg font-semibold font-display">Uploaded Documents</h3>
          <div className="mt-4 space-y-2">
            {profile.documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{doc.fileName}</p>
                    <p className="text-xs text-muted-foreground">{doc.type.replace(/_/g, ' ')} • {(doc.fileSize / 1024).toFixed(0)} KB • {formatDate(doc.uploadedAt)}</p>
                  </div>
                </div>
                <Badge variant={doc.status === 'approved' ? 'success' : doc.status === 'rejected' ? 'error' : 'warning'}>
                  {doc.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

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
          <ShieldCheck className="h-4 w-4" />
          Submit for Review
        </Button>
      )}
    </div>
  );
}

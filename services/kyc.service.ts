/**
 * KYC Service (Know Your Customer)
 * Mock KYC workflow: document upload, selfie verification, proof of address, timeline.
 * Structured for production swap to a real KYC provider (Onfido, Veriff, etc.).
 */

import type { KYCProfile, KYCDocument, KYCStatus, DocumentType, DocumentStatus } from '@/types';
import { auditService } from './audit.service';

let kycProfiles: KYCProfile[] = [];
let docCounter = 0;

function nextDocId(): string {
  docCounter++;
  return `KYC-DOC-${docCounter.toString().padStart(6, '0')}`;
}

function createMockProfile(userId: string): KYCProfile {
  return {
    id: `KYC-${userId}`,
    userId,
    status: 'not_started',
    documents: [],
    selfieVerified: false,
    proofOfAddressVerified: false,
    timeline: [{ status: 'not_started', timestamp: new Date().toISOString() }],
  };
}

export const kycService = {
  /** Get KYC profile for a user. Creates one if it doesn't exist. */
  getProfile(userId: string): KYCProfile {
    let profile = kycProfiles.find((p) => p.userId === userId);
    if (!profile) {
      profile = createMockProfile(userId);
      kycProfiles.push(profile);
    }
    return profile;
  },

  /** Upload a document. */
  uploadDocument(userId: string, params: { type: DocumentType; fileName: string; fileSize: number }): KYCDocument {
    const profile = this.getProfile(userId);
    const doc: KYCDocument = {
      id: nextDocId(),
      type: params.type,
      status: 'pending',
      fileName: params.fileName,
      fileSize: params.fileSize,
      uploadedAt: new Date().toISOString(),
    };
    profile.documents.push(doc);

    if (profile.status === 'not_started') {
      profile.status = 'pending';
      profile.submittedAt = new Date().toISOString();
      profile.timeline.push({ status: 'pending', timestamp: new Date().toISOString(), note: 'Documents submitted' });
    }

    auditService.log({
      type: 'document_upload',
      actorId: userId,
      actorName: 'User',
      actorRole: 'customer',
      action: `Uploaded ${params.type.replace(/_/g, ' ')}`,
      resourceType: 'kyc_document',
      resourceId: doc.id,
    });

    return doc;
  },

  /** Simulate selfie verification. */
  verifySelfie(userId: string): boolean {
    const profile = this.getProfile(userId);
    profile.selfieVerified = true;
    profile.timeline.push({ status: profile.status, timestamp: new Date().toISOString(), note: 'Selfie verification completed' });
    return true;
  },

  /** Simulate proof of address verification. */
  verifyProofOfAddress(userId: string): boolean {
    const profile = this.getProfile(userId);
    profile.proofOfAddressVerified = true;
    profile.timeline.push({ status: profile.status, timestamp: new Date().toISOString(), note: 'Proof of address verified' });
    return true;
  },

  /** Submit KYC for review. */
  submitForReview(userId: string): KYCProfile {
    const profile = this.getProfile(userId);
    profile.status = 'in_review';
    profile.submittedAt = new Date().toISOString();
    profile.timeline.push({ status: 'in_review', timestamp: new Date().toISOString(), note: 'Submitted for review' });

    auditService.log({
      type: 'kyc_submission',
      actorId: userId,
      actorName: 'User',
      actorRole: 'customer',
      action: 'KYC submitted for review',
      resourceType: 'kyc_profile',
      resourceId: profile.id,
    });

    return profile;
  },

  /** Approve KYC (compliance officer action). */
  approve(userId: string, reviewerId: string): KYCProfile {
    const profile = this.getProfile(userId);
    profile.status = 'approved';
    profile.reviewedAt = new Date().toISOString();
    profile.reviewerId = reviewerId;
    profile.expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
    profile.documents.forEach((d) => { d.status = 'approved'; d.reviewedAt = new Date().toISOString(); d.reviewerId = reviewerId; });
    profile.timeline.push({ status: 'approved', timestamp: new Date().toISOString(), note: 'KYC approved', actor: reviewerId });

    auditService.log({
      type: 'kyc_approval',
      actorId: reviewerId,
      actorName: 'Compliance Officer',
      actorRole: 'compliance',
      action: `KYC approved for ${userId}`,
      resourceType: 'kyc_profile',
      resourceId: profile.id,
    });

    return profile;
  },

  /** Reject KYC. */
  reject(userId: string, reviewerId: string, reason: string): KYCProfile {
    const profile = this.getProfile(userId);
    profile.status = 'rejected';
    profile.reviewedAt = new Date().toISOString();
    profile.reviewerId = reviewerId;
    profile.rejectionReason = reason;
    profile.documents.forEach((d) => { d.status = 'rejected'; d.reviewedAt = new Date().toISOString(); d.reviewerId = reviewerId; d.rejectionReason = reason; });
    profile.timeline.push({ status: 'rejected', timestamp: new Date().toISOString(), note: reason, actor: reviewerId });

    auditService.log({
      type: 'kyc_approval',
      actorId: reviewerId,
      actorName: 'Compliance Officer',
      actorRole: 'compliance',
      action: `KYC rejected for ${userId}: ${reason}`,
      resourceType: 'kyc_profile',
      resourceId: profile.id,
    });

    return profile;
  },

  /** Get verification progress as a percentage. */
  getProgress(userId: string): number {
    const profile = this.getProfile(userId);
    let steps = 0;
    let completed = 0;

    // Identity document
    steps++;
    if (profile.documents.some((d) => d.type === 'passport' || d.type === 'national_id' || d.type === 'driver_license' || d.type === 'residence_permit')) completed++;

    // Selfie
    steps++;
    if (profile.selfieVerified) completed++;

    // Proof of address
    steps++;
    if (profile.proofOfAddressVerified) completed++;

    // Review
    steps++;
    if (profile.status === 'approved') completed++;
    else if (profile.status === 'in_review') completed += 0.5;

    return Math.round((completed / steps) * 100);
  },

  /** Get all profiles (for compliance queue). */
  getAllProfiles(): KYCProfile[] {
    return [...kycProfiles];
  },

  /** Get profiles by status. */
  getByStatus(status: KYCStatus): KYCProfile[] {
    return kycProfiles.filter((p) => p.status === status);
  },

  /** Seed mock data for existing users. */
  _seed(profiles: KYCProfile[]): void {
    kycProfiles = profiles;
    docCounter = profiles.reduce((max, p) => max + p.documents.length, 0);
  },
};

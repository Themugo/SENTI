/**
 * KYB Service (Know Your Business)
 * Mock KYB workflow: company verification, documents, directors, beneficial owners, timeline.
 * Structured for production swap to a real KYB provider.
 */

import type { KYBProfile, KYBDocument, KYBStatus, DocumentType, Director, BeneficialOwner, BusinessOnboardingData } from '@/types';
import { auditService } from './audit.service';

let kybProfiles: KYBProfile[] = [];
let docCounter = 0;

function nextDocId(): string {
  docCounter++;
  return `KYB-DOC-${docCounter.toString().padStart(6, '0')}`;
}

export const kybService = {
  /** Get KYB profile for a merchant. Creates one if it doesn't exist. */
  getProfile(merchantId: string): KYBProfile {
    let profile = kybProfiles.find((p) => p.merchantId === merchantId);
    if (!profile) {
      profile = {
        id: `KYB-${merchantId}`,
        merchantId,
        status: 'not_started',
        documents: [],
        directors: [],
        beneficialOwners: [],
        businessAddress: { line1: '', city: '', country: '' },
        expectedMonthlyVolume: 0,
        expectedCountries: [],
        expectedCurrencies: [],
        timeline: [{ status: 'not_started', timestamp: new Date().toISOString() }],
      };
      kybProfiles.push(profile);
    }
    return profile;
  },

  /** Submit business onboarding data. */
  submitOnboarding(merchantId: string, data: BusinessOnboardingData): KYBProfile {
    const profile = this.getProfile(merchantId);
    profile.businessAddress = data.address;
    profile.website = data.website;
    profile.businessDescription = data.businessDescription;
    profile.expectedMonthlyVolume = data.expectedMonthlyVolume;
    profile.expectedCountries = data.expectedCountries;
    profile.expectedCurrencies = data.expectedCurrencies;
    profile.directors = data.directors;
    profile.beneficialOwners = data.beneficialOwners;
    profile.status = 'pending';
    profile.submittedAt = new Date().toISOString();
    profile.timeline.push({ status: 'pending', timestamp: new Date().toISOString(), note: 'Business onboarding submitted' });

    auditService.log({
      type: 'kyb_submission',
      actorId: merchantId,
      actorName: 'Merchant',
      actorRole: 'merchant',
      action: `KYB onboarding submitted for ${data.companyName}`,
      resourceType: 'kyb_profile',
      resourceId: profile.id,
    });

    return profile;
  },

  /** Upload a company document. */
  uploadDocument(merchantId: string, params: { type: DocumentType; fileName: string; fileSize: number }): KYBDocument {
    const profile = this.getProfile(merchantId);
    const doc: KYBDocument = {
      id: nextDocId(),
      type: params.type,
      status: 'pending',
      fileName: params.fileName,
      fileSize: params.fileSize,
      uploadedAt: new Date().toISOString(),
    };
    profile.documents.push(doc);

    auditService.log({
      type: 'document_upload',
      actorId: merchantId,
      actorName: 'Merchant',
      actorRole: 'merchant',
      action: `Uploaded ${params.type.replace(/_/g, ' ')}`,
      resourceType: 'kyb_document',
      resourceId: doc.id,
    });

    return doc;
  },

  /** Submit KYB for review. */
  submitForReview(merchantId: string): KYBProfile {
    const profile = this.getProfile(merchantId);
    profile.status = 'in_review';
    profile.submittedAt = new Date().toISOString();
    profile.timeline.push({ status: 'in_review', timestamp: new Date().toISOString(), note: 'Submitted for review' });

    auditService.log({
      type: 'kyb_submission',
      actorId: merchantId,
      actorName: 'Merchant',
      actorRole: 'merchant',
      action: 'KYB submitted for review',
      resourceType: 'kyb_profile',
      resourceId: profile.id,
    });

    return profile;
  },

  /** Approve KYB. */
  approve(merchantId: string, reviewerId: string): KYBProfile {
    const profile = this.getProfile(merchantId);
    profile.status = 'approved';
    profile.reviewedAt = new Date().toISOString();
    profile.reviewerId = reviewerId;
    profile.documents.forEach((d) => { d.status = 'approved'; d.reviewedAt = new Date().toISOString(); d.reviewerId = reviewerId; });
    profile.timeline.push({ status: 'approved', timestamp: new Date().toISOString(), note: 'KYB approved', actor: reviewerId });

    auditService.log({
      type: 'kyb_approval',
      actorId: reviewerId,
      actorName: 'Compliance Officer',
      actorRole: 'compliance',
      action: `KYB approved for ${merchantId}`,
      resourceType: 'kyb_profile',
      resourceId: profile.id,
    });

    return profile;
  },

  /** Reject KYB. */
  reject(merchantId: string, reviewerId: string, reason: string): KYBProfile {
    const profile = this.getProfile(merchantId);
    profile.status = 'rejected';
    profile.reviewedAt = new Date().toISOString();
    profile.reviewerId = reviewerId;
    profile.rejectionReason = reason;
    profile.documents.forEach((d) => { d.status = 'rejected'; d.reviewedAt = new Date().toISOString(); d.reviewerId = reviewerId; d.rejectionReason = reason; });
    profile.timeline.push({ status: 'rejected', timestamp: new Date().toISOString(), note: reason, actor: reviewerId });

    return profile;
  },

  /** Get verification progress. */
  getProgress(merchantId: string): number {
    const profile = this.getProfile(merchantId);
    let steps = 0;
    let completed = 0;

    const requiredDocs: DocumentType[] = ['certificate_of_incorporation', 'business_registration', 'tax_certificate'];
    for (const docType of requiredDocs) {
      steps++;
      if (profile.documents.some((d) => d.type === docType)) completed++;
    }

    steps++;
    if (profile.directors.length > 0) completed++;

    steps++;
    if (profile.beneficialOwners.length > 0) completed++;

    steps++;
    if (profile.businessAddress.city) completed++;

    steps++;
    if (profile.status === 'approved') completed++;
    else if (profile.status === 'in_review') completed += 0.5;

    return Math.round((completed / steps) * 100);
  },

  /** Get all profiles. */
  getAllProfiles(): KYBProfile[] {
    return [...kybProfiles];
  },

  /** Get profiles by status. */
  getByStatus(status: KYBStatus): KYBProfile[] {
    return kybProfiles.filter((p) => p.status === status);
  },

  /** Seed mock data. */
  _seed(profiles?: KYBProfile[]): void {
    if (profiles) {
      kybProfiles = profiles;
      docCounter = profiles.reduce((max, p) => max + p.documents.length, 0);
    }
  },
};

/**
 * Compliance Service
 * Manages the compliance queue: pending reviews, approvals, rejections, escalations.
 * Handles KYC/KYB reviews, sanctions checks, chargeback reviews, manual reviews.
 */

import type { ComplianceCase, ComplianceStatus, ComplianceNote } from '@/types';
import { auditService } from './audit.service';

let cases: ComplianceCase[] = [];
let caseCounter = 0;

function nextCaseId(): string {
  caseCounter++;
  return `CMP-${Date.now().toString(36).toUpperCase()}-${caseCounter.toString().padStart(6, '0')}`;
}

export const complianceService = {
  /** Get all compliance cases. */
  getAll(): ComplianceCase[] {
    return [...cases].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },

  /** Get a single case. */
  getById(id: string): ComplianceCase | undefined {
    return cases.find((c) => c.id === id);
  },

  /** Get cases by status. */
  getByStatus(status: ComplianceStatus): ComplianceCase[] {
    return cases.filter((c) => c.status === status);
  },

  /** Get cases assigned to a user. */
  getByAssignee(assigneeId: string): ComplianceCase[] {
    return cases.filter((c) => c.assignedTo === assigneeId);
  },

  /** Get cases by priority. */
  getByPriority(priority: 'low' | 'medium' | 'high' | 'urgent'): ComplianceCase[] {
    return cases.filter((c) => c.priority === priority);
  },

  /** Create a new compliance case. */
  create(params: {
    userId?: string;
    merchantId?: string;
    type: ComplianceCase['type'];
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    description: string;
    assignedTo?: string;
  }): ComplianceCase {
    const now = new Date().toISOString();
    const case_: ComplianceCase = {
      id: nextCaseId(),
      userId: params.userId,
      merchantId: params.merchantId,
      type: params.type,
      status: 'pending_review',
      priority: params.priority ?? 'medium',
      assignedTo: params.assignedTo,
      description: params.description,
      createdAt: now,
      updatedAt: now,
      notes: [],
    };
    cases.push(case_);

    auditService.log({
      type: 'compliance_review',
      actorId: 'system',
      actorName: 'System',
      actorRole: 'compliance',
      action: `Compliance case created: ${params.type}`,
      resourceType: 'compliance_case',
      resourceId: case_.id,
    });

    return case_;
  },

  /** Update case status. */
  updateStatus(id: string, status: ComplianceStatus, actorId: string, actorName: string, note?: string): ComplianceCase | undefined {
    const c = cases.find((x) => x.id === id);
    if (!c) return undefined;
    c.status = status;
    c.updatedAt = new Date().toISOString();
    if (status === 'approved' || status === 'rejected' || status === 'suspended') {
      c.resolvedAt = new Date().toISOString();
    }
    if (note) {
      c.notes.push({
        id: `note-${Date.now()}`,
        authorId: actorId,
        authorName: actorName,
        note,
        timestamp: new Date().toISOString(),
      });
    }

    auditService.log({
      type: 'compliance_review',
      actorId,
      actorName,
      actorRole: 'compliance',
      action: `Case ${id} status changed to ${status}`,
      resourceType: 'compliance_case',
      resourceId: id,
    });

    return c;
  },

  /** Assign a case. */
  assign(id: string, assigneeId: string, actorId: string, actorName: string): ComplianceCase | undefined {
    const c = cases.find((x) => x.id === id);
    if (!c) return undefined;
    c.assignedTo = assigneeId;
    c.updatedAt = new Date().toISOString();
    return c;
  },

  /** Add a note to a case. */
  addNote(id: string, authorId: string, authorName: string, note: string): ComplianceCase | undefined {
    const c = cases.find((x) => x.id === id);
    if (!c) return undefined;
    c.notes.push({
      id: `note-${Date.now()}`,
      authorId,
      authorName,
      note,
      timestamp: new Date().toISOString(),
    });
    c.updatedAt = new Date().toISOString();
    return c;
  },

  /** Escalate a case. */
  escalate(id: string, actorId: string, actorName: string, reason: string): ComplianceCase | undefined {
    return this.updateStatus(id, 'escalated', actorId, actorName, reason);
  },

  /** Get summary stats. */
  getStats(): {
    pending: number;
    approved: number;
    rejected: number;
    manualReview: number;
    escalated: number;
    suspended: number;
    total: number;
  } {
    return {
      pending: cases.filter((c) => c.status === 'pending_review').length,
      approved: cases.filter((c) => c.status === 'approved').length,
      rejected: cases.filter((c) => c.status === 'rejected').length,
      manualReview: cases.filter((c) => c.status === 'manual_review').length,
      escalated: cases.filter((c) => c.status === 'escalated').length,
      suspended: cases.filter((c) => c.status === 'suspended').length,
      total: cases.length,
    };
  },

  /** Seed mock data. */
  _seed(c: ComplianceCase[]): void {
    cases = c;
    caseCounter = c.length;
  },
};

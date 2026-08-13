/**
 * Audit Service
 * Immutable audit log. Every important action creates a permanent record.
 * Records are append-only and marked readonly at the type level.
 */

import type { AuditEvent, AuditEventType } from '@/types';

let auditEvents: AuditEvent[] = [];
let eventCounter = 0;

function nextEventId(): string {
  eventCounter++;
  return `AUD-${Date.now().toString(36).toUpperCase()}-${eventCounter.toString().padStart(8, '0')}`;
}

function generateMockEvents(): AuditEvent[] {
  const now = Date.now();
  const events: Omit<AuditEvent, 'id' | 'immutable'>[] = [
    { type: 'login', actorId: 'usr_001', actorName: 'SENTI User', actorRole: 'merchant', action: 'User logged in', resourceType: 'auth', resourceId: 'usr_001', ipAddress: '105.166.0.1', userAgent: 'Chrome/Mac', timestamp: new Date(now - 3600_000).toISOString() },
    { type: 'login', actorId: 'usr_002', actorName: 'Amara Okafor', actorRole: 'merchant', action: 'User logged in', resourceType: 'auth', resourceId: 'usr_002', ipAddress: '102.89.0.1', userAgent: 'Safari/iPhone', timestamp: new Date(now - 7200_000).toISOString() },
    { type: 'password_change', actorId: 'usr_001', actorName: 'SENTI User', actorRole: 'merchant', action: 'Password changed', resourceType: 'auth', resourceId: 'usr_001', ipAddress: '105.166.0.1', userAgent: 'Chrome/Mac', timestamp: new Date(now - 86400_000).toISOString() },
    { type: 'wallet_creation', actorId: 'usr_001', actorName: 'SENTI User', actorRole: 'merchant', action: 'Primary wallet created', resourceType: 'wallet', resourceId: 'PW-001', ipAddress: '105.166.0.1', userAgent: 'Chrome/Mac', timestamp: new Date(now - 7 * 86400_000).toISOString() },
    { type: 'merchant_registration', actorId: 'usr_002', actorName: 'Amara Okafor', actorRole: 'merchant', action: 'Merchant registered: Amara Stores', resourceType: 'merchant', resourceId: 'MCH-001', ipAddress: '102.89.0.1', userAgent: 'Safari/iPhone', timestamp: new Date(now - 14 * 86400_000).toISOString() },
    { type: 'api_key_creation', actorId: 'usr_003', actorName: 'James Mwangi', actorRole: 'developer', action: 'API key created: production-key', resourceType: 'api_key', resourceId: 'key-001', ipAddress: '105.166.0.2', userAgent: 'Firefox/Linux', timestamp: new Date(now - 3 * 86400_000).toISOString() },
    { type: 'kyc_submission', actorId: 'usr_001', actorName: 'SENTI User', actorRole: 'merchant', action: 'KYC submitted for review', resourceType: 'kyc_profile', resourceId: 'KYC-001', ipAddress: '105.166.0.1', userAgent: 'Chrome/Mac', timestamp: new Date(now - 5 * 86400_000).toISOString() },
    { type: 'kyc_approval', actorId: 'usr_005', actorName: 'Compliance Officer', actorRole: 'compliance', action: 'KYC approved for usr_001', resourceType: 'kyc_profile', resourceId: 'KYC-001', ipAddress: '10.0.0.1', userAgent: 'Chrome/Mac', timestamp: new Date(now - 4 * 86400_000).toISOString() },
    { type: 'settlement_approval', actorId: 'usr_005', actorName: 'Compliance Officer', actorRole: 'compliance', action: 'Settlement STL-001 approved', resourceType: 'settlement', resourceId: 'STL-001', ipAddress: '10.0.0.1', userAgent: 'Chrome/Mac', timestamp: new Date(now - 2 * 86400_000).toISOString() },
    { type: 'role_change', actorId: 'usr_005', actorName: 'Compliance Officer', actorRole: 'compliance', action: 'Role changed: usr_003 customer → developer', resourceType: 'user', resourceId: 'usr_003', ipAddress: '10.0.0.1', userAgent: 'Chrome/Mac', timestamp: new Date(now - 10 * 86400_000).toISOString() },
    { type: 'security_alert', actorId: 'system', actorName: 'System', actorRole: 'admin', action: 'Suspicious login from new device', resourceType: 'auth', resourceId: 'usr_001', ipAddress: '203.0.113.1', userAgent: 'Unknown', timestamp: new Date(now - 6 * 3600_000).toISOString() },
    { type: 'document_upload', actorId: 'usr_002', actorName: 'Amara Okafor', actorRole: 'merchant', action: 'Uploaded passport', resourceType: 'kyc_document', resourceId: 'KYC-DOC-001', ipAddress: '102.89.0.1', userAgent: 'Safari/iPhone', timestamp: new Date(now - 6 * 86400_000).toISOString() },
    { type: 'settings_change', actorId: 'usr_001', actorName: 'SENTI User', actorRole: 'merchant', action: 'Notification preferences updated', resourceType: 'identity', resourceId: 'id-001', ipAddress: '105.166.0.1', userAgent: 'Chrome/Mac', timestamp: new Date(now - 12 * 3600_000).toISOString() },
    { type: 'logout', actorId: 'usr_003', actorName: 'James Mwangi', actorRole: 'developer', action: 'User logged out', resourceType: 'auth', resourceId: 'usr_003', ipAddress: '105.166.0.2', userAgent: 'Firefox/Linux', timestamp: new Date(now - 48 * 3600_000).toISOString() },
    { type: 'email_change', actorId: 'usr_004', actorName: 'Sarah Chen', actorRole: 'merchant', action: 'Email changed from sarah@old.com to sarah@enterprise.com', resourceType: 'identity', resourceId: 'id-004', ipAddress: '73.222.0.1', userAgent: 'Chrome/Mac', timestamp: new Date(now - 20 * 86400_000).toISOString() },
    { type: 'account_suspension', actorId: 'usr_005', actorName: 'Compliance Officer', actorRole: 'compliance', action: 'Account suspended: fraudulent activity detected', resourceType: 'user', resourceId: 'usr_006', ipAddress: '10.0.0.1', userAgent: 'Chrome/Mac', timestamp: new Date(now - 8 * 86400_000).toISOString() },
  ];

  return events.map((e) => ({ ...e, id: nextEventId(), immutable: true as const }));
}

export const auditService = {
  /** Log an audit event. This is the primary entry point. */
  log(params: Omit<AuditEvent, 'id' | 'timestamp' | 'userAgent' | 'immutable' | 'ipAddress'> & { userAgent?: string; ipAddress?: string }): AuditEvent {
    const event: AuditEvent = {
      ...params,
      id: nextEventId(),
      ipAddress: params.ipAddress ?? '0.0.0.0',
      userAgent: params.userAgent ?? 'client',
      timestamp: new Date().toISOString(),
      immutable: true,
    };
    auditEvents.push(event);
    return event;
  },

  /** Get all audit events (newest first). */
  getAll(limit?: number): AuditEvent[] {
    const sorted = [...auditEvents].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    return limit ? sorted.slice(0, limit) : sorted;
  },

  /** Get events by actor. */
  getByActor(actorId: string): AuditEvent[] {
    return auditEvents.filter((e) => e.actorId === actorId).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  },

  /** Get events by type. */
  getByType(type: AuditEventType): AuditEvent[] {
    return auditEvents.filter((e) => e.type === type).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  },

  /** Get events for a resource. */
  getByResource(resourceType: string, resourceId: string): AuditEvent[] {
    return auditEvents
      .filter((e) => e.resourceType === resourceType && e.resourceId === resourceId)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  },

  /** Get count. */
  count(): number {
    return auditEvents.length;
  },

  /** Get events within a date range. */
  getByDateRange(from: string, to: string): AuditEvent[] {
    return auditEvents
      .filter((e) => e.timestamp >= from && e.timestamp <= to)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  },

  /** Seed mock data. */
  _seed(events?: AuditEvent[]): void {
    if (events) {
      auditEvents = events;
      eventCounter = events.length;
    } else {
      auditEvents = generateMockEvents();
      eventCounter = auditEvents.length;
    }
  },
};

// Auto-seed on module load
auditService._seed();

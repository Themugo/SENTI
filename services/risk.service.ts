/**
 * Risk Engine
 * Calculates risk scores (0-100) across 6 dimensions and flags suspicious activity.
 * Scores are mock but structured for production swap to a real risk engine.
 */

import type { RiskProfile, RiskFlag, RiskLevel, RiskFlagType } from '@/types';
import { auditService } from './audit.service';

let riskProfiles: RiskProfile[] = [];
let flagCounter = 0;

function nextFlagId(): string {
  flagCounter++;
  return `RSK-${flagCounter.toString().padStart(6, '0')}`;
}

function scoreToLevel(score: number): RiskLevel {
  if (score >= 80) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 30) return 'medium';
  return 'low';
}

function generateMockFlags(): RiskFlag[] {
  const now = Date.now();
  return [
    { id: nextFlagId(), type: 'high_value_transaction', severity: 'medium', description: 'Transaction of $15,000 exceeds normal pattern', detectedAt: new Date(now - 3600_000).toISOString(), resolved: false },
    { id: nextFlagId(), type: 'new_device_login', severity: 'low', description: 'Login from new device in Nairobi, Kenya', detectedAt: new Date(now - 7200_000).toISOString(), resolved: false },
    { id: nextFlagId(), type: 'multiple_failed_logins', severity: 'medium', description: '5 failed login attempts in 10 minutes', detectedAt: new Date(now - 3 * 3600_000).toISOString(), resolved: true, resolvedAt: new Date(now - 2 * 3600_000).toISOString() },
    { id: nextFlagId(), type: 'rapid_transfers', severity: 'high', description: '4 transfers totaling $45,000 within 1 hour', detectedAt: new Date(now - 6 * 3600_000).toISOString(), resolved: false },
    { id: nextFlagId(), type: 'high_risk_country', severity: 'high', description: 'Transaction with entity in sanctioned jurisdiction', detectedAt: new Date(now - 12 * 3600_000).toISOString(), resolved: false },
    { id: nextFlagId(), type: 'sanctions_match', severity: 'critical', description: 'Potential match against sanctions list (requires manual review)', detectedAt: new Date(now - 18 * 3600_000).toISOString(), resolved: false },
    { id: nextFlagId(), type: 'chargeback_risk', severity: 'medium', description: 'Chargeback rate 2.1% (threshold 1.5%)', detectedAt: new Date(now - 24 * 3600_000).toISOString(), resolved: false },
    { id: nextFlagId(), type: 'velocity_anomaly', severity: 'high', description: 'Transaction velocity 3.2x above 30-day average', detectedAt: new Date(now - 48 * 3600_000).toISOString(), resolved: true, resolvedAt: new Date(now - 36 * 3600_000).toISOString() },
    { id: nextFlagId(), type: 'multiple_devices', severity: 'low', description: 'Account accessed from 3 devices in 24 hours', detectedAt: new Date(now - 72 * 3600_000).toISOString(), resolved: true, resolvedAt: new Date(now - 60 * 3600_000).toISOString() },
    { id: nextFlagId(), type: 'unusual_pattern', severity: 'medium', description: 'Unusual transaction pattern detected by ML model', detectedAt: new Date(now - 96 * 3600_000).toISOString(), resolved: false },
  ];
}

const mockFlags = generateMockFlags();

function generateMockProfiles(): RiskProfile[] {
  return [
    {
      userId: 'usr_001',
      overallScore: 35,
      level: 'medium',
      transactionRisk: 28,
      countryRisk: 20,
      merchantRisk: 42,
      deviceRisk: 15,
      behaviourRisk: 30,
      velocityRisk: 45,
      flags: mockFlags.filter((f) => ['high_value_transaction', 'new_device_login', 'rapid_transfers'].includes(f.type)),
      assessedAt: new Date().toISOString(),
    },
    {
      userId: 'usr_002',
      merchantId: 'MCH-001',
      overallScore: 72,
      level: 'high',
      transactionRisk: 65,
      countryRisk: 70,
      merchantRisk: 78,
      deviceRisk: 30,
      behaviourRisk: 55,
      velocityRisk: 80,
      flags: mockFlags.filter((f) => ['high_risk_country', 'sanctions_match', 'chargeback_risk', 'velocity_anomaly'].includes(f.type)),
      assessedAt: new Date().toISOString(),
    },
    {
      userId: 'usr_003',
      overallScore: 18,
      level: 'low',
      transactionRisk: 12,
      countryRisk: 15,
      merchantRisk: 20,
      deviceRisk: 10,
      behaviourRisk: 18,
      velocityRisk: 25,
      flags: mockFlags.filter((f) => f.type === 'multiple_devices'),
      assessedAt: new Date().toISOString(),
    },
    {
      userId: 'usr_004',
      merchantId: 'MCH-002',
      overallScore: 55,
      level: 'medium',
      transactionRisk: 50,
      countryRisk: 25,
      merchantRisk: 60,
      deviceRisk: 20,
      behaviourRisk: 45,
      velocityRisk: 55,
      flags: mockFlags.filter((f) => ['unusual_pattern', 'chargeback_risk'].includes(f.type)),
      assessedAt: new Date().toISOString(),
    },
  ];
}

export const riskService = {
  /** Get risk profile for a user. */
  getProfile(userId: string): RiskProfile {
    let profile = riskProfiles.find((p) => p.userId === userId);
    if (!profile) {
      profile = {
        userId,
        overallScore: 25,
        level: 'low',
        transactionRisk: 20,
        countryRisk: 15,
        merchantRisk: 25,
        deviceRisk: 15,
        behaviourRisk: 20,
        velocityRisk: 30,
        flags: [],
        assessedAt: new Date().toISOString(),
      };
      riskProfiles.push(profile);
    }
    return profile;
  },

  /** Get all risk profiles. */
  getAll(): RiskProfile[] {
    return [...riskProfiles];
  },

  /** Get high-risk profiles. */
  getHighRisk(): RiskProfile[] {
    return riskProfiles.filter((p) => p.level === 'high' || p.level === 'critical');
  },

  /** Get all risk flags across all profiles. */
  getAllFlags(): RiskFlag[] {
    return riskProfiles.flatMap((p) => p.flags);
  },

  /** Get unresolved flags. */
  getUnresolvedFlags(): RiskFlag[] {
    return this.getAllFlags().filter((f) => !f.resolved);
  },

  /** Resolve a flag. */
  resolveFlag(userId: string, flagId: string, actorId: string): RiskProfile | undefined {
    const profile = riskProfiles.find((p) => p.userId === userId);
    if (!profile) return undefined;
    const flag = profile.flags.find((f) => f.id === flagId);
    if (!flag) return undefined;
    flag.resolved = true;
    flag.resolvedAt = new Date().toISOString();

    auditService.log({
      type: 'security_alert',
      actorId,
      actorName: 'Compliance Officer',
      actorRole: 'compliance',
      action: `Risk flag resolved: ${flag.type}`,
      resourceType: 'risk_flag',
      resourceId: flagId,
    });

    return profile;
  },

  /** Add a new flag to a profile. */
  addFlag(userId: string, type: RiskFlagType, severity: RiskLevel, description: string): RiskFlag {
    const profile = this.getProfile(userId);
    const flag: RiskFlag = {
      id: nextFlagId(),
      type,
      severity,
      description,
      detectedAt: new Date().toISOString(),
      resolved: false,
    };
    profile.flags.push(flag);
    profile.assessedAt = new Date().toISOString();

    auditService.log({
      type: 'security_alert',
      actorId: 'system',
      actorName: 'Risk Engine',
      actorRole: 'admin',
      action: `Risk flag raised: ${type} (${severity})`,
      resourceType: 'risk_flag',
      resourceId: flag.id,
    });

    return flag;
  },

  /** Recalculate overall score from components. */
  recalculate(userId: string): RiskProfile {
    const profile = this.getProfile(userId);
    const components = [profile.transactionRisk, profile.countryRisk, profile.merchantRisk, profile.deviceRisk, profile.behaviourRisk, profile.velocityRisk];
    profile.overallScore = Math.round(components.reduce((a, b) => a + b, 0) / components.length);
    profile.level = scoreToLevel(profile.overallScore);
    profile.assessedAt = new Date().toISOString();
    return profile;
  },

  /** Get platform-wide risk stats. */
  getStats(): { avgScore: number; highRisk: number; critical: number; totalFlags: number; unresolvedFlags: number } {
    const profiles = riskProfiles;
    const avg = profiles.length > 0 ? Math.round(profiles.reduce((sum, p) => sum + p.overallScore, 0) / profiles.length) : 0;
    const allFlags = this.getAllFlags();
    return {
      avgScore: avg,
      highRisk: profiles.filter((p) => p.level === 'high').length,
      critical: profiles.filter((p) => p.level === 'critical').length,
      totalFlags: allFlags.length,
      unresolvedFlags: allFlags.filter((f) => !f.resolved).length,
    };
  },

  /** Seed mock data. */
  _seed(profiles?: RiskProfile[]): void {
    riskProfiles = profiles ?? generateMockProfiles();
    flagCounter = riskProfiles.reduce((max, p) => max + p.flags.length, 0);
  },
};

// Auto-seed
riskService._seed();

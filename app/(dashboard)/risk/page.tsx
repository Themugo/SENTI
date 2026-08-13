'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Shield, ShieldAlert, ShieldCheck, Activity, TrendingUp, TrendingDown,
  AlertTriangle, Globe, Smartphone, Zap, Eye, Check, X, Clock,
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/status-badge';
import { riskService } from '@/services/risk.service';
import { cn, formatDate } from '@/lib/utils';
import type { RiskProfile, RiskLevel, RiskFlag } from '@/types';

const levelConfig: Record<RiskLevel, { label: string; color: string; bg: string }> = {
  low: { label: 'Low Risk', color: 'text-success', bg: 'bg-success/10' },
  medium: { label: 'Medium Risk', color: 'text-warning', bg: 'bg-warning/10' },
  high: { label: 'High Risk', color: 'text-destructive', bg: 'bg-destructive/10' },
  critical: { label: 'Critical', color: 'text-destructive', bg: 'bg-destructive/20' },
};

const flagTypeIcons: Record<string, typeof AlertTriangle> = {
  high_value_transaction: TrendingUp,
  multiple_failed_logins: ShieldAlert,
  rapid_transfers: Zap,
  multiple_devices: Smartphone,
  new_device_login: Smartphone,
  high_risk_country: Globe,
  sanctions_match: ShieldAlert,
  chargeback_risk: TrendingDown,
  velocity_anomaly: Activity,
  unusual_pattern: Eye,
};

export default function RiskDashboardPage() {
  const [profile, setProfile] = useState<RiskProfile | null>(null);
  const [stats, setStats] = useState(riskService.getStats());

  useEffect(() => {
    setProfile(riskService.getProfile('usr_001'));
    setStats(riskService.getStats());
  }, []);

  if (!profile) {
    return (
      <div className="space-y-6">
        <PageHeader title="Risk Dashboard" description="Real-time risk assessment and monitoring." />
        <div className="h-96 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  const level = levelConfig[profile.level];

  const dimensions = [
    { label: 'Transaction Risk', value: profile.transactionRisk, icon: TrendingUp },
    { label: 'Country Risk', value: profile.countryRisk, icon: Globe },
    { label: 'Merchant Risk', value: profile.merchantRisk, icon: Shield },
    { label: 'Device Risk', value: profile.deviceRisk, icon: Smartphone },
    { label: 'Behaviour Risk', value: profile.behaviourRisk, icon: Eye },
    { label: 'Velocity Risk', value: profile.velocityRisk, icon: Zap },
  ];

  const handleResolve = (flagId: string) => {
    riskService.resolveFlag(profile.userId, flagId, 'usr_005');
    setProfile({ ...riskService.getProfile(profile.userId) });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Risk Dashboard" description="Real-time risk assessment across 6 dimensions.">
        <div className={cn('flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium', level.bg, level.color)}>
          <Shield className="h-3.5 w-3.5" />
          {level.label}
        </div>
      </PageHeader>

      {/* Overall Score + Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Overall Risk Score</p>
              <p className={cn('text-4xl font-bold font-display mt-1', level.color)}>{profile.overallScore}</p>
              <p className="text-xs text-muted-foreground mt-1">out of 100</p>
            </div>
            <div className={cn('flex h-16 w-16 items-center justify-center rounded-2xl', level.bg)}>
              <Shield className={cn('h-8 w-8', level.color)} />
            </div>
          </div>
        </Card>

        <StatCard title="Avg Platform Risk" value={stats.avgScore.toString()} subtitle="across all users" icon={<Activity className="h-5 w-5" />} />
        <StatCard title="High-Risk Users" value={stats.highRisk.toString()} subtitle="require review" icon={<ShieldAlert className="h-5 w-5" />} delay={0.05} />
        <StatCard title="Unresolved Flags" value={stats.unresolvedFlags.toString()} subtitle={`of ${stats.totalFlags} total`} icon={<AlertTriangle className="h-5 w-5" />} delay={0.1} />
      </div>

      {/* Risk Dimensions */}
      <Card className="p-5">
        <h3 className="text-lg font-semibold font-display">Risk Dimensions</h3>
        <p className="text-sm text-muted-foreground">6-dimensional risk assessment</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {dimensions.map((dim, i) => {
            const dimLevel = levelConfig[dim.value >= 80 ? 'critical' : dim.value >= 60 ? 'high' : dim.value >= 30 ? 'medium' : 'low'];
            return (
              <motion.div key={dim.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-xl border border-border p-4">
                <div className="flex items-center justify-between">
                  <dim.icon className={cn('h-5 w-5', dimLevel.color)} />
                  <span className={cn('text-2xl font-bold font-display', dimLevel.color)}>{dim.value}</span>
                </div>
                <p className="mt-2 text-sm font-medium">{dim.label}</p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${dim.value}%` }} transition={{ duration: 0.8, delay: i * 0.05 }} className={cn('h-full rounded-full', dim.value >= 60 ? 'bg-destructive' : dim.value >= 30 ? 'bg-warning' : 'bg-success')} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </Card>

      {/* Risk Flags */}
      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold font-display">Risk Flags</h3>
          <Badge variant={profile.flags.filter((f) => !f.resolved).length > 0 ? 'warning' : 'success'}>
            {profile.flags.filter((f) => !f.resolved).length} active
          </Badge>
        </div>
        <div className="space-y-3">
          {profile.flags.length === 0 ? (
            <p className="text-sm text-muted-foreground">No risk flags detected.</p>
          ) : (
            profile.flags.map((flag: RiskFlag, i) => {
              const Icon = flagTypeIcons[flag.type] ?? AlertTriangle;
              const flagLevel = levelConfig[flag.severity];
              return (
                <motion.div key={flag.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className={cn('flex items-center justify-between rounded-lg border p-4', flag.resolved ? 'border-border opacity-60' : 'border-border')}>
                  <div className="flex items-center gap-3">
                    <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', flagLevel.bg)}>
                      <Icon className={cn('h-5 w-5', flagLevel.color)} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{flag.type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</p>
                      <p className="text-xs text-muted-foreground">{flag.description}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Detected: {formatDate(flag.detectedAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={cn('rounded-full px-2.5 py-1 text-xs font-medium', flagLevel.bg, flagLevel.color)}>
                      {flag.severity}
                    </div>
                    {flag.resolved ? (
                      <Badge variant="success"><Check className="h-3 w-3" /> Resolved</Badge>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => handleResolve(flag.id)} className="gap-1">
                        <Check className="h-3 w-3" />
                        Resolve
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}

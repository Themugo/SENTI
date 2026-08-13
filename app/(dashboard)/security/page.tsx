'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Shield, Key, Smartphone, Monitor, Tablet,
  Check, AlertTriangle, Eye, EyeOff, RefreshCw, Download, LogOut,
  Clock, Lock, Unlock,
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/status-badge';
import { toast } from 'sonner';
import { cn, formatDate } from '@/lib/utils';
import type { SecurityEvent, Session, TrustedDevice } from '@/types';

const mockDevices: TrustedDevice[] = [
  { id: 'dev-001', deviceName: 'MacBook Pro', deviceType: 'desktop', browser: 'Chrome 120', os: 'macOS 14', location: 'Nairobi, Kenya', lastUsed: new Date().toISOString(), trusted: true },
  { id: 'dev-002', deviceName: 'iPhone 15 Pro', deviceType: 'mobile', browser: 'Safari', os: 'iOS 17', location: 'Nairobi, Kenya', lastUsed: new Date(Date.now() - 2 * 3600_000).toISOString(), trusted: true },
  { id: 'dev-003', deviceName: 'Chrome on Windows', deviceType: 'desktop', browser: 'Chrome 120', os: 'Windows 11', location: 'London, UK', lastUsed: new Date(Date.now() - 3 * 86400_000).toISOString(), trusted: false },
];

const mockSessions: Session[] = [
  { id: 'ses-001', device: 'MacBook Pro — Chrome', location: 'Nairobi, Kenya', ipAddress: '105.166.0.1', status: 'active', createdAt: new Date().toISOString(), lastActive: new Date().toISOString() },
  { id: 'ses-002', device: 'iPhone 15 Pro — Safari', location: 'Nairobi, Kenya', ipAddress: '105.166.0.2', status: 'active', createdAt: new Date(Date.now() - 2 * 3600_000).toISOString(), lastActive: new Date(Date.now() - 30 * 60_000).toISOString() },
  { id: 'ses-003', device: 'Chrome — Windows', location: 'London, UK', ipAddress: '203.0.113.1', status: 'expired', createdAt: new Date(Date.now() - 3 * 86400_000).toISOString(), lastActive: new Date(Date.now() - 3 * 86400_000).toISOString() },
];

const mockSecurityEvents: SecurityEvent[] = [
  { id: 'sev-001', type: 'login', description: 'Successful login', location: 'Nairobi, Kenya', ipAddress: '105.166.0.1', timestamp: new Date().toISOString() },
  { id: 'sev-002', type: '2fa_enabled', description: 'Two-factor authentication enabled', location: 'Nairobi, Kenya', ipAddress: '105.166.0.1', timestamp: new Date(Date.now() - 7 * 86400_000).toISOString() },
  { id: 'sev-003', type: 'password_change', description: 'Password changed successfully', location: 'Nairobi, Kenya', ipAddress: '105.166.0.1', timestamp: new Date(Date.now() - 14 * 86400_000).toISOString() },
  { id: 'sev-004', type: 'suspicious_activity', description: 'Login attempt from new device blocked', location: 'Unknown', ipAddress: '203.0.113.99', timestamp: new Date(Date.now() - 2 * 86400_000).toISOString() },
  { id: 'sev-005', type: 'device_trusted', description: 'iPhone 15 Pro added as trusted device', location: 'Nairobi, Kenya', ipAddress: '105.166.0.2', timestamp: new Date(Date.now() - 10 * 86400_000).toISOString() },
];

const mockRecoveryCodes = ['SENTI-7K2M-9P4Q', 'SENTI-X8RN-3L5T', 'SENTI-B1ZW-6Y8V', 'SENTI-F4DC-2H9J', 'SENTI-A7MK-5N3P', 'SENTI-Q2LR-8T6W'];

const deviceIcons: Record<string, typeof Monitor> = { desktop: Monitor, mobile: Smartphone, tablet: Tablet };

export default function SecurityCenterPage() {
  const [twoFAEnabled, setTwoFAEnabled] = useState(true);
  const [showCodes, setShowCodes] = useState(false);
  const [devices, setDevices] = useState(mockDevices);
  const [sessions, setSessions] = useState(mockSessions);
  const [events] = useState(mockSecurityEvents);

  const handleRevokeSession = (id: string) => {
    setSessions((prev) => prev.map((s) => s.id === id ? { ...s, status: 'revoked' as const } : s));
    toast.success('Session revoked');
  };

  const handleTrustDevice = (id: string) => {
    setDevices((prev) => prev.map((d) => d.id === id ? { ...d, trusted: true } : d));
    toast.success('Device trusted');
  };

  const handleRevokeDevice = (id: string) => {
    setDevices((prev) => prev.filter((d) => d.id !== id));
    toast.success('Device removed');
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Security Center" description="Manage passwords, two-factor authentication, devices, and sessions.">
        <Badge variant={twoFAEnabled ? 'success' : 'warning'}>
          <Shield className="h-3 w-3" />
          {twoFAEnabled ? 'Secured' : '2FA Required'}
        </Badge>
      </PageHeader>

      {/* Password Management */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold font-display">Password Management</h3>
        <p className="text-sm text-muted-foreground">Change your account password</p>
        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label>Current Password</Label>
            <Input type="password" placeholder="••••••••" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label>New Password</Label><Input type="password" placeholder="••••••••" /></div>
            <div className="space-y-2"><Label>Confirm Password</Label><Input type="password" placeholder="••••••••" /></div>
          </div>
        </div>
        <div className="mt-4 flex justify-end"><Button onClick={() => toast.success('Password updated')} className="gap-1.5"><Key className="h-4 w-4" /> Update Password</Button></div>
      </Card>

      {/* Two-Factor Authentication */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold font-display">Two-Factor Authentication</h3>
            <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
          </div>
          <Switch checked={twoFAEnabled} onCheckedChange={(v) => { setTwoFAEnabled(v); toast.success(v ? '2FA enabled' : '2FA disabled'); }} />
        </div>
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-3 rounded-lg border border-border p-3">
            <Smartphone className="h-5 w-5 text-primary" />
            <div className="flex-1"><p className="text-sm font-medium">Authenticator App</p><p className="text-xs text-muted-foreground">Google Authenticator, Authy, or similar</p></div>
            <Badge variant="success"><Check className="h-3 w-3" /> Active</Badge>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border p-3">
            <Smartphone className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1"><p className="text-sm font-medium">SMS Authentication</p><p className="text-xs text-muted-foreground">Receive codes via SMS</p></div>
            <Button variant="outline" size="sm">Enable</Button>
          </div>
        </div>
      </Card>

      {/* Recovery Codes */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold font-display">Recovery Codes</h3>
            <p className="text-sm text-muted-foreground">Use these codes if you lose access to your 2FA device</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowCodes(!showCodes)}>
              {showCodes ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {showCodes ? 'Hide' : 'Reveal'}
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => toast.success('New codes generated')}>
              <RefreshCw className="h-3.5 w-3.5" /> Regenerate
            </Button>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {mockRecoveryCodes.map((code, i) => (
            <div key={i} className={cn('rounded-lg border border-border p-2 text-center font-mono text-sm', showCodes ? '' : 'blur-sm select-none')}>
              {code}
            </div>
          ))}
        </div>
      </Card>

      {/* Trusted Devices */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold font-display">Trusted Devices</h3>
        <p className="text-sm text-muted-foreground">Devices that have access to your account</p>
        <div className="mt-4 space-y-3">
          {devices.map((device) => {
            const Icon = deviceIcons[device.deviceType] ?? Monitor;
            return (
              <div key={device.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{device.deviceName} {device.trusted && <Badge variant="success" className="ml-1">Trusted</Badge>}</p>
                    <p className="text-xs text-muted-foreground">{device.browser} • {device.os} • {device.location} • {formatDate(device.lastUsed)}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {!device.trusted && <Button variant="outline" size="sm" onClick={() => handleTrustDevice(device.id)} className="gap-1"><Unlock className="h-3 w-3" /> Trust</Button>}
                  <Button variant="ghost" size="sm" onClick={() => handleRevokeDevice(device.id)} className="text-destructive"><LogOut className="h-3 w-3" /></Button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Active Sessions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold font-display">Active Sessions</h3>
        <p className="text-sm text-muted-foreground">Manage your active login sessions</p>
        <div className="mt-4 space-y-3">
          {sessions.map((session) => (
            <div key={session.id} className="flex items-center justify-between rounded-lg border border-border p-3">
              <div className="flex items-center gap-3">
                <Monitor className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{session.device} {session.status === 'active' && <Badge variant="success" className="ml-1">Active</Badge>}</p>
                  <p className="text-xs text-muted-foreground">{session.location} • {session.ipAddress} • {formatDate(session.lastActive)}</p>
                </div>
              </div>
              {session.status === 'active' && <Button variant="ghost" size="sm" onClick={() => handleRevokeSession(session.id)} className="text-destructive gap-1"><LogOut className="h-3 w-3" /> Revoke</Button>}
            </div>
          ))}
        </div>
      </Card>

      {/* Security Timeline */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold font-display">Security Timeline</h3>
        <p className="text-sm text-muted-foreground">Recent security events on your account</p>
        <div className="mt-4 space-y-3">
          {events.map((event, i) => (
            <motion.div key={event.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-start gap-3">
              <div className={cn('flex h-8 w-8 items-center justify-center rounded-full', event.type === 'suspicious_activity' ? 'bg-destructive/10' : 'bg-muted')}>
                {event.type === 'suspicious_activity' ? <AlertTriangle className="h-4 w-4 text-destructive" /> : <Shield className="h-4 w-4 text-muted-foreground" />}
              </div>
              <div className="flex-1 pt-0.5">
                <p className="text-sm font-medium">{event.description}</p>
                <p className="text-xs text-muted-foreground">{event.location} • {event.ipAddress} • {formatDate(event.timestamp)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  );
}

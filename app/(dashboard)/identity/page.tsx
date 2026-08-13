'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User, Shield, Bell, Globe, Key, Lock, Eye, EyeOff, Check,
  Smartphone, Mail, Phone, MapPin, Clock, CreditCard, Save,
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/status-badge';
import { toast } from 'sonner';
import { identityService } from '@/services/identity.service';
import { CURRENCIES, COUNTRIES } from '@/constants';
import type { Identity, AccountType, CurrencyCode } from '@/types';

const languages = [
  { code: 'en', name: 'English' }, { code: 'sw', name: 'Swahili' }, { code: 'fr', name: 'French' },
  { code: 'ar', name: 'Arabic' }, { code: 'pt', name: 'Portuguese' }, { code: 'es', name: 'Spanish' },
  { code: 'de', name: 'German' }, { code: 'zh', name: 'Chinese' },
];

const timezones = [
  'UTC', 'Africa/Nairobi', 'Africa/Lagos', 'Africa/Cairo', 'Africa/Johannesburg',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'America/New_York',
  'America/Los_Angeles', 'America/Chicago', 'Asia/Dubai', 'Asia/Singapore',
  'Asia/Tokyo', 'Australia/Sydney',
];

export default function IdentityCenterPage() {
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [prefs, setPrefs] = useState({
    email: true, push: true, sms: false, transactionAlerts: true,
    securityAlerts: true, marketingUpdates: false, weeklySummary: true, productUpdates: true,
  });
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'private' as 'public' | 'private' | 'contacts',
    showTransactionHistory: false, shareAnalytics: true, twoFactorRequired: true,
  });

  useEffect(() => {
    const id = identityService.getCurrent();
    setIdentity(id);
    setPrefs(id.notificationPreferences);
    setPrivacy(id.privacySettings);
  }, []);

  if (!identity) {
    return (
      <div className="space-y-6">
        <PageHeader title="Identity Center" description="Manage your profile, preferences, and security." />
        <div className="h-96 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  const handleSaveProfile = () => {
    identityService.updateProfile(identity.userId, {
      firstName: identity.firstName, lastName: identity.lastName,
      email: identity.email, phone: identity.phone,
      country: identity.country, language: identity.language,
      timezone: identity.timezone, preferredCurrency: identity.preferredCurrency,
    });
    toast.success('Profile updated');
  };

  const handleSavePrefs = () => {
    identityService.updateNotificationPreferences(identity.userId, prefs);
    toast.success('Notification preferences saved');
  };

  const handleSavePrivacy = () => {
    identityService.updatePrivacySettings(identity.userId, privacy);
    toast.success('Privacy settings saved');
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Identity Center" description="Manage your profile, preferences, and security.">
        <Badge variant="info">
          <User className="h-3 w-3" />
          {identityService.getAccountTypeLabel(identity.accountType)}
        </Badge>
      </PageHeader>

      <Tabs defaultValue="profile">
        <TabsList className="flex-wrap">
          <TabsTrigger value="profile" className="gap-1.5"><User className="h-4 w-4" /> Profile</TabsTrigger>
          <TabsTrigger value="preferences" className="gap-1.5"><Globe className="h-4 w-4" /> Preferences</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5"><Bell className="h-4 w-4" /> Notifications</TabsTrigger>
          <TabsTrigger value="privacy" className="gap-1.5"><Shield className="h-4 w-4" /> Privacy</TabsTrigger>
        </TabsList>

        {/* Profile */}
        <TabsContent value="profile" className="mt-4 space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold font-display">Profile Information</h3>
            <p className="text-sm text-muted-foreground">Your personal details and contact information</p>

            <div className="mt-6 flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-primary/10 text-2xl font-bold font-display text-primary">
                  {identity.firstName[0]}{identity.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <Button variant="outline" size="sm" onClick={() => toast.info('Photo upload coming soon')}>Change Photo</Button>
                <p className="mt-2 text-xs text-muted-foreground">JPG, PNG or GIF. Max 2MB.</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input value={identity.firstName} onChange={(e) => setIdentity({ ...identity, firstName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input value={identity.lastName} onChange={(e) => setIdentity({ ...identity, lastName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input type="email" value={identity.email} onChange={(e) => setIdentity({ ...identity, email: e.target.value })} className="pl-10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input value={identity.phone} onChange={(e) => setIdentity({ ...identity, phone: e.target.value })} className="pl-10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Nationality</Label>
                <Input value={identity.nationality} onChange={(e) => setIdentity({ ...identity, nationality: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Date of Birth</Label>
                <Input type="date" value={identity.dateOfBirth ?? ''} onChange={(e) => setIdentity({ ...identity, dateOfBirth: e.target.value })} />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline">Cancel</Button>
              <Button onClick={handleSaveProfile} className="gap-1.5"><Save className="h-4 w-4" /> Save Changes</Button>
            </div>
          </Card>
        </TabsContent>

        {/* Preferences */}
        <TabsContent value="preferences" className="mt-4 space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold font-display">Regional Preferences</h3>
            <p className="text-sm text-muted-foreground">Country, language, timezone, and currency</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Country</Label>
                <Select value={identity.country} onValueChange={(v) => setIdentity({ ...identity, country: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{COUNTRIES.map((c) => <SelectItem key={c.code} value={c.name}>{c.flag} {c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Language</Label>
                <Select value={identity.language} onValueChange={(v) => setIdentity({ ...identity, language: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{languages.map((l) => <SelectItem key={l.code} value={l.code}>{l.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select value={identity.timezone} onValueChange={(v) => setIdentity({ ...identity, timezone: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{timezones.map((tz) => <SelectItem key={tz} value={tz}>{tz}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Preferred Currency</Label>
                <Select value={identity.preferredCurrency} onValueChange={(v) => setIdentity({ ...identity, preferredCurrency: v as CurrencyCode })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(CURRENCIES).map(([code, meta]) => <SelectItem key={code} value={code}>{meta.flag} {code} — {meta.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={handleSaveProfile} className="gap-1.5"><Save className="h-4 w-4" /> Save Preferences</Button>
            </div>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="mt-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold font-display">Notification Preferences</h3>
            <p className="text-sm text-muted-foreground">Choose how and when you want to be notified</p>
            <div className="mt-6 space-y-4">
              {[
                { key: 'email', label: 'Email Notifications', desc: 'Receive notifications via email', icon: Mail },
                { key: 'push', label: 'Push Notifications', desc: 'Browser and mobile push alerts', icon: Smartphone },
                { key: 'sms', label: 'SMS Notifications', desc: 'Text message alerts (carrier fees may apply)', icon: Phone },
                { key: 'transactionAlerts', label: 'Transaction Alerts', desc: 'When you send or receive money', icon: CreditCard },
                { key: 'securityAlerts', label: 'Security Alerts', desc: 'New device logins and security events', icon: Shield },
                { key: 'weeklySummary', label: 'Weekly Summary', desc: 'Weekly financial summary email', icon: Clock },
                { key: 'productUpdates', label: 'Product Updates', desc: 'New features and announcements', icon: Globe },
                { key: 'marketingUpdates', label: 'Marketing', desc: 'Promotional offers and tips', icon: Mail },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div className="flex items-center gap-3">
                    <item.icon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                  <Switch checked={prefs[item.key as keyof typeof prefs]} onCheckedChange={(v) => setPrefs((p) => ({ ...p, [item.key]: v }))} />
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={handleSavePrefs} className="gap-1.5"><Save className="h-4 w-4" /> Save Preferences</Button>
            </div>
          </Card>
        </TabsContent>

        {/* Privacy */}
        <TabsContent value="privacy" className="mt-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold font-display">Privacy Settings</h3>
            <p className="text-sm text-muted-foreground">Control your data and visibility</p>
            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label>Profile Visibility</Label>
                <Select value={privacy.profileVisibility} onValueChange={(v) => setPrivacy((p) => ({ ...p, profileVisibility: v as 'public' | 'private' | 'contacts' }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private — Only me</SelectItem>
                    <SelectItem value="contacts">Contacts only</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {[
                { key: 'showTransactionHistory', label: 'Show Transaction History', desc: 'Allow others to see your transaction activity' },
                { key: 'shareAnalytics', label: 'Share Analytics', desc: 'Help improve SENTI by sharing anonymous usage data' },
                { key: 'twoFactorRequired', label: 'Require Two-Factor Authentication', desc: 'Mandate 2FA for all account access' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch checked={privacy[item.key as keyof typeof privacy] as boolean} onCheckedChange={(v) => setPrivacy((p) => ({ ...p, [item.key]: v }))} />
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={handleSavePrivacy} className="gap-1.5"><Save className="h-4 w-4" /> Save Privacy Settings</Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

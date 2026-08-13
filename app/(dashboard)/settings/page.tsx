'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User, Shield, Bell, CreditCard, Globe, Key,
  Check, Smartphone, Mail, ArrowRight,
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/status-badge';
import { CURRENCIES } from '@/constants';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    payments: true,
    transfers: true,
    invoices: true,
    security: true,
    marketing: false,
    weekly: true,
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your account, security, and preferences." />

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile" className="gap-1.5"><User className="h-4 w-4" /> Profile</TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5"><Shield className="h-4 w-4" /> Security</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5"><Bell className="h-4 w-4" /> Notifications</TabsTrigger>
          <TabsTrigger value="payment" className="gap-1.5"><CreditCard className="h-4 w-4" /> Payment</TabsTrigger>
        </TabsList>

        {/* Profile */}
        <TabsContent value="profile" className="mt-4 space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold font-display">Profile Information</h3>
            <p className="text-sm text-muted-foreground">Update your personal details</p>

            <div className="mt-6 flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-primary/10 text-2xl font-bold font-display text-primary">SU</AvatarFallback>
              </Avatar>
              <div>
                <Button variant="outline" size="sm">Change Photo</Button>
                <p className="mt-2 text-xs text-muted-foreground">JPG, PNG or GIF. Max 2MB.</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="first-name">First Name</Label>
                <Input id="first-name" defaultValue="SENTI" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last-name">Last Name</Label>
                <Input id="last-name" defaultValue="User" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="user@senti.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" defaultValue="+254 712 345 678" />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline">Cancel</Button>
              <Button onClick={() => toast.success('Profile updated')}>Save Changes</Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold font-display">Business Information</h3>
            <p className="text-sm text-muted-foreground">Your business details for compliance</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Business Name</Label>
                <Input defaultValue="Acme Corp" />
              </div>
              <div className="space-y-2">
                <Label>Country</Label>
                <Input defaultValue="United States" />
              </div>
              <div className="space-y-2">
                <Label>Preferred Currency</Label>
                <select className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm">
                  {Object.entries(CURRENCIES).map(([code, meta]) => (
                    <option key={code} value={code}>{meta.flag} {code} — {meta.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Business Type</Label>
                <Input defaultValue="Technology" />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="mt-4 space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold font-display">Password</h3>
            <p className="text-sm text-muted-foreground">Change your account password</p>
            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label>Current Password</Label>
                <Input type="password" placeholder="••••••••" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <div className="space-y-2">
                  <Label>Confirm Password</Label>
                  <Input type="password" placeholder="••••••••" />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={() => toast.success('Password updated')}>Update Password</Button>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold font-display">Two-Factor Authentication</h3>
                <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                <Smartphone className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Authenticator App</p>
                  <p className="text-xs text-muted-foreground">Use Google Authenticator or similar</p>
                </div>
                <Badge variant="success"><Check className="h-3 w-3" /> Active</Badge>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                <Smartphone className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">SMS Authentication</p>
                  <p className="text-xs text-muted-foreground">Receive codes via SMS</p>
                </div>
                <Button variant="outline" size="sm">Enable</Button>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold font-display">Active Sessions</h3>
            <p className="text-sm text-muted-foreground">Devices currently signed in</p>
            <div className="mt-4 space-y-3">
              {[
                { device: 'MacBook Pro', location: 'Nairobi, Kenya', current: true, time: 'Active now' },
                { device: 'iPhone 15 Pro', location: 'Nairobi, Kenya', current: false, time: '2 hours ago' },
                { device: 'Chrome on Windows', location: 'London, UK', current: false, time: '3 days ago' },
              ].map((session, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{session.device} {session.current && <Badge variant="success" className="ml-1">Current</Badge>}</p>
                      <p className="text-xs text-muted-foreground">{session.location} • {session.time}</p>
                    </div>
                  </div>
                  {!session.current && <Button variant="ghost" size="sm" className="text-destructive">Revoke</Button>}
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="mt-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold font-display">Notification Preferences</h3>
            <p className="text-sm text-muted-foreground">Choose what you want to be notified about</p>
            <div className="mt-6 space-y-4">
              {[
                { key: 'payments', label: 'Payments', desc: 'When you receive or send payments' },
                { key: 'transfers', label: 'Transfers', desc: 'Money transfers between accounts' },
                { key: 'invoices', label: 'Invoices', desc: 'Invoice status changes and payments' },
                { key: 'security', label: 'Security Alerts', desc: 'New device logins and security events' },
                { key: 'marketing', label: 'Product Updates', desc: 'New features and announcements' },
                { key: 'weekly', label: 'Weekly Summary', desc: 'Weekly financial summary email' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch
                    checked={notifications[item.key as keyof typeof notifications]}
                    onCheckedChange={(v) => setNotifications((prev) => ({ ...prev, [item.key]: v }))}
                  />
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={() => toast.success('Preferences saved')}>Save Preferences</Button>
            </div>
          </Card>
        </TabsContent>

        {/* Payment */}
        <TabsContent value="payment" className="mt-4 space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold font-display">Linked Bank Accounts</h3>
            <p className="text-sm text-muted-foreground">Manage your withdrawal methods</p>
            <div className="mt-4 space-y-3">
              {[
                { bank: 'Equity Bank', number: '**** 4521', type: 'Checking' },
                { bank: 'KCB Bank', number: '**** 8830', type: 'Savings' },
              ].map((acc, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{acc.bank}</p>
                      <p className="text-xs text-muted-foreground">{acc.number} • {acc.type}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-destructive">Remove</Button>
                </div>
              ))}
            </div>
            <Button variant="outline" className="mt-4 gap-1.5">
              <ArrowRight className="h-4 w-4" />
              Add Bank Account
            </Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

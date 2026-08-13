'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bell, Check, CreditCard, FileText, Shield, Send,
  Settings as SettingsIcon, CheckCheck,
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/status-badge';
import { mockNotifications } from '@/services/mock-data';
import { formatRelativeTime, cn } from '@/lib/utils';
import { toast } from 'sonner';

const typeIcons: Record<string, React.ReactNode> = {
  payment: <CreditCard className="h-4 w-4" />,
  transfer: <Send className="h-4 w-4" />,
  invoice: <FileText className="h-4 w-4" />,
  security: <Shield className="h-4 w-4" />,
  system: <SettingsIcon className="h-4 w-4" />,
  card: <CreditCard className="h-4 w-4" />,
};

const typeColors: Record<string, string> = {
  payment: 'bg-success/10 text-success',
  transfer: 'bg-primary/10 text-primary',
  invoice: 'bg-accent/10 text-accent',
  security: 'bg-destructive/10 text-destructive',
  system: 'bg-muted text-muted-foreground',
  card: 'bg-warning/10 text-warning',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filtered = filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Notifications" description="Stay updated on your account activity.">
        <Button variant="outline" size="sm" className="gap-1.5" onClick={markAllAsRead}>
          <CheckCheck className="h-4 w-4" />
          Mark all as read
        </Button>
      </PageHeader>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilter('all')}
          className={cn(
            'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
            filter === 'all' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted',
          )}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={cn(
            'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
            filter === 'unread' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted',
          )}
        >
          Unread ({unreadCount})
        </button>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="divide-y divide-border">
          {filtered.length > 0 ? (
            filtered.map((n, i) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                onClick={() => !n.read && markAsRead(n.id)}
                className={cn(
                  'flex items-start gap-4 p-4 transition-colors cursor-pointer hover:bg-muted/40',
                  !n.read && 'bg-primary/5',
                )}
              >
                <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', typeColors[n.type])}>
                  {typeIcons[n.type] ?? <Bell className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{n.title}</p>
                    {!n.read && <span className="h-2 w-2 rounded-full bg-primary" />}
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{n.message}</p>
                  <p className="mt-1 text-xs text-muted-foreground/70">{formatRelativeTime(n.timestamp)}</p>
                </div>
                {!n.read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(n.id);
                    }}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </Button>
                )}
              </motion.div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Bell className="h-10 w-10 text-muted-foreground" />
              <p className="mt-4 text-sm font-medium">No unread notifications</p>
              <p className="mt-1 text-xs text-muted-foreground">You're all caught up!</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

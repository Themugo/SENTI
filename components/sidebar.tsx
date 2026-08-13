'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  Send,
  Download,
  Link2,
  FileText,
  Repeat,
  Store,
  ShoppingCart,
  Shield,
  CreditCard,
  RefreshCw,
  BarChart3,
  Code2,
  Settings,
  Bell,
  Banknote,
  LifeBuoy,
  HelpCircle,
  ChevronRight,
  FileCheck,
  Building2,
  AlertTriangle,
  ShieldCheck,
  History,
  UserCircle,
  Gavel,
  Scale,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  Send,
  Download,
  Link2,
  FileText,
  Repeat,
  Store,
  ShoppingCart,
  Shield,
  CreditCard,
  RefreshCw,
  BarChart3,
  Code2,
  Settings,
  Bell,
  Banknote,
  LifeBuoy,
  HelpCircle,
  FileCheck,
  Building2,
  AlertTriangle,
  ShieldCheck,
  History,
  UserCircle,
  Gavel,
  Scale,
};

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const mainNav: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'Wallet', href: '/wallet', icon: 'Wallet' },
  { label: 'Transactions', href: '/transactions', icon: 'ArrowLeftRight' },
  { label: 'Send Money', href: '/send-money', icon: 'Send' },
  { label: 'Receive Money', href: '/receive-money', icon: 'Download' },
  { label: 'Payment Links', href: '/payment-links', icon: 'Link2' },
  { label: 'Invoices', href: '/invoices', icon: 'FileText' },
  { label: 'Subscriptions', href: '/subscriptions', icon: 'Repeat' },
];

const businessNav: NavItem[] = [
  { label: 'Merchant', href: '/merchant', icon: 'Store' },
  { label: 'Checkout', href: '/checkout', icon: 'ShoppingCart' },
  { label: 'Escrow', href: '/escrow', icon: 'Shield' },
  { label: 'Cards', href: '/cards', icon: 'CreditCard' },
  { label: 'Exchange', href: '/exchange', icon: 'RefreshCw' },
  { label: 'Settlements', href: '/settlements', icon: 'Banknote' },
  { label: 'Analytics', href: '/analytics', icon: 'BarChart3' },
  { label: 'KYC Verification', href: '/kyc', icon: 'FileCheck' },
  { label: 'Business KYB', href: '/kyb', icon: 'Building2' },
  { label: 'Risk Dashboard', href: '/risk', icon: 'AlertTriangle' },
  { label: 'Compliance', href: '/compliance', icon: 'ShieldCheck' },
  { label: 'Audit Log', href: '/audit-log', icon: 'History' },
  { label: 'Disputes', href: '/disputes', icon: 'Gavel' },
  { label: 'Reconciliation', href: '/reconciliation', icon: 'Scale' },
];

const developerNav: NavItem[] = [
  { label: 'Developer API', href: '/developer', icon: 'Code2' },
  { label: 'Documentation', href: '/docs', icon: 'HelpCircle' },
];

const accountNav: NavItem[] = [
  { label: 'Identity Center', href: '/identity', icon: 'UserCircle' },
  { label: 'Security', href: '/security', icon: 'ShieldCheck' },
  { label: 'Settings', href: '/settings', icon: 'Settings' },
  { label: 'Notifications', href: '/notifications', icon: 'Bell' },
  { label: 'Help Center', href: '/help', icon: 'LifeBuoy' },
];

function NavSection({ title, items, pathname }: { title: string; items: NavItem[]; pathname: string }) {
  return (
    <div className="space-y-1">
      <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
        {title}
      </p>
      {items.map((item) => {
        const Icon = iconMap[item.icon];
        const isActive = pathname === item.href;
        return (
          <Link key={item.href} href={item.href}>
            <div
              className={cn(
                'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'text-sidebar-accent-foreground'
                  : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground',
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-lg bg-sidebar-accent"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              {Icon && (
                <Icon
                  className={cn(
                    'relative z-10 h-4 w-4 shrink-0',
                    isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground',
                  )}
                />
              )}
              <span className="relative z-10">{item.label}</span>
              {isActive && (
                <ChevronRight className="relative z-10 ml-auto h-4 w-4 text-primary" />
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      <div className="flex h-16 items-center gap-2.5 px-5">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-glow-emerald">
            <span className="text-lg font-bold font-display">S</span>
          </div>
          <div>
            <p className="text-lg font-bold tracking-tight font-display">SENTI</p>
            <p className="-mt-1 text-[10px] text-muted-foreground">Frameworks Technologies</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4 scrollbar-hide">
        <NavSection title="Main" items={mainNav} pathname={pathname} />
        <NavSection title="Business" items={businessNav} pathname={pathname} />
        <NavSection title="Developer" items={developerNav} pathname={pathname} />
        <NavSection title="Account" items={accountNav} pathname={pathname} />
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <Link
          href="/admin"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
        >
          <Shield className="h-4 w-4" />
          <span>Admin Dashboard</span>
        </Link>
      </div>
    </aside>
  );
}

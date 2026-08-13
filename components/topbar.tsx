'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Bell,
  Menu,
  X,
  Sun,
  Moon,
  Plus,
  ChevronDown,
  Check,
  type LucideIcon,
} from 'lucide-react';
import { useTheme } from 'next-themes';
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
  LifeBuoy,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn, formatCurrencyWithSymbol } from '@/lib/utils';
import { mockNotifications } from '@/services/mock-data';
import { searchService, type SearchResult } from '@/services/search.service';

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
  LifeBuoy,
  HelpCircle,
};

const allNav = [
  { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'Wallet', href: '/wallet', icon: 'Wallet' },
  { label: 'Transactions', href: '/transactions', icon: 'ArrowLeftRight' },
  { label: 'Send Money', href: '/send-money', icon: 'Send' },
  { label: 'Receive Money', href: '/receive-money', icon: 'Download' },
  { label: 'Payment Links', href: '/payment-links', icon: 'Link2' },
  { label: 'Invoices', href: '/invoices', icon: 'FileText' },
  { label: 'Subscriptions', href: '/subscriptions', icon: 'Repeat' },
  { label: 'Merchant', href: '/merchant', icon: 'Store' },
  { label: 'Checkout', href: '/checkout', icon: 'ShoppingCart' },
  { label: 'Escrow', href: '/escrow', icon: 'Shield' },
  { label: 'Cards', href: '/cards', icon: 'CreditCard' },
  { label: 'Exchange', href: '/exchange', icon: 'RefreshCw' },
  { label: 'Settlements', href: '/settlements', icon: 'Banknote' },
  { label: 'Analytics', href: '/analytics', icon: 'BarChart3' },
  { label: 'Developer API', href: '/developer', icon: 'Code2' },
  { label: 'Documentation', href: '/docs', icon: 'HelpCircle' },
  { label: 'Settings', href: '/settings', icon: 'Settings' },
  { label: 'Notifications', href: '/notifications', icon: 'Bell' },
  { label: 'Help Center', href: '/help', icon: 'LifeBuoy' },
];

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="h-9 w-9" />;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="h-9 w-9"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}

// useEffect already imported at top

export function Topbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchService.search(searchQuery, 8);
  }, [searchQuery]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-sidebar-border bg-background/80 px-4 backdrop-blur-xl lg:px-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              placeholder="Search transactions, wallets, merchants..."
              className="h-9 w-64 rounded-lg border border-input bg-muted/50 pl-9 pr-3 text-sm outline-none transition-all focus:w-80 focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20"
            />
            <AnimatePresence>
              {searchFocused && searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute top-11 left-0 w-80 overflow-hidden rounded-lg border border-border bg-card shadow-premium-lg"
                >
                  {searchResults.map((r) => (
                    <Link key={`${r.type}-${r.id}`} href={r.href}>
                      <div className="flex items-center gap-3 border-b border-border p-3 transition-colors last:border-0 hover:bg-muted/40">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                          {r.type === 'transaction' && <ArrowLeftRight className="h-4 w-4 text-primary" />}
                          {r.type === 'wallet' && <Wallet className="h-4 w-4 text-accent" />}
                          {r.type === 'merchant' && <Store className="h-4 w-4 text-warning" />}
                          {r.type === 'ledger' && <Search className="h-4 w-4 text-muted-foreground" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{r.title}</p>
                          <p className="truncate text-xs text-muted-foreground">{r.subtitle}</p>
                        </div>
                        {r.amount !== undefined && r.currency && (
                          <span className="shrink-0 text-xs font-semibold">{formatCurrencyWithSymbol(r.amount, r.currency)}</span>
                        )}
                      </div>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="default" size="sm" className="hidden gap-1.5 sm:flex">
            <Link href="/send-money">
              <Plus className="h-4 w-4" />
              New Payment
            </Link>
          </Button>

          <ThemeToggle />

          <Button asChild variant="ghost" size="icon" className="relative h-9 w-9">
            <Link href="/notifications" aria-label="Notifications">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                  {unreadCount}
                </span>
              )}
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-lg p-1 pr-2 transition-colors hover:bg-muted">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                    SU
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-medium sm:block">SENTI User</span>
                <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold">SENTI User</p>
                  <p className="text-xs text-muted-foreground">user@senti.com</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/help">Help Center</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/developer">Developer API</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/" className="text-destructive">
                  Sign out
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-sidebar-border bg-sidebar lg:hidden"
            >
              <div className="flex h-16 items-center justify-between px-5">
                <Link href="/dashboard" className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
                    <span className="text-lg font-bold font-display">S</span>
                  </div>
                  <span className="text-lg font-bold tracking-tight font-display">SENTI</span>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 scrollbar-hide">
                {allNav.map((item) => {
                  const Icon = iconMap[item.icon];
                  const isActive = pathname === item.href;
                  return (
                    <Link key={item.href} href={item.href}>
                      <div
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                            : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground',
                        )}
                      >
                        {Icon && <Icon className="h-4 w-4" />}
                        {item.label}
                      </div>
                    </Link>
                  );
                })}
                <Link href="/admin">
                  <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground">
                    <Shield className="h-4 w-4" />
                    Admin Dashboard
                  </div>
                </Link>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

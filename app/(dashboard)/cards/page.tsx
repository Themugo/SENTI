'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Snowflake, Eye, EyeOff, Settings, Trash2, CreditCard,
  TrendingUp, Lock,
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/status-badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { mockCards } from '@/services/mock-data';
import { formatCurrencyWithSymbol, maskCardNumber, cn } from '@/lib/utils';

const cardGradients: Record<string, string> = {
  emerald: 'from-emerald-600 via-emerald-700 to-teal-800',
  dark: 'from-slate-800 via-slate-900 to-black',
  cyan: 'from-cyan-500 via-cyan-600 to-blue-700',
};

export default function CardsPage() {
  const [showNumbers, setShowNumbers] = useState<Record<string, boolean>>({});

  const toggleNumber = (id: string) => {
    setShowNumbers((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const activeCards = mockCards.filter((c) => c.status === 'active');
  const totalSpent = mockCards.reduce((a, c) => a + c.spent, 0);
  const totalLimit = mockCards.reduce((a, c) => a + c.spendingLimit, 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Cards" description="Manage your virtual and physical cards.">
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          New Card
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Active Cards" value={String(activeCards.length)} icon={<CreditCard className="h-5 w-5" />} />
        <StatCard title="Total Spent" value={formatCurrencyWithSymbol(totalSpent, 'USD')} delay={0.05} />
        <StatCard title="Available Limit" value={formatCurrencyWithSymbol(totalLimit - totalSpent, 'USD')} delay={0.1} />
      </div>

      {/* Cards grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockCards.map((card, i) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="space-y-3"
          >
            {/* Card visual */}
            <div
              className={cn(
                'relative aspect-[1.6/1] w-full overflow-hidden rounded-2xl bg-gradient-to-br p-5 text-white shadow-premium-lg',
                cardGradients[card.color],
              )}
            >
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
              <div className="absolute -bottom-12 -left-8 h-32 w-32 rounded-full bg-black/10" />

              <div className="relative flex h-full flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs opacity-80">{card.type === 'virtual' ? 'Virtual Card' : 'Physical Card'}</p>
                    <p className="mt-1 text-lg font-bold font-display">SENTI</p>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 backdrop-blur">
                    {card.brand === 'visa' ? (
                      <span className="text-xs font-bold italic">VISA</span>
                    ) : (
                      <div className="flex">
                        <div className="h-4 w-4 rounded-full bg-red-500/80" />
                        <div className="-ml-2 h-4 w-4 rounded-full bg-yellow-500/80" />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <p className="font-mono text-sm tracking-wider">
                    {showNumbers[card.id] ? `4242 4242 4242 ${card.last4}` : maskCardNumber(card.last4)}
                  </p>
                  <div className="mt-2 flex items-end justify-between">
                    <div>
                      <p className="text-[10px] uppercase opacity-70">Card Holder</p>
                      <p className="text-xs font-medium">{card.holder}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase opacity-70">Expires</p>
                      <p className="text-xs font-medium">{card.expiry}</p>
                    </div>
                  </div>
                </div>
              </div>

              {card.status === 'frozen' && (
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-white">
                    <Snowflake className="h-5 w-5" />
                    <span className="font-medium">Card Frozen</span>
                  </div>
                </div>
              )}
            </div>

            {/* Card details */}
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{card.type === 'virtual' ? 'Virtual' : 'Physical'} ••{card.last4}</p>
                  <Badge variant={card.status === 'active' ? 'success' : card.status === 'frozen' ? 'warning' : 'outline'}>
                    {card.status}
                  </Badge>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleNumber(card.id)}>
                    {showNumbers[card.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="gap-2">
                        <Snowflake className="h-4 w-4" />
                        {card.status === 'frozen' ? 'Unfreeze' : 'Freeze'}
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2">
                        <Settings className="h-4 w-4" />
                        Card settings
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 text-destructive">
                        <Trash2 className="h-4 w-4" />
                        Delete card
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Spending progress */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Spent this month</span>
                  <span className="font-medium">
                    {formatCurrencyWithSymbol(card.spent, 'USD')} / {formatCurrencyWithSymbol(card.spendingLimit, 'USD')}
                  </span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(card.spent / card.spendingLimit) * 100}%` }}
                    transition={{ duration: 0.8, delay: 0.2 + i * 0.1 }}
                    className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                  />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

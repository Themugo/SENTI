'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  icon?: React.ReactNode;
  className?: string;
  delay?: number;
  subtitle?: string;
}

export function StatCard({
  title,
  value,
  change,
  icon,
  className,
  delay = 0,
  subtitle,
}: StatCardProps) {
  const isPositive = (change ?? 0) >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className={cn('relative overflow-hidden p-5', className)}>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold tracking-tight font-display">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              {icon}
            </div>
          )}
        </div>
        {change !== undefined && (
          <div className="mt-4 flex items-center gap-2">
            <span
              className={cn(
                'flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold',
                isPositive
                  ? 'bg-success/10 text-success'
                  : 'bg-destructive/10 text-destructive',
              )}
            >
              {isPositive ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {Math.abs(change).toFixed(1)}%
            </span>
            <span className="text-xs text-muted-foreground">vs last month</span>
          </div>
        )}
      </Card>
    </motion.div>
  );
}

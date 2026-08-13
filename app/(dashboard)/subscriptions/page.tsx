'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Repeat,
  Check,
  Clock,
  X,
  Pause,
  Play,
  TrendingUp,
  Calendar,
  Users,
  DollarSign,
} from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/status-badge';
import { cn, formatDate, formatCurrencyWithSymbol } from '@/lib/utils';
import { subscriptionService } from '@/services/subscription.service';
import type {
  SubscriptionV2,
  SubscriptionPlan,
  SubscriptionStatus,
  SubscriptionInterval,
  BillingType,
  CurrencyCode,
} from '@/types';

type BadgeVariant = 'success' | 'info' | 'warning' | 'error';

const STATUS_VARIANT: Record<SubscriptionStatus, BadgeVariant> = {
  active: 'success',
  trialing: 'info',
  past_due: 'warning',
  cancelled: 'error',
  expired: 'warning',
  paused: 'warning',
};

const STATUS_LABEL: Record<SubscriptionStatus, string> = {
  active: 'Active',
  trialing: 'Trialing',
  past_due: 'Past Due',
  cancelled: 'Cancelled',
  expired: 'Expired',
  paused: 'Paused',
};

const INTERVAL_LABEL: Record<SubscriptionInterval, string> = {
  monthly: 'month',
  quarterly: 'quarter',
  yearly: 'year',
  weekly: 'week',
};

const BILLING_LABEL: Record<BillingType, string> = {
  fixed: 'Fixed',
  usage_based: 'Usage-based',
};

// Demo customer used when subscribing via the plan cards.
const DEMO_CUSTOMER = {
  customerId: 'cust-demo-0001',
  customerName: 'SENTI Demo Customer',
  customerEmail: 'demo@senti.app',
};

export default function SubscriptionsPage() {
  const [plans] = useState<SubscriptionPlan[]>(() => subscriptionService.getPlans());
  const [subscriptions, setSubscriptions] = useState<SubscriptionV2[]>(() =>
    subscriptionService.getAll(),
  );

  const stats = useMemo(() => {
    const base = subscriptionService.getStats();
    return {
      ...base,
      mrr: subscriptions
        .filter((s) => s.status === 'active')
        .reduce((sum, s) => {
          if (s.interval === 'yearly') return sum + s.amount / 12;
          if (s.interval === 'quarterly') return sum + s.amount / 3;
          if (s.interval === 'weekly') return sum + s.amount * 4.345;
          return sum + s.amount;
        }, 0),
    };
  }, [subscriptions]);

  const refresh = () => setSubscriptions(subscriptionService.getAll());

  const handleSubscribe = (plan: SubscriptionPlan) => {
    try {
      subscriptionService.subscribe({
        ...DEMO_CUSTOMER,
        planId: plan.id,
      });
      refresh();
      toast.success(`Subscribed to ${plan.name}`, {
        description: `${DEMO_CUSTOMER.customerName} is now on the ${plan.name} plan.`,
      });
    } catch (err) {
      toast.error('Failed to subscribe', {
        description: err instanceof Error ? err.message : 'Unexpected error',
      });
    }
  };

  const handleCancel = (sub: SubscriptionV2) => {
    subscriptionService.cancel(sub.id);
    refresh();
    toast.success('Subscription cancelled', {
      description: `${sub.customerName}'s ${sub.planName} subscription was cancelled.`,
    });
  };

  const handlePause = (sub: SubscriptionV2) => {
    subscriptionService.pause(sub.id);
    refresh();
    toast.success('Subscription paused', {
      description: `${sub.customerName}'s ${sub.planName} subscription is paused.`,
    });
  };

  const handleResume = (sub: SubscriptionV2) => {
    subscriptionService.resume(sub.id);
    refresh();
    toast.success('Subscription resumed', {
      description: `${sub.customerName}'s ${sub.planName} subscription is active again.`,
    });
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Subscriptions"
        description="Manage recurring billing, plans, and active subscriptions across SENTI."
      />

      {/* ── Summary stats ─────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Subscriptions"
          value={String(stats.active)}
          icon={<Repeat className="h-5 w-5" />}
          subtitle={`${stats.total} total subscriptions`}
        />
        <StatCard
          title="Trialing"
          value={String(stats.trialing)}
          icon={<Clock className="h-5 w-5" />}
          delay={0.05}
          subtitle="Converting to paid soon"
        />
        <StatCard
          title="Monthly Recurring Revenue"
          value={formatCurrencyWithSymbol(stats.mrr, 'USD')}
          icon={<TrendingUp className="h-5 w-5" />}
          delay={0.1}
          subtitle="Normalized to monthly"
        />
        <StatCard
          title="Total Subscriptions"
          value={String(stats.total)}
          icon={<Users className="h-5 w-5" />}
          delay={0.15}
          subtitle={`${stats.paused} paused · ${stats.cancelled} cancelled`}
        />
      </div>

      {/* ── Subscription Plans ─────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight font-display">
              Subscription Plans
            </h2>
            <p className="text-sm text-muted-foreground">
              Available plans your customers can subscribe to.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {plans.map((plan, i) => {
            const isUsageBased = plan.billingType === 'usage_based';
            const isFree = plan.amount === 0 && !isUsageBased;
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              >
                <Card className="flex h-full flex-col overflow-hidden">
                  <CardHeader className="space-y-3 pb-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <h3 className="text-xl font-semibold tracking-tight font-display">
                          {plan.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">{plan.description}</p>
                      </div>
                      <Badge variant={isUsageBased ? 'info' : 'default'}>
                        {BILLING_LABEL[plan.billingType]}
                      </Badge>
                    </div>

                    <div className="flex items-baseline gap-1.5">
                      {isUsageBased ? (
                        <span className="text-3xl font-bold tracking-tight font-display">
                          Variable
                        </span>
                      ) : (
                        <>
                          <span className="text-3xl font-bold tracking-tight font-display">
                            {isFree ? 'Free' : formatCurrencyWithSymbol(plan.amount, plan.currency)}
                          </span>
                          {!isFree && (
                            <span className="text-sm font-medium text-muted-foreground">
                              / {INTERVAL_LABEL[plan.interval]}
                            </span>
                          )}
                        </>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant="outline" className="capitalize">
                        <Calendar className="mr-1 h-3 w-3" />
                        {plan.interval}
                      </Badge>
                      {plan.trialDays ? (
                        <Badge variant="info">
                          <Clock className="mr-1 h-3 w-3" />
                          {plan.trialDays}-day trial
                        </Badge>
                      ) : null}
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 pt-0">
                    <ul className="space-y-2.5">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2.5 text-sm">
                          <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
                            <Check className="h-3 w-3" />
                          </span>
                          <span className="text-foreground/90">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter className="pt-4">
                    <Button
                      className="w-full"
                      variant={isFree ? 'secondary' : 'default'}
                      onClick={() => handleSubscribe(plan)}
                    >
                      Subscribe
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── Active Subscriptions ───────────────────────────────────── */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight font-display">
            Active Subscriptions
          </h2>
          <p className="text-sm text-muted-foreground">
            All subscriptions across your customers. Cancel, pause, or resume as needed.
          </p>
        </div>

        <Card className="overflow-hidden p-0">
          {subscriptions.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Repeat className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">No subscriptions yet</p>
                <p className="text-xs text-muted-foreground">
                  Subscribe a customer to a plan above to see it here.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Customer
                    </th>
                    <th className="hidden px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground sm:table-cell">
                      Plan
                    </th>
                    <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Amount
                    </th>
                    <th className="hidden px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground md:table-cell">
                      Interval
                    </th>
                    <th className="hidden px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground lg:table-cell">
                      Current Period End
                    </th>
                    <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((sub, i) => {
                    const variant = STATUS_VARIANT[sub.status];
                    const canCancel = sub.status !== 'cancelled' && sub.status !== 'expired';
                    const canPause = sub.status === 'active' || sub.status === 'trialing';
                    const canResume = sub.status === 'paused';

                    return (
                      <motion.tr
                        key={sub.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.04 }}
                        className="border-b border-border transition-colors last:border-0 hover:bg-muted/40"
                      >
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium">{sub.customerName}</p>
                          <p className="text-xs text-muted-foreground">{sub.customerEmail}</p>
                        </td>
                        <td className="hidden px-4 py-3 sm:table-cell">
                          <span className="text-sm">{sub.planName}</span>
                        </td>
                        <td className="px-4 py-3">
                          {sub.billingType === 'usage_based' ? (
                            <div className="space-y-0.5">
                              <p className="text-sm font-semibold">Usage-based</p>
                              <p className="text-xs text-muted-foreground">
                                {sub.usage ?? 0} units
                              </p>
                            </div>
                          ) : (
                            <p className="text-sm font-semibold">
                              {formatCurrencyWithSymbol(sub.amount, sub.currency)}
                            </p>
                          )}
                        </td>
                        <td className="hidden px-4 py-3 md:table-cell">
                          <span className="text-sm capitalize text-muted-foreground">
                            {sub.interval}
                          </span>
                        </td>
                        <td className="hidden px-4 py-3 lg:table-cell">
                          <span className="text-sm text-muted-foreground">
                            {formatDate(sub.currentPeriodEnd)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={variant}>{STATUS_LABEL[sub.status]}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            {canResume && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleResume(sub)}
                                title="Resume"
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                            )}
                            {canPause && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handlePause(sub)}
                                title="Pause"
                              >
                                <Pause className="h-4 w-4" />
                              </Button>
                            )}
                            {canCancel && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => handleCancel(sub)}
                                title="Cancel"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                            {!canCancel && !canPause && !canResume && (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}

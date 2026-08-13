'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, ArrowRight, Sparkles } from 'lucide-react';
import { MarketingNav, MarketingFooter } from '@/components/marketing-nav';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PRICING_PLANS } from '@/constants';

const faqs = [
  { q: 'Are there any hidden fees?', a: 'No. SENTI has transparent pricing. You only pay the fees listed for each plan, plus standard processing fees for card payments.' },
  { q: 'Can I switch plans anytime?', a: 'Yes. You can upgrade or downgrade your plan at any time from your dashboard. Changes take effect immediately.' },
  { q: 'Do you offer volume discounts?', a: 'For businesses processing over $100K/month, we offer custom volume-based pricing. Contact our sales team to learn more.' },
  { q: 'What payment methods are supported?', a: 'We support cards (Visa, Mastercard), mobile money (M-Pesa, Airtel), bank transfers, Apple Pay, Google Pay, and PayPal.' },
  { q: 'Is there a free trial?', a: 'The Personal plan is free forever. The Business plan includes a 14-day free trial with no credit card required.' },
];

export default function PricingPage() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />

      <section className="pt-32 pb-16 sm:pt-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-2xl text-center"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              <span className="text-muted-foreground">Simple, transparent pricing</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight font-display sm:text-5xl">
              Pricing that scales with you
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Start free. Upgrade when you need more. No hidden fees, ever.
            </p>

            <div className="mt-8 inline-flex items-center gap-1 rounded-lg border border-border bg-card p-1">
              <button
                onClick={() => setBilling('monthly')}
                className={cn(
                  'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
                  billing === 'monthly' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                Monthly
              </button>
              <button
                onClick={() => setBilling('yearly')}
                className={cn(
                  'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
                  billing === 'yearly' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                Yearly
                <span className="ml-1.5 text-xs text-success">Save 20%</span>
              </button>
            </div>
          </motion.div>

          {/* Plans */}
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {PRICING_PLANS.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <Card className={cn(
                  'relative h-full p-6',
                  plan.highlighted && 'border-primary shadow-glow-emerald',
                )}>
                  {plan.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary to-accent px-3 py-1 text-xs font-medium text-primary-foreground">
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-lg font-semibold font-display">{plan.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                  <div className="mt-4">
                    {plan.price !== null ? (
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold font-display">
                          ${billing === 'yearly' ? Math.floor(plan.price * 0.8) : plan.price}
                        </span>
                        <span className="text-sm text-muted-foreground">/month</span>
                      </div>
                    ) : (
                      <span className="text-4xl font-bold font-display">Custom</span>
                    )}
                  </div>
                  <Button
                    asChild
                    className={cn('mt-6 w-full', plan.highlighted ? '' : 'variant-outline')}
                    variant={plan.highlighted ? 'default' : 'outline'}
                  >
                    <Link href={plan.price === null ? '#' : '/signup'} className="gap-1.5">
                      {plan.cta}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* FAQs */}
          <div className="mx-auto mt-20 max-w-3xl">
            <h2 className="text-center text-2xl font-bold font-display">Frequently Asked Questions</h2>
            <div className="mt-8 space-y-4">
              {faqs.map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <Card className="p-5">
                    <h3 className="font-medium">{faq.q}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{faq.a}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}

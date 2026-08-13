'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Globe,
  Wallet,
  CreditCard,
  Shield,
  Zap,
  Code2,
  BarChart3,
  Store,
  RefreshCw,
  Lock,
  CheckCircle2,
  Star,
  TrendingUp,
  Users,
  Building2,
  Sparkles,
} from 'lucide-react';
import { MarketingNav, MarketingFooter } from '@/components/marketing-nav';
import { AnimatedCounter } from '@/components/animated-counter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const stats = [
  { label: 'Processed volume', value: 842, suffix: 'M+', prefix: '$' },
  { label: 'Active users', value: 84, suffix: 'K+' },
  { label: 'Countries', value: 45, suffix: '' },
  { label: 'Uptime', value: 99.98, suffix: '%', decimals: 2 },
];

const features = [
  {
    icon: Globe,
    title: 'Global Payments',
    description: 'Send and receive money across 45+ countries with real-time settlement and transparent fees.',
  },
  {
    icon: Wallet,
    title: 'Multi-Currency Wallets',
    description: 'Hold and manage balances in 7+ currencies. Convert instantly at mid-market rates.',
  },
  {
    icon: CreditCard,
    title: 'Virtual & Physical Cards',
    description: 'Issue cards instantly. Freeze, unfreeze, and set spending limits with a tap.',
  },
  {
    icon: Shield,
    title: 'Escrow Protection',
    description: 'Secure milestone-based transactions. Protect both buyers and sellers with built-in dispute resolution.',
  },
  {
    icon: Store,
    title: 'Merchant Tools',
    description: 'Accept payments online with hosted checkout, payment links, and subscriptions.',
  },
  {
    icon: Code2,
    title: 'Developer API',
    description: 'Build on top of SENTI with a clean, well-documented API. SDKs for every major language.',
  },
  {
    icon: BarChart3,
    title: 'Real-time Analytics',
    description: 'Track revenue, monitor cash flow, and understand your business with beautiful dashboards.',
  },
  {
    icon: RefreshCw,
    title: 'Currency Exchange',
    description: 'Exchange currencies at mid-market rates with zero hidden fees. Instant settlement.',
  },
];

const businessUseCases = [
  { icon: Building2, title: 'Global Payroll', description: 'Pay contractors and employees in any currency.' },
  { icon: Store, title: 'E-commerce', description: 'Accept payments from customers worldwide.' },
  { icon: Zap, title: 'SaaS Billing', description: 'Recurring subscriptions with automatic invoicing.' },
  { icon: Shield, title: 'B2B Escrow', description: 'Secure large transactions with milestone releases.' },
];

const personalUseCases = [
  { icon: Globe, title: 'Send Money Home', description: 'Support family abroad with low-fee transfers.' },
  { icon: Wallet, title: 'Multi-Currency', description: 'Hold and spend in multiple currencies.' },
  { icon: CreditCard, title: 'Virtual Cards', description: 'Shop online securely with disposable cards.' },
  { icon: TrendingUp, title: 'Smart Savings', description: 'Track spending and grow your money.' },
];

const testimonials = [
  {
    quote: 'SENTI replaced three different payment tools for us. The multi-currency wallet alone saves us thousands in conversion fees every month.',
    author: 'Sarah Kimani',
    role: 'CFO, Acme Corp',
    rating: 5,
  },
  {
    quote: 'The developer API is a dream. We integrated checkout in an afternoon and the documentation is the best I have seen in fintech.',
    author: 'David Okafor',
    role: 'CTO, TechFlow Solutions',
    rating: 5,
  },
  {
    quote: 'Escrow with milestones changed how we work with freelancers. Everyone feels protected and payments release automatically.',
    author: 'Maria Garcia',
    role: 'Operations Lead, London Studios',
    rating: 5,
  },
];

const partners = ['Acme', 'TechFlow', 'London Studios', 'Nairobi Coffee', 'Dubai Trade', 'DevHub'];

const apiCodeExample = `// Create a payment link
const payment = await senti.payments.create({
  amount: 2500,
  currency: 'USD',
  description: 'Premium consultation',
  customer: {
    email: 'customer@example.com'
  }
});

// Returns a hosted checkout URL
console.log(payment.checkout_url);
// → https://senti.pay/c/premium-consult`;

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
        <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_70%)]" />
        <div className="absolute left-1/2 top-0 -z-10 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute right-0 top-40 -z-10 h-[400px] w-[400px] rounded-full bg-accent/10 blur-[100px]" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-1.5 text-sm backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              <span className="text-muted-foreground">Now supporting 45+ countries</span>
            </div>

            <h1 className="text-4xl font-bold tracking-tight font-display sm:text-6xl lg:text-7xl">
              Money without{' '}
              <span className="text-gradient-emerald">borders</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              The next-generation financial infrastructure platform for businesses and
              individuals. Global payments, digital wallets, virtual cards, escrow, and more —
              all in one place.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="gap-2 text-base h-12 px-8">
                <Link href="/signup">
                  Open free account
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base h-12 px-8">
                <Link href="/dashboard">View dashboard</Link>
              </Button>
            </div>

            <p className="mt-4 text-sm text-muted-foreground">
              No monthly fees. No hidden charges. Cancel anytime.
            </p>
          </motion.div>

          {/* Hero illustration placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="mt-16"
          >
            <Card className="relative mx-auto max-w-5xl overflow-hidden border-border/60 p-0 shadow-premium-lg">
              <div className="relative bg-gradient-to-br from-primary/5 via-accent/5 to-transparent p-6 sm:p-10">
                <div className="grid gap-4 sm:grid-cols-3">
                  {/* Balance card */}
                  <div className="rounded-2xl bg-gradient-to-br from-primary to-accent p-5 text-primary-foreground shadow-glow-emerald sm:col-span-1">
                    <p className="text-xs opacity-80">Total Balance</p>
                    <p className="mt-1 text-3xl font-bold font-display">$128,450.75</p>
                    <div className="mt-4 flex items-center gap-2 text-xs">
                      <TrendingUp className="h-3 w-3" />
                      <span>+12.4% this month</span>
                    </div>
                  </div>

                  {/* Quick stats */}
                  <div className="rounded-2xl border border-border bg-card p-5 sm:col-span-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Monthly Revenue</p>
                        <p className="mt-1 text-xl font-bold font-display">$89,200</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Pending</p>
                        <p className="mt-1 text-xl font-bold font-display">$3,200</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Transactions</p>
                        <p className="mt-1 text-xl font-bold font-display">1,284</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Active Cards</p>
                        <p className="mt-1 text-xl font-bold font-display">3</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mini chart placeholder */}
                <div className="mt-4 rounded-2xl border border-border bg-card p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-medium">Revenue Overview</p>
                    <span className="flex items-center gap-1 text-xs text-success">
                      <TrendingUp className="h-3 w-3" /> +18.2%
                    </span>
                  </div>
                  <div className="flex h-24 items-end gap-2">
                    {[40, 55, 48, 62, 58, 72, 68, 85, 78, 92, 88, 100].map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ duration: 0.6, delay: 0.4 + i * 0.05, ease: 'easeOut' }}
                        className="flex-1 rounded-t bg-gradient-to-t from-primary/40 to-primary"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Live statistics */}
      <section className="border-y border-border bg-card/30 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="text-center"
              >
                <p className="text-3xl font-bold tracking-tight font-display sm:text-4xl">
                  <AnimatedCounter
                    value={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    decimals={stat.decimals ?? 0}
                  />
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="product" className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            {...fadeUp}
            className="mx-auto max-w-2xl text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight font-display sm:text-4xl">
              Everything you need to move money
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              One platform for global payments, wallets, cards, escrow, and developer tools.
              Built for the next generation of financial infrastructure.
            </p>
          </motion.div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: (i % 4) * 0.1 }}
              >
                <Card className="group h-full p-6 transition-all hover:shadow-premium-lg hover:border-primary/30">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold font-display">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Business & Personal use cases */}
      <section className="border-y border-border bg-card/30 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            <motion.div {...fadeUp}>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-sm">
                <Building2 className="h-3.5 w-3.5 text-primary" />
                <span className="font-medium">For Business</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight font-display">
                Power your business finances
              </h2>
              <p className="mt-3 text-muted-foreground">
                From accepting payments to paying your team, SENTI handles every financial workflow.
              </p>
              <div className="mt-8 space-y-4">
                {businessUseCases.map((uc) => (
                  <div key={uc.title} className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <uc.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{uc.title}</h4>
                      <p className="text-sm text-muted-foreground">{uc.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }}>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-sm">
                <Users className="h-3.5 w-3.5 text-accent" />
                <span className="font-medium">For Individuals</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight font-display">
                Your money, everywhere
              </h2>
              <p className="mt-3 text-muted-foreground">
                Manage your personal finances across borders with tools built for the modern world.
              </p>
              <div className="mt-8 space-y-4">
                {personalUseCases.map((uc) => (
                  <div key={uc.title} className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                      <uc.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{uc.title}</h4>
                      <p className="text-sm text-muted-foreground">{uc.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* API Section */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div {...fadeUp}>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-sm">
                <Code2 className="h-3.5 w-3.5 text-primary" />
                <span className="font-medium">Developer API</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight font-display sm:text-4xl">
                Build on SENTI
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                A clean, RESTful API with SDKs for every major language. Webhooks, sandbox
                environment, and comprehensive documentation.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  'RESTful API with predictable resources',
                  'SDKs for JavaScript, Python, Go, and more',
                  'Sandbox environment with test data',
                  'Real-time webhooks for every event',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-8 gap-2">
                <Link href="/developer">
                  Explore the API
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Card className="overflow-hidden border-border/60 p-0 shadow-premium-lg">
                <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-3">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-destructive/60" />
                    <div className="h-3 w-3 rounded-full bg-warning/60" />
                    <div className="h-3 w-3 rounded-full bg-success/60" />
                  </div>
                  <span className="ml-2 text-xs text-muted-foreground">payment.js</span>
                </div>
                <pre className="overflow-x-auto p-5 text-sm leading-relaxed">
                  <code className="font-mono">
                    <span className="text-muted-foreground">// Create a payment link</span>{'\n'}
                    <span className="text-accent">const</span> payment = <span className="text-accent">await</span> senti.payments.<span className="text-primary">create</span>({'{'}{'\n'}
                    {'  '}amount: <span className="text-warning">2500</span>,{'\n'}
                    {'  '}currency: <span className="text-success">'USD'</span>,{'\n'}
                    {'  '}description: <span className="text-success">'Premium consultation'</span>,{'\n'}
                    {'  '}customer: {'{'}{'\n'}
                    {'    '}email: <span className="text-success">'customer@example.com'</span>{'\n'}
                    {'  '}{'}'},{'\n'}
                    {'}'});{'\n\n'}
                    <span className="text-muted-foreground">// Returns a hosted checkout URL</span>{'\n'}
                    console.<span className="text-primary">log</span>(payment.checkout_url);{'\n'}
                    <span className="text-muted-foreground">{'// → https://senti.pay/c/premium-consult'}</span>
                  </code>
                </pre>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-y border-border bg-card/30 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight font-display sm:text-4xl">
              Trusted by thousands of businesses
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              From startups to enterprises, teams rely on SENTI to move money globally.
            </p>
          </motion.div>

          <div className="mt-16 grid gap-6 lg:grid-cols-3">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.author}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <Card className="h-full p-6">
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-warning text-warning" />
                    ))}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-foreground/90">"{t.quote}"</p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {t.author.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{t.author}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Powering payments for industry leaders
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {partners.map((p) => (
              <span key={p} className="text-xl font-bold tracking-tight text-muted-foreground/60 transition-colors hover:text-foreground font-display">
                {p}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-accent p-10 text-center text-primary-foreground sm:p-16"
          >
            <div className="absolute inset-0 bg-grid opacity-10" />
            <div className="relative">
              <h2 className="text-3xl font-bold tracking-tight font-display sm:text-5xl">
                Start moving money without borders
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg opacity-90">
                Open a free account in minutes. No monthly fees, no hidden charges.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button asChild size="lg" variant="secondary" className="gap-2 text-base h-12 px-8">
                  <Link href="/signup">
                    Get started free
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="text-base h-12 px-8 border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">
                  <Link href="/pricing">View pricing</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}

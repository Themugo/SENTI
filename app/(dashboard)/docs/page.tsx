'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search, BookOpen, Code2, CreditCard, Wallet, Shield,
  Webhook, Zap, ArrowRight, ChevronRight, Copy,
} from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const docSections = [
  {
    title: 'Getting Started',
    items: [
      { title: 'Introduction', desc: 'Overview of the SENTI API', icon: BookOpen },
      { title: 'Authentication', desc: 'How to authenticate API requests', icon: Shield },
      { title: 'Quick Start', desc: 'Make your first request in minutes', icon: Zap },
    ],
  },
  {
    title: 'Core Resources',
    items: [
      { title: 'Payments', desc: 'Create and manage payments', icon: CreditCard },
      { title: 'Wallets', desc: 'Multi-currency wallet management', icon: Wallet },
      { title: 'Transfers', desc: 'Send money to any account', icon: ArrowRight },
    ],
  },
  {
    title: 'Advanced',
    items: [
      { title: 'Webhooks', desc: 'Real-time event notifications', icon: Webhook },
      { title: 'Escrow', desc: 'Milestone-based escrow transactions', icon: Shield },
      { title: 'Error Handling', desc: 'Error codes and handling guide', icon: Code2 },
    ],
  },
];

const codeBlock = `// Initialize the SENTI client
import { Senti } from '@senti/sdk';

const senti = new Senti({
  apiKey: process.env.SENTI_API_KEY,
  environment: 'live', // or 'sandbox'
});

// Create a payment
const payment = await senti.payments.create({
  amount: 2500,
  currency: 'USD',
  description: 'Premium consultation',
  customer: {
    email: 'customer@example.com',
  },
});

console.log(payment.id);
// → pay_4f2a8b9c1d2e3f4a`;

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('Introduction');

  return (
    <div className="space-y-6">
      <PageHeader title="Documentation" description="Everything you need to build on the SENTI platform.">
        <Button asChild variant="outline" size="sm" className="gap-1.5">
          <Link href="/developer">
            <Code2 className="h-4 w-4" />
            API Dashboard
          </Link>
        </Button>
      </PageHeader>

      {/* Search */}
      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search documentation..." className="pl-10" />
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20 p-4">
            <nav className="space-y-4">
              {docSections.map((section) => (
                <div key={section.title}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {section.title}
                  </p>
                  <div className="space-y-1">
                    {section.items.map((item) => (
                      <button
                        key={item.title}
                        onClick={() => setActiveSection(item.title)}
                        className={cn(
                          'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                          activeSection === item.title
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.title}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </Card>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Link href="/docs" className="hover:text-foreground">Docs</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">{activeSection}</span>
          </div>

          {/* Doc content */}
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-6">
              <h2 className="text-2xl font-bold font-display">{activeSection}</h2>
              <p className="mt-2 text-muted-foreground">
                Learn how to integrate SENTI's powerful payment infrastructure into your application.
              </p>

              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-semibold">Overview</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  The SENTI API is organized around REST. Our API has predictable resource-oriented URLs,
                  returns JSON-encoded responses, and uses standard HTTP response codes, authentication, and verbs.
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  All API requests must be made over HTTPS. Calls made over plain HTTP will fail. API requests
                  without authentication will also fail.
                </p>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold">Quick Start</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Install the SDK and make your first request:
                </p>
                <div className="mt-3 overflow-hidden rounded-xl border border-border">
                  <div className="flex items-center justify-between border-b border-border bg-muted/50 px-4 py-2">
                    <span className="text-xs font-medium text-muted-foreground">example.js</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(codeBlock);
                        toast.success('Copied');
                      }}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Copy
                    </button>
                  </div>
                  <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
                    <code className="font-mono">{codeBlock}</code>
                  </pre>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-semibold">Authentication</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  SENTI uses API keys for authentication. You can generate and manage your API keys from the
                  Developer Dashboard. Your API keys carry many privileges, so keep them secure.
                </p>
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm font-mono">
                    Authorization: Bearer sk_live_4f2a8b9c1d2e3f4a...
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Quick links */}
          <div className="grid gap-4 sm:grid-cols-3">
            {docSections[0].items.map((item) => (
              <Card key={item.title} className="p-4 transition-all hover:shadow-premium hover:border-primary/30">
                <item.icon className="h-6 w-6 text-primary" />
                <h4 className="mt-3 text-sm font-semibold">{item.title}</h4>
                <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

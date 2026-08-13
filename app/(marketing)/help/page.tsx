'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Search, BookOpen, CreditCard, Wallet, Shield, Settings,
  ArrowRight, ChevronDown, LifeBuoy, MessageSquare, Mail,
} from 'lucide-react';
import { MarketingNav, MarketingFooter } from '@/components/marketing-nav';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const categories = [
  { title: 'Getting Started', desc: 'Set up your account and make your first payment', icon: BookOpen, articles: 12 },
  { title: 'Payments & Transfers', desc: 'Send and receive money globally', icon: CreditCard, articles: 24 },
  { title: 'Wallet & Currencies', desc: 'Manage multi-currency balances', icon: Wallet, articles: 18 },
  { title: 'Security & Compliance', desc: 'Keep your account secure', icon: Shield, articles: 15 },
  { title: 'Account Settings', desc: 'Manage your profile and preferences', icon: Settings, articles: 20 },
  { title: 'API & Developers', desc: 'Integrate SENTI into your app', icon: BookOpen, articles: 32 },
];

const popularArticles = [
  { title: 'How to verify your business account', category: 'Getting Started' },
  { title: 'What are the supported payment methods?', category: 'Payments' },
  { title: 'How to set up multi-currency wallets', category: 'Wallet' },
  { title: 'Understanding escrow milestones', category: 'Payments' },
  { title: 'How to generate API keys', category: 'API' },
  { title: 'Setting up webhook endpoints', category: 'API' },
];

const faqs = [
  { q: 'How long do transfers take?', a: 'Transfers between SENTI users are instant. International bank transfers typically take 1-3 business days depending on the destination country.' },
  { q: 'What are the transaction fees?', a: 'SENTI charges 0.1% for transfers between users, 2.9% + $0.30 for card payments, and 0.5% for currency exchange. No hidden fees.' },
  { q: 'Is my money safe with SENTI?', a: 'Yes. SENTI uses bank-grade encryption and your funds are held in segregated accounts at regulated financial institutions.' },
  { q: 'Can I cancel a transaction?', a: 'Pending transactions can be cancelled from your dashboard. Completed transactions may be eligible for a refund depending on the payment type.' },
  { q: 'How do I contact support?', a: 'You can reach our support team 24/7 via live chat in your dashboard, or submit a ticket from the Help Center.' },
];

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />

      <section className="pt-32 pb-16 sm:pt-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-2xl text-center"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm">
              <LifeBuoy className="h-3.5 w-3.5 text-primary" />
              <span className="text-muted-foreground">Help Center</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight font-display sm:text-5xl">
              How can we help?
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Search our knowledge base or browse by category.
            </p>
            <div className="relative mt-8 max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search for articles, guides, and FAQs..."
                className="h-12 pl-12 text-base"
              />
            </div>
          </motion.div>

          {/* Categories */}
          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <Card className="group h-full p-5 transition-all hover:shadow-premium-lg hover:border-primary/30">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <cat.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold font-display">{cat.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{cat.desc}</p>
                      <p className="mt-2 text-xs text-muted-foreground">{cat.articles} articles</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Popular articles */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold font-display">Popular Articles</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {popularArticles.map((article, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <Card className="group flex items-center justify-between p-4 transition-all hover:shadow-premium hover:border-primary/30">
                    <div>
                      <p className="text-sm font-medium">{article.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{article.category}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* FAQs */}
          <div className="mx-auto mt-16 max-w-3xl">
            <h2 className="text-center text-2xl font-bold font-display">Frequently Asked Questions</h2>
            <div className="mt-8 space-y-3">
              {faqs.map((faq, i) => (
                <Card key={i} className="overflow-hidden p-0">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="flex w-full items-center justify-between p-5 text-left"
                  >
                    <span className="font-medium">{faq.q}</span>
                    <ChevronDown className={cn('h-4 w-4 shrink-0 text-muted-foreground transition-transform', openFaq === i && 'rotate-180')} />
                  </button>
                  <motion.div
                    initial={false}
                    animate={{ height: openFaq === i ? 'auto' : 0, opacity: openFaq === i ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-5 text-sm text-muted-foreground">{faq.a}</p>
                  </motion.div>
                </Card>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="mt-16">
            <Card className="relative overflow-hidden bg-gradient-to-br from-primary to-accent p-8 text-center text-primary-foreground">
              <h2 className="text-2xl font-bold font-display">Still need help?</h2>
              <p className="mt-2 opacity-90">Our support team is available 24/7</p>
              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button variant="secondary" className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Start Live Chat
                </Button>
                <Button variant="outline" className="gap-2 border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">
                  <Mail className="h-4 w-4" />
                  Email Support
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}

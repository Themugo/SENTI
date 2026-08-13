'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Globe, Zap } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left panel - branding */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-primary via-primary to-accent p-12 lg:flex">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-accent/30 blur-[100px]" />
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary-foreground/10 blur-[100px]" />

        <Link href="/" className="relative flex items-center gap-2.5 text-primary-foreground">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-foreground/20 backdrop-blur">
            <span className="text-lg font-bold font-display">S</span>
          </div>
          <span className="text-xl font-bold tracking-tight font-display">SENTI</span>
        </Link>

        <div className="relative space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold tracking-tight font-display text-primary-foreground">
              Money without borders.
            </h1>
            <p className="mt-4 max-w-md text-lg text-primary-foreground/80">
              Join thousands of businesses and individuals using SENTI to send, receive, and
              manage money across 45+ countries.
            </p>
          </motion.div>

          <div className="space-y-4">
            {[
              { icon: Globe, text: 'Global payments in 45+ countries' },
              { icon: Zap, text: 'Instant transfers between SENTI users' },
              { icon: Shield, text: 'Bank-grade security and encryption' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                className="flex items-center gap-3 text-primary-foreground/90"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-foreground/15 backdrop-blur">
                  <item.icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative flex items-center gap-2 text-sm text-primary-foreground/60">
          <span>© 2026 Frameworks Technologies</span>
          <span>•</span>
          <Link href="/" className="hover:text-primary-foreground">Privacy</Link>
          <span>•</span>
          <Link href="/" className="hover:text-primary-foreground">Terms</Link>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex w-full flex-col lg:w-1/2">
        <div className="flex items-center justify-between p-6 lg:hidden">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
              <span className="text-lg font-bold font-display">S</span>
            </div>
            <span className="text-xl font-bold tracking-tight font-display">SENTI</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back home
          </Link>
        </div>

        <div className="hidden items-center justify-end p-6 lg:flex">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back home
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

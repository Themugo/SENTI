'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive"
          >
            <AlertTriangle className="h-8 w-8" />
          </motion.div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold font-display">Application Error</h1>
            <p className="max-w-sm text-sm text-muted-foreground">
              A critical error occurred. Please try refreshing the page.
            </p>
          </div>
          <Button onClick={reset} className="gap-1.5">
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
        </div>
      </body>
    </html>
  );
}
